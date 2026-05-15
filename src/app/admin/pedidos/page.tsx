import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { formatCOP, formatDateShort } from "@/lib/utils/format";

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  // Flujo A
  { value: "pending_payment", label: "Pendiente pago" },
  { value: "paid", label: "Pagado" },
  { value: "preparing", label: "Preparando" },
  { value: "en_produccion", label: "En producción" },
  { value: "shipped", label: "Enviado" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
  // Flujos B/C
  { value: "cotizacion_pendiente", label: "Cotización pendiente" },
  { value: "pendiente_aprobacion", label: "Pendiente aprobación" },
  { value: "en_ajustes", label: "En ajustes" },
  { value: "aprobado_pendiente_pago", label: "Aprobado — sin pagar" },
  { value: "rechazado", label: "Rechazado" },
];

const FLOW_OPTIONS = [
  { value: "", label: "Todos los flujos" },
  { value: "A", label: "A — Pre-diseñado" },
  { value: "B", label: "B — Configurador" },
  { value: "C", label: "C — Cotización" },
];

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
  pending_payment: "Pend. pago",
  paid: "Pagado",
  preparing: "Preparando",
  en_produccion: "En prod.",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  cotizacion_pendiente: "Cotiz. pend.",
  pendiente_aprobacion: "Pend. aprob.",
  en_ajustes: "En ajustes",
  aprobado_pendiente_pago: "Aprob. s/pago",
  rechazado: "Rechazado",
};

const FLOW_BADGE: Record<string, string> = {
  A: "bg-[#F3EDE0] text-[#3D2B1F]",
  B: "bg-indigo-50 text-indigo-700",
  C: "bg-orange-50 text-orange-700",
};

interface Props {
  searchParams: Promise<{ status?: string; flow?: string; q?: string }>;
}

export default async function AdminPedidosPage({ searchParams }: Props) {
  const { status, flow, q } = await searchParams;
  const supabase = createServiceClient();

  let query = supabase
    .from("orders")
    .select("id, order_number, shipping_name, shipping_email, shipping_city, total, status, flow, created_at, tracking_number, wompi_link_url")
    .order("created_at", { ascending: false })
    .limit(150);

  if (status) query = query.eq("status", status);
  if (flow) query = query.eq("flow", flow);
  if (q) query = query.ilike("order_number", `%${q}%`);

  const { data: orders } = await query;

  function buildUrl(overrides: Record<string, string>) {
    const base = new URLSearchParams();
    if (status) base.set("status", status);
    if (flow) base.set("flow", flow);
    if (q) base.set("q", q);
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) base.set(k, v); else base.delete(k);
    });
    const str = base.toString();
    return `/admin/pedidos${str ? `?${str}` : ""}`;
  }

  const isPersonalizado = (f: string | null) => f === "B" || f === "C";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-3xl text-[#3D2B1F]"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Pedidos
        </h1>
        <Link
          href="/admin/cotizaciones"
          className="text-[10px] tracking-[0.15em] uppercase px-4 py-2 border border-[#DDD5C4] text-[#897568] hover:border-[#3D2B1F] hover:text-[#3D2B1F] transition-colors font-[500]"
        >
          Ver cotizaciones →
        </Link>
      </div>

      {/* Filtro por flujo */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {FLOW_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={buildUrl({ flow: opt.value, status: "" })}
            className={`text-[10px] tracking-[0.12em] uppercase px-3 py-1.5 border font-[500] transition-colors ${
              (flow ?? "") === opt.value
                ? "bg-[#0e0e0e] text-[#faf7f1] border-[#0e0e0e]"
                : "border-[#DDD5C4] text-[#897568] hover:border-[#897568]"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {/* Filtro por estado */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={buildUrl({ status: opt.value })}
            className={`text-[10px] tracking-[0.12em] uppercase px-3 py-1.5 border font-[500] transition-colors ${
              (status ?? "") === opt.value
                ? "bg-[#3D2B1F] text-[#F3EDE0] border-[#3D2B1F]"
                : "border-[#DDD5C4] text-[#897568] hover:border-[#897568]"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white border border-[#DDD5C4] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#DDD5C4]">
              {["Pedido", "Clienta", "Ciudad", "Total", "Flujo", "Estado", "Fecha", ""].map((h) => (
                <th key={h} className="text-left text-[9px] tracking-[0.2em] uppercase text-[#897568] font-[600] px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((order) => (
              <tr key={order.id} className="border-b border-[#F3EDE0] hover:bg-[#F3EDE0]/50 transition-colors">
                <td className="px-4 py-3 font-[500] text-[#3D2B1F] font-mono text-xs">
                  {order.order_number}
                </td>
                <td className="px-4 py-3">
                  <p className="text-[#3D2B1F]">{order.shipping_name}</p>
                  <p className="text-xs text-[#897568]">{order.shipping_email}</p>
                </td>
                <td className="px-4 py-3 text-[#897568]">{order.shipping_city}</td>
                <td className="px-4 py-3 font-[500] text-[#3D2B1F]">{formatCOP(order.total)}</td>
                <td className="px-4 py-3">
                  <span className={`text-[9px] px-2 py-0.5 font-[600] tracking-wide uppercase ${FLOW_BADGE[order.flow ?? "A"] ?? ""}`}>
                    {order.flow ?? "A"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-[600] tracking-wide uppercase ${STATUS_BADGE[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#897568] text-xs whitespace-nowrap">
                  {formatDateShort(order.created_at)}
                </td>
                <td className="px-4 py-3 flex gap-2 items-center">
                  {isPersonalizado(order.flow) ? (
                    <Link
                      href={`/admin/cotizaciones/${order.id}`}
                      className="text-xs text-[#b85539] hover:text-[#0e0e0e] font-[500]"
                    >
                      Gestionar →
                    </Link>
                  ) : (
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="text-xs text-[#B5888A] hover:text-[#3D2B1F] font-[500]"
                    >
                      Ver →
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders?.length && (
          <div className="py-16 text-center text-[#897568] text-sm">
            No hay pedidos con estos filtros.
          </div>
        )}
      </div>
    </div>
  );
}
