"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Loader2, ChevronRight } from "lucide-react";
import { formatCOP } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { ContactStep } from "./ContactStep";
import { ShirtSelector } from "./ShirtSelector";
import { DesignGallery } from "./DesignGallery";
import { TextEditor } from "./TextEditor";

// Importar el canvas dinámicamente para evitar SSR
const CanvasPreview = dynamic(() => import("./CanvasPreview"), { ssr: false });

// ── Tipos ────────────────────────────────────────────────────────
export type ShirtModel = "cuello-redondo" | "polo" | "cuello-v" | "oversize";
export type ShirtColor = "blanco" | "negro" | "gris" | "azul-navy" | "rojo" | "beige";

export interface DesignOption {
  id: string;
  name: string;
  image_url: string;
  event_tag?: string;
  style_tag?: string;
}

export interface ConfigState {
  modelo: ShirtModel;
  color: ShirtColor;
  design: DesignOption | null;
  texto: string;
  fuente: string;
  colorTexto: string;
}

export type Step = "diseno" | "contacto";

// ── Precios ──────────────────────────────────────────────────────
export const PRECIO_BASE = 65_000; // configurable en admin futuro

const SHIRT_COLORS: { id: ShirtColor; label: string; hex: string }[] = [
  { id: "blanco",    label: "Blanco",    hex: "#F5F5F0" },
  { id: "negro",     label: "Negro",     hex: "#1A1A1A" },
  { id: "gris",      label: "Gris",      hex: "#9B9B9B" },
  { id: "azul-navy", label: "Navy",      hex: "#1B2A49" },
  { id: "rojo",      label: "Rojo",      hex: "#C0392B" },
  { id: "beige",     label: "Beige",     hex: "#E8DFC8" },
];

const SHIRT_MODELS: { id: ShirtModel; label: string }[] = [
  { id: "cuello-redondo", label: "Cuello redondo" },
  { id: "polo",           label: "Polo" },
  { id: "cuello-v",       label: "Cuello V" },
  { id: "oversize",       label: "Oversize" },
];

// ── Diseños de catálogo estáticos (placeholder hasta tener DB) ───
const STATIC_DESIGNS: DesignOption[] = [
  { id: "fg-01", name: "Feria Ganadera — Bandera", image_url: "/colecciones/feria-ganadera/fg-01.jpg", event_tag: "feria-ganadera" },
  { id: "fg-02", name: "Feria Ganadera — Sombrero", image_url: "/colecciones/feria-ganadera/fg-03.jpg", event_tag: "feria-ganadera" },
  { id: "fg-03", name: "Feria Ganadera — Colores", image_url: "/colecciones/feria-ganadera/fg-09.jpg", event_tag: "feria-ganadera" },
  { id: "custom-01", name: "Geométrico", image_url: "/colecciones/feria-ganadera/fg-11.jpg", style_tag: "geometrico" },
  { id: "custom-02", name: "Floral", image_url: "/colecciones/feria-ganadera/fg-04.jpg", style_tag: "floral" },
  { id: "custom-03", name: "Minimalista", image_url: "/colecciones/feria-ganadera/fg-07.jpg", style_tag: "minimalista" },
];

export function ConfiguradorClient() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("diseno");
  const [config, setConfig] = useState<ConfigState>({
    modelo: "cuello-redondo",
    color: "blanco",
    design: null,
    texto: "",
    fuente: "Instrument Serif",
    colorTexto: "#0e0e0e",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<{ toDataURL: () => string } | null>(null);

  function updateConfig(patch: Partial<ConfigState>) {
    setConfig((c) => ({ ...c, ...patch }));
    setError(null);
  }

  const selectedColor = SHIRT_COLORS.find((c) => c.id === config.color)!;

  async function handleSolicitar(contact: {
    full_name: string;
    email: string;
    phone: string;
    city?: string;
    department?: string;
  }) {
    setSubmitting(true);
    setError(null);

    // Capturar preview del canvas como data URL
    const previewUrl = canvasRef.current?.toDataURL() ?? undefined;

    try {
      const res = await fetch("/api/configurador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...contact,
          modelo_camisa: SHIRT_MODELS.find((m) => m.id === config.modelo)?.label ?? config.modelo,
          color_camisa: selectedColor.label,
          design_id: config.design?.id,
          design_name: config.design?.name,
          texto_diseno: config.texto || undefined,
          fuente_texto: config.texto ? config.fuente : undefined,
          color_texto: config.texto ? config.colorTexto : undefined,
          preview_url: previewUrl,
          precio_base: PRECIO_BASE,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al enviar tu diseño."); return; }

      router.push(`/configura/exito?numero=${data.orderNumber}`);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="text-[#6a6356] hover:text-[#0e0e0e] transition-colors">
          <ArrowLeft size={18} strokeWidth={1.5} />
        </Link>
        <div>
          <h1
            className="text-3xl text-[#0e0e0e]"
            style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
          >
            {step === "diseno" ? "Diseña tu camiseta" : "Tus datos"}
          </h1>
          <p className="text-sm text-[#6a6356] mt-0.5">
            {step === "diseno"
              ? "Elige el modelo, el diseño y añade tu texto."
              : "Ingresa tus datos para enviar tu diseño a aprobación."}
          </p>
        </div>
      </div>

      {step === "diseno" ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">

          {/* ── PANEL IZQUIERDO: opciones ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Modelo */}
            <ShirtSelector
              models={SHIRT_MODELS}
              colors={SHIRT_COLORS}
              selectedModel={config.modelo}
              selectedColor={config.color}
              onChange={(m, c) => updateConfig({ modelo: m, color: c })}
            />

            {/* Galería de diseños */}
            <DesignGallery
              designs={STATIC_DESIGNS}
              selected={config.design}
              onSelect={(d) => updateConfig({ design: d })}
            />

            {/* Editor de texto */}
            <TextEditor
              texto={config.texto}
              fuente={config.fuente}
              colorTexto={config.colorTexto}
              onChange={(t, f, c) => updateConfig({ texto: t, fuente: f, colorTexto: c })}
            />
          </div>

          {/* ── PANEL DERECHO: preview ── */}
          <div className="lg:col-span-3 flex flex-col">
            <div className="sticky top-24">
              {/* Canvas preview */}
              <div className="bg-[#e8e0c8] aspect-[4/5] flex items-center justify-center overflow-hidden">
                <CanvasPreview
                  ref={canvasRef}
                  config={config}
                  shirtColor={selectedColor.hex}
                />
              </div>

              {/* Precio y CTA */}
              <div className="mt-4 border border-[#d8cfbb] p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-[#6a6356]">Precio desde</p>
                  <p className="text-2xl font-[500] text-[#0e0e0e]">{formatCOP(PRECIO_BASE)}</p>
                  <p className="text-[11px] text-[#6a6356] mt-0.5">
                    Precio final se confirma al aprobar el diseño
                  </p>
                </div>
                <button
                  onClick={() => setStep("contacto")}
                  className="flex items-center gap-2 bg-[#0e0e0e] text-[#faf7f1] px-5 py-3 text-sm font-[500] tracking-[0.1em] uppercase hover:bg-[#f0c419] hover:text-[#0e0e0e] transition-colors"
                >
                  Solicitar aprobación
                  <ChevronRight size={15} />
                </button>
              </div>

              <p className="text-[11px] text-[#6a6356] mt-3 text-center">
                María José revisará tu diseño en menos de 24 horas.
                Recibirás un correo con la propuesta final y el link de pago.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-xl">
          <button
            onClick={() => setStep("diseno")}
            className="text-sm text-[#6a6356] hover:text-[#0e0e0e] mb-6 flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> Volver al diseño
          </button>

          {/* Resumen del diseño */}
          <div className="border border-[#d8cfbb] p-4 mb-6 text-sm space-y-1">
            <p className="text-xs uppercase tracking-[0.12em] text-[#6a6356] mb-2">Tu diseño</p>
            <p><span className="text-[#6a6356]">Modelo:</span> {SHIRT_MODELS.find((m) => m.id === config.modelo)?.label}</p>
            <p><span className="text-[#6a6356]">Color:</span> {selectedColor.label}</p>
            {config.design && <p><span className="text-[#6a6356]">Diseño:</span> {config.design.name}</p>}
            {config.texto && <p><span className="text-[#6a6356]">Texto:</span> {config.texto}</p>}
          </div>

          <ContactStep
            onSubmit={handleSolicitar}
            submitting={submitting}
          />

          {error && (
            <div className="mt-4 flex items-start gap-2 text-sm text-[#b85539] bg-[#b85539]/8 border border-[#b85539]/30 px-4 py-3">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" strokeWidth={2} />
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
