import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import {
  sendNewCotizacionAdminEmail,
} from "@/lib/email/templates";

interface AttachmentInput {
  url: string;
  name: string;
  type: string;
}

interface CotizacionPayload {
  full_name: string;
  email: string;
  phone: string;
  city: string;
  department: string;
  tipo_prenda: string;
  color_base: string;
  tallas: string;
  cantidad: number;
  evento: string;
  descripcion: string;
  attachments: AttachmentInput[];
}

export async function POST(req: NextRequest) {
  try {
    const payload: CotizacionPayload = await req.json();
    const {
      full_name, email, phone, city, department,
      tipo_prenda, color_base, tallas, cantidad, evento, descripcion,
      attachments,
    } = payload;

    if (!full_name || !email || !phone || !descripcion) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // 1. Obtener o crear cliente
    let customerId: string | null = null;
    const { data: existing } = await supabase
      .from("customers")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (existing) {
      customerId = existing.id;
    } else {
      const { data: newCustomer } = await supabase
        .from("customers")
        .insert({
          email: email.toLowerCase(),
          full_name,
          phone,
          marketing_email: false,
          is_guest: true,
        })
        .select("id")
        .single();
      customerId = newCustomer?.id ?? null;
    }

    // 2. Crear pedido Flujo C
    const orderNumber = `RIC-C-${Date.now().toString(36).toUpperCase()}`;

    const customizationData = {
      tipo_prenda,
      color_base,
      tallas,
      cantidad,
      evento: evento || null,
      descripcion,
    };

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: customerId,
        status: "cotizacion_pendiente",
        flow: "C",
        customization_data: customizationData,
        shipping_name: full_name,
        shipping_email: email.toLowerCase(),
        shipping_phone: phone,
        shipping_address: "",
        shipping_city: city || "",
        shipping_department: department || "",
        subtotal: 0,
        discount_amount: 0,
        shipping_cost: 0,
        total: 0,
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      console.error("[cotizaciones] order insert error:", orderError);
      return NextResponse.json({ error: "Error al crear la cotización" }, { status: 500 });
    }

    // 3. Guardar archivos adjuntos
    if (attachments.length > 0) {
      const attachmentRows = attachments.map((a) => ({
        order_id: order.id,
        file_url: a.url,
        file_name: a.name,
        file_type: a.type || null,
        uploaded_by: "customer" as const,
      }));
      await supabase.from("cotizacion_attachments").insert(attachmentRows);
    }

    // 4. Log de estado inicial
    await supabase.from("order_status_log").insert({
      order_id: order.id,
      from_status: null,
      to_status: "cotizacion_pendiente",
      notes: "Solicitud de cotización recibida desde el formulario web",
    });

    // 5. Notificar a admins
    await sendNewCotizacionAdminEmail({
      orderNumber: order.order_number,
      orderId: order.id,
      customerName: full_name,
      customerEmail: email,
      customerPhone: phone,
      description: descripcion,
      tipoPrenda: tipo_prenda,
      colorBase: color_base,
      tallas,
      cantidad,
      evento: evento || undefined,
      attachmentCount: attachments.length,
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
    });
  } catch (err) {
    console.error("[cotizaciones]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
