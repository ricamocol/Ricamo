"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, AlertTriangle, Link2, MessageSquare } from "lucide-react";
import { formatCOP } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface OrderData {
  id: string;
  order_number: string;
  status: string;
  flow: string;
  shipping_email: string;
  shipping_name: string;
  cotizacion_price: number | null;
  wompi_link_url: string | null;
}

interface Props {
  order: OrderData;
}

type Action =
  | "aprobar"
  | "ajustes"
  | "rechazar"
  | "cotizar"
  | "mensaje";

export function CotizacionActions({ order }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<Action | null>(null);

  // Formularios de cada acción
  const [precio, setPrecio] = useState(order.cotizacion_price?.toString() ?? "");
  const [mensaje, setMensaje] = useState("");
  const [razonRechazo, setRazonRechazo] = useState("");

  async function submit(action: string, body: Record<string, unknown>) {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/admin/cotizaciones/${order.id}/accion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...body }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al procesar"); return; }
      setSuccess(data.message ?? "Acción completada");
      setActiveAction(null);
      router.refresh();
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const isTerminal = ["rechazado", "cancelled", "delivered", "paid", "shipped", "en_produccion"].includes(order.status);
  const hasPriceAndLink = order.cotizacion_price && order.wompi_link_url;

  return (
    <div className="bg-white border border-[#DDD5C4] p-5 space-y-4 sticky top-4">
      <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#897568] font-[600]">
        Acciones
      </h2>

      {success && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2">
          <CheckCircle size={14} />
          {success}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-2">
          <XCircle size={14} />
          {error}
        </div>
      )}

      {!isTerminal && (
        <>
          {/* ── COTIZAR (Flujo C pendiente cotizacion) ── */}
          {(order.status === "cotizacion_pendiente" || order.status === "en_ajustes") && (
            <div>
              <button
                onClick={() => setActiveAction(activeAction === "cotizar" ? null : "cotizar")}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-[500] bg-[#3D2B1F] text-[#F3EDE0] hover:bg-[#5C3D2E] transition-colors"
              >
                <Link2 size={14} />
                {hasPriceAndLink ? "Actualizar cotización" : "Cotizar y generar link"}
              </button>

              {activeAction === "cotizar" && (
                <div className="mt-3 space-y-3 border-t border-[#DDD5C4] pt-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.1em] text-[#897568] mb-1">
                      Precio cotizado (COP) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={precio}
                      onChange={(e) => setPrecio(e.target.value)}
                      placeholder="Ej: 85000"
                      className="w-full border border-[#DDD5C4] px-3 py-2 text-sm text-[#3D2B1F] focus:outline-none focus:border-[#897568]"
                    />
                    {precio && !isNaN(Number(precio)) && (
                      <p className="text-xs text-[#897568] mt-0.5">{formatCOP(Number(precio))}</p>
                    )}
                  </div>
                  <button
                    onClick={() => submit("cotizar", { precio_cotizado: Number(precio) })}
                    disabled={loading || !precio || isNaN(Number(precio)) || Number(precio) <= 0}
                    className="w-full py-2 text-sm font-[500] bg-[#3D2B1F] text-[#F3EDE0] hover:bg-[#5C3D2E] transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Generar link de pago"}
                  </button>
                  <p className="text-[10px] text-[#897568]">
                    Se generará un Wompi Link y se notificará al cliente por email.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── APROBAR (Flujo B pendiente_aprobacion) ── */}
          {order.status === "pendiente_aprobacion" && (
            <div>
              <button
                onClick={() => setActiveAction(activeAction === "aprobar" ? null : "aprobar")}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-[500] bg-green-700 text-white hover:bg-green-800 transition-colors"
              >
                <CheckCircle size={14} />
                Aprobar diseño y cotizar
              </button>

              {activeAction === "aprobar" && (
                <div className="mt-3 space-y-3 border-t border-[#DDD5C4] pt-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.1em] text-[#897568] mb-1">
                      Precio final (COP) *
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={precio}
                      onChange={(e) => setPrecio(e.target.value)}
                      placeholder="Ej: 95000"
                      className="w-full border border-[#DDD5C4] px-3 py-2 text-sm text-[#3D2B1F] focus:outline-none focus:border-[#897568]"
                    />
                  </div>
                  <button
                    onClick={() => submit("aprobar", { precio_cotizado: Number(precio) })}
                    disabled={loading || !precio || isNaN(Number(precio)) || Number(precio) <= 0}
                    className="w-full py-2 text-sm font-[500] bg-green-700 text-white hover:bg-green-800 transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Aprobar y generar link"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── PEDIR AJUSTES ── */}
          {["cotizacion_pendiente", "pendiente_aprobacion", "en_ajustes"].includes(order.status) && (
            <div>
              <button
                onClick={() => setActiveAction(activeAction === "ajustes" ? null : "ajustes")}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-[500] border border-[#DDD5C4] text-[#897568] hover:border-[#3D2B1F] hover:text-[#3D2B1F] transition-colors"
              >
                <AlertTriangle size={14} />
                Solicitar ajustes al cliente
              </button>

              {activeAction === "ajustes" && (
                <div className="mt-3 space-y-3 border-t border-[#DDD5C4] pt-3">
                  <textarea
                    rows={3}
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    placeholder="Describe qué debe cambiar el cliente…"
                    className="w-full border border-[#DDD5C4] px-3 py-2 text-sm text-[#3D2B1F] resize-none focus:outline-none focus:border-[#897568]"
                  />
                  <button
                    onClick={() => submit("ajustes", { mensaje })}
                    disabled={loading || !mensaje.trim()}
                    className="w-full py-2 text-sm font-[500] border border-[#3D2B1F] text-[#3D2B1F] hover:bg-[#3D2B1F] hover:text-[#F3EDE0] transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Enviar al cliente"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── MENSAJE ── */}
          <div>
            <button
              onClick={() => setActiveAction(activeAction === "mensaje" ? null : "mensaje")}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-[500] border border-[#DDD5C4] text-[#897568] hover:border-[#3D2B1F] hover:text-[#3D2B1F] transition-colors"
            >
              <MessageSquare size={14} />
              Enviar mensaje al cliente
            </button>

            {activeAction === "mensaje" && (
              <div className="mt-3 space-y-3 border-t border-[#DDD5C4] pt-3">
                <textarea
                  rows={3}
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Mensaje para el cliente…"
                  className="w-full border border-[#DDD5C4] px-3 py-2 text-sm text-[#3D2B1F] resize-none focus:outline-none focus:border-[#897568]"
                />
                <button
                  onClick={() => submit("mensaje", { mensaje })}
                  disabled={loading || !mensaje.trim()}
                  className="w-full py-2 text-sm font-[500] border border-[#3D2B1F] text-[#3D2B1F] hover:bg-[#3D2B1F] hover:text-[#F3EDE0] transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Enviar mensaje"}
                </button>
              </div>
            )}
          </div>

          {/* ── RECHAZAR ── */}
          {["cotizacion_pendiente", "pendiente_aprobacion", "en_ajustes"].includes(order.status) && (
            <div>
              <button
                onClick={() => setActiveAction(activeAction === "rechazar" ? null : "rechazar")}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-[500] text-red-600 border border-red-200 hover:border-red-600 hover:bg-red-50 transition-colors"
              >
                <XCircle size={14} />
                Rechazar solicitud
              </button>

              {activeAction === "rechazar" && (
                <div className="mt-3 space-y-3 border-t border-[#DDD5C4] pt-3">
                  <textarea
                    rows={3}
                    value={razonRechazo}
                    onChange={(e) => setRazonRechazo(e.target.value)}
                    placeholder="Razón del rechazo (se enviará al cliente)…"
                    className="w-full border border-[#DDD5C4] px-3 py-2 text-sm text-[#3D2B1F] resize-none focus:outline-none focus:border-[#897568]"
                  />
                  <button
                    onClick={() => submit("rechazar", { razon: razonRechazo })}
                    disabled={loading || !razonRechazo.trim()}
                    className="w-full py-2 text-sm font-[500] bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Confirmar rechazo"}
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {isTerminal && (
        <p className="text-sm text-[#897568] italic">
          Esta cotización está en estado final: <strong>{order.status}</strong>.
          No hay acciones disponibles.
        </p>
      )}
    </div>
  );
}
