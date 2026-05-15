"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface VariantRow {
  sku: string;
  attributes: { talla: string; color: string };
  stock: number;                  // total físico — usado por sistema de reservas
  price: number | null;
  stock_pre_producido: number;    // unidades listas para envío rápido
  bajo_demanda_habilitado: boolean;
  tiempo_produccion_dias: number;
}

interface Props {
  variants: VariantRow[];
  onChange: (variants: VariantRow[]) => void;
  basePrice: number;
}

const TALLAS_DEFAULT = ["XS", "S", "M", "L", "XL", "XXL"];

function generateSKU(talla: string, color: string): string {
  const clean = (s: string) => s.toUpperCase().replace(/\s+/g, "").replace(/[^A-Z0-9]/g, "").slice(0, 4);
  return `RIC-${clean(talla)}-${clean(color)}`;
}

const DEFAULT_VARIANT = (talla: string, color: string): VariantRow => ({
  sku: generateSKU(talla, color),
  attributes: { talla, color },
  stock: 0,
  price: null,
  stock_pre_producido: 0,
  bajo_demanda_habilitado: true,
  tiempo_produccion_dias: 3,
});

export function VariantManager({ variants, onChange, basePrice }: Props) {
  const [tallas, setTallas] = useState<string[]>([]);
  const [colores, setColores] = useState<string[]>([]);
  const [newTalla, setNewTalla] = useState("");
  const [newColor, setNewColor] = useState("");

  useEffect(() => {
    if (variants.length === 0) return;
    const t = [...new Set(variants.map((v) => v.attributes.talla))];
    const c = [...new Set(variants.map((v) => v.attributes.color))];
    setTallas(t);
    setColores(c);
  }, []); // only on mount

  function rebuildMatrix(nextTallas: string[], nextColores: string[]) {
    const next: VariantRow[] = [];
    for (const t of nextTallas) {
      for (const c of nextColores) {
        const existing = variants.find(
          (v) => v.attributes.talla === t && v.attributes.color === c
        );
        next.push(existing ?? DEFAULT_VARIANT(t, c));
      }
    }
    onChange(next);
  }

  function addTalla(value: string) {
    const v = value.trim().toUpperCase();
    if (!v || tallas.includes(v)) return;
    const next = [...tallas, v];
    setTallas(next);
    rebuildMatrix(next, colores);
  }

  function removeTalla(t: string) {
    const next = tallas.filter((x) => x !== t);
    setTallas(next);
    rebuildMatrix(next, colores);
  }

  function addColor(value: string) {
    const v = value.trim();
    if (!v || colores.includes(v)) return;
    const next = [...colores, v];
    setColores(next);
    rebuildMatrix(tallas, next);
  }

  function removeColor(c: string) {
    const next = colores.filter((x) => x !== c);
    setColores(next);
    rebuildMatrix(tallas, next);
  }

  function updateVariant(
    talla: string,
    color: string,
    field: keyof VariantRow,
    value: string | boolean
  ) {
    const next = variants.map((v) => {
      if (v.attributes.talla !== talla || v.attributes.color !== color) return v;
      if (field === "sku") return { ...v, sku: value as string };
      if (field === "price") return { ...v, price: value === "" ? null : Math.max(0, parseFloat(value as string) || 0) };
      if (field === "stock_pre_producido") {
        const n = Math.max(0, parseInt(value as string) || 0);
        return { ...v, stock_pre_producido: n, stock: n }; // keep stock in sync
      }
      if (field === "bajo_demanda_habilitado") return { ...v, bajo_demanda_habilitado: value as boolean };
      if (field === "tiempo_produccion_dias") return { ...v, tiempo_produccion_dias: Math.max(1, parseInt(value as string) || 1) };
      return v;
    });
    onChange(next);
  }

  function getVariant(talla: string, color: string): VariantRow | undefined {
    return variants.find((v) => v.attributes.talla === talla && v.attributes.color === color);
  }

  const inputCls = "w-full border border-[#DDD5C4] bg-white px-2 py-1 text-xs text-[#3D2B1F] focus:outline-none focus:border-[#897568]";

  return (
    <div className="space-y-5">
      {/* Tallas */}
      <div>
        <p className="text-[10px] tracking-[0.18em] uppercase text-[#897568] font-[600] mb-2">Tallas</p>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {TALLAS_DEFAULT.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => (tallas.includes(t) ? removeTalla(t) : addTalla(t))}
              className={cn(
                "px-3 py-1 text-xs border transition-colors",
                tallas.includes(t)
                  ? "bg-[#3D2B1F] text-[#F3EDE0] border-[#3D2B1F]"
                  : "bg-white text-[#897568] border-[#DDD5C4] hover:border-[#897568]"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newTalla}
            onChange={(e) => setNewTalla(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTalla(newTalla); setNewTalla(""); } }}
            placeholder="Otra talla…"
            className="border border-[#DDD5C4] px-2 py-1 text-xs text-[#3D2B1F] focus:outline-none focus:border-[#897568] w-28"
          />
          <button type="button" onClick={() => { addTalla(newTalla); setNewTalla(""); }} className="text-xs text-[#897568] hover:text-[#3D2B1F] flex items-center gap-1">
            <Plus size={12} /> Agregar
          </button>
        </div>
      </div>

      {/* Colores */}
      <div>
        <p className="text-[10px] tracking-[0.18em] uppercase text-[#897568] font-[600] mb-2">Colores</p>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {colores.map((c) => (
            <span key={c} className="flex items-center gap-1 px-2 py-0.5 text-xs bg-[#F3EDE0] text-[#3D2B1F] border border-[#DDD5C4]">
              {c}
              <button type="button" onClick={() => removeColor(c)}>
                <X size={10} className="text-[#897568] hover:text-[#B5888A]" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addColor(newColor); setNewColor(""); } }}
            placeholder="Ej: Negro, Blanco…"
            className="border border-[#DDD5C4] px-2 py-1 text-xs text-[#3D2B1F] focus:outline-none focus:border-[#897568] w-44"
          />
          <button type="button" onClick={() => { addColor(newColor); setNewColor(""); }} className="text-xs text-[#897568] hover:text-[#3D2B1F] flex items-center gap-1">
            <Plus size={12} /> Agregar
          </button>
        </div>
      </div>

      {/* Matriz */}
      {tallas.length > 0 && colores.length > 0 && (
        <div className="overflow-x-auto">
          <table className="text-xs border-collapse">
            <thead>
              <tr>
                <th className="text-left text-[9px] tracking-[0.15em] uppercase text-[#897568] font-[600] pb-2 pr-4 whitespace-nowrap">
                  Talla / Color
                </th>
                {colores.map((c) => (
                  <th key={c} className="text-center text-[9px] tracking-[0.12em] uppercase text-[#897568] font-[600] pb-2 px-3 whitespace-nowrap">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tallas.map((t) => (
                <tr key={t} className="border-t border-[#F3EDE0]">
                  <td className="py-3 pr-4 font-[600] text-[#3D2B1F] whitespace-nowrap align-top">{t}</td>
                  {colores.map((c) => {
                    const v = getVariant(t, c);
                    if (!v) return <td key={c} />;
                    return (
                      <td key={c} className="py-3 px-3 align-top">
                        <div className="space-y-1.5 min-w-[160px]">
                          {/* SKU */}
                          <input
                            value={v.sku}
                            onChange={(e) => updateVariant(t, c, "sku", e.target.value)}
                            placeholder="SKU"
                            className={inputCls}
                            title="SKU"
                          />
                          {/* Precio override */}
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-[#897568] w-12 shrink-0">Precio</span>
                            <input
                              type="number" min={0} step={100}
                              value={v.price ?? ""}
                              onChange={(e) => updateVariant(t, c, "price", e.target.value)}
                              placeholder={String(basePrice)}
                              className={cn(inputCls, "placeholder:text-[#CEC3AB]")}
                            />
                          </div>
                          {/* Pre-stock */}
                          <div className="flex items-center gap-1">
                            <span className="text-[9px] text-[#897568] w-12 shrink-0 leading-tight">Pre-stock</span>
                            <input
                              type="number" min={0}
                              value={v.stock_pre_producido}
                              onChange={(e) => updateVariant(t, c, "stock_pre_producido", e.target.value)}
                              className={inputCls}
                              title="Unidades listas para envío rápido"
                            />
                          </div>
                          {/* Bajo demanda */}
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={v.bajo_demanda_habilitado}
                              onChange={(e) => updateVariant(t, c, "bajo_demanda_habilitado", e.target.checked)}
                              className="accent-[#3D2B1F]"
                            />
                            <span className="text-[9px] text-[#897568]">Bajo demanda</span>
                          </label>
                          {/* Tiempo producción (solo si bajo demanda) */}
                          {v.bajo_demanda_habilitado && (
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] text-[#897568] w-12 shrink-0 leading-tight">Días prod.</span>
                              <input
                                type="number" min={1} max={30}
                                value={v.tiempo_produccion_dias}
                                onChange={(e) => updateVariant(t, c, "tiempo_produccion_dias", e.target.value)}
                                className={cn(inputCls, "w-14")}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] text-[#897568] mt-3">
            Pre-stock = unidades físicas listas. Bajo demanda = se acepta el pedido aunque no haya stock.
          </p>
        </div>
      )}

      {tallas.length === 0 && colores.length === 0 && (
        <p className="text-xs text-[#CEC3AB] italic">
          Agrega al menos una talla y un color para generar la matriz de variantes.
        </p>
      )}
    </div>
  );
}
