"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { OrderStatus } from "@/types";

const TRANSITIONS: Record<string, { next: OrderStatus; label: string }[]> = {
  // Flujo A pre-producido
  paid: [{ next: "preparing", label: "Marcar en preparación" }],
  // Flujo A o B/C recién llegado de en_produccion
  en_produccion: [
    { next: "preparing", label: "Listo para empacar" },
    { next: "shipped", label: "Marcar como enviado" },
    { next: "cancelled", label: "Cancelar" },
  ],
  preparing: [
    { next: "shipped", label: "Marcar como enviado" },
    { next: "cancelled", label: "Cancelar" },
  ],
  shipped: [{ next: "delivered", label: "Marcar como entregado" }],
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
  pendiente_aprobacion: "Pendiente de aprobación",
  en_ajustes: "En ajustes",
  aprobado_pendiente_pago: "Aprobado — esperando pago",
  rechazado: "Rechazado",
};

interface Props {
  order: {
    id: string;
    status: string;
    flow?: string | null;
    tracking_number: string | null;
    courier: string | null;
  };
}

export function OrderStatusActions({ order }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number ?? "");
  const [courier, setCourier] = useState(order.courier ?? "Coordinadora");
  const [error, setError] = useState<string | null>(null);

  const transitions = TRANSITIONS[order.status] ?? [];
  const needsTracking = order.status === "preparing" || order.status === "en_produccion";

  async function changeStatus(nextStatus: OrderStatus) {
    if (nextStatus === "shipped" && !trackingNumber.trim()) {
      setError("Ingresa el número de guía antes de marcar como enviado.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch(`/api/admin/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus, trackingNumber, courier }),
    });

    if (res.ok) {
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.error ?? "Error al actualizar el estado.");
    }
    setLoading(false);
  }

  const isBC = order.flow === "B" || order.flow === "C";
  const isFinished = ["delivered", "cancelled", "rechazado"].includes(order.status);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm text-[#897568]">Estado actual:</span>
        <span className="text-sm font-[600] text-[#3D2B1F]">
          {STATUS_LABEL[order.status] ?? order.status}
        </span>
        {order.flow && (
          <span className="text-[9px] px-2 py-0.5 bg-[#F3EDE0] text-[#3D2B1F] font-[600] tracking-wide uppercase">
            Flujo {order.flow}
          </span>
        )}
      </div>

      {/* B/C: Gestión vía cotizaciones */}
      {isBC && !["en_produccion", "preparing", "shipped", "delivered"].includes(order.status) && (
        <p className="text-xs text-[#897568] bg-[#F3EDE0] px-3 py-2 border border-[#DDD5C4]">
          Pedido personalizado — gestionar estado desde{" "}
          <a href={`/admin/cotizaciones/${order.id}`} className="text-[#b85539] underline">
            el panel de cotizaciones
          </a>
          .
        </p>
      )}

      {/* Campo guía cuando va a despacharse */}
      {needsTracking && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-[#897568] font-[600] block mb-1.5">
              Número de guía
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="123456789"
              className="w-full border border-[#DDD5C4] bg-[#F3EDE0] px-3 py-2 text-sm text-[#3D2B1F] outline-none focus:border-[#897568]"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-[#897568] font-[600] block mb-1.5">
              Courier
            </label>
            <select
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
              className="w-full border border-[#DDD5C4] bg-[#F3EDE0] px-3 py-2 text-sm text-[#3D2B1F] outline-none focus:border-[#897568]"
            >
              <option>Coordinadora</option>
              <option>Interrapidísimo</option>
              <option>Servientrega</option>
              <option>TCC</option>
            </select>
          </div>
        </div>
      )}

      {/* Botones de transición */}
      {transitions.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {transitions.map(({ next, label }) => (
            <button
              key={next}
              onClick={() => changeStatus(next)}
              disabled={loading}
              className={cn(
                "px-5 py-2.5 text-[11px] tracking-[0.15em] uppercase font-[500] transition-colors disabled:opacity-50",
                next === "cancelled" || next === "rechazado"
                  ? "border border-red-300 text-red-600 hover:bg-red-50"
                  : "bg-[#3D2B1F] text-[#F3EDE0] hover:bg-[#5A3E2E]"
              )}
            >
              {loading ? "Actualizando…" : label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="text-xs text-[#B5888A] bg-[#EAC9C9]/30 border border-[#EAC9C9] px-3 py-2">
          {error}
        </p>
      )}

      {isFinished && (
        <p className="text-xs text-[#CEC3AB]">Este pedido está finalizado.</p>
      )}
    </div>
  );
}
