"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Upload, X, FileImage, FileText,
  Loader2, CheckCircle2, AlertCircle, ImagePlus,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const TIPOS_PRENDA = [
  "Camiseta cuello redondo",
  "Camiseta polo",
  "Camiseta cuello V",
  "Camiseta oversize",
  "Sudadera con capucha",
  "Sudadera sin capucha",
  "Otro",
];

const COLORES_BASE = [
  "Blanco", "Negro", "Gris", "Azul navy", "Rojo", "Verde", "Beige", "Otro",
];

const DEPARTMENTS = [
  "Amazonas","Antioquia","Arauca","Atlántico","Bolívar","Boyacá","Caldas",
  "Caquetá","Casanare","Cauca","Cesar","Chocó","Córdoba","Cundinamarca",
  "Guainía","Guaviare","Huila","La Guajira","Magdalena","Meta","Nariño",
  "Norte de Santander","Putumayo","Quindío","Risaralda","San Andrés","Santander",
  "Sucre","Tolima","Valle del Cauca","Vaupés","Vichada",
];

interface UploadedFile {
  url: string;
  name: string;
  type: string;
  preview?: string;
}

const inputClass =
  "w-full border border-[#d8cfbb] bg-[#faf7f1] px-3 py-2.5 text-sm text-[#0e0e0e] " +
  "focus:outline-none focus:border-[#0e0e0e] transition-colors placeholder:text-[#6a6356]";

const labelClass = "block text-xs uppercase tracking-[0.12em] text-[#6a6356] mb-1.5 font-[500]";

export default function CotizaPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    city: "",
    department: "",
    tipo_prenda: "",
    color_base: "",
    tallas: "",
    cantidad: 1,
    evento: "",
    descripcion: "",
    terms_accepted: false,
  });

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function set(field: string, value: string | number | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
    setError(null);
  }

  async function uploadFile(file: File): Promise<UploadedFile | null> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/cotizaciones/upload", { method: "POST", body: fd });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error ?? "Error al subir archivo");
    }
    const data = await res.json();

    let preview: string | undefined;
    if (file.type.startsWith("image/")) {
      preview = URL.createObjectURL(file);
    }

    return { url: data.url, name: data.name, type: data.type, preview };
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    if (files.length + fileList.length > 5) {
      setError("Máximo 5 archivos de referencia.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const results = await Promise.all(Array.from(fileList).map(uploadFile));
      const valid = results.filter(Boolean) as UploadedFile[];
      setFiles((f) => [...f, ...valid]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al subir archivo");
    } finally {
      setUploading(false);
    }
  }

  function removeFile(idx: number) {
    setFiles((f) => {
      const next = [...f];
      if (next[idx].preview) URL.revokeObjectURL(next[idx].preview!);
      next.splice(idx, 1);
      return next;
    });
  }

  function validate(): string | null {
    if (!form.full_name.trim()) return "Ingresa tu nombre completo.";
    if (!form.email.includes("@")) return "El correo no es válido.";
    if (form.phone.replace(/\D/g, "").length < 7) return "El teléfono no es válido.";
    if (!form.tipo_prenda) return "Selecciona el tipo de prenda.";
    if (!form.color_base) return "Selecciona el color base.";
    if (!form.tallas.trim()) return "Indica las tallas que necesitas.";
    if (form.cantidad < 1) return "La cantidad debe ser al menos 1.";
    if (form.descripcion.trim().length < 20) return "Describe tu diseño con más detalle (mínimo 20 caracteres).";
    if (!form.terms_accepted) return "Debes aceptar los términos y condiciones.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/cotizaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          attachments: files.map(({ url, name, type }) => ({ url, name, type })),
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al enviar la solicitud."); return; }

      router.push(`/cotiza/exito?numero=${data.orderNumber}`);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
            Cotiza tu diseño
          </h1>
          <p className="text-sm text-[#6a6356] mt-0.5">
            Cuéntanos qué tienes en mente y te enviamos una propuesta en menos de 24 horas.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ── DATOS DE CONTACTO ── */}
        <section>
          <h2 className="text-xs uppercase tracking-[0.18em] text-[#6a6356] mb-4 font-[500]">
            Datos de contacto
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nombre completo *</label>
              <input
                type="text"
                className={inputClass}
                placeholder="María González"
                value={form.full_name}
                onChange={(e) => set("full_name", e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Correo electrónico *</label>
              <input
                type="email"
                className={inputClass}
                placeholder="maria@correo.com"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Teléfono / WhatsApp *</label>
              <input
                type="tel"
                className={inputClass}
                placeholder="+57 300 000 0000"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Ciudad</label>
              <input
                type="text"
                className={inputClass}
                placeholder="Montería"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Departamento</label>
              <select
                className={inputClass}
                value={form.department}
                onChange={(e) => set("department", e.target.value)}
              >
                <option value="">Selecciona</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ── DETALLES DE LA PRENDA ── */}
        <section>
          <h2 className="text-xs uppercase tracking-[0.18em] text-[#6a6356] mb-4 font-[500]">
            Detalles de la prenda
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tipo de prenda *</label>
              <select
                className={inputClass}
                value={form.tipo_prenda}
                onChange={(e) => set("tipo_prenda", e.target.value)}
                required
              >
                <option value="">Selecciona</option>
                {TIPOS_PRENDA.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Color base de la prenda *</label>
              <select
                className={inputClass}
                value={form.color_base}
                onChange={(e) => set("color_base", e.target.value)}
                required
              >
                <option value="">Selecciona</option>
                {COLORES_BASE.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Tallas / Unidades por talla *</label>
              <input
                type="text"
                className={inputClass}
                placeholder="Ej: 2 S, 3 M, 2 L"
                value={form.tallas}
                onChange={(e) => set("tallas", e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Cantidad total *</label>
              <input
                type="number"
                min={1}
                max={9999}
                className={inputClass}
                value={form.cantidad}
                onChange={(e) => set("cantidad", parseInt(e.target.value) || 1)}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Evento u ocasión</label>
              <input
                type="text"
                className={inputClass}
                placeholder="Ej: Feria Ganadera Montería 2026, Cumpleaños, Equipo de trabajo…"
                value={form.evento}
                onChange={(e) => set("evento", e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* ── DESCRIPCIÓN DEL DISEÑO ── */}
        <section>
          <h2 className="text-xs uppercase tracking-[0.18em] text-[#6a6356] mb-4 font-[500]">
            Descripción del diseño
          </h2>
          <div>
            <label className={labelClass}>
              Cuéntanos con detalle qué quieres *
            </label>
            <textarea
              className={cn(inputClass, "resize-none")}
              rows={5}
              placeholder="Describe tu diseño: colores, texto, elementos gráficos, posición del estampado, tipo de técnica si lo sabes… Mientras más detallado, mejor."
              value={form.descripcion}
              onChange={(e) => set("descripcion", e.target.value)}
              required
            />
            <p className="text-[11px] text-[#6a6356] mt-1">
              {form.descripcion.length} / 1000 caracteres
            </p>
          </div>
        </section>

        {/* ── IMÁGENES DE REFERENCIA ── */}
        <section>
          <h2 className="text-xs uppercase tracking-[0.18em] text-[#6a6356] mb-4 font-[500]">
            Imágenes de referencia
            <span className="normal-case tracking-normal ml-2 text-[#6a6356] font-[400]">
              (opcional, máx. 5 archivos — JPG, PNG, PDF, máx. 8 MB c/u)
            </span>
          </h2>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed cursor-pointer transition-colors",
              "flex flex-col items-center justify-center gap-3 py-8 px-4",
              dragOver
                ? "border-[#f0c419] bg-[#f0c419]/10"
                : "border-[#d8cfbb] bg-[#faf7f1] hover:border-[#6a6356]",
              uploading && "cursor-wait"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            {uploading ? (
              <Loader2 size={24} className="text-[#6a6356] animate-spin" />
            ) : (
              <ImagePlus size={24} className="text-[#6a6356]" strokeWidth={1.5} />
            )}
            <div className="text-center">
              <p className="text-sm text-[#0e0e0e] font-[500]">
                {uploading ? "Subiendo…" : "Arrastra tus archivos aquí o haz clic"}
              </p>
              <p className="text-xs text-[#6a6356] mt-0.5">
                Logos, bocetos, fotos de referencia, archivos de diseño
              </p>
            </div>
          </div>

          {/* Vista previa de archivos */}
          {files.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {files.map((f, i) => (
                <div key={i} className="relative group border border-[#d8cfbb] bg-[#e8e0c8]">
                  {f.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={f.preview}
                      alt={f.name}
                      className="w-full h-24 object-cover"
                    />
                  ) : (
                    <div className="w-full h-24 flex items-center justify-center">
                      {f.type === "application/pdf" ? (
                        <FileText size={32} className="text-[#6a6356]" strokeWidth={1} />
                      ) : (
                        <FileImage size={32} className="text-[#6a6356]" strokeWidth={1} />
                      )}
                    </div>
                  )}
                  <p className="text-[10px] text-[#6a6356] px-1.5 py-1 truncate">{f.name}</p>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 bg-[#0e0e0e]/70 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Quitar archivo"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {/* Botón agregar más */}
              {files.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#d8cfbb] h-[calc(6rem+28px)] flex items-center justify-center text-[#6a6356] hover:border-[#6a6356] transition-colors"
                >
                  <Upload size={18} strokeWidth={1.5} />
                </button>
              )}
            </div>
          )}
        </section>

        {/* ── TÉRMINOS ── */}
        <section>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.terms_accepted}
              onChange={(e) => set("terms_accepted", e.target.checked)}
              className="mt-0.5 h-4 w-4 border-[#d8cfbb] accent-[#0e0e0e]"
            />
            <span className="text-sm text-[#6a6356] leading-snug">
              Acepto los{" "}
              <Link href="/terminos" className="underline text-[#0e0e0e] hover:text-[#b85539]">
                términos y condiciones
              </Link>{" "}
              y la{" "}
              <Link href="/privacidad" className="underline text-[#0e0e0e] hover:text-[#b85539]">
                política de privacidad
              </Link>
              . Entiendo que esta solicitud no implica un pedido confirmado — Ricamo me enviará
              una cotización formal antes de cualquier cobro.
            </span>
          </label>
        </section>

        {/* ── ERROR ── */}
        {error && (
          <div className="flex items-start gap-2 text-sm text-[#b85539] bg-[#b85539]/8 border border-[#b85539]/30 px-4 py-3">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" strokeWidth={2} />
            {error}
          </div>
        )}

        {/* ── SUBMIT ── */}
        <button
          type="submit"
          disabled={submitting || uploading}
          className={cn(
            "w-full py-3.5 text-sm font-[500] tracking-[0.12em] uppercase transition-colors",
            submitting || uploading
              ? "bg-[#d8cfbb] text-[#6a6356] cursor-not-allowed"
              : "bg-[#0e0e0e] text-[#faf7f1] hover:bg-[#f0c419] hover:text-[#0e0e0e]"
          )}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Enviando solicitud…
            </span>
          ) : (
            "Solicitar cotización"
          )}
        </button>

        <p className="text-center text-xs text-[#6a6356]">
          Respondemos en menos de 24 horas · Lunes a viernes
        </p>
      </form>
    </div>
  );
}
