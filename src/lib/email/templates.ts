import { getResend, FROM, ADMIN_EMAILS } from "./resend";
import { formatCOP } from "@/lib/utils/format";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ricamo.co";

// ── Paleta Ricamo ──────────────────────────────────────────────────
const C = {
  cream:   "#faf7f1",
  cream2:  "#e8e0c8",
  ink:     "#0e0e0e",
  ink3:    "#6a6356",
  gold:    "#f0c419",
  terra:   "#b85539",
  border:  "#d8cfbb",
  white:   "#ffffff",
  green:   "#2d7a3d",
  blue:    "#1a6fa8",
  purple:  "#6b5ea7",
};

// ── Wrapper principal ──────────────────────────────────────────────
function emailBase(preheader: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Ricamo</title>
</head>
<body style="margin:0;padding:0;background:${C.cream};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌</div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.cream};">
    <tr>
      <td align="center" style="padding:36px 16px 28px;">

        <!-- LOGO HEADER -->
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">
          <tr>
            <td style="background:${C.ink};padding:20px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <a href="${SITE_URL}" style="text-decoration:none;">
                      <span style="font-family:Georgia,'Times New Roman',serif;font-size:28px;color:${C.gold};font-weight:700;letter-spacing:0.02em;">Ricamo</span>
                    </a>
                    <div style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:${C.ink3};margin-top:2px;">lo creas, lo llevas</div>
                  </td>
                  <td align="right" valign="middle">
                    <span style="font-family:Arial,sans-serif;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:${C.ink3};">Medellín · Colombia</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- CARD -->
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:${C.white};border:1px solid ${C.border};border-top:none;">
          <tr>
            <td style="padding:36px 36px 28px;">
              ${content}
            </td>
          </tr>
        </table>

        <!-- FOOTER -->
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;margin-top:20px;">
          <tr>
            <td align="center" style="padding:0 20px;">
              <p style="font-family:Arial,sans-serif;font-size:11px;color:${C.ink3};line-height:1.7;margin:0;">
                <a href="${SITE_URL}" style="color:${C.ink3};text-decoration:none;">ricamo.co</a>
                &nbsp;·&nbsp;
                <a href="mailto:hola@ricamo.co" style="color:${C.ink3};text-decoration:none;">hola@ricamo.co</a>
                &nbsp;·&nbsp;
                <a href="https://www.instagram.com/ricamo.co/" style="color:${C.ink3};text-decoration:none;">@ricamo.co</a>
              </p>
              <p style="font-family:Arial,sans-serif;font-size:10px;color:${C.border};margin:8px 0 0;">
                Estás recibiendo este correo porque realizaste una compra o tienes una cuenta en Ricamo.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Componentes reutilizables ──────────────────────────────────────

function heading(text: string): string {
  return `<h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:400;font-style:italic;font-size:26px;color:${C.ink};margin:0 0 8px;line-height:1.3;">${text}</h1>`;
}

function subheading(text: string): string {
  return `<p style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:${C.gold};font-weight:700;margin:0 0 14px;background:${C.ink};display:inline-block;padding:3px 10px;">${text}</p>`;
}

function bodyText(text: string, extra = ""): string {
  return `<p style="font-family:Arial,sans-serif;font-size:14px;color:${C.ink3};line-height:1.75;margin:0 0 14px;${extra}">${text}</p>`;
}

function divider(): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0;"><tr><td style="border-top:1px solid ${C.border};font-size:0;line-height:0;">&nbsp;</td></tr></table>`;
}

function label(text: string): string {
  return `<p style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:${C.ink3};font-weight:600;margin:0 0 4px;opacity:0.6;">${text}</p>`;
}

function value(text: string): string {
  return `<p style="font-family:Arial,sans-serif;font-size:14px;color:${C.ink};font-weight:600;margin:0 0 14px;">${text}</p>`;
}

function cta(text: string, url: string, secondary = false): string {
  const bg = secondary ? C.cream2 : C.ink;
  const color = secondary ? C.ink : C.cream;
  return `<table cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
    <tr>
      <td style="background:${bg};">
        <a href="${url}" style="display:inline-block;padding:14px 32px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;font-weight:700;color:${color};text-decoration:none;">${text}</a>
      </td>
    </tr>
  </table>`;
}

function alertBox(text: string, color = C.cream2): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${color};margin:16px 0;">
    <tr><td style="padding:14px 18px;font-family:Arial,sans-serif;font-size:13px;color:${C.ink};line-height:1.6;">${text}</td></tr>
  </table>`;
}

function orderHeader(orderNumber: string, status: string, statusColor: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.cream};margin-bottom:20px;">
    <tr>
      <td style="padding:14px 18px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              ${label("Número de pedido")}
              <p style="font-family:Georgia,serif;font-size:18px;color:${C.ink};font-weight:600;margin:0;">${orderNumber}</p>
            </td>
            <td align="right" valign="middle">
              <span style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:${statusColor};font-weight:700;background:${statusColor}18;border:1px solid ${statusColor}40;padding:4px 10px;">${status}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function itemsTable(items: { product_name: string; variant_attrs?: Record<string,string>; quantity: number; total_price: number }[]): string {
  if (!items.length) return "";
  const rows = items.map((item) => {
    const attrs = item.variant_attrs ? Object.values(item.variant_attrs).filter(Boolean).join(" · ") : "";
    return `<tr>
      <td style="font-family:Arial,sans-serif;font-size:13px;color:${C.ink};padding:10px 0;border-bottom:1px solid ${C.cream};">
        <span style="font-weight:500;">${item.product_name}</span>${attrs ? `<br><span style="font-size:11px;color:${C.ink3};">${attrs}</span>` : ""}
        <span style="color:${C.ink3};font-size:12px;">&nbsp;&nbsp;×${item.quantity}</span>
      </td>
      <td align="right" style="font-family:Arial,sans-serif;font-size:13px;color:${C.ink};font-weight:600;padding:10px 0;border-bottom:1px solid ${C.cream};white-space:nowrap;">
        ${formatCOP(item.total_price)}
      </td>
    </tr>`;
  }).join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>`;
}

function totalsTable(order: { subtotal: number; discount_amount: number; shipping_cost: number; courier?: string; total: number }): string {
  const hasDiscount = order.discount_amount > 0;
  const hasShipping = order.shipping_cost > 0;
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:4px;">
    <tr>
      <td style="font-family:Arial,sans-serif;font-size:13px;color:${C.ink3};padding:8px 0 4px;">Subtotal</td>
      <td align="right" style="font-family:Arial,sans-serif;font-size:13px;color:${C.ink3};padding:8px 0 4px;">${formatCOP(order.subtotal)}</td>
    </tr>
    ${hasDiscount ? `<tr>
      <td style="font-family:Arial,sans-serif;font-size:13px;color:${C.terra};padding:4px 0;">Descuento</td>
      <td align="right" style="font-family:Arial,sans-serif;font-size:13px;color:${C.terra};padding:4px 0;">−${formatCOP(order.discount_amount)}</td>
    </tr>` : ""}
    ${hasShipping ? `<tr>
      <td style="font-family:Arial,sans-serif;font-size:13px;color:${C.ink3};padding:4px 0;">Envío${order.courier ? ` (${order.courier})` : ""}</td>
      <td align="right" style="font-family:Arial,sans-serif;font-size:13px;color:${C.ink3};padding:4px 0;">${formatCOP(order.shipping_cost)}</td>
    </tr>` : ""}
    <tr><td style="border-top:1px solid ${C.border};padding-top:2px;"></td><td style="border-top:1px solid ${C.border};"></td></tr>
    <tr>
      <td style="font-family:Georgia,serif;font-size:16px;color:${C.ink};font-weight:600;padding:10px 0 0;">Total</td>
      <td align="right" style="font-family:Georgia,serif;font-size:16px;color:${C.ink};font-weight:600;padding:10px 0 0;">${formatCOP(order.total)}</td>
    </tr>
  </table>`;
}

function shippingBlock(order: { shipping_name: string; shipping_address: string; shipping_city: string; shipping_department: string; shipping_phone: string }): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.cream};margin-top:14px;">
    <tr>
      <td style="padding:14px 18px;">
        ${label("Dirección de entrega")}
        <p style="font-family:Arial,sans-serif;font-size:13px;color:${C.ink};margin:0;line-height:1.6;">
          <strong>${order.shipping_name}</strong><br>
          ${order.shipping_address}<br>
          ${order.shipping_city}, ${order.shipping_department}<br>
          <span style="color:${C.ink3};">${order.shipping_phone}</span>
        </p>
      </td>
    </tr>
  </table>`;
}

function paymentLinkBlock(linkUrl: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.gold};margin:20px 0;">
    <tr>
      <td style="padding:20px 24px;">
        ${label("Link de pago")}
        <p style="font-family:Arial,sans-serif;font-size:13px;color:${C.ink};margin:4px 0 12px;line-height:1.5;">
          Tu link de pago está listo. No tiene vencimiento automático — puedes pagarlo cuando estés lista.
        </p>
        <a href="${linkUrl}" style="display:inline-block;padding:12px 28px;background:${C.ink};font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;font-weight:700;color:${C.cream};text-decoration:none;">Pagar ahora</a>
      </td>
    </tr>
  </table>`;
}

// ══════════════════════════════════════════════════════════════════
// PLANTILLAS — FLUJO A (pre-diseñados)
// ══════════════════════════════════════════════════════════════════

// 1. Confirmación de pedido pagado → cliente
export async function sendOrderConfirmationEmail(order: any) {
  const items = order.items ?? [];
  const trackUrl = `${SITE_URL}/seguimiento?orden=${order.order_number}&email=${encodeURIComponent(order.shipping_email)}`;

  const content = `
    ${subheading("Pedido confirmado")}
    ${heading("¡Gracias por tu compra!")}
    ${bodyText(`Hola <strong style="color:${C.ink};">${order.shipping_name}</strong>, tu pedido está confirmado y ya lo estamos preparando para ti.`)}
    ${divider()}
    ${orderHeader(order.order_number, "Confirmado", C.green)}
    ${label("Tus prendas")}
    ${itemsTable(items)}
    ${totalsTable(order)}
    ${divider()}
    ${shippingBlock(order)}
    ${cta("Seguir mi pedido", trackUrl)}
    ${divider()}
    ${bodyText(`¿Tienes preguntas? Escríbenos por <a href="https://wa.me/573108007700" style="color:${C.terra};">WhatsApp</a> o a <a href="mailto:hola@ricamo.co" style="color:${C.terra};">hola@ricamo.co</a>.`, "font-size:12px;")}
  `;

  return getResend().emails.send({
    from: FROM,
    to: order.shipping_email,
    subject: `Tu pedido ${order.order_number} está confirmado — Ricamo`,
    html: emailBase(`Tu pedido ${order.order_number} fue confirmado. Ya lo estamos preparando.`, content),
  });
}

// 2. Nuevo pedido → admins
export async function sendNewOrderAdminEmail(order: any) {
  if (!ADMIN_EMAILS.length) return;
  const items = order.items ?? [];
  const adminUrl = `${SITE_URL}/admin/pedidos/${order.id}`;

  const content = `
    ${subheading("Nuevo pedido")}
    ${heading("Nuevo pedido recibido")}
    ${orderHeader(order.order_number, "Por preparar", C.terra)}
    ${label("Cliente")}
    ${value(order.shipping_name)}
    <p style="font-family:Arial,sans-serif;font-size:13px;color:${C.ink3};margin:0 0 16px;">
      <a href="mailto:${order.shipping_email}" style="color:${C.terra};">${order.shipping_email}</a>&nbsp;·&nbsp;
      <a href="tel:${order.shipping_phone}" style="color:${C.ink3};text-decoration:none;">${order.shipping_phone}</a>
    </p>
    ${divider()}
    ${label("Prendas")}
    ${itemsTable(items)}
    ${totalsTable(order)}
    ${divider()}
    ${shippingBlock(order)}
    ${cta("Ver pedido en el admin", adminUrl)}
  `;

  return getResend().emails.send({
    from: FROM,
    to: ADMIN_EMAILS,
    subject: `[Nuevo pedido] ${order.order_number} — ${formatCOP(order.total)}`,
    html: emailBase(`Nuevo pedido de ${order.shipping_name} por ${formatCOP(order.total)}.`, content),
  });
}

// 3. Pago rechazado → cliente
export async function sendPaymentFailedEmail(order: any) {
  const content = `
    ${subheading("Estado del pago")}
    ${heading("No pudimos procesar tu pago")}
    ${bodyText(`Hola <strong style="color:${C.ink};">${order.shipping_name}</strong>, el pago del pedido <strong style="color:${C.ink};">${order.order_number}</strong> no pudo completarse.`)}
    ${alertBox(`<strong>¿Qué puedes hacer?</strong><br>
      · Verificar los datos de tu tarjeta<br>
      · Intentar con otro método (PSE, Nequi, Daviplata)<br>
      · Contactar a tu banco si el problema persiste`)}
    ${cta("Volver al carrito", `${SITE_URL}/carrito`)}
    ${divider()}
    ${bodyText(`¿Necesitas ayuda? Escríbenos por <a href="https://wa.me/573108007700" style="color:${C.terra};">WhatsApp</a>.`, "font-size:12px;")}
  `;

  return getResend().emails.send({
    from: FROM,
    to: order.shipping_email,
    subject: "Problema con tu pago — Ricamo",
    html: emailBase("Tu pago no pudo procesarse. Tus productos siguen disponibles.", content),
  });
}

// 4. Cambios de estado → cliente (preparing / en_produccion / shipped / delivered)
export async function sendOrderStatusEmail(order: any, newStatus: string) {
  const trackUrl = `${SITE_URL}/seguimiento?orden=${order.order_number}&email=${encodeURIComponent(order.shipping_email)}`;

  type StatusConfig = { preheader: string; badge: string; badgeColor: string; title: string; body: string; extra?: string };

  const configs: Record<string, StatusConfig> = {
    preparing: {
      preheader: `Tu pedido ${order.order_number} está siendo empacado.`,
      badge: "Empacando",
      badgeColor: C.purple,
      title: "Estamos empacando tu pedido",
      body: `Tu pedido <strong style="color:${C.ink};">${order.order_number}</strong> está siendo preparado con cuidado. Te avisaremos cuando sea despachado.`,
    },
    en_produccion: {
      preheader: `Tu pedido ${order.order_number} entró a producción.`,
      badge: "En producción",
      badgeColor: C.terra,
      title: "Tu pedido está en producción",
      body: `Hola <strong style="color:${C.ink};">${order.shipping_name}</strong>, tu pedido <strong style="color:${C.ink};">${order.order_number}</strong> entró a maquila. En unos días estará listo para enviarse.`,
    },
    shipped: {
      preheader: `Tu pedido ${order.order_number} va en camino.`,
      badge: "En camino",
      badgeColor: C.blue,
      title: "Tu pedido va en camino",
      body: `Tu pedido <strong style="color:${C.ink};">${order.order_number}</strong> fue entregado al courier.${order.tracking_number ? ` Número de guía: <strong style="color:${C.ink};">${order.tracking_number}</strong>${order.courier ? ` — ${order.courier}` : ""}.` : ""} Tiempo estimado: 2–5 días hábiles.`,
    },
    delivered: {
      preheader: `Tu pedido ${order.order_number} fue entregado.`,
      badge: "Entregado",
      badgeColor: C.green,
      title: "¡Tu pedido llegó!",
      body: `Tu pedido <strong style="color:${C.ink};">${order.order_number}</strong> fue entregado exitosamente. Esperamos que ames tus nuevas prendas.`,
      extra: alertBox(`<em style="font-family:Georgia,serif;font-size:15px;color:${C.ink};">"Cada evento merece su camiseta."</em>`, C.gold),
    },
  };

  const cfg = configs[newStatus];
  if (!cfg) return;

  const content = `
    ${subheading("Actualización de pedido")}
    ${heading(cfg.title)}
    ${orderHeader(order.order_number, cfg.badge, cfg.badgeColor)}
    ${bodyText(cfg.body)}
    ${cfg.extra ?? ""}
    ${divider()}
    ${shippingBlock(order)}
    ${cta("Ver estado del pedido", trackUrl)}
    ${divider()}
    ${bodyText(`¿Preguntas? Escríbenos por <a href="https://wa.me/573108007700" style="color:${C.terra};">WhatsApp</a>.`, "font-size:12px;")}
  `;

  return getResend().emails.send({
    from: FROM,
    to: order.shipping_email,
    subject: `${cfg.preheader.replace(".", " —")} Ricamo`,
    html: emailBase(cfg.preheader, content),
  });
}

// ══════════════════════════════════════════════════════════════════
// PLANTILLAS — FLUJOS B/C (configurador y cotización)
// ══════════════════════════════════════════════════════════════════

// 5. Nueva solicitud del configurador → María José (admin)
export async function sendNewConfiguratorRequestEmail(order: any) {
  if (!ADMIN_EMAILS.length) return;
  const adminUrl = `${SITE_URL}/admin/pedidos/${order.id}`;

  const content = `
    ${subheading("Configurador — Flujo B")}
    ${heading("Nueva solicitud de diseño")}
    ${orderHeader(order.order_number, "Pendiente aprobación", C.terra)}
    ${label("Cliente")}
    ${value(order.shipping_name)}
    <p style="font-family:Arial,sans-serif;font-size:13px;color:${C.ink3};margin:0 0 16px;">
      <a href="mailto:${order.shipping_email}" style="color:${C.terra};">${order.shipping_email}</a>&nbsp;·&nbsp;${order.shipping_phone}
    </p>
    ${divider()}
    ${alertBox(`El cliente usó el configurador para crear un diseño personalizado. Debes revisarlo y aprobarlo o pedir ajustes.`)}
    ${cta("Revisar diseño en el admin", adminUrl)}
  `;

  return getResend().emails.send({
    from: FROM,
    to: ADMIN_EMAILS,
    subject: `[Configurador] Nueva solicitud — ${order.order_number}`,
    html: emailBase(`Nueva solicitud de diseño de ${order.shipping_name}.`, content),
  });
}

// 6. Nueva solicitud de cotización → María José (admin)
export async function sendNewCotizacionAdminEmail(order: any) {
  if (!ADMIN_EMAILS.length) return;
  const adminUrl = `${SITE_URL}/admin/cotizaciones/${order.id}`;

  const content = `
    ${subheading("Cotización — Flujo C")}
    ${heading("Nueva solicitud de cotización")}
    ${orderHeader(order.order_number, "Cotización pendiente", C.terra)}
    ${label("Cliente")}
    ${value(order.shipping_name)}
    <p style="font-family:Arial,sans-serif;font-size:13px;color:${C.ink3};margin:0 0 16px;">
      <a href="mailto:${order.shipping_email}" style="color:${C.terra};">${order.shipping_email}</a>&nbsp;·&nbsp;${order.shipping_phone}
    </p>
    ${order.notes ? `${divider()}${label("Descripción de la idea")}${bodyText(order.notes)}` : ""}
    ${divider()}
    ${alertBox(`El cliente envió una solicitud de cotización manual. Debes cotizar el precio y generar el link de pago.`)}
    ${cta("Cotizar en el admin", adminUrl)}
  `;

  return getResend().emails.send({
    from: FROM,
    to: ADMIN_EMAILS,
    subject: `[Cotización] Nueva solicitud — ${order.order_number}`,
    html: emailBase(`Nueva cotización de ${order.shipping_name}.`, content),
  });
}

// 7. Diseño aprobado + link de pago → cliente (Flujo B)
export async function sendDesignApprovedEmail(order: any, linkUrl: string) {
  const content = `
    ${subheading("¡Diseño aprobado!")}
    ${heading("Tu diseño está listo para producir")}
    ${bodyText(`Hola <strong style="color:${C.ink};">${order.shipping_name}</strong>, revisamos tu diseño y está perfecto. Ya puedes hacer el pago para que entremos a producción.`)}
    ${orderHeader(order.order_number, "Aprobado — pago pendiente", C.green)}
    ${paymentLinkBlock(linkUrl)}
    ${divider()}
    ${shippingBlock(order)}
    ${divider()}
    ${bodyText(`¿Tienes dudas sobre el diseño? Escríbenos por <a href="https://wa.me/573108007700" style="color:${C.terra};">WhatsApp</a>.`, "font-size:12px;")}
  `;

  return getResend().emails.send({
    from: FROM,
    to: order.shipping_email,
    subject: `Tu diseño fue aprobado — Ricamo`,
    html: emailBase("Tu diseño está aprobado. Solo falta el pago para producirlo.", content),
  });
}

// 8. Cotización lista + link de pago → cliente (Flujo C)
export async function sendCotizacionReadyEmail(order: any, linkUrl: string, price: number) {
  const content = `
    ${subheading("Cotización lista")}
    ${heading("Tu cotización está lista")}
    ${bodyText(`Hola <strong style="color:${C.ink};">${order.shipping_name}</strong>, cotizamos tu idea y ya tenemos el precio para ti.`)}
    ${orderHeader(order.order_number, "Aprobado — pago pendiente", C.green)}
    ${label("Precio cotizado")}
    <p style="font-family:Georgia,serif;font-size:28px;color:${C.ink};font-weight:700;margin:0 0 20px;">${formatCOP(price)}</p>
    ${paymentLinkBlock(linkUrl)}
    ${divider()}
    ${bodyText(`¿Tienes preguntas sobre la cotización? Escríbenos por <a href="https://wa.me/573108007700" style="color:${C.terra};">WhatsApp</a> antes de pagar.`, "font-size:12px;")}
  `;

  return getResend().emails.send({
    from: FROM,
    to: order.shipping_email,
    subject: `Tu cotización está lista — ${formatCOP(price)} — Ricamo`,
    html: emailBase(`Tu cotización está lista: ${formatCOP(price)}. Revísala y paga cuando quieras.`, content),
  });
}

// 9. Diseño requiere ajustes → cliente (B/C)
export async function sendDesignAdjustmentsEmail(order: any, notes: string) {
  const content = `
    ${subheading("Ajustes solicitados")}
    ${heading("Necesitamos un pequeño ajuste")}
    ${bodyText(`Hola <strong style="color:${C.ink};">${order.shipping_name}</strong>, revisamos tu solicitud y necesitamos que hagas un ajuste antes de continuar.`)}
    ${orderHeader(order.order_number, "En ajustes", C.terra)}
    ${divider()}
    ${label("Comentario de María José")}
    ${alertBox(notes)}
    ${cta("Responder por WhatsApp", "https://wa.me/573108007700")}
    ${divider()}
    ${bodyText("Una vez recibamos los cambios, tu solicitud vuelve a revisión.", "font-size:12px;")}
  `;

  return getResend().emails.send({
    from: FROM,
    to: order.shipping_email,
    subject: `Ajuste requerido en tu pedido ${order.order_number} — Ricamo`,
    html: emailBase("Tu pedido necesita un pequeño ajuste antes de continuar.", content),
  });
}

// 10. Diseño/cotización rechazada → cliente (B/C)
export async function sendRejectionEmail(order: any, reason: string) {
  const content = `
    ${subheading("Solicitud rechazada")}
    ${heading("No pudimos procesar tu solicitud")}
    ${bodyText(`Hola <strong style="color:${C.ink};">${order.shipping_name}</strong>, lamentablemente no podemos proceder con tu solicitud en este momento.`)}
    ${orderHeader(order.order_number, "Rechazado", C.terra)}
    ${divider()}
    ${label("Motivo")}
    ${alertBox(reason)}
    ${bodyText(`Si tienes preguntas o quieres intentarlo de otra manera, escríbenos por <a href="https://wa.me/573108007700" style="color:${C.terra};">WhatsApp</a> y con gusto te ayudamos.`)}
    ${cta("Explorar el catálogo", `${SITE_URL}/catalogo`, true)}
  `;

  return getResend().emails.send({
    from: FROM,
    to: order.shipping_email,
    subject: `Actualización sobre tu pedido ${order.order_number} — Ricamo`,
    html: emailBase("Tu solicitud no pudo ser procesada. Contáctanos para más información.", content),
  });
}

// ══════════════════════════════════════════════════════════════════
// RECORDATORIOS DE PAGO — RB-CHK-06 (días 3, 7, 14)
// ══════════════════════════════════════════════════════════════════

export async function sendPaymentReminderEmail(
  order: any,
  linkUrl: string,
  day: 3 | 7 | 14
) {
  const urgency: Record<number, { badge: string; color: string; title: string; body: string }> = {
    3: {
      badge: "Recordatorio",
      color: C.blue,
      title: "¿Ya viste tu link de pago?",
      body: `Hola <strong style="color:${C.ink};">${order.shipping_name}</strong>, hace 3 días aprobamos tu pedido. Tu link de pago sigue activo y te esperamos cuando estés lista.`,
    },
    7: {
      badge: "Segunda llamada",
      color: C.terra,
      title: "Tu pedido sigue esperándote",
      body: `Han pasado 7 días desde que aprobamos tu pedido <strong style="color:${C.ink};">${order.order_number}</strong>. Tu link de pago sigue vigente — sin vencimiento automático.`,
    },
    14: {
      badge: "Último recordatorio",
      color: C.ink,
      title: "Último recordatorio de pago",
      body: `Llevamos 14 días esperando el pago de tu pedido <strong style="color:${C.ink};">${order.order_number}</strong>. Si ya no lo necesitas, no pasa nada. Si quieres continuar, tu link sigue activo.`,
    },
  };

  const u = urgency[day];

  const content = `
    ${subheading(u.badge)}
    ${heading(u.title)}
    ${bodyText(u.body)}
    ${orderHeader(order.order_number, "Pago pendiente", u.color)}
    ${paymentLinkBlock(linkUrl)}
    ${divider()}
    ${bodyText(`¿Tienes preguntas o quieres cancelar? Escríbenos por <a href="https://wa.me/573108007700" style="color:${C.terra};">WhatsApp</a>.`, "font-size:12px;")}
  `;

  return getResend().emails.send({
    from: FROM,
    to: order.shipping_email,
    subject: `Recordatorio: tu pedido ${order.order_number} sigue esperando — Ricamo`,
    html: emailBase(`Tienes un pago pendiente para el pedido ${order.order_number}.`, content),
  });
}

// ══════════════════════════════════════════════════════════════════
// CUENTA
// ══════════════════════════════════════════════════════════════════

// 11. Bienvenida → nueva cuenta registrada
export async function sendWelcomeEmail(email: string, name: string) {
  const content = `
    ${subheading("Bienvenida")}
    ${heading(`Hola, ${name || "bienvenida"}`)}
    ${bodyText("Nos alegra que formes parte de la comunidad Ricamo — camisetas para los festivales y eventos de Colombia.")}
    ${divider()}
    ${alertBox(`
      <strong>Con tu cuenta puedes:</strong><br>
      📦 &nbsp;Seguir tus pedidos en tiempo real<br>
      ✏️ &nbsp;Ver el estado de tus cotizaciones y diseños<br>
      ❤️ &nbsp;Guardar tus prendas favoritas en tu wishlist<br>
      📍 &nbsp;Guardar tus direcciones de envío
    `)}
    ${cta("Explorar el catálogo", `${SITE_URL}/catalogo`)}
    ${divider()}
    ${bodyText(`¿Tienes dudas? Escríbenos a <a href="mailto:hola@ricamo.co" style="color:${C.terra};">hola@ricamo.co</a> o por <a href="https://wa.me/573108007700" style="color:${C.terra};">WhatsApp</a>.`, "font-size:12px;")}
  `;

  return getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Bienvenida a Ricamo — lo creas, lo llevas",
    html: emailBase("Tu cuenta está lista. Empieza a explorar nuestra colección.", content),
  });
}

// 12. Recuperación de contraseña → cliente
export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const content = `
    ${subheading("Seguridad de cuenta")}
    ${heading("Restablece tu contraseña")}
    ${bodyText("Recibimos una solicitud para restablecer la contraseña de tu cuenta en Ricamo.")}
    ${cta("Restablecer contraseña", resetUrl)}
    ${divider()}
    ${bodyText("Este enlace expira en 1 hora. Si no solicitaste este cambio, puedes ignorar este correo — tu contraseña no cambiará.", "font-size:12px;")}
  `;

  return getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Restablece tu contraseña — Ricamo",
    html: emailBase("Solicitud para restablecer tu contraseña.", content),
  });
}
