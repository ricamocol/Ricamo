import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendNewConfiguratorRequestEmail } from "@/lib/email/templates";

interface ConfiguradorPayload {
  full_name: string;
  email: string;
  phone: string;
  city?: string;
  department?: string;
  modelo_camisa: string;
  color_camisa: string;
  design_id?: string;
  design_name?: string;
  texto_diseno?: string;
  fuente_texto?: string;
  color_texto?: string;
  preview_url?: string;
  precio_base: number;
}

export async function POST(req: NextRequest) {
  try {
    const payload: ConfiguradorPayload = await req.json();
    const {
      full_name, email, phone, city, department,
      modelo_camisa, color_camisa, design_id, design_name,
      texto_diseno, fuente_texto, color_texto, preview_url, precio_base,
    } = payload;

    if (!full_name || !email || !phone || !modelo_camisa || !color_camisa) {
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

    // 2. Crear pedido Flujo B
    const orderNumber = `RIC-B-${Date.now().toString(36).toUpperCase()}`;

    const customizationData = {
      modelo_camisa,
      color_camisa,
      design_id: design_id ?? null,
      design_name: design_name ?? null,
      texto_diseno: texto_diseno ?? null,
      fuente_texto: fuente_texto ?? null,
      color_texto: color_texto ?? null,
      preview_url: preview_url ?? null,
    };

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: customerId,
        status: "pendiente_aprobacion",
        flow: "B",
        customization_data: customizationData,
        shipping_name: full_name,
        shipping_email: email.toLowerCase(),
        shipping_phone: phone,
        shipping_address: "",
        shipping_city: city ?? "",
        shipping_department: department ?? "",
        subtotal: precio_base,
        discount_amount: 0,
        shipping_cost: 0,
        total: precio_base,
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      console.error("[configurador] order insert error:", orderError);
      return NextResponse.json({ error: "Error al crear el pedido" }, { status: 500 });
    }

    // 3. Log de estado inicial
    await supabase.from("order_status_log").insert({
      order_id: order.id,
      from_status: null,
      to_status: "pendiente_aprobacion",
      notes: "Diseño enviado desde el configurador web — esperando aprobación de María José",
    });

    // 4. Notificar a admins
    await sendNewConfiguratorRequestEmail({
      orderNumber: order.order_number,
      orderId: order.id,
      customerName: full_name,
      customerEmail: email,
      customerPhone: phone,
      modeloCamisa: modelo_camisa,
      colorCamisa: color_camisa,
      designName: design_name,
      textoDiseno: texto_diseno,
      fuenteTexto: fuente_texto,
      colorTexto: color_texto,
      precioBase: precio_base,
    });

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
    });
  } catch (err) {
    console.error("[configurador]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
