"use client";

import { cn } from "@/lib/utils/cn";

const FUENTES = [
  { id: "Instrument Serif", label: "Serif" },
  { id: "DM Sans", label: "Sans" },
  { id: "Caveat", label: "Cursive" },
  { id: "Georgia", label: "Georgia" },
  { id: "Arial", label: "Block" },
];

const COLORES_TEXTO = [
  { hex: "#0e0e0e", label: "Negro" },
  { hex: "#ffffff", label: "Blanco" },
  { hex: "#f0c419", label: "Dorado" },
  { hex: "#b85539", label: "Terra" },
  { hex: "#1B2A49", label: "Navy" },
];

interface Props {
  texto: string;
  fuente: string;
  colorTexto: string;
  onChange: (texto: string, fuente: string, colorTexto: string) => void;
}

export function TextEditor({ texto, fuente, colorTexto, onChange }: Props) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-[0.15em] text-[#6a6356] mb-3 font-[500]">
        Texto en la prenda
        <span className="normal-case tracking-normal font-[400] ml-2">(opcional)</span>
      </h3>

      <input
        type="text"
        maxLength={50}
        value={texto}
        onChange={(e) => onChange(e.target.value, fuente, colorTexto)}
        placeholder="Ej: Feria Ganadera 2026"
        className={cn(
          "w-full border border-[#d8cfbb] bg-[#faf7f1] px-3 py-2.5 text-sm text-[#0e0e0e]",
          "focus:outline-none focus:border-[#0e0e0e] transition-colors placeholder:text-[#6a6356] mb-3"
        )}
      />
      <p className="text-[10px] text-[#6a6356] -mt-2 mb-3">{texto.length}/50</p>

      {texto.length > 0 && (
        <>
          {/* Selector de fuente */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {FUENTES.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onChange(texto, f.id, colorTexto)}
                className={cn(
                  "px-3 py-1.5 text-xs border transition-colors",
                  fuente === f.id
                    ? "border-[#0e0e0e] bg-[#0e0e0e] text-[#faf7f1]"
                    : "border-[#d8cfbb] text-[#6a6356] hover:border-[#0e0e0e]"
                )}
                style={{ fontFamily: f.id }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Selector de color de texto */}
          <div className="flex gap-2">
            {COLORES_TEXTO.map((c) => (
              <button
                key={c.hex}
                type="button"
                title={c.label}
                onClick={() => onChange(texto, fuente, c.hex)}
                className={cn(
                  "w-7 h-7 border-2 transition-all",
                  colorTexto === c.hex
                    ? "border-[#0e0e0e] scale-110"
                    : "border-[#d8cfbb] hover:border-[#6a6356]"
                )}
                style={{ backgroundColor: c.hex }}
                aria-label={c.label}
              />
            ))}
          </div>

          {/* Preview de texto */}
          <div
            className="mt-3 py-2 px-3 bg-[#e8e0c8] text-center"
            style={{
              fontFamily: fuente,
              color: colorTexto,
              fontSize: "1.1rem",
            }}
          >
            {texto}
          </div>
        </>
      )}
    </div>
  );
}
