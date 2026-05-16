import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "María José",
  description:
    "Conoce a María José, la fundadora e influencer detrás de Ricamo. Su historia, su proceso creativo y las ferias que inspiraron cada colección.",
};

const VALUES = [
  {
    title: "Festival",
    desc: "Cada diseño nace de un evento real. La Feria Ganadera, las Fiestas del Mar, la Feria de las Flores — el espíritu de cada feria en una camiseta.",
  },
  {
    title: "Personal",
    desc: "María José diseña cada motivo. No hay intermediarios entre su visión y la prenda que llevas.",
  },
  {
    title: "Auténtica",
    desc: "Sin filtros, sin tendencias forzadas. Ricamo refleja lo que ella vive y lo que sus seguidoras sienten.",
  },
  {
    title: "Comunidad",
    desc: "Cada camiseta es una forma de decir 'estuve ahí'. Una memoria que une a quienes vivieron el mismo evento.",
  },
];

export default function MariaJosePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-[#EAC9C9]/30 py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F3EDE0] to-transparent opacity-60" />
        <div className="relative z-10 max-w-xl mx-auto">
          <span className="text-[10px] tracking-[0.3em] uppercase text-[#B5888A] font-[500]">
            La cara de Ricamo
          </span>
          <h1
            className="text-5xl text-[#3D2B1F] mt-3 mb-5 leading-tight"
            style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
          >
            María José
          </h1>
          <p className="text-sm text-[#897568] leading-loose font-[300]">
            Fundadora, diseñadora e influencer. Ricamo nació de su amor por los festivales
            colombianos y su necesidad de vestir cada momento con identidad propia.
          </p>
        </div>
      </section>

      {/* Historia */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Imagen placeholder — reemplazar con foto profesional (DP-RIC-15) */}
          <div className="aspect-[3/4] bg-gradient-to-br from-[#EAC9C9]/40 to-[#CEC3AB]/30 flex items-center justify-center">
            <span
              className="text-5xl text-[#B5888A]/40"
              style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
            >
              MJ
            </span>
          </div>

          <div>
            <span className="text-[10px] tracking-[0.28em] uppercase text-[#B5888A] font-[500]">
              El origen
            </span>
            <h2
              className="text-3xl text-[#3D2B1F] mt-2 mb-5"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Camisetas que cuentan una historia
            </h2>
            <div className="space-y-4 text-sm text-[#897568] leading-loose font-[300]">
              <p>
                Todo empezó en la Feria Ganadera de Montería. María José quería una camiseta
                que capturara el espíritu del evento — algo que fuera más que ropa, que fuera
                un recuerdo que llevar puesto.
              </p>
              <p>
                Como no encontró lo que buscaba, lo diseñó ella misma. Sus seguidoras en
                Instagram y TikTok lo vieron, lo quisieron, y Ricamo nació.
              </p>
              <p>
                Hoy cada colección cuenta la historia de un festival colombiano. La Feria de
                las Flores, las Fiestas del Mar, cada evento tiene su propia camiseta — y María
                José la diseña desde adentro, como alguien que realmente lo vivió.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Valores */}
      <section className="bg-[#F3EDE0] border-y border-[#DDD5C4] py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[10px] tracking-[0.28em] uppercase text-[#B5888A] font-[500]">
              Lo que mueve a Ricamo
            </span>
            <h2
              className="text-4xl text-[#3D2B1F] mt-2"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Los valores de la marca
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map((v) => (
              <div key={v.title} className="text-center">
                <div className="w-10 h-px bg-[#B5888A] mx-auto mb-4" />
                <h3
                  className="text-lg text-[#3D2B1F] mb-2"
                  style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
                >
                  {v.title}
                </h3>
                <p className="text-xs text-[#897568] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Redes sociales — Lookbook + links */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[10px] tracking-[0.28em] uppercase text-[#B5888A] font-[500]">
              Síguela
            </span>
            <h2
              className="text-4xl text-[#3D2B1F] mt-2"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              En sus redes
            </h2>
            <p className="text-sm text-[#897568] mt-3 font-[300]">
              Sus videos orgánicos son donde Ricamo vive. Mírala en los eventos, en el proceso
              de diseño, en la vida real.
            </p>
          </div>

          {/* Grid lookbook — fotos de colección */}
          <div className="grid grid-cols-3 gap-1 mb-8">
            {[
              { src: "/colecciones/feria-ganadera/fg-09.jpg", alt: "Ricamo — MONTERÍA oversize" },
              { src: "/colecciones/feria-ganadera/fg-11.jpg", alt: "Ricamo — Cordobesa baby tee" },
              { src: "/colecciones/feria-ganadera/fg-12.jpg", alt: "Ricamo — Montería stamp" },
              { src: "/colecciones/feria-ganadera/fg-04.jpg", alt: "Ricamo — colección Feria Ganadera" },
              { src: "/colecciones/feria-ganadera/fg-08.jpg", alt: "Ricamo — lifestyle Feria Ganadera" },
              { src: "/colecciones/feria-ganadera/fg-03.jpg", alt: "Ricamo — Montería sello postal" },
            ].map((foto) => (
              <a
                key={foto.src}
                href="https://www.instagram.com/ricamo.co/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden"
              >
                <Image
                  src={foto.src}
                  alt={foto.alt}
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 33vw, 20vw"
                />
                <div className="absolute inset-0 bg-[#3D2B1F]/0 group-hover:bg-[#3D2B1F]/40 transition-colors duration-300 flex items-center justify-center">
                  <span className="text-white text-xs tracking-[0.15em] uppercase font-[500] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    @ricamo.co
                  </span>
                </div>
              </a>
            ))}
          </div>

          {/* Botones de redes */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://www.instagram.com/ricamo.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 border border-[#DDD5C4] text-[#3D2B1F] text-[11px] tracking-[0.2em] uppercase font-[600] hover:bg-[#3D2B1F] hover:text-white hover:border-[#3D2B1F] transition-all duration-300"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              Instagram · @ricamo.co
            </a>
            <a
              href="https://www.tiktok.com/@ricamo.co"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 border border-[#DDD5C4] text-[#3D2B1F] text-[11px] tracking-[0.2em] uppercase font-[600] hover:bg-[#3D2B1F] hover:text-white hover:border-[#3D2B1F] transition-all duration-300"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
              </svg>
              TikTok · @ricamo.co
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#3D2B1F] py-20 px-4 text-center">
        <span className="text-[10px] tracking-[0.3em] uppercase text-[#B5888A] font-[500]">
          Únete a la comunidad
        </span>
        <h2
          className="text-3xl text-[#F3EDE0] mt-3 mb-5"
          style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
        >
          Viste el evento
        </h2>
        <p className="text-sm text-[#CEC3AB] mb-8 font-[300] max-w-md mx-auto">
          Encuentra la camiseta de tu feria favorita o diseña la tuya.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#EAC9C9] text-[#3D2B1F] text-[11px] tracking-[0.2em] uppercase font-[600] hover:bg-[#F3EDE0] transition-colors"
          >
            Ver colecciones <ArrowRight size={13} />
          </Link>
          <Link
            href="/configura"
            className="inline-flex items-center gap-2 px-8 py-3 border border-[#EAC9C9] text-[#EAC9C9] text-[11px] tracking-[0.2em] uppercase font-[500] hover:bg-[#EAC9C9] hover:text-[#3D2B1F] transition-colors"
          >
            Diseña la tuya
          </Link>
        </div>
      </section>
    </>
  );
}
