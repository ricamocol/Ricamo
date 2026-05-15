import { notFound } from "next/navigation";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { formatCOP, formatDate } from "@/lib/utils/format";
import { OrderStatusActions } from "@/components/admin/OrderStatusActions";

interface Props {
  params: Promise<{ id: string }>;
}

const STATUS_BADGE: Record<string, string> = {
  pending_payment: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  preparing: "bg-blue-100 text-blue-800",
  en_produccion: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-[#EAC9C9] text-[#3D2B1F]",
  cancelled: "bg-red-100 text-red-700",
  cotizacion_pendiente: "bg-orange-100 text-orange-700",
  pendiente_aprobacion: "bg-amber-100 text-amber-700",
  en_ajustes: "bg-sky-100 text-sky-700",
  aprobado_pendiente_pago: "bg-lime-100 text-lime-700",
  rechazado: "bg-rose-100 text-rose-700",
};

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Pendiente de pago",
  paid: "Pagado",
  preparing: "Empacando",
  en_produccion: "En producción",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  cotizacion_pendiente: "Cotización pendiente",
  pendiente_aprobacion: "Pendiente aprobación",
  en_ajustes: "En ajustes",
  aprobado_pendiente_pago: "Aprobado — esperando pago",
  rechazado: "Rechazado",
};

export default async function AdminPedidoDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: order } = await supabase
    .from("orders")
    .select(`
      *,
      items:order_items(*),
      status_log:order_status_log(*)
    `)
    .eq("id", id)
    .single();

  if (!order) notFound();

  const isBC = order.flow === "B" || order.flow === "C";
  const customData = order.customization_data as Record<string, unknown> | null;
  const thread = order.communication_thread as Array<{ author: string; message: string; created_at: string }> | null;

  return (
    <div className="max-w-3xl">
      {/* Cabecera */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/pedidos" className="text-[#897568] hover:text-[#3D2B1F] text-sm">
          ← Pedidos
        </Link>
        <h1
          className="text-2xl text-[#3D2B1F] font-mono"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {order.order_number}
        </h1>
        <span className={`text-[9px] px-2 py-1 rounded-full font-[600] tracking-wide uppercase ${STATUS_BADGE[order.status] ?? "bg-gray-100 text-gray-600"}`}>
          {STATUS_LABEL[order.status] ?? order.status}
        </span>
        <span className="text-[9px] px-2 py-1 bg-[#F3EDE0] text-[#3D2B1F] font-[600] tracking-wide uppercase">
          Flujo {order.flow ?? "A"}
        </span>
        {isBC && (
          <Link
            href={`/admin/cotizaciones/${order.id}`}
            className="ml-auto text-xs text-[#b85539] hover:text-[#0e0e0e] font-[500]"
          >
            Ir a cotizaciones →
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Info clienta */}
        <div className="bg-white border border-[#DDD5C4] p-5">
          <h2 className="text-[10px] tracking-[0.2em] uppercase text-[#897568] font-[600] mb-3">Clienta</h2>
          <p className="text-sm text-[#3D2B1F] font-[500]">{order.shipping_name}</p>
          <p className="text-xs text-[#897568]">{order.shipping_email}</p>
          <p className="text-xs text-[#897568]">{order.shipping_phone}</p>
          <p className="text-xs text-[#897568] mt-2">
            {order.shipping_address}, {order.shipping_city}, {order.shipping_department}
          </p>
          {order.courier && (
            <p className="text-xs text-[#897568] mt-1">Courier: <span className="font-[500] text-[#3D2B1F]">{order.courier}</span></p>
          )}
          {order.tracking_number && (
            <p className="text-xs text-[#897568]">Guía: <span className="font-mono font-[600] text-[#3D2B1F]">{order.tracking_number}</span></p>
          )}
        </div>

        {/* Totales */}
        <div className="bg-white border border-[#DDD5C4] p-5">
          <h2 className="text-[10px] tracking-[0.2em] uppercase text-[#897568] font-[600] mb-3">Totales</h2>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-[#897568]">
              <span>Subtotal</span><span>{formatCOP(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-[#B5888A]">
                <span>Descuento</span><span>−{formatCOP(order.discount_amount)}</span>
              </div>
            )}
            {order.cotizacion_price && (
              <div className="flex justify-between text-[#3D2B1F] font-[500]">
                <span>Precio cotizado</span><span>{formatCOP(order.cotizacion_price)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#897568]">
              <span>Envío</span><span>{formatCOP(order.shipping_cost)}</span>
            </div>
            <div className="flex justify-between font-[600] text-[#3D2B1F] pt-1 border-t border-[#DDD5C4]">
              <span>Total</span><span>{formatCOP(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wompi Link (Flujos B/C) */}
      {order.wompi_link_url && (
        <div className="bg-amber-50 border border-amber-200 p-4 mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] tracking-[0.15em] uppercase text-amber-700 font-[600]">Link de pago activo</p>
            <p className="text-xs text-amber-600 mt-0.5 font-mono break-all">{order.wompi_link_url}</p>
          </div>
          <a
            href={order.wompi_link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-[10px] tracking-[0.1em] uppercase px-3 py-2 bg-amber-500 text-white font-[600] hover:bg-amber-600 transition-colors"
          >
            Abrir →
          </a>
        </div>
      )}

      {/* Prendas */}
      <div className="bg-white border border-[#DDD5C4] p-5 mb-5">
        <h2 className="text-[10px] tracking-[0.2em] uppercase text-[#897568] font-[600] mb-4">Prendas</h2>
        {(order.items ?? []).length > 0 ? (
          <div className="space-y-3">
            {(order.items ?? []).map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm border-b border-[#F3EDE0] pb-2">
                <div>
                  <p className="text-[#3D2B1F] font-[400]">{item.product_name}</p>
                  <p className="text-xs text-[#897568]">
                    SKU: {item.variant_sku} · {Object.entries(item.variant_attrs ?? {}).map(([k,v])=>`${k}: ${v}`).join(" · ")} · ×{item.quantity}
                  </p>
                </div>
                <span className="text-[#3D2B1F] font-[500]">{formatCOP(item.total_price)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#897568]">Pedido personalizado — sin ítems de catálogo.</p>
        )}
      </div>

      {/* Personalización (Flujos B/C) */}
      {isBC && customData && Object.keys(customData).length > 0 && (
        <div className="bg-white border border-[#DDD5C4] p-5 mb-5">
          <h2 className="text-[10px] tracking-[0.2em] uppercase text-[#897568] font-[600] mb-3">Datos de personalización</h2>
          <div className="space-y-1.5">
            {Object.entries(customData).map(([key, val]) => (
              <div key={key} className="flex gap-3 text-xs">
                <span className="text-[#897568] w-32 shrink-0 capitalize">{key.replace(/_/g, " ")}</span>
                <span className="text-[#3D2B1F] font-[400]">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hilo de comunicación (Flujos B/C) */}
      {isBC && thread && thread.length > 0 && (
        <div className="bg-white border border-[#DDD5C4] p-5 mb-5">
          <h2 className="text-[10px] tracking-[0.2em] uppercase text-[#897568] font-[600] mb-3">Comunicación</h2>
          <div className="space-y-3">
            {thread.map((msg, i) => (
              <div key={i} className={`p-3 text-xs ${msg.author === "admin" ? "bg-[#F3EDE0] border-l-2 border-[#3D2B1F]" : "bg-white border border-[#DDD5C4]"}`}>
                <p className="text-[9px] uppercase tracking-wide text-[#897568] mb-1 font-[600]">
                  {msg.author === "admin" ? "María José" : "Cliente"} · {formatDate(msg.created_at)}
                </p>
                <p className="text-[#3D2B1F]">{msg.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Acciones de estado */}
      <div className="bg-white border border-[#DDD5C4] p-5 mb-5">
        <h2 className="text-[10px] tracking-[0.2em] uppercase text-[#897568] font-[600] mb-4">
          Estado del pedido
        </h2>
        <OrderStatusActions order={{ ...order, flow: order.flow ?? "A" }} />
      </div>

      {/* Log de estados */}
      <div className="bg-white border border-[#DDD5C4] p-5">
        <h2 className="text-[10px] tracking-[0.2em] uppercase text-[#897568] font-[600] mb-4">
          Historial
        </h2>
        <div className="space-y-3">
          {(order.status_log ?? [])
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map((log: any) => (
              <div key={log.id} className="flex gap-3 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-[#B5888A] shrink-0 mt-1.5" />
                <div>
                  <p className="text-[#3D2B1F]">{log.notes ?? `${log.from_status} → ${log.to_status}`}</p>
                  <p className="text-[#897568] mt-0.5">{formatDate(log.created_at)}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
