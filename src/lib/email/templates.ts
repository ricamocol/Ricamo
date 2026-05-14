import { getResend, FROM, ADMIN_EMAILS } from "./resend";
import { formatCOP } from "@/lib/utils/format";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ricamo.vercel.app";

// ── Wrapper principal — tabla compatible con todos los clientes ────
function emailBase(preheader: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Ricamo</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background:#F3EDE0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <!-- preheader hidden -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌</div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F3EDE0;">
    <tr>
      <td align="center" style="padding:40px 16px 32px;">

        <!-- LOGO -->
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <a href="${SITE_URL}" style="text-decoration:none;">
                <span style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:30px;color:#3D2B1F;letter-spacing:0.02em;">Ricamo</span>
              </a>
              <div style="width:40px;height:1px;background:#EAC9C9;margin:10px auto 0;"></div>
            </td>
          </tr>
        </table>

        <!-- CARD -->
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid #EAC9C9;">
          <tr>
            <td style="padding:40px 40px 32px;">
              ${content}
            </td>
          </tr>
        </table>

        <!-- FOOTER -->
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;margin-top:24px;">
          <tr>
            <td align="center" style="padding:0 20px;">
              <p style="font-family:Arial,sans-serif;font-size:11px;color:#897568;line-height:1.7;margin:0;">
                Ricamo · Medellín, Colombia<br>
                <a href="${SITE_URL}" style="color:#897568;text-decoration:underline;">ricamo.co</a>
                &nbsp;·&nbsp;
                <a href="mailto:hola@ricamo.co" style="color:#897568;text-decoration:underline;">hola@ricamo.co</a>
              </p>
              <p style="font-family:Arial,sans-serif;font-size:10px;color:#CEC3AB;margin:8px 0 0;">
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
  return `<h1 style="font-family:Georgia,'Times New Roman',serif;font-weight:400;font-style:italic;font-size:26px;color:#3D2B1F;margin:0 0 8px;line-height:1.3;">${text}</h1>`;
}

function subheading(text: string): string {
  return `<p style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#B5888A;font-weight:600;margin:0 0 20px;">${text}</p>`;
}

function bodyText(text: string, extra = ""): string {
  return `<p style="font-family:Arial,sans-serif;font-size:14px;color:#897568;line-height:1.75;margin:0 0 14px;${extra}">${text}</p>`;
}

function divider(): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
    <tr><td style="border-top:1px solid #EAC9C9;font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>`;
}

function label(text: string): string {
  return `<p style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#CEC3AB;font-weight:600;margin:0 0 6px;">${text}</p>`;
}

function value(text: string): string {
  return `<p style="font-family:Arial,sans-serif;font-size:14px;color:#3D2B1F;font-weight:600;margin:0 0 16px;">${text}</p>`;
}

function cta(text: string, url: string): string {
  return `<table cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
    <tr>
      <td style="background:#3D2B1F;">
        <a href="${url}" style="display:inline-block;padding:14px 32px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;font-weight:600;color:#F3EDE0;text-decoration:none;">${text}</a>
      </td>
    </tr>
  </table>`;
}

function orderHeader(orderNumber: string, status: string, statusColor: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F3EDE0;margin-bottom:24px;">
    <tr>
      <td style="padding:16px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td>
              ${label("Número de pedido")}
              <p style="font-family:Georgia,serif;font-size:18px;color:#3D2B1F;font-weight:600;margin:0;">${orderNumber}</p>
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

function itemsTable(items: any[]): string {
  if (!items.length) return "";
  const rows = items.map((item) => {
    const attrs = item.variant_attrs ? Object.values(item.variant_attrs).filter(Boolean).join(" · ") : "";
    return `<tr>
      <td style="font-family:Arial,sans-serif;font-size:13px;color:#3D2B1F;padding:10px 0;border-bottom:1px solid #F3EDE0;">
        <span style="font-weight:500;">${item.product_name}</span>${attrs ? `<br><span style="font-size:11px;color:#897568;">${attrs}</span>` : ""}
        <span style="color:#B5888A;font-size:12px;"> &nbsp;×${item.quantity}</span>
      </td>
      <td align="right" style="font-family:Arial,sans-serif;font-size:13px;color:#3D2B1F;font-weight:600;padding:10px 0;border-bottom:1px solid #F3EDE0;white-space:nowrap;">
        ${formatCOP(item.total_price)}
      </td>
    </tr>`;
  }).join("");

  return `<table width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>`;
}

function totalsTable(order: any): string {
  const hasDiscount = order.discount_amount > 0;
  const hasShipping = order.shipping_cost > 0;
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:4px;">
    <tr>
      <td style="font-family:Arial,sans-serif;font-size:13px;color:#897568;padding:8px 0 4px;">Subtotal</td>
      <td align="right" style="font-family:Arial,sans-serif;font-size:13px;color:#897568;padding:8px 0 4px;">${formatCOP(order.subtotal)}</td>
    </tr>
    ${hasDiscount ? `<tr>
      <td style="font-family:Arial,sans-serif;font-size:13px;color:#B5888A;padding:4px 0;">Descuento</td>
      <td align="right" style="font-family:Arial,sans-serif;font-size:13px;color:#B5888A;padding:4px 0;">−${formatCOP(order.discount_amount)}</td>
    </tr>` : ""}
    ${hasShipping ? `<tr>
      <td style="font-family:Arial,sans-serif;font-size:13px;color:#897568;padding:4px 0;">Envío</td>
      <td align="right" style="font-family:Arial,sans-serif;font-size:13px;color:#897568;padding:4px 0;">${formatCOP(order.shipping_cost)}</td>
    </tr>` : ""}
    <tr>
      <td style="border-top:1px solid #EAC9C9;"></td>
      <td style="border-top:1px solid #EAC9C9;"></td>
    </tr>
    <tr>
      <td style="font-family:Georgia,serif;font-size:16px;color:#3D2B1F;font-weight:600;padding:12px 0 0;">Total</td>
      <td align="right" style="font-family:Georgia,serif;font-size:16px;color:#3D2B1F;font-weight:600;padding:12px 0 0;">${formatCOP(order.total)}</td>
    </tr>
  </table>`;
}

function shippingBlock(order: any): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F3EDE0;margin-top:16px;">
    <tr>
      <td style="padding:16px 20px;">
        ${label("Dirección de entrega")}
        <p style="font-family:Arial,sans-serif;font-size:13px;color:#3D2B1F;margin:0;line-height:1.6;">
          <strong>${order.shipping_name}</strong><br>
          ${order.shipping_address}<br>
          ${order.shipping_city}, ${order.shipping_department}<br>
          <span style="color:#897568;">${order.shipping_phone}</span>
        </p>
      </td>
    </tr>
  </table>`;
}

// ══════════════════════════════════════════════════════════════════
// PLANTILLAS
// ══════════════════════════════════════════════════════════════════

// 1. Confirmación de pedido a la clienta — RB-PED-03
export async function sendOrderConfirmationEmail(order: any) {
  const items = order.items ?? [];
  const trackUrl = `${SITE_URL}/seguimiento?orden=${order.order_number}&email=${encodeURIComponent(order.shipping_email)}`;

  const content = `
    ${subheading("Confirmación de pedido")}
    ${heading("¡Gracias por tu compra!")}
    ${bodyText(`Hola <strong style="color:#3D2B1F;">${order.shipping_name}</strong>, tu pedido está confirmado y ya estamos preparándolo con cariño para ti.`)}
    ${divider()}
    ${orderHeader(order.order_number, "Confirmado", "#3D7A3D")}
    ${label("Tus prendas")}
    ${itemsTable(items)}
    ${totalsTable(order)}
    ${divider()}
    ${shippingBlock(order)}
    ${cta("Seguir mi pedido", trackUrl)}
    ${divider()}
    ${bodyText("¿Tienes alguna pregunta? Escríbenos por <a href='https://wa.me/573108007700' style='color:#B5888A;'>WhatsApp</a> o a <a href='mailto:hola@ricamo.co' style='color:#B5888A;'>hola@ricamo.co</a>.", "font-size:12px;")}
  `;

  return getResend().emails.send({
    from: FROM,
    to: order.shipping_email,
    subject: `Tu pedido ${order.order_number} está confirmado — Ricamo`,
    html: emailBase(`Tu pedido ${order.order_number} fue confirmado. Ya estamos preparándolo.`, content),
  });
}

// 2. Notificación a los 3 admins — RB-PED-05
export async function sendNewOrderAdminEmail(order: any) {
  if (!ADMIN_EMAILS.length) return;
  const items = order.items ?? [];
  const adminUrl = `${SITE_URL}/admin/pedidos/${order.id}`;

  const content = `
    ${subheading("Panel administrativo")}
    ${heading("Nuevo pedido recibido")}
    ${orderHeader(order.order_number, "Pendiente preparación", "#B5888A")}
    ${label("Clienta")}
    ${value(order.shipping_name)}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
      <tr>
        <td style="font-family:Arial,sans-serif;font-size:13px;color:#897568;">
          <a href="mailto:${order.shipping_email}" style="color:#B5888A;">${order.shipping_email}</a>&nbsp;&nbsp;·&nbsp;&nbsp;
          <a href="tel:${order.shipping_phone}" style="color:#897568;text-decoration:none;">${order.shipping_phone}</a>
        </td>
      </tr>
    </table>
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

// 3. Pago rechazado — RB-CHK-05
export async function sendPaymentFailedEmail(order: any) {
  const content = `
    ${subheading("Estado del pago")}
    ${heading("No pudimos procesar tu pago")}
    ${bodyText(`Hola <strong style="color:#3D2B1F;">${order.shipping_name}</strong>, lamentablemente el pago de tu pedido <strong style="color:#3D2B1F;">${order.order_number}</strong> no pudo completarse.`)}
    ${bodyText("Esto puede ocurrir por fondos insuficientes, datos incorrectos o un rechazo temporal del banco. Tus productos siguen disponibles.")}
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F3EDE0;">
      <tr>
        <td style="padding:16px 20px;">
          ${label("¿Qué puedes hacer?")}
          <ul style="font-family:Arial,sans-serif;font-size:13px;color:#897568;line-height:1.8;margin:8px 0 0;padding-left:18px;">
            <li>Verificar los datos de tu tarjeta</li>
            <li>Intentar con otro método de pago (PSE, Nequi, Daviplata)</li>
            <li>Contactar a tu banco</li>
          </ul>
        </td>
      </tr>
    </table>
    ${cta("Volver al carrito", `${SITE_URL}/carrito`)}
    ${divider()}
    ${bodyText("¿Necesitas ayuda? Escríbenos por <a href='https://wa.me/573108007700' style='color:#B5888A;'>WhatsApp</a>.", "font-size:12px;")}
  `;

  return getResend().emails.send({
    from: FROM,
    to: order.shipping_email,
    subject: `Problema con tu pago — Ricamo`,
    html: emailBase("Tu pago no pudo procesarse. Tus productos siguen disponibles.", content),
  });
}

// 4. Cambios de estado del pedido — RB-PED-03
export async function sendOrderStatusEmail(order: any, newStatus: string) {
  const trackUrl = `${SITE_URL}/seguimiento?orden=${order.order_number}&email=${encodeURIComponent(order.shipping_email)}`;

  const configs: Record<string, { preheader: string; badge: string; badgeColor: string; title: string; body: string; extra?: string }> = {
    preparing: {
      preheader: `Tu pedido ${order.order_number} está siendo preparado.`,
      badge: "En preparación",
      badgeColor: "#7B5EA7",
      title: "Estamos preparando tu pedido",
      body: `¡Buenas noticias! Estamos preparando tu pedido <strong style="color:#3D2B1F;">${order.order_number}</strong> con mucho cuidado. Te notificaremos cuando sea despachado.`,
    },
    shipped: {
      preheader: `Tu pedido ${order.order_number} va en camino.`,
      badge: "En camino",
      badgeColor: "#1A7FA8",
      title: "Tu pedido va en camino",
      body: `Tu pedido <strong style="color:#3D2B1F;">${order.order_number}</strong> fue entregado al courier y está en camino hacia ti.${order.tracking_number ? ` Número de guía: <strong style="color:#3D2B1F;">${order.tracking_number}</strong>${order.courier ? ` (${order.courier})` : ""}.` : ""} Tiempo estimado: 3–5 días hábiles.`,
    },
    delivered: {
      preheader: `Tu pedido ${order.order_number} fue entregado. ¡Disfrútalo!`,
      badge: "Entregado",
      badgeColor: "#3D7A3D",
      title: "¡Tu pedido llegó!",
      body: `Tu pedido <strong style="color:#3D2B1F;">${order.order_number}</strong> fue entregado exitosamente. Esperamos que ames tus nuevas prendas.`,
      extra: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F3EDE0;margin-top:20px;"><tr><td style="padding:16px 20px;text-align:center;"><p style="font-family:Georgia,serif;font-style:italic;font-size:15px;color:#3D2B1F;margin:0;">"Cada evento merece su camiseta."</p></td></tr></table>`,
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
    ${bodyText("¿Preguntas? Escríbenos por <a href='https://wa.me/573108007700' style='color:#B5888A;'>WhatsApp</a>.", "font-size:12px;")}
  `;

  return getResend().emails.send({
    from: FROM,
    to: order.shipping_email,
    subject: cfg.preheader.replace(".", " —") + " Ricamo",
    html: emailBase(cfg.preheader, content),
  });
}

// 5. Bienvenida — nueva cuenta registrada
export async function sendWelcomeEmail(email: string, name: string) {
  const content = `
    ${subheading("Bienvenida a Ricamo")}
    ${heading(`Hola, ${name || "bienvenida"} ✨`)}
    ${bodyText("Nos alegra que formes parte de la comunidad Ricamo. Aquí encontrarás camisetas temáticas para los festivales y eventos de Colombia, y la opción de diseñar la tuya.")}
    ${divider()}
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F3EDE0;">
      <tr>
        <td style="padding:20px;">
          ${label("Con tu cuenta puedes")}
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;">
            ${[
              ["Seguir tus pedidos en tiempo real", "📦"],
              ["Ver el estado de tus cotizaciones y personalizaciones", "✏️"],
              ["Guardar tus camisetas favoritas en tu wishlist", "❤️"],
              ["Guardar tus direcciones de envío", "📍"],
            ].map(([txt, icon]) => `<tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#897568;padding:5px 0;">${icon}&nbsp; ${txt}</td></tr>`).join("")}
          </table>
        </td>
      </tr>
    </table>
    ${cta("Explorar el catálogo", `${SITE_URL}/catalogo`)}
    ${divider()}
    ${bodyText("¿Tienes dudas? Escríbenos por <a href='https://wa.me/573108007700' style='color:#B5888A;'>WhatsApp</a> o a <a href='mailto:hola@ricamo.co' style='color:#B5888A;'>hola@ricamo.co</a>.", "font-size:12px;")}
  `;

  return getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Bienvenida a Ricamo",
    html: emailBase("Tu cuenta está lista. Empieza a explorar nuestra colección.", content),
  });
}
