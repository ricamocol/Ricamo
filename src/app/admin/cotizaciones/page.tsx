import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { formatCOP, formatDateShort } from "@/lib/utils/format";

const STATUS_OPTIONS = [
  { value: "", label: "Todas" },
  { value: "cotizacion_pendiente", label: "Pendientes" },
  { value: "pendiente_aprobacion", label: "Por aprobar (Config.)" },
  { value: "en_ajustes", label: "En ajustes" },
  { value: "aprobado_pendiente_pago", label: "Pendiente pago" },
  { value: "en_produccion", label: "En producción" },
  { value: "rechazado", label: "Rechazadas" },
];

const STATUS_BADGE: Record<string, string> = {
  cotizacion_pendiente:    "bg-orange-100 text-orange-800",
  pendiente_aprobacion:   "bg-yellow-100 text-yellow-800",
  en_ajustes:             "bg-blue-100 text-blue-800",
  aprobado_pendiente_pago:"bg-purple-100 text-purple-800",
  en_produccion:          "bg-green-100 text-green-800",
  rechazado:              "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<string, string> = {
  cotizacion_pendiente:    "Por cotizar",
  pendiente_aprobacion:   "Por aprobar",
  en_ajustes:             "En ajustes",
  aprobado_pendiente_pago:"Pendiente pago",
  en_produccion:          "En producción",
  rechazado:              "Rechazada",
};

const FLOW_LABEL: Record<string, string> = {
  B: "Configurador",
  C: "Cotización",
};

interface Props {
  searchParams: Promise<{ status?: string; q?: string }>;
}

export default async function AdminCotizacionesPage({ searchParams }: Props) {
  const { status, q } = await searchParams;
  const supabase = createServiceClient();

  let query = supabase
    .from("orders")
    .select("id, order_number, shipping_name, shipping_email, shipping_phone, flow, status, cotizacion_price, wompi_link_url, created_at, customization_data")
    .in("flow", ["B", "C"])
    .order("created_at", { ascending: false })
    .limit(100);

  if (status) query = query.eq("status", status);
  if (q) query = query.ilike("order_number", `%${q}%`);

  const { data: orders } = await query;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-3xl text-[#3D2B1F]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Cotizaciones y diseños
          </h1>
          <p className="text-sm text-[#897568] mt-1">
            Flujo B (Configurador) y Flujo C (Cotización manual)
          </p>
        </div>
      </div>

      {/* Búsqueda */}
      <form className="mb-4">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar por número de pedido…"
          className="w-full max-w-sm border border-[#DDD5C4] bg-white px-3 py-2 text-sm text-[#3D2B1F] focus:outline-none focus:border-[#897568]"
        />
      </form>

      {/* Filtros de estado */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUS_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={opt.value ? `/admin/cotizaciones?status=${opt.value}` : "/admin/cotizaciones"}
            className={`text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 border font-[500] transition-colors ${
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
              {["Pedido", "Flujo", "Cliente", "Estado", "Cotización", "Link pago", "Fecha", ""].map((h) => (
                <th key={h} className="text-left text-[9px] tracking-[0.2em] uppercase text-[#897568] font-[600] px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((order) => (
              <tr key={order.id} className="border-b border-[#F3EDE0] hover:bg-[#F3EDE0]/50 transition-colors">
                <td className="px-4 py-3 font-[500] text-[#3D2B1F] whitespace-nowrap">
                  {order.order_number}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[9px] px-2 py-0.5 font-[600] tracking-wide uppercase ${
                    order.flow === "B" ? "bg-purple-100 text-purple-800" : "bg-orange-100 text-orange-800"
                  }`}>
                    {FLOW_LABEL[order.flow] ?? order.flow}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="text-[#3D2B1F]">{order.shipping_name}</p>
                  <p className="text-xs text-[#897568]">{order.shipping_email}</p>
                  <p className="text-xs text-[#897568]">{order.shipping_phone}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-[600] tracking-wide uppercase ${STATUS_BADGE[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#3D2B1F]">
                  {order.cotizacion_price ? formatCOP(order.cotizacion_price) : (
                    <span className="text-[#897568] text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {order.wompi_link_url ? (
                    <a
                      href={order.wompi_link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#B5888A] hover:text-[#3D2B1F] underline"
                    >
                      Ver link
                    </a>
                  ) : (
                    <span className="text-[#897568] text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-[#897568] text-xs whitespace-nowrap">
                  {formatDateShort(order.created_at)}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/cotizaciones/${order.id}`}
                    className="text-xs text-[#B5888A] hover:text-[#3D2B1F] font-[500] whitespace-nowrap"
                  >
                    Gestionar →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders?.length && (
          <div className="py-16 text-center text-[#897568] text-sm">
            No hay cotizaciones con estos filtros.
          </div>
        )}
      </div>
    </div>
  );
}
