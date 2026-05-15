import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { sendOrderStatusEmail } from "@/lib/email/templates";
import type { OrderStatus } from "@/types";

const VALID_TRANSITIONS: Record<string, OrderStatus[]> = {
  // Flujo A
  pending_payment: ["paid", "cancelled"],
  paid: ["preparing", "en_produccion"],
  en_produccion: ["preparing", "shipped", "cancelled"],
  preparing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
  // Flujos B/C
  cotizacion_pendiente: ["en_ajustes", "aprobado_pendiente_pago", "rechazado"],
  pendiente_aprobacion: ["en_ajustes", "aprobado_pendiente_pago", "rechazado"],
  en_ajustes: ["pendiente_aprobacion", "aprobado_pendiente_pago", "rechazado"],
  aprobado_pendiente_pago: ["paid", "rechazado", "cancelled"],
  rechazado: [],
};

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Verificar autenticación del admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { status, trackingNumber, courier } = await req.json();

  const service = await createServiceClient();

  // Obtener pedido actual
  const { data: order } = await service.from("orders").select("*").eq("id", id).single();
  if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });

  // Validar transición — RB-ADM-02
  const allowed = VALID_TRANSITIONS[order.status] ?? [];
  if (!allowed.includes(status)) {
    return NextResponse.json(
      { error: `Transición inválida: ${order.status} → ${status}` },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const updates: Record<string, string | null> = { status };
  if (status === "paid") {
    updates.paid_at = now;
  }
  if (status === "shipped") {
    updates.tracking_number = trackingNumber || null;
    updates.courier = courier || null;
    updates.shipped_at = now;
  }
  if (status === "delivered") {
    updates.delivered_at = now;
  }
  if (status === "aprobado_pendiente_pago" && order.approved_at == null) {
    updates.approved_at = now;
  }
  if (status === "rechazado") {
    updates.rejected_at = now;
  }

  await service.from("orders").update(updates).eq("id", id);

  // Log auditable — RB-PED-04
  await service.from("order_status_log").insert({
    order_id: id,
    from_status: order.status,
    to_status: status,
    changed_by: user.id,
    notes: trackingNumber ? `Guía: ${trackingNumber} · ${courier ?? ""}` : null,
  });

  // Notificación a la clienta — RB-PED-03
  const updatedOrder = { ...order, ...updates };
  await sendOrderStatusEmail(updatedOrder, status).catch(console.error);

  return NextResponse.json({ ok: true });
}
