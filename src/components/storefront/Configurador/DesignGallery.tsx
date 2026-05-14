"use client";

import { useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { DesignOption } from "./ConfiguradorClient";

interface Props {
  designs: DesignOption[];
  selected: DesignOption | null;
  onSelect: (design: DesignOption | null) => void;
}

const FILTER_TAGS = [
  { id: "all",           label: "Todos" },
  { id: "feria-ganadera",label: "Feria Ganadera" },
  { id: "geometrico",    label: "Geométrico" },
  { id: "floral",        label: "Floral" },
  { id: "minimalista",   label: "Minimalista" },
];

export function DesignGallery({ designs, selected, onSelect }: Props) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered = activeFilter === "all"
    ? designs
    : designs.filter((d) => d.event_tag === activeFilter || d.style_tag === activeFilter);

  return (
    <div>
      <h3 className="text-xs uppercase tracking-[0.15em] text-[#6a6356] mb-3 font-[500]">
        Diseño de catálogo
        <span className="normal-case tracking-normal font-[400] ml-2">(opcional)</span>
      </h3>

      {/* Filtros */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {FILTER_TAGS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActiveFilter(f.id)}
            className={cn(
              "px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] font-[500] border transition-colors",
              activeFilter === f.id
                ? "bg-[#0e0e0e] text-[#faf7f1] border-[#0e0e0e]"
                : "border-[#d8cfbb] text-[#6a6356] hover:border-[#0e0e0e]"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid de diseños */}
      <div className="grid grid-cols-3 gap-1.5">
        {/* Opción "Sin diseño" */}
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={cn(
            "aspect-square border-2 flex items-center justify-center text-[10px] uppercase tracking-[0.1em] transition-colors",
            selected === null
              ? "border-[#0e0e0e] bg-[#0e0e0e] text-[#faf7f1]"
              : "border-[#d8cfbb] text-[#6a6356] bg-[#e8e0c8] hover:border-[#6a6356]"
          )}
        >
          {selected === null && <Check size={14} strokeWidth={2.5} />}
          {selected !== null && "Sin diseño"}
        </button>

        {filtered.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => onSelect(d)}
            className={cn(
              "relative aspect-square border-2 overflow-hidden transition-all",
              selected?.id === d.id
                ? "border-[#0e0e0e]"
                : "border-transparent hover:border-[#6a6356]"
            )}
            title={d.name}
          >
            <Image
              src={d.image_url}
              alt={d.name}
              fill
              className="object-cover object-top"
              sizes="80px"
            />
            {selected?.id === d.id && (
              <div className="absolute inset-0 bg-[#0e0e0e]/40 flex items-center justify-center">
                <Check size={18} strokeWidth={2.5} className="text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      {selected && (
        <p className="text-xs text-[#6a6356] mt-2">{selected.name}</p>
      )}
    </div>
  );
}
