import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { formatCOP, formatDateShort } from "@/lib/utils/format";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { CotizacionActions } from "@/components/admin/CotizacionActions";

interface Props {
  params: Promise<{ id: string }>;
}

const STATUS_LABEL: Record<string, string> = {
  cotizacion_pendiente:    "Por cotizar",
  pendiente_aprobacion:   "Pendiente aprobación",
  en_ajustes:             "En ajustes",
  aprobado_pendiente_pago:"Pendiente de pago",
  en_produccion:          "En producción",
  paid:                   "Pagado",
  shipped:                "Enviado",
  delivered:              "Entregado",
  rechazado:              "Rechazado",
  cancelled:              "Cancelado",
};

const STATUS_BADGE: Record<string, string> = {
  cotizacion_pendiente:    "bg-orange-100 text-orange-800",
  pendiente_aprobacion:   "bg-yellow-100 text-yellow-800",
  en_ajustes:             "bg-blue-100 text-blue-800",
  aprobado_pendiente_pago:"bg-purple-100 text-purple-800",
  en_produccion:          "bg-green-100 text-green-800",
  paid:                   "bg-emerald-100 text-emerald-800",
  rechazado:              "bg-red-100 text-red-700",
};

export default async function CotizacionDetallePage({ params }: Props) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: order } = await supabase
    .from("orders")
    .select(`
      id, order_number, flow, status,
      shipping_name, shipping_email, shipping_phone, shipping_city, shipping_department,
      customization_data, notes, cotizacion_price,
      wompi_link_id, wompi_link_url,
      approved_at, rejected_at, rejection_reason,
      communication_thread,
      created_at, updated_at
    `)
    .eq("id", id)
    .in("flow", ["B", "C"])
    .single();

  if (!order) notFound();

  // Adjuntos
  const { data: attachments } = await supabase
    .from("cotizacion_attachments")
    .select("id, file_url, file_name, file_type, uploaded_by, created_at")
    .eq("order_id", id)
    .order("created_at");

  const cd = (order.customization_data ?? {}) as Record<string, string | number | null>;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/cotizaciones" className="text-[#897568] hover:text-[#3D2B1F] transition-colors">
          <ArrowLeft size={18} strokeWidth={1.5} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1
              className="text-2xl text-[#3D2B1F]"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              {order.order_number}
            </h1>
            <span className={`text-[9px] px-2.5 py-1 rounded-full font-[600] tracking-wide uppercase ${STATUS_BADGE[order.status] ?? "bg-gray-100 text-gray-600"}`}>
              {STATUS_LABEL[order.status] ?? order.status}
            </span>
            <span className={`text-[9px] px-2.5 py-1 font-[600] tracking-wide uppercase ${
              order.flow === "B" ? "bg-purple-100 text-purple-800" : "bg-orange-100 text-orange-800"
            }`}>
              Flujo {order.flow === "B" ? "B — Configurador" : "C — Cotización"}
            </span>
          </div>
          <p className="text-sm text-[#897568] mt-0.5">
            Creado {formatDateShort(order.created_at)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── COLUMNA IZQUIERDA: info + acciones ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Datos del cliente */}
          <section className="bg-white border border-[#DDD5C4] p-5">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#897568] font-[600] mb-4">
              Cliente
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex gap-3">
                <dt className="text-[#897568] w-24 flex-shrink-0">Nombre</dt>
                <dd className="text-[#3D2B1F] font-[500]">{order.shipping_name}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-[#897568] w-24 flex-shrink-0">Correo</dt>
                <dd>
                  <a href={`mailto:${order.shipping_email}`} className="text-[#B5888A] hover:text-[#3D2B1F]">
                    {order.shipping_email}
                  </a>
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-[#897568] w-24 flex-shrink-0">WhatsApp</dt>
                <dd>
                  <a
                    href={`https://wa.me/${order.shipping_phone?.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#B5888A] hover:text-[#3D2B1F]"
                  >
                    {order.shipping_phone}
                  </a>
                </dd>
              </div>
              {order.shipping_city && (
                <div className="flex gap-3">
                  <dt className="text-[#897568] w-24 flex-shrink-0">Ciudad</dt>
                  <dd className="text-[#3D2B1F]">{order.shipping_city}, {order.shipping_department}</dd>
                </div>
              )}
            </dl>
          </section>

          {/* Detalles del diseño / solicitud */}
          <section className="bg-white border border-[#DDD5C4] p-5">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#897568] font-[600] mb-4">
              {order.flow === "B" ? "Diseño del configurador" : "Solicitud de cotización"}
            </h2>
            {Object.keys(cd).length > 0 ? (
              <dl className="space-y-2 text-sm">
                {Object.entries(cd).map(([k, v]) => v ? (
                  <div key={k} className="flex gap-3">
                    <dt className="text-[#897568] w-32 flex-shrink-0 capitalize">{k.replace(/_/g, " ")}</dt>
                    <dd className="text-[#3D2B1F]">{String(v)}</dd>
                  </div>
                ) : null)}
              </dl>
            ) : (
              <p className="text-sm text-[#897568]">Sin datos adicionales.</p>
            )}
          </section>

          {/* Adjuntos */}
          {(attachments?.length ?? 0) > 0 && (
            <section className="bg-white border border-[#DDD5C4] p-5">
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#897568] font-[600] mb-4">
                Archivos de referencia ({attachments!.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {attachments!.map((a) => (
                  <a
                    key={a.id}
                    href={a.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group border border-[#DDD5C4] p-2 hover:border-[#897568] transition-colors"
                  >
                    {a.file_type?.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.file_url} alt={a.file_name} className="w-full h-24 object-cover mb-1" />
                    ) : (
                      <div className="w-full h-24 bg-[#F3EDE0] flex items-center justify-center mb-1">
                        <span className="text-xs text-[#897568] uppercase">{a.file_type?.split("/")[1] ?? "doc"}</span>
                      </div>
                    )}
                    <p className="text-[10px] text-[#897568] truncate group-hover:text-[#3D2B1F]">
                      {a.file_name}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-[#B5888A] mt-0.5">
                      <ExternalLink size={9} />
                      Ver
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Link de pago existente */}
          {order.wompi_link_url && (
            <section className="bg-purple-50 border border-purple-200 p-5">
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-purple-700 font-[600] mb-3">
                Link de pago activo
              </h2>
              {order.cotizacion_price && (
                <p className="text-lg font-[500] text-[#3D2B1F] mb-2">
                  {formatCOP(order.cotizacion_price)}
                </p>
              )}
              <a
                href={order.wompi_link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#B5888A] hover:text-[#3D2B1F] underline"
              >
                <ExternalLink size={14} />
                {order.wompi_link_url}
              </a>
            </section>
          )}

          {/* Hilo de comunicación */}
          {Array.isArray(order.communication_thread) && order.communication_thread.length > 0 && (
            <section className="bg-white border border-[#DDD5C4] p-5">
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#897568] font-[600] mb-4">
                Historial de comunicación
              </h2>
              <div className="space-y-3">
                {(order.communication_thread as Array<{ author: string; message: string; created_at: string }>).map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 text-sm ${
                      msg.author === "admin"
                        ? "bg-[#EAC9C9]/30 border-l-2 border-[#B5888A]"
                        : "bg-[#F3EDE0] border-l-2 border-[#DDD5C4]"
                    }`}
                  >
                    <p className="text-[10px] text-[#897568] mb-1 uppercase tracking-wide">
                      {msg.author === "admin" ? "María José" : "Cliente"} · {formatDateShort(msg.created_at)}
                    </p>
                    <p className="text-[#3D2B1F]">{msg.message}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── COLUMNA DERECHA: acciones ── */}
        <div>
          <CotizacionActions order={order} />
        </div>
      </div>
    </div>
  );
}
