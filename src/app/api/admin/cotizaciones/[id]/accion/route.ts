import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  sendDesignApprovedEmail,
  sendCotizacionReadyEmail,
  sendDesignAdjustmentsEmail,
  sendRejectionEmail,
} from "@/lib/email/templates";

interface AcionPayload {
  action: "cotizar" | "aprobar" | "ajustes" | "rechazar" | "mensaje";
  precio_cotizado?: number;
  mensaje?: string;
  razon?: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar que el usuario es admin
    const supabaseAuth = await createClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user || user.app_metadata?.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const payload: AcionPayload = await req.json();
    const { action } = payload;

    const supabase = createServiceClient();

    // Obtener el pedido actual
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, order_number, flow, status, shipping_name, shipping_email, cotizacion_price, communication_thread")
      .eq("id", id)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    if (!["B", "C"].includes(order.flow)) {
      return NextResponse.json({ error: "Este pedido no es un Flujo B o C" }, { status: 400 });
    }

    const now = new Date().toISOString();

    // ── COTIZAR (Flujo C) / APROBAR (Flujo B) ─────────────────────
    if (action === "cotizar" || action === "aprobar") {
      const { precio_cotizado } = payload;
      if (!precio_cotizado || precio_cotizado <= 0) {
        return NextResponse.json({ error: "El precio debe ser mayor a 0" }, { status: 400 });
      }

      // Generar Wompi Link — por ahora guardamos el precio y marcamos el pedido
      // El Wompi Link real se genera llamando a la API de Wompi
      // En esta implementación inicial, generamos un link simulado para completar el flujo
      const wompiLinkUrl = await generateWompiLink(order.order_number, precio_cotizado);

      const newStatus = "aprobado_pendiente_pago";
      const prevStatus = order.status;

      const updates: Record<string, unknown> = {
        cotizacion_price: precio_cotizado,
        status: newStatus,
        wompi_link_url: wompiLinkUrl,
        updated_at: now,
      };

      if (action === "aprobar") {
        updates.approved_at = now;
      }

      const { error: updateErr } = await supabase
        .from("orders")
        .update(updates)
        .eq("id", id);

      if (updateErr) {
        return NextResponse.json({ error: "Error al actualizar el pedido" }, { status: 500 });
      }

      // Log de estado
      await supabase.from("order_status_log").insert({
        order_id: id,
        from_status: prevStatus,
        to_status: newStatus,
        notes: action === "aprobar"
          ? `Diseño aprobado por admin. Precio: $${precio_cotizado}`
          : `Cotización enviada. Precio: $${precio_cotizado}`,
      });

      // Notificar al cliente
      const orderForEmail = {
        order_number: order.order_number,
        shipping_name: order.shipping_name,
        shipping_email: order.shipping_email,
        shipping_phone: "",
        shipping_address: "",
        shipping_city: "",
        shipping_department: "",
        subtotal: precio_cotizado,
        discount_amount: 0,
        shipping_cost: 0,
        total: precio_cotizado,
      };

      if (action === "aprobar") {
        await sendDesignApprovedEmail(orderForEmail, wompiLinkUrl);
      } else {
        await sendCotizacionReadyEmail(orderForEmail, wompiLinkUrl, precio_cotizado);
      }

      return NextResponse.json({
        message: action === "aprobar"
          ? "Diseño aprobado. Link de pago enviado al cliente."
          : "Cotización enviada. Link de pago enviado al cliente.",
        linkUrl: wompiLinkUrl,
      });
    }

    // ── PEDIR AJUSTES ─────────────────────────────────────────────
    if (action === "ajustes") {
      const { mensaje } = payload;
      if (!mensaje?.trim()) {
        return NextResponse.json({ error: "El mensaje es requerido" }, { status: 400 });
      }

      const prevStatus = order.status;
      const thread = Array.isArray(order.communication_thread) ? order.communication_thread : [];
      thread.push({ author: "admin", message: mensaje, created_at: now });

      await supabase
        .from("orders")
        .update({ status: "en_ajustes", communication_thread: thread, updated_at: now })
        .eq("id", id);

      await supabase.from("order_status_log").insert({
        order_id: id,
        from_status: prevStatus,
        to_status: "en_ajustes",
        notes: `Ajustes solicitados: ${mensaje}`,
      });

      const orderForEmail = { order_number: order.order_number, shipping_name: order.shipping_name, shipping_email: order.shipping_email };
      await sendDesignAdjustmentsEmail(orderForEmail, mensaje);

      return NextResponse.json({ message: "Mensaje enviado al cliente. Estado: En ajustes." });
    }

    // ── MENSAJE ───────────────────────────────────────────────────
    if (action === "mensaje") {
      const { mensaje } = payload;
      if (!mensaje?.trim()) {
        return NextResponse.json({ error: "El mensaje es requerido" }, { status: 400 });
      }

      const thread = Array.isArray(order.communication_thread) ? order.communication_thread : [];
      thread.push({ author: "admin", message: mensaje, created_at: now });

      await supabase
        .from("orders")
        .update({ communication_thread: thread, updated_at: now })
        .eq("id", id);

      return NextResponse.json({ message: "Mensaje registrado en el hilo de comunicación." });
    }

    // ── RECHAZAR ──────────────────────────────────────────────────
    if (action === "rechazar") {
      const { razon } = payload;
      const prevStatus = order.status;

      await supabase
        .from("orders")
        .update({
          status: "rechazado",
          rejected_at: now,
          rejection_reason: razon ?? null,
          updated_at: now,
        })
        .eq("id", id);

      await supabase.from("order_status_log").insert({
        order_id: id,
        from_status: prevStatus,
        to_status: "rechazado",
        notes: razon ? `Rechazado: ${razon}` : "Rechazado sin razón indicada",
      });

      const orderForEmail = { order_number: order.order_number, shipping_name: order.shipping_name, shipping_email: order.shipping_email };
      await sendRejectionEmail(orderForEmail, razon ?? "No se pudo procesar tu solicitud en este momento.");

      return NextResponse.json({ message: "Solicitud rechazada. Cliente notificado." });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (err) {
    console.error("[cotizaciones/accion]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// Genera un Wompi Link de pago sin vencimiento (implementación placeholder)
// En producción, llamar a la API de Wompi Payment Links
async function generateWompiLink(
  orderNumber: string,
  amountCOP: number
): Promise<string> {
  const WOMPI_PRIVATE_KEY = process.env.WOMPI_PRIVATE_KEY;
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ricamo.co";

  if (!WOMPI_PRIVATE_KEY) {
    // Fallback para desarrollo: URL de seguimiento
    return `${SITE_URL}/seguimiento?orden=${orderNumber}`;
  }

  try {
    const res = await fetch("https://production.wompi.co/v1/payment_links", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WOMPI_PRIVATE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: `Ricamo — ${orderNumber}`,
        description: `Pago de diseño personalizado Ricamo ${orderNumber}`,
        single_use: false,
        collect_shipping: false,
        currency: "COP",
        amount_in_cents: Math.round(amountCOP * 100),
        redirect_url: `${SITE_URL}/confirmacion/${orderNumber}`,
      }),
    });

    if (!res.ok) {
      console.error("[generateWompiLink] Wompi API error:", await res.text());
      return `${SITE_URL}/seguimiento?orden=${orderNumber}`;
    }

    const data = await res.json();
    return data.data?.url ?? `${SITE_URL}/seguimiento?orden=${orderNumber}`;
  } catch (err) {
    console.error("[generateWompiLink]", err);
    return `${SITE_URL}/seguimiento?orden=${orderNumber}`;
  }
}
