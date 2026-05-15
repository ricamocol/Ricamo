"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";

const inputClass =
  "w-full border border-[#DDD5C4] bg-white px-3 py-2.5 text-sm text-[#3D2B1F] " +
  "focus:outline-none focus:border-[#897568] transition-colors";
const labelClass = "block text-[10px] uppercase tracking-[0.1em] text-[#897568] mb-1.5 font-[500]";

export default function NuevoDisenioConfiguradorPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    image_url: "",
    event_tag: "",
    style_tag: "",
    sort_order: 0,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.image_url) {
      setError("Nombre e imagen son requeridos.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/admin/configurador", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Error al guardar"); return; }
    router.push("/admin/configurador");
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/configurador" className="text-[#897568] hover:text-[#3D2B1F]">
          <ArrowLeft size={18} strokeWidth={1.5} />
        </Link>
        <h1
          className="text-3xl text-[#3D2B1F]"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Nuevo diseño
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-[#DDD5C4] p-6 space-y-4">
        <div>
          <label className={labelClass}>Imagen del diseño *</label>
          <ImageUploader
            images={form.image_url ? [form.image_url] : []}
            onChange={(imgs) => setForm((f) => ({ ...f, image_url: imgs[0] ?? "" }))}
            maxImages={1}
          />
        </div>
        <div>
          <label className={labelClass}>Nombre *</label>
          <input
            type="text"
            className={inputClass}
            placeholder="Feria Ganadera — Bandera"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Tag de evento</label>
            <input
              type="text"
              className={inputClass}
              placeholder="feria-ganadera"
              value={form.event_tag}
              onChange={(e) => setForm((f) => ({ ...f, event_tag: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelClass}>Tag de estilo</label>
            <input
              type="text"
              className={inputClass}
              placeholder="geometrico"
              value={form.style_tag}
              onChange={(e) => setForm((f) => ({ ...f, style_tag: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Orden</label>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={form.sort_order}
            onChange={(e) => setForm((f) => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
          />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            className="h-4 w-4 border-[#DDD5C4] accent-[#3D2B1F]"
          />
          <span className="text-sm text-[#3D2B1F]">Visible en el configurador</span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-sm font-[500] bg-[#3D2B1F] text-[#F3EDE0] hover:bg-[#5C3D2E] transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Guardar diseño"}
        </button>
      </form>
    </div>
  );
}
