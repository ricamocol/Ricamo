"use client";

import { useState, useEffect } from "react";
import { X, MapPin } from "lucide-react";
import Link from "next/link";

interface ActiveEvent {
  id: string;
  name: string;
  city: string;
  banner_text: string;
  starts_at: string;
  ends_at: string;
}

// Normaliza para comparar ciudad IP con ciudad del evento
function normalizeCity(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

export function EventBanner() {
  const [event, setEvent] = useState<ActiveEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Si el usuario ya cerró el banner en esta sesión, no mostrar
    if (typeof window !== "undefined" && sessionStorage.getItem("event-banner-closed")) {
      return;
    }

    async function detect() {
      try {
        // 1. Detectar ciudad del usuario
        const geoRes = await fetch("/api/geo");
        if (!geoRes.ok) return;
        const { city } = await geoRes.json() as { city: string | null };
        if (!city) return;

        // 2. Buscar evento activo para esta ciudad
        const eventsRes = await fetch("/api/eventos/activos");
        if (!eventsRes.ok) return;
        const { events } = await eventsRes.json() as { events: ActiveEvent[] };

        const cityNorm = normalizeCity(city);
        const now = new Date();

        const matched = events.find((e) => {
          const start = new Date(e.starts_at);
          const end = new Date(e.ends_at);
          return (
            normalizeCity(e.city) === cityNorm &&
            now >= start &&
            now <= end
          );
        });

        if (matched) {
          setEvent(matched);
          setVisible(true);
        }
      } catch {
        // Degradar elegantemente — RB-EVT-02
      }
    }

    detect();
  }, []);

  function close() {
    setVisible(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("event-banner-closed", "1");
    }
  }

  if (!visible || !event) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-[#f0c419] text-[#0e0e0e] border-t-2 border-[#0e0e0e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
        <MapPin size={16} strokeWidth={2} className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-[600] truncate">{event.name}</p>
          <p className="text-xs truncate">{event.banner_text}</p>
        </div>
        <Link
          href={`/colecciones`}
          className="flex-shrink-0 px-3 py-1.5 bg-[#0e0e0e] text-[#faf7f1] text-xs font-[500] uppercase tracking-[0.1em] hover:bg-[#b85539] transition-colors whitespace-nowrap"
        >
          Ver colección
        </Link>
        <button
          onClick={close}
          aria-label="Cerrar banner"
          className="flex-shrink-0 text-[#0e0e0e] hover:text-[#6a6356] transition-colors ml-1"
        >
          <X size={18} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
