import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, MapPin, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { formatCOP, formatDate } from "@/lib/utils/format";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  // Flujo A
  pending_payment: { label: "Pendiente de pago", cls: "text-amber-700 bg-amber-50 border-amber-200" },
  paid: { label: "Pago confirmado", cls: "text-blue-700 bg-blue-50 border-blue-200" },
  preparing: { label: "Empacando tu pedido", cls: "text-purple-700 bg-purple-50 border-purple-200" },
  en_produccion: { label: "En producción", cls: "text-indigo-700 bg-indigo-50 border-indigo-200" },
  shipped: { label: "En camino", cls: "text-cyan-700 bg-cyan-50 border-cyan-200" },
  delivered: { label: "Entregado", cls: "text-green-700 bg-green-50 border-green-200" },
  cancelled: { label: "Cancelado", cls: "text-gray-500 bg-gray-50 border-gray-200" },
  // Flujos B/C
  cotizacion_pendiente: { label: "Cotización en proceso", cls: "text-orange-700 bg-orange-50 border-orange-200" },
  pendiente_aprobacion: { label: "Revisando tu diseño", cls: "text-amber-700 bg-amber-50 border-amber-200" },
  en_ajustes: { label: "Diseño en ajustes", cls: "text-sky-700 bg-sky-50 border-sky-200" },
  aprobado_pendiente_pago: { label: "¡Aprobado! Lista para pagar", cls: "text-[#b85539] bg-orange-50 border-[#b85539]" },
  rechazado: { label: "No pudimos continuar", cls: "text-gray-500 bg-gray-50 border-gray-200" },
};

export default async function PedidoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/cuenta/pedidos");

  const db = createServiceClient();

  // Buscar customer por auth_user_id, si no por email
  let customerId: string | null = null;
  const { data: byAuthId } = await db
    .from("customers")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (byAuthId) {
    customerId = byAuthId.id;
  } else if (user.email) {
    const { data: byEmail } = await db
      .from("customers")
      .select("id")
      .eq("email", user.email.toLowerCase())
      .single();

    if (byEmail) {
      customerId = byEmail.id;
      await db
        .from("customers")
        .update({ auth_user_id: user.id, is_guest: false })
        .eq("id", byEmail.id);
    }
  }

  if (!customerId) notFound();

  const { data: order } = await db
    .from("orders")
    .select(
      `*, order_items (id, product_name, variant_sku, variant_attrs, quantity, unit_price, total_price), cotizacion_attachments(file_url, file_name, file_type)`
    )
    .eq("id", id)
    .eq("customer_id", customerId)
    .single();

  if (!order) notFound();

  const s =
    STATUS_MAP[order.status] ?? {
      label: order.status,
      cls: "text-gray-500 bg-gray-50 border-gray-200",
    };

  return (
    <div>
      <Link
        href="/cuenta/pedidos"
        className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-[#897568] hover:text-[#3D2B1F] mb-5 transition-colors"
      >
        <ArrowLeft size={12} /> Mis pedidos
      </Link>

      {/* CTA pago para B/C aprobados */}
      {order.status === "aprobado_pendiente_pago" && order.wompi_link_url && (
        <div className="mb-6 p-5 bg-[#f0c419]/10 border border-[#f0c419] text-center">
          <p className="text-sm font-[600] text-[#3D2B1F] mb-1">¡Tu pedido está aprobado!</p>
          <p className="text-xs text-[#6a6356] mb-4">
            Completa el pago para que empecemos a producirlo.
          </p>
          <a
            href={order.wompi_link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 bg-[#f0c419] text-[#0e0e0e] text-[11px] tracking-[0.2em] uppercase font-[700] hover:bg-[#e0b410] transition-colors"
          >
            Pagar ahora →
          </a>
        </div>
      )}

      {/* Rechazo */}
      {order.status === "rechazado" && order.rejection_reason && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-xs text-red-700">
          <p className="font-[600] mb-1">Motivo:</p>
          <p>{order.rejection_reason}</p>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h2
            className="text-xl text-[#3D2B1F]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            {order.order_number}
          </h2>
          <p className="text-xs text-[#897568] mt-1">{formatDate(order.created_at)}</p>
        </div>
        <span className={`text-[10px] px-3 py-1.5 border font-[500] ${s.cls}`}>{s.label}</span>
      </div>

      <div className="space-y-4">
        {/* Prendas */}
        <div className="bg-white border border-[#DDD5C4]">
          <div className="px-5 py-3 border-b border-[#F3EDE0] flex items-center gap-2">
            <Package size={13} className="text-[#B5888A]" />
            <p className="text-[11px] uppercase tracking-[0.15em] font-[600] text-[#3D2B1F]">
              Prendas
            </p>
          </div>
          {order.order_items?.map((item: any) => {
            const attrs = item.variant_attrs ?? {};
            const attrStr = Object.values(attrs).filter(Boolean).join(" · ");
            return (
              <div
                key={item.id}
                className="flex items-start justify-between px-5 py-4 border-b border-[#F3EDE0] last:border-0 gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-[500] text-[#3D2B1F]">{item.product_name}</p>
                  {attrStr && (
                    <p className="text-[11px] text-[#897568] mt-0.5">{attrStr}</p>
                  )}
                  <p className="text-[11px] text-[#CEC3AB] mt-0.5">SKU: {item.variant_sku}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-[600] text-[#3D2B1F]">
                    {formatCOP(item.total_price)}
                  </p>
                  <p className="text-[11px] text-[#897568]">
                    {formatCOP(item.unit_price)} × {item.quantity}
                  </p>
                </div>
              </div>
            );
          })}
          {/* Totales */}
          <div className="px-5 py-4 border-t border-[#DDD5C4] bg-[#F3EDE0]/40 space-y-2">
            <div className="flex justify-between text-sm text-[#897568]">
              <span>Subtotal</span>
              <span>{formatCOP(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-sm text-[#B5888A]">
                <span>Descuento</span>
                <span>−{formatCOP(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-[#897568]">
              <span>Envío</span>
              <span>
                {order.shipping_cost > 0 ? formatCOP(order.shipping_cost) : "Gratis"}
              </span>
            </div>
            <div className="flex justify-between text-base font-[600] text-[#3D2B1F] pt-2 border-t border-[#DDD5C4]">
              <span>Total</span>
              <span>{formatCOP(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Dirección de envío */}
        <div className="bg-white border border-[#DDD5C4]">
          <div className="px-5 py-3 border-b border-[#F3EDE0] flex items-center gap-2">
            <MapPin size={13} className="text-[#B5888A]" />
            <p className="text-[11px] uppercase tracking-[0.15em] font-[600] text-[#3D2B1F]">
              Envío
            </p>
          </div>
          <div className="px-5 py-4 text-sm text-[#897568] space-y-0.5">
            <p className="text-[#3D2B1F] font-[500]">{order.shipping_name}</p>
            <p>{order.shipping_address}</p>
            <p>
              {order.shipping_city}, {order.shipping_department}
            </p>
            <p>{order.shipping_phone}</p>
          </div>
        </div>

        {/* Tracking — solo si fue despachado */}
        {(order.status === "shipped" || order.status === "delivered") &&
          order.tracking_number && (
            <div className="bg-white border border-[#DDD5C4]">
              <div className="px-5 py-3 border-b border-[#F3EDE0] flex items-center gap-2">
                <Truck size={13} className="text-[#B5888A]" />
                <p className="text-[11px] uppercase tracking-[0.15em] font-[600] text-[#3D2B1F]">
                  Seguimiento
                </p>
              </div>
              <div className="px-5 py-4 text-sm space-y-1">
                <p className="text-[#897568]">
                  Guía:{" "}
                  <span className="text-[#3D2B1F] font-[600]">{order.tracking_number}</span>
                </p>
                {order.courier && (
                  <p className="text-[#897568]">
                    Courier: <span className="text-[#3D2B1F]">{order.courier}</span>
                  </p>
                )}
                {order.shipped_at && (
                  <p className="text-[#897568]">
                    Despachado:{" "}
                    <span className="text-[#3D2B1F]">{formatDate(order.shipped_at)}</span>
                  </p>
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
