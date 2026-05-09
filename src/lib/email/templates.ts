import { resend, FROM, ADMIN_EMAILS } from "./resend";
import { formatCOP, formatDate } from "@/lib/utils/format";

// ── Paleta usada en emails ─────────────────────────────────────
const C = {
  bg: "#F3EDE0",
  espresso: "#3D2B1F",
  taupe: "#897568",
  blush: "#EAC9C9",
  sand: "#CEC3AB",
};

function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin:0; padding:0; background:${C.bg}; font-family:'Helvetica Neue',Arial,sans-serif; }
    .container { max-width:560px; margin:0 auto; padding:40px 20px; }
    .logo { font-size:26px; color:${C.espresso}; font-style:italic; font-family:Georgia,serif; text-align:center; margin-bottom:32px; }
    .card { background:#ffffff; border:1px solid ${C.blush}; padding:32px; }
    h2 { font-family:Georgia,serif; font-weight:400; color:${C.espresso}; font-size:22px; margin:0 0 16px; }
    p { color:${C.taupe}; font-size:14px; line-height:1.7; margin:0 0 14px; }
    .highlight { color:${C.espresso}; font-weight:600; }
    .divider { border:none; border-top:1px solid ${C.sand}; margin:24px 0; }
    .label { font-size:11px; letter-spacing:0.15em; text-transform:uppercase; color:${C.taupe}; font-weight:600; }
    .item-row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid ${C.bg}; font-size:13px; color:${C.espresso}; }
    .total-row { display:flex; justify-content:space-between; padding:12px 0 0; font-size:15px; font-weight:600; color:${C.espresso}; }
    .btn { display:inline-block; margin-top:20px; padding:12px 28px; background:${C.espresso}; color:#F3EDE0; text-decoration:none; font-size:11px; letter-spacing:0.2em; text-transform:uppercase; font-weight:500; }
    .footer { text-align:center; margin-top:24px; font-size:11px; color:${C.taupe}; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">Mar Boutique</div>
    <div class="card">${content}</div>
    <div class="footer">
      Mar Boutique · Cartagena, Colombia<br>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}" style="color:${C.taupe};">marboutique.co</a>
    </div>
  </div>
</body>
</html>`;
}

function itemsTable(items: any[]): string {
  return items
    .map(
      (item) =>
        `<div class="item-row">
          <span>${item.product_name} <span style="color:${C.taupe};font-size:12px;">× ${item.quantity}</span></span>
          <span>${formatCOP(item.total_price)}</span>
        </div>`
    )
    .join("");
}

// ── Confirmación de pedido a la clienta — RB-PED-03 ───────────
export async function sendOrderConfirmationEmail(order: any) {
  const items = order.items ?? [];
  const html = emailWrapper(`
    <h2>¡Recibimos tu pedido! 🎉</h2>
    <p>Hola <span class="highlight">${order.shipping_name}</span>, tu pedido está confirmado y ya estamos preparándolo con cariño.</p>
    <hr class="divider">
    <p class="label">Número de pedido</p>
    <p class="highlight" style="font-size:18px;">${order.order_number}</p>
    <hr class="divider">
    <p class="label">Tus prendas</p>
    ${itemsTable(items)}
    <div class="total-row">
      <span>Total pagado</span>
      <span>${formatCOP(order.total)}</span>
    </div>
    <hr class="divider">
    <p class="label">Envío a</p>
    <p>${order.shipping_address}, ${order.shipping_city}, ${order.shipping_department}</p>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/seguimiento?orden=${order.order_number}&email=${encodeURIComponent(order.shipping_email)}" class="btn">
      Seguir mi pedido
    </a>
    <p style="margin-top:20px;font-size:12px;">¿Preguntas? Escríbenos por WhatsApp o a hola@marboutique.co.</p>
  `);

  return resend.emails.send({
    from: FROM,
    to: order.shipping_email,
    subject: `Pedido confirmado ${order.order_number} — Mar Boutique`,
    html,
  });
}

// ── Notificación a los 3 admins — RB-PED-05 ──────────────────
export async function sendNewOrderAdminEmail(order: any) {
  if (!ADMIN_EMAILS.length) return;

  const items = order.items ?? [];
  const html = emailWrapper(`
    <h2>Nuevo pedido recibido</h2>
    <p class="label">Pedido</p>
    <p class="highlight" style="font-size:18px;">${order.order_number}</p>
    <p class="label">Clienta</p>
    <p>${order.shipping_name} · ${order.shipping_email} · ${order.shipping_phone}</p>
    <p class="label">Envío a</p>
    <p>${order.shipping_address}, ${order.shipping_city}, ${order.shipping_department}</p>
    <hr class="divider">
    <p class="label">Prendas</p>
    ${itemsTable(items)}
    <div class="total-row">
      <span>Total</span>
      <span>${formatCOP(order.total)}</span>
    </div>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/pedidos/${order.id}" class="btn">
      Ver en panel admin
    </a>
  `);

  return resend.emails.send({
    from: FROM,
    to: ADMIN_EMAILS,
    subject: `[Mar Boutique] Nuevo pedido ${order.order_number} — ${formatCOP(order.total)}`,
    html,
  });
}

// ── Pago rechazado — RB-CHK-05 ───────────────────────────────
export async function sendPaymentFailedEmail(order: any) {
  const html = emailWrapper(`
    <h2>Hubo un problema con tu pago</h2>
    <p>Hola <span class="highlight">${order.shipping_name}</span>, no pudimos procesar el pago de tu pedido <strong>${order.order_number}</strong>.</p>
    <p>Tus productos siguen disponibles. Puedes intentar de nuevo cuando quieras.</p>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/carrito" class="btn">
      Volver al carrito
    </a>
    <p style="margin-top:20px;font-size:12px;">Si el problema persiste, escríbenos a hola@marboutique.co.</p>
  `);

  return resend.emails.send({
    from: FROM,
    to: order.shipping_email,
    subject: `Problema con tu pago — Mar Boutique`,
    html,
  });
}

// ── Cambio de estado del pedido — RB-PED-03 ──────────────────
export async function sendOrderStatusEmail(order: any, newStatus: string) {
  const statusMessages: Record<string, { subject: string; body: string }> = {
    preparing: {
      subject: `Tu pedido ${order.order_number} está en preparación`,
      body: `¡Buenas noticias! Estamos empacando tu pedido <strong>${order.order_number}</strong> con mucho cariño. Pronto lo tendrás en camino.`,
    },
    shipped: {
      subject: `Tu pedido ${order.order_number} va en camino 🚚`,
      body: `Tu pedido <strong>${order.order_number}</strong> ya fue entregado al courier${order.tracking_number ? ` con guía <strong>${order.tracking_number}</strong>` : ""}. Tiempo estimado: 3-5 días hábiles.`,
    },
    delivered: {
      subject: `¡Tu pedido ${order.order_number} fue entregado! 🎉`,
      body: `Tu pedido <strong>${order.order_number}</strong> fue entregado. Esperamos que ames tus nuevas prendas. ¡Úsalas con intención! 💛`,
    },
  };

  const msg = statusMessages[newStatus];
  if (!msg) return;

  const html = emailWrapper(`
    <h2>${msg.subject}</h2>
    <p>${msg.body}</p>
    <a href="${process.env.NEXT_PUBLIC_SITE_URL}/seguimiento?orden=${order.order_number}&email=${encodeURIComponent(order.shipping_email)}" class="btn">
      Ver estado del pedido
    </a>
  `);

  return resend.emails.send({
    from: FROM,
    to: order.shipping_email,
    subject: msg.subject,
    html,
  });
}
