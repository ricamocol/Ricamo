"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

const inputClass =
  "w-full border border-[#DDD5C4] bg-white px-3 py-2.5 text-sm text-[#3D2B1F] " +
  "focus:outline-none focus:border-[#897568] transition-colors";

const labelClass = "block text-[10px] uppercase tracking-[0.1em] text-[#897568] mb-1.5 font-[500]";

export default function NuevoEventoPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    city: "",
    starts_at: "",
    ends_at: "",
    banner_text: "",
    is_active: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.city || !form.starts_at || !form.ends_at || !form.banner_text) {
      setError("Todos los campos son requeridos.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/admin/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Error al crear"); return; }
    router.push("/admin/eventos");
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/eventos" className="text-[#897568] hover:text-[#3D2B1F] transition-colors">
          <ArrowLeft size={18} strokeWidth={1.5} />
        </Link>
        <h1
          className="text-3xl text-[#3D2B1F]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Nuevo evento
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-[#DDD5C4] p-6 space-y-4">
        <div>
          <label className={labelClass}>Nombre del evento *</label>
          <input
            type="text"
            className={inputClass}
            placeholder="Feria Ganadera Montería 2026"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Ciudad *</label>
          <input
            type="text"
            className={inputClass}
            placeholder="Montería"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            required
          />
          <p className="text-[10px] text-[#897568] mt-0.5">
            Debe coincidir con la ciudad detectada por geo-IP (sin tilde).
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Fecha inicio *</label>
            <input
              type="date"
              className={inputClass}
              value={form.starts_at}
              onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Fecha fin *</label>
            <input
              type="date"
              className={inputClass}
              value={form.ends_at}
              onChange={(e) => setForm((f) => ({ ...f, ends_at: e.target.value }))}
              required
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Texto del banner *</label>
          <input
            type="text"
            className={inputClass}
            placeholder="¡Estás en Montería! Lleva la Feria Ganadera contigo."
            value={form.banner_text}
            onChange={(e) => setForm((f) => ({ ...f, banner_text: e.target.value }))}
            required
          />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            className="h-4 w-4 border-[#DDD5C4] accent-[#3D2B1F]"
          />
          <span className="text-sm text-[#3D2B1F]">Activar inmediatamente</span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-sm font-[500] bg-[#3D2B1F] text-[#F3EDE0] hover:bg-[#5C3D2E] transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Crear evento"}
        </button>
      </form>
    </div>
  );
}
