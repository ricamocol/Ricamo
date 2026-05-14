"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const DEPARTMENTS = [
  "Amazonas","Antioquia","Arauca","Atlántico","Bolívar","Boyacá","Caldas",
  "Caquetá","Casanare","Cauca","Cesar","Chocó","Córdoba","Cundinamarca",
  "Guainía","Guaviare","Huila","La Guajira","Magdalena","Meta","Nariño",
  "Norte de Santander","Putumayo","Quindío","Risaralda","San Andrés","Santander",
  "Sucre","Tolima","Valle del Cauca","Vaupés","Vichada",
];

interface ContactData {
  full_name: string;
  email: string;
  phone: string;
  city?: string;
  department?: string;
}

interface Props {
  onSubmit: (data: ContactData) => void;
  submitting: boolean;
}

const inputClass =
  "w-full border border-[#d8cfbb] bg-[#faf7f1] px-3 py-2.5 text-sm text-[#0e0e0e] " +
  "focus:outline-none focus:border-[#0e0e0e] transition-colors placeholder:text-[#6a6356]";

const labelClass = "block text-xs uppercase tracking-[0.12em] text-[#6a6356] mb-1.5 font-[500]";

export function ContactStep({ onSubmit, submitting }: Props) {
  const [form, setForm] = useState<ContactData>({
    full_name: "", email: "", phone: "", city: "", department: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [terms, setTerms] = useState(false);

  function set(field: keyof ContactData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setError(null);
  }

  function validate(): string | null {
    if (!form.full_name.trim()) return "Ingresa tu nombre completo.";
    if (!form.email.includes("@")) return "El correo no es válido.";
    if (form.phone.replace(/\D/g, "").length < 7) return "El teléfono no es válido.";
    if (!terms) return "Debes aceptar los términos y condiciones.";
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div className="grid grid-cols-2 gap-4">
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
          <label className={labelClass}>WhatsApp *</label>
          <input
            type="tel"
            className={inputClass}
            placeholder="+57 300 000 0000"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
        <div>
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

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={terms}
          onChange={(e) => { setTerms(e.target.checked); setError(null); }}
          className="mt-0.5 h-4 w-4 border-[#d8cfbb] accent-[#0e0e0e]"
        />
        <span className="text-sm text-[#6a6356] leading-snug">
          Acepto los términos y condiciones. Entiendo que esto es una solicitud de aprobación,
          no un pedido confirmado.
        </span>
      </label>

      {error && (
        <p className="text-sm text-[#b85539]">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className={cn(
          "w-full py-3.5 text-sm font-[500] tracking-[0.12em] uppercase transition-colors",
          submitting
            ? "bg-[#d8cfbb] text-[#6a6356] cursor-not-allowed"
            : "bg-[#0e0e0e] text-[#faf7f1] hover:bg-[#f0c419] hover:text-[#0e0e0e]"
        )}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Enviando diseño…
          </span>
        ) : (
          "Enviar diseño para aprobación"
        )}
      </button>
    </form>
  );
}
