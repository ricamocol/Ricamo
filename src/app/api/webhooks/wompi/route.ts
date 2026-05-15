import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { createServiceClient } from "@/lib/supabase/server";
import {
  sendOrderConfirmationEmail,
  sendNewOrderAdminEmail,
  sendPaymentFailedEmail,
  sendOrderStatusEmail,
} from "@/lib/email/templates";
import type { WompiWebhookEvent } from "@/types";

// Verificar firma del webhook — seguridad
function verifySignature(event: WompiWebhookEvent, secret: string): boolean {
  const { properties, checksum } = event.signature;

  const values = properties.map((prop) => {
    const parts = prop.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = event.data;
    for (const part of parts) {
      value = value?.[part];
    }
    return value ?? "";
  });

  const str = [...values, event.timestamp, secret].join("");
  const expected = createHash("sha256").update(str).digest("hex");
  return expected === checksum;
}

export async function POST(req: NextRequest) {
  try {
    const body: WompiWebhookEvent = await req.json();
    const secret = process.env.WOMPI_EVENTS_SECRET!;

    // Validar firma — RB-CHK-04
    if (!verifySignature(body, secret)) {
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }

    const { event, data } = body;
    if (event !== "transaction.updated") {
      return NextResponse.json({ ok: true });
    }

    const tx = data.transaction;
    const supabase = createServiceClient();

    // Buscar pedido: primero por wompi_reference (Flujo A), luego por order_number (Flujos B/C)
    const SELECT_FIELDS = `
      *, cart_session_id, flow, notes,
      items:order_items(variant_id, quantity, product_variants(stock_pre_producido))
    `;

    let order: Record<string, any> | null = null;

    const byRef = await supabase
      .from("orders")
      .select(SELECT_FIELDS)
      .eq("wompi_reference", tx.reference)
      .maybeSingle();
    order = byRef.data;

    if (!order) {
      const byNum = await supabase
        .from("orders")
        .select(SELECT_FIELDS)
        .eq("order_number", tx.reference)
        .maybeSingle();
      order = byNum.data;
    }

    if (!order) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    // Idempotencia: si ya está pagado, no hacer nada
    if (order.status === "paid" && tx.status === "APPROVED") {
      return NextResponse.json({ ok: true });
    }

    const flow = order.flow ?? "A";

    if (tx.status === "APPROVED") {
      // ── PAGO APROBADO ──────────────────────────────────────

      // 1. Solo Flujo A descuenta inventario — RB-INV-01, RB-CHK-03
      if (flow === "A") {
        for (const item of order.items ?? []) {
          await supabase.rpc("confirm_stock_sale", {
            p_variant_id: item.variant_id,
            p_session_id: order.cart_session_id ?? order.wompi_reference,
            p_quantity: item.quantity,
            p_order_id: order.id,
          });
        }
      }

      // 2. Determinar siguiente estado — RB-PED-01
      // Flujo A pre-producido → preparing | Flujo A bajo demanda / B/C → en_produccion
      const hasPreStock = flow === "A" &&
        (order.items ?? []).some((i: any) => (i.product_variants?.stock_pre_producido ?? 0) > 0);
      const nextStatus = (flow === "A" && hasPreStock) ? "preparing" : "en_produccion";

      await supabase
        .from("orders")
        .update({
          status: "paid",
          wompi_transaction_id: tx.id,
          paid_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      await supabase.from("order_status_log").insert({
        order_id: order.id,
        from_status: order.status,
        to_status: "paid",
        notes: `Pago confirmado por Wompi. Transacción: ${tx.id}`,
      });

      // Auto-transición — RB-PED-01
      await supabase.from("orders").update({ status: nextStatus }).eq("id", order.id);
      await supabase.from("order_status_log").insert({
        order_id: order.id,
        from_status: "paid",
        to_status: nextStatus,
        notes: "Transición automática post-pago",
      });

      // 3. Atribución de influencer — RB-INF-02
      const notes = order.notes as string | null;
      if (notes?.startsWith("promotion_id:")) {
        const promotionId = notes.replace("promotion_id:", "").trim();
        const { data: promo } = await supabase
          .from("promotions")
          .select("id, influencer_id")
          .eq("id", promotionId)
          .single();
        if (promo?.influencer_id) {
          await supabase.from("influencer_attributions").insert({
            influencer_id: promo.influencer_id,
            promotion_id: promotionId,
            order_id: order.id,
            customer_email: order.shipping_email,
            order_total: order.total,
          });
        }
      }

      // 4. Emails — RB-PED-03
      await Promise.allSettled([
        sendOrderConfirmationEmail(order),
        sendNewOrderAdminEmail(order),
      ]);

    } else if (tx.status === "DECLINED" || tx.status === "VOIDED" || tx.status === "ERROR") {
      // ── PAGO RECHAZADO ────────────────────────────────────

      if (flow === "A") {
        // Flujo A: cancelar y liberar reservas
        await supabase.rpc("release_expired_reservations");
        await supabase.from("orders").update({ status: "cancelled" }).eq("id", order.id);
        await supabase.from("order_status_log").insert({
          order_id: order.id,
          from_status: "pending_payment",
          to_status: "cancelled",
          notes: `Pago rechazado por Wompi. Estado: ${tx.status}`,
        });
      }
      // Flujos B/C: no cancelar — el cliente puede reintentar con el mismo Wompi Link

      await sendPaymentFailedEmail(order);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[wompi_webhook]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
