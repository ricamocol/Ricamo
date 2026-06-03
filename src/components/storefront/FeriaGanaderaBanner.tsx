import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const PHOTOS = [
  {
    src: "/colecciones/feria-ganadera/fg-09.jpg",
    alt: "MONTERÍA oversize blanca — Feria Ganadera",
  },
  {
    src: "/colecciones/feria-ganadera/fg-01.jpg",
    alt: "Montería script azul — Feria Ganadera",
  },
  {
    src: "/colecciones/feria-ganadera/fg-11.jpg",
    alt: "Cordobesa baby tee negra — Feria Ganadera",
  },
  {
    src: "/colecciones/feria-ganadera/fg-06.jpg",
    alt: "Montería en la feria — Ricamo lifestyle",
  },
];

export function FeriaGanaderaBanner() {
  return (
    <section className="bg-[#0e0e0e] overflow-hidden">
      {/* ── Label strip ──────────────────────────────────── */}
      <div className="flex items-center gap-4 px-6 py-3 border-b border-white/[0.07]">
        <span className="text-[#f0c419] text-[9px] tracking-[0.45em] uppercase font-[600]">
          Feria Ganadera · Montería 2026
        </span>
        <div className="flex-1 h-px bg-white/[0.07]" />
        <span className="hidden sm:block text-white/20 text-[9px] tracking-[0.3em] uppercase">
          Nueva colección
        </span>
      </div>

      {/* ── Grid de fotos ────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0.5">
        {PHOTOS.map(({ src, alt }) => (
          <div key={src} className="relative aspect-[3/4] overflow-hidden">
            <Image
              src={src}
              alt={alt}
              fill
              className="object-cover object-top transition-transform duration-700 hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
              priority
            />
          </div>
        ))}
      </div>

      {/* ── Texto + CTA ──────────────────────────────────── */}
      <div className="border-t border-white/[0.07] px-6 md:px-14 py-6">
        {/* Heading */}
        <h2
          className="text-[clamp(2rem,4vw,4rem)] text-white leading-none mb-4"
          style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
        >
          La colección del año
        </h2>
        {/* Descripción y botones en la misma línea */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-white/40 text-sm font-[300] max-w-xs leading-relaxed">
            Diseños exclusivos para la feria más grande de la Costa Caribe colombiana.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Link
              href="/catalogo?coleccion=feria-ganadera"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#f0c419] text-[#0e0e0e] text-[11px] tracking-[0.25em] uppercase font-[700] hover:bg-white transition-colors"
            >
              Ver colección <ArrowRight size={12} />
            </Link>
            <Link
              href="/cotiza"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white/60 text-[11px] tracking-[0.25em] uppercase font-[500] hover:border-white/50 hover:text-white transition-colors"
            >
              Cotiza tu diseño
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
