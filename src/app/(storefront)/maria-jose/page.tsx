import type { Metadata } from "next";
import Link from "next/link";
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
            style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
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
              style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
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
              style={{ fontFamily: "'Playfair Display', serif" }}
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
              style={{ fontFamily: "'Playfair Display', serif" }}
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
                  style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
                >
                  {v.title}
                </h3>
                <p className="text-xs text-[#897568] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Redes sociales */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <span className="text-[10px] tracking-[0.28em] uppercase text-[#B5888A] font-[500]">
            Síguela
          </span>
          <h2
            className="text-4xl text-[#3D2B1F] mt-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            En sus redes
          </h2>
          <p className="text-sm text-[#897568] mt-3 font-[300]">
            Sus videos orgánicos son donde Ricamo vive. Mírala en los eventos, en el proceso
            de diseño, en la vida real.
          </p>
        </div>

        {/* Feed embebido placeholder — implementar en Fase 1 con Instagram Embed + TikTok Embed */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="border border-[#DDD5C4] bg-white p-8 text-center">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#B5888A] font-[500] mb-3">Instagram</p>
            <p className="text-sm text-[#897568] font-[300]">
              {/* TODO DP-RIC-06: reemplazar con handle real de Instagram */}
              @ricamo.co
            </p>
          </div>
          <div className="border border-[#DDD5C4] bg-white p-8 text-center">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[#B5888A] font-[500] mb-3">TikTok</p>
            <p className="text-sm text-[#897568] font-[300]">
              {/* TODO DP-RIC-06: reemplazar con handle real de TikTok */}
              @ricamo.co
            </p>
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
          style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
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
