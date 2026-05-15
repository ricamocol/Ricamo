import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { sendPaymentReminderEmail } from "@/lib/email/templates";

// Cron llamado diariamente desde Vercel Cron o Render Cron.
// Envía recordatorios de pago en días 3, 7 y 14 — RB-CHK-06.
// Los Wompi Links no vencen automáticamente — se cancelan solo manualmente.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const now = new Date();

  // Obtener pedidos en estado aprobado_pendiente_pago con link activo
  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, order_number, shipping_name, shipping_email, wompi_link_url, payment_reminder_sent_at, approved_at, updated_at")
    .eq("status", "aprobado_pendiente_pago")
    .not("wompi_link_url", "is", null);

  if (error) {
    console.error("[payment-reminders] fetch error:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const results = { sent: 0, skipped: 0, errors: 0 };

  for (const order of orders ?? []) {
    try {
      // Calcular días desde la aprobación (o desde el último update si no hay approved_at)
      const baseDate = order.approved_at
        ? new Date(order.approved_at)
        : new Date(order.updated_at);

      const daysSince = Math.floor(
        (now.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const sent = (order.payment_reminder_sent_at as Record<string, string | undefined>) ?? {};
      const linkUrl = order.wompi_link_url!;

      const orderForEmail = {
        order_number: order.order_number,
        shipping_name: order.shipping_name,
        shipping_email: order.shipping_email,
      };

      // Determinar qué recordatorio enviar
      let dayKey: 3 | 7 | 14 | null = null;

      if (daysSince >= 14 && !sent.day14) {
        dayKey = 14;
      } else if (daysSince >= 7 && !sent.day7) {
        dayKey = 7;
      } else if (daysSince >= 3 && !sent.day3) {
        dayKey = 3;
      }

      if (!dayKey) {
        results.skipped++;
        continue;
      }

      // Enviar recordatorio
      await sendPaymentReminderEmail(orderForEmail, linkUrl, dayKey);

      // Marcar como enviado
      const updatedSent = {
        ...sent,
        [`day${dayKey}`]: now.toISOString(),
      };

      await supabase
        .from("orders")
        .update({
          payment_reminder_sent_at: updatedSent,
          updated_at: now.toISOString(),
        })
        .eq("id", order.id);

      results.sent++;
    } catch (err) {
      console.error(`[payment-reminders] error on order ${order.id}:`, err);
      results.errors++;
    }
  }

  console.log(`[payment-reminders] sent=${results.sent} skipped=${results.skipped} errors=${results.errors}`);

  return NextResponse.json({
    ok: true,
    timestamp: now.toISOString(),
    ...results,
  });
}
