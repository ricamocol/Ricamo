import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { createServiceClient } from "@/lib/supabase/server";
import { sendOrderConfirmationEmail, sendNewOrderAdminEmail } from "@/lib/email/templates";
import { getCourier } from "@/lib/shipping";
import type { CartItem, CheckoutForm } from "@/types";

interface CheckoutPayload {
  form: CheckoutForm;
  items: CartItem[];
  sessionId: string;
  total: number;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
}

function buildWompiSignature(
  reference: string,
  amountInCents: number,
  currency: string,
  secret: string
): string {
  const str = `${reference}${amountInCents}${currency}${secret}`;
  return createHash("sha256").update(str).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const payload: CheckoutPayload = await req.json();
    const { form, items, sessionId, total, subtotal, discountAmount, shippingCost } = payload;

    if (!items.length) {
      return NextResponse.json({ error: "Carrito vacío" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // 1. Obtener o crear cliente — RB-CHK-07
    let customerId: string | null = null;
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("email", form.email.toLowerCase())
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const { data: newCustomer } = await supabase
        .from("customers")
        .insert({
          email: form.email.toLowerCase(),
          full_name: form.full_name,
          phone: form.phone,
          marketing_email: form.save_address ?? false,
          is_guest: true,
        })
        .select("id")
        .single();
      customerId = newCustomer?.id ?? null;
    }

    // 2. Crear pedido en estado pending_payment
    // Recalcular courier en servidor para evitar manipulación — RB-CHK-04
    const courierResult = getCourier(form.city);

    const orderNumber = `RIC-${Date.now().toString(36).toUpperCase()}`;
    const wompiReference = `RIC-${orderNumber}`;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: customerId,
        status: "pending_payment",
        shipping_name: form.full_name,
        shipping_email: form.email.toLowerCase(),
        shipping_phone: form.phone,
        shipping_address: form.address,
        shipping_city: form.city,
        shipping_department: form.department,
        subtotal,
        discount_amount: discountAmount,
        shipping_cost: courierResult.cost,
        courier: courierResult.courier,
        total: Math.max(0, subtotal - discountAmount + courierResult.cost),
        wompi_reference: wompiReference,
        cart_session_id: sessionId,
        terms_accepted: form.terms_accepted,
        terms_accepted_at: new Date().toISOString(),
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Error al crear el pedido" }, { status: 500 });
    }

    // 3. Insertar items del pedido
    const orderItems = items.map((item) => ({
      order_id: order.id,
      variant_id: item.variantId,
      product_id: item.productId,
      product_name: item.productName,
      variant_sku: item.sku,
      variant_attrs: item.attributes,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.unitPrice * item.quantity,
    }));

    await supabase.from("order_items").insert(orderItems);

    // 4. Log de estado inicial
    await supabase.from("order_status_log").insert({
      order_id: order.id,
      from_status: null,
      to_status: "pending_payment",
      notes: "Pedido creado — esperando confirmación de Wompi",
    });

    // 5. Registrar promotion_id en notes para atribución de influencer — RB-INF-02
    if (form.coupon_code) {
      const { data: promo } = await supabase
        .from("promotions")
        .select("id, influencer_id")
        .eq("code", form.coupon_code.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();
      if (promo?.influencer_id) {
        await supabase
          .from("orders")
          .update({ notes: `promotion_id:${promo.id}` })
          .eq("id", order.id);
      }
    }

    // 5. Construir datos de Wompi con el total validado en servidor
    const validatedTotal = Math.max(0, subtotal - discountAmount + courierResult.cost);
    const amountInCents = Math.round(validatedTotal * 100);
    const currency = "COP";
    const integritySecret = process.env.WOMPI_INTEGRITY_SECRET!;
    const integritySignature = buildWompiSignature(
      wompiReference,
      amountInCents,
      currency,
      integritySecret
    );

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
    const redirectUrl = `${siteUrl}/confirmacion/${order.id}`;

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
      wompi: {
        publicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY!,
        currency,
        amountInCents,
        reference: wompiReference,
        redirectUrl,
        integritySignature,
      },
    });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
