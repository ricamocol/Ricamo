import type { Metadata } from "next";
import Link from "next/link";
import { Search, Package, MapPin, Truck, CheckCircle, XCircle, Clock, Scissors } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";
import { formatCOP, formatDate } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Seguimiento de pedido" };

// Flujo A pre-stock: pending_payment → paid → preparing → shipped → delivered
const STEPS_PRESTOCK = [
  { key: "pending_payment", label: "Pendiente de pago", icon: Clock },
  { key: "paid", label: "Pago confirmado", icon: CheckCircle },
  { key: "preparing", label: "Empacando", icon: Package },
  { key: "shipped", label: "En camino", icon: Truck },
  { key: "delivered", label: "Entregado", icon: CheckCircle },
];
const ORDER_PRESTOCK = ["pending_payment", "paid", "preparing", "shipped", "delivered"];

// Flujo A bajo demanda / B / C: paid → en_produccion → shipped → delivered
const STEPS_PRODUCCION = [
  { key: "paid", label: "Pago confirmado", icon: CheckCircle },
  { key: "en_produccion", label: "En producción", icon: Scissors },
  { key: "shipped", label: "En camino", icon: Truck },
  { key: "delivered", label: "Entregado", icon: CheckCircle },
];
const ORDER_PRODUCCION = ["paid", "en_produccion", "shipped", "delivered"];

// Estados B/C previos al pago — mapa de etiqueta para mostrar en card
const BC_STATUS_LABELS: Record<string, { label: string; detail: string }> = {
  cotizacion_pendiente: {
    label: "Cotización en proceso",
    detail: "Estamos revisando tu solicitud y pronto te enviaremos una cotización.",
  },
  pendiente_aprobacion: {
    label: "Revisando tu diseño",
    detail: "Tu diseño está siendo revisado. Te notificaremos cuando esté listo.",
  },
  en_ajustes: {
    label: "Diseño en ajustes",
    detail: "Se solicitaron ajustes. Revisa tu correo para más detalles.",
  },
  aprobado_pendiente_pago: {
    label: "¡Aprobado! Lista para pagar",
    detail: "Tu diseño fue aprobado. Usa el enlace enviado a tu correo para completar el pago.",
  },
  rechazado: {
    label: "No pudimos continuar",
    detail: "Tu solicitud no pudo ser procesada. Revisa tu correo para conocer el motivo.",
  },
};

function pickSteps(status: string) {
  if (ORDER_PRESTOCK.includes(status) && status === "preparing") {
    return { steps: STEPS_PRESTOCK, order: ORDER_PRESTOCK };
  }
  if (ORDER_PRODUCCION.includes(status)) {
    return { steps: STEPS_PRODUCCION, order: ORDER_PRODUCCION };
  }
  // Default: pre-stock path (covers pending_payment, paid before knowing the path)
  return { steps: STEPS_PRESTOCK, order: ORDER_PRESTOCK };
}

interface Props {
  searchParams: Promise<{ orden?: string; email?: string }>;
}

export default async function SeguimientoPage({ searchParams }: Props) {
  const { orden, email } = await searchParams;

  let order: any = null;
  let error: string | null = null;

  if (orden && email) {
    // Service client para que guests y clientes registrados puedan consultar
    const db = createServiceClient();
    const { data, error: err } = await db
      .from("orders")
      .select(`*, order_items (id, product_name, variant_attrs, quantity, total_price)`)
      .eq("order_number", orden.toUpperCase())
      .ilike("shipping_email", email.trim())
      .single();

    if (err || !data) {
      error = "No encontramos un pedido con ese número y correo. Verifica los datos.";
    } else {
      order = data;
    }
  }

  const isCancelled = order?.status === "cancelled";
  const isRechazado = order?.status === "rechazado";
  const bcStatus = order && BC_STATUS_LABELS[order.status] ? order.status : null;

  const { steps: STATUS_STEPS, order: STATUS_ORDER } =
    order ? pickSteps(order.status) : { steps: STEPS_PRESTOCK, order: ORDER_PRESTOCK };
  const currentStep = order ? STATUS_ORDER.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen bg-[#F3EDE0]">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-[10px] tracking-[0.28em] uppercase text-[#B5888A] font-[500]">
            Estado de tu compra
          </span>
          <h1
            className="text-4xl text-[#3D2B1F] mt-2"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Seguimiento de pedido
          </h1>
        </div>

        {/* Formulario de búsqueda */}
        <form method="GET" className="bg-white border border-[#DDD5C4] p-6 mb-8">
          <p className="text-[11px] uppercase tracking-[0.15em] font-[600] text-[#3D2B1F] mb-4">
            Consultar pedido
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] text-[#897568] font-[600] mb-1.5">
                Número de pedido
              </label>
              <input
                name="orden"
                defaultValue={orden ?? ""}
                placeholder="RIC-XXXXXXXX"
                className="w-full border border-[#DDD5C4] bg-white px-3 py-2.5 text-sm text-[#3D2B1F] focus:outline-none focus:border-[#897568] transition-colors placeholder:text-[#CEC3AB] uppercase"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] text-[#897568] font-[600] mb-1.5">
                Correo electrónico
              </label>
              <input
                name="email"
                type="email"
                defaultValue={email ?? ""}
                placeholder="tu@correo.com"
                className="w-full border border-[#DDD5C4] bg-white px-3 py-2.5 text-sm text-[#3D2B1F] focus:outline-none focus:border-[#897568] transition-colors placeholder:text-[#CEC3AB]"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#3D2B1F] text-[#F3EDE0] text-[11px] tracking-[0.2em] uppercase font-[500] hover:bg-[#B5888A] transition-colors"
            >
              <Search size={14} /> Buscar pedido
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-white border border-[#EAC9C9] p-4 mb-6 flex items-start gap-3">
            <XCircle size={18} className="text-[#B5888A] shrink-0 mt-0.5" />
            <p className="text-sm text-[#897568]">{error}</p>
          </div>
        )}

        {/* Resultado */}
        {order && (
          <div className="space-y-5">
            {/* Cabecera del pedido */}
            <div className="bg-white border border-[#DDD5C4] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-[#B5888A] font-[500]">
                    Pedido
                  </p>
                  <p
                    className="text-2xl text-[#3D2B1F] mt-0.5"
                    style={{ fontFamily: "'Instrument Serif', serif" }}
                  >
                    {order.order_number}
                  </p>
                  <p className="text-xs text-[#897568] mt-1">{formatDate(order.created_at)}</p>
                </div>
                <p className="text-xl font-[600] text-[#3D2B1F]">{formatCOP(order.total)}</p>
              </div>
            </div>

            {/* Timeline de estado */}
            <div className="bg-white border border-[#DDD5C4] p-5">
              <p className="text-[11px] uppercase tracking-[0.15em] font-[600] text-[#3D2B1F] mb-5">
                Estado del pedido
              </p>

              {isCancelled || isRechazado ? (
                <div className="flex items-center gap-3 py-3 text-[#B5888A]">
                  <XCircle size={20} />
                  <div>
                    <p className="text-sm font-[600]">
                      {isCancelled ? "Pedido cancelado" : "No pudimos continuar"}
                    </p>
                    <p className="text-xs text-[#897568] mt-0.5">
                      {isCancelled
                        ? "Este pedido fue cancelado. Si tienes preguntas escríbenos a hola@ricamo.co"
                        : "Tu solicitud no pudo ser procesada. Revisa tu correo para conocer el motivo."}
                    </p>
                  </div>
                </div>
              ) : bcStatus ? (
                <div className="py-3">
                  <div className="flex items-start gap-3">
                    <Clock size={20} className="text-[#f0c419] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-[600] text-[#3D2B1F]">
                        {BC_STATUS_LABELS[bcStatus].label}
                      </p>
                      <p className="text-xs text-[#897568] mt-1">
                        {BC_STATUS_LABELS[bcStatus].detail}
                      </p>
                      {bcStatus === "aprobado_pendiente_pago" && order?.wompi_link_url && (
                        <a
                          href={order.wompi_link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-3 px-6 py-2.5 bg-[#f0c419] text-[#0e0e0e] text-[11px] tracking-[0.18em] uppercase font-[700] hover:bg-[#e0b410] transition-colors"
                        >
                          Pagar ahora →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-0">
                  {STATUS_STEPS.map((step, idx) => {
                    const done = currentStep >= idx;
                    const active = currentStep === idx;
                    return (
                      <div key={step.key} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                              done
                                ? "bg-[#3D2B1F] text-[#F3EDE0]"
                                : "bg-[#F3EDE0] text-[#CEC3AB] border border-[#DDD5C4]"
                            }`}
                          >
                            <step.icon size={14} />
                          </div>
                          {idx < STATUS_STEPS.length - 1 && (
                            <div className={`w-px h-6 ${done ? "bg-[#3D2B1F]" : "bg-[#DDD5C4]"}`} />
                          )}
                        </div>
                        <div className="pb-4">
                          <p
                            className={`text-sm ${active ? "font-[600]" : "font-[400]"} ${
                              done ? "text-[#3D2B1F]" : "text-[#CEC3AB]"
                            }`}
                          >
                            {step.label}
                          </p>
                          {active && step.key === "shipped" && order.tracking_number && (
                            <p className="text-xs text-[#897568] mt-0.5">
                              Guía: <span className="font-[600] text-[#3D2B1F]">{order.tracking_number}</span>
                              {order.courier && ` · ${order.courier}`}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Prendas */}
            <div className="bg-white border border-[#DDD5C4]">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-[#F3EDE0]">
                <Package size={13} className="text-[#B5888A]" />
                <p className="text-[11px] uppercase tracking-[0.15em] font-[600] text-[#3D2B1F]">
                  Prendas
                </p>
              </div>
              {order.order_items?.map((item: any) => {
                const attrs = Object.values(item.variant_attrs ?? {}).filter(Boolean).join(" · ");
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-5 py-3.5 border-b border-[#F3EDE0] last:border-0"
                  >
                    <div>
                      <p className="text-sm text-[#3D2B1F] font-[500]">{item.product_name}</p>
                      {attrs && <p className="text-[11px] text-[#897568]">{attrs}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-[600] text-[#3D2B1F]">{formatCOP(item.total_price)}</p>
                      <p className="text-[11px] text-[#897568]">× {item.quantity}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Envío */}
            <div className="bg-white border border-[#DDD5C4]">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-[#F3EDE0]">
                <MapPin size={13} className="text-[#B5888A]" />
                <p className="text-[11px] uppercase tracking-[0.15em] font-[600] text-[#3D2B1F]">
                  Dirección de envío
                </p>
              </div>
              <div className="px-5 py-4 text-sm text-[#897568] space-y-0.5">
                <p className="text-[#3D2B1F] font-[500]">{order.shipping_name}</p>
                <p>{order.shipping_address}</p>
                <p>{order.shipping_city}, {order.shipping_department}</p>
              </div>
            </div>

            <p className="text-center text-xs text-[#897568]">
              ¿Tienes dudas?{" "}
              <Link href="mailto:hola@ricamo.co" className="text-[#3D2B1F] underline underline-offset-2">
                hola@ricamo.co
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
