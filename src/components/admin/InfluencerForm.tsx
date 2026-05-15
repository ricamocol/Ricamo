"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Promo {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  used_count: number;
  is_active: boolean;
}

interface Influencer {
  id: string;
  name: string;
  handle: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
}

interface Props {
  influencer?: Influencer;
  promos?: Promo[];
}

const inputClass =
  "w-full border border-[#DDD5C4] bg-white px-3 py-2.5 text-sm text-[#3D2B1F] " +
  "focus:outline-none focus:border-[#897568] transition-colors";

const labelClass = "block text-[10px] uppercase tracking-[0.1em] text-[#897568] mb-1.5 font-[500]";

export function InfluencerForm({ influencer, promos = [] }: Props) {
  const router = useRouter();
  const isEdit = !!influencer;

  const [form, setForm] = useState({
    name: influencer?.name ?? "",
    handle: influencer?.handle ?? "",
    email: influencer?.email ?? "",
    phone: influencer?.phone ?? "",
    is_active: influencer?.is_active ?? true,
  });

  const [code, setCode] = useState(promos[0]?.code ?? "");
  const [discountType, setDiscountType] = useState(promos[0]?.discount_type ?? "percentage");
  const [discountValue, setDiscountValue] = useState(promos[0]?.discount_value?.toString() ?? "");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("El nombre es requerido."); return; }
    if (!code.trim()) { setError("El código de cupón es requerido."); return; }
    if (!discountValue || isNaN(Number(discountValue)) || Number(discountValue) <= 0) {
      setError("El valor del descuento es requerido.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        isEdit ? `/api/admin/influencers/${influencer!.id}` : "/api/admin/influencers",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            code: code.toUpperCase().trim(),
            discount_type: discountType,
            discount_value: Number(discountValue),
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error al guardar"); return; }

      router.push("/admin/influencers");
      router.refresh();
    } catch {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelClass}>Nombre *</label>
          <input
            type="text"
            className={inputClass}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Handle Instagram / TikTok</label>
          <input
            type="text"
            className={inputClass}
            placeholder="@mariajose"
            value={form.handle}
            onChange={(e) => setForm((f) => ({ ...f, handle: e.target.value }))}
          />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div>
          <label className={labelClass}>Teléfono / WhatsApp</label>
          <input
            type="tel"
            className={inputClass}
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
        <div className="flex items-center gap-3 pt-5">
          <input
            type="checkbox"
            id="is_active"
            checked={form.is_active}
            onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            className="h-4 w-4 border-[#DDD5C4] accent-[#3D2B1F]"
          />
          <label htmlFor="is_active" className="text-sm text-[#3D2B1F]">Influencer activo</label>
        </div>
      </div>

      <div className="border-t border-[#DDD5C4] pt-4">
        <h3 className="text-[10px] uppercase tracking-[0.15em] text-[#897568] font-[600] mb-3">
          Código de cupón (ilimitado — RB-INF-01)
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Código *</label>
            <input
              type="text"
              className={cn(inputClass, "uppercase font-mono")}
              placeholder="MARIA15"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Tipo</label>
            <select
              className={inputClass}
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
            >
              <option value="percentage">Porcentaje (%)</option>
              <option value="fixed">Valor fijo ($)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>
              {discountType === "percentage" ? "Porcentaje *" : "Valor COP *"}
            </label>
            <input
              type="number"
              min={0}
              max={discountType === "percentage" ? 100 : undefined}
              className={inputClass}
              placeholder={discountType === "percentage" ? "15" : "10000"}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              required
            />
          </div>
        </div>
        <p className="text-[10px] text-[#897568] mt-2">
          Los cupones de influencer son ilimitados en usos y se aplican solo en el Flujo A (checkout pre-diseñados).
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 text-sm font-[500] bg-[#3D2B1F] text-[#F3EDE0] hover:bg-[#5C3D2E] transition-colors disabled:opacity-50"
      >
        {loading
          ? <Loader2 size={16} className="animate-spin mx-auto" />
          : isEdit ? "Guardar cambios" : "Crear influencer"
        }
      </button>
    </form>
  );
}
