"use client";

import { cn } from "@/lib/utils/cn";
import type { ShirtModel, ShirtColor } from "./ConfiguradorClient";

interface Props {
  models: { id: ShirtModel; label: string }[];
  colors: { id: ShirtColor; label: string; hex: string }[];
  selectedModel: ShirtModel;
  selectedColor: ShirtColor;
  onChange: (model: ShirtModel, color: ShirtColor) => void;
}

export function ShirtSelector({ models, colors, selectedModel, selectedColor, onChange }: Props) {
  return (
    <div className="space-y-4">
      {/* Modelo */}
      <div>
        <h3 className="text-xs uppercase tracking-[0.15em] text-[#6a6356] mb-3 font-[500]">
          Modelo de camiseta
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {models.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id, selectedColor)}
              className={cn(
                "px-3 py-2.5 text-xs font-[500] tracking-[0.08em] uppercase border transition-colors text-left",
                selectedModel === m.id
                  ? "border-[#0e0e0e] bg-[#0e0e0e] text-[#faf7f1]"
                  : "border-[#d8cfbb] text-[#6a6356] hover:border-[#0e0e0e] hover:text-[#0e0e0e]"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <h3 className="text-xs uppercase tracking-[0.15em] text-[#6a6356] mb-3 font-[500]">
          Color de prenda
        </h3>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button
              key={c.id}
              type="button"
              title={c.label}
              onClick={() => onChange(selectedModel, c.id)}
              className={cn(
                "w-8 h-8 border-2 transition-all",
                selectedColor === c.id
                  ? "border-[#0e0e0e] scale-110 shadow-sm"
                  : "border-transparent hover:border-[#6a6356]"
              )}
              style={{ backgroundColor: c.hex }}
              aria-label={c.label}
            />
          ))}
        </div>
        <p className="text-xs text-[#6a6356] mt-1.5">
          {colors.find((c) => c.id === selectedColor)?.label}
        </p>
      </div>
    </div>
  );
}
