import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Nosotras",
  description:
    "Mar Boutique nació desde el amor y la intención. Desde Cartagena, curaduramos prendas que acompañan cada momento con elegancia y propósito.",
};

const VALUES = [
  {
    title: "Intencional",
    desc: "Elegimos cada prenda con propósito. No seguimos tendencias por seguirlas — curaduramos piezas que tienen algo qué decir.",
  },
  {
    title: "Versátil",
    desc: "De la playa a la cena. Prendas que se adaptan a tu ritmo y viajan contigo sin perder su esencia.",
  },
  {
    title: "Atemporal",
    desc: "Más allá de las temporadas. Apostamos por clásicos que suman, no por modas que pasan.",
  },
  {
    title: "Auténtica",
    desc: "Tu esencia, reflejada. Moda que habla de quién eres, no de quién deberías ser.",
  },
];

const TEAM = [
  {
    name: "María Angélica",
    role: "Fundadora & Curadora de estilos",
    bio: "Diseñadora de corazón y enamorada del mar. María Angélica creó Mar Boutique con la convicción de que la ropa debe hacerte sentir tú misma — libre, auténtica y cómoda en tu piel.",
  },
  {
    name: "María Isabel",
    role: "Atención al cliente",
    bio: "La calidez de Mar Boutique se llama María Isabel. Ella está detrás de cada mensaje respondido con amor y de cada clienta que se siente escuchada.",
  },
];

export default function NosotrasPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-[#EAC9C9]/30 py-24 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F3EDE0] to-transparent opacity-60" />
        <div className="relative z-10 max-w-xl mx-auto">
          <span className="text-[10px] tracking-[0.3em] uppercase text-[#B5888A] font-[500]">
            Nuestra historia
          </span>
          <h1
            className="text-5xl text-[#3D2B1F] mt-3 mb-5 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
          >
            Nosotras
          </h1>
          <p className="text-sm text-[#897568] leading-loose font-[300]">
            Mar Boutique nació desde el amor y la intención. Desde Cartagena, curaduramos prendas
            que acompañan cada momento con elegancia y propósito.
          </p>
        </div>
      </section>

      {/* Historia */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Imagen placeholder */}
          <div className="aspect-[3/4] bg-gradient-to-br from-[#EAC9C9]/40 to-[#CEC3AB]/30 flex items-center justify-center">
            <span
              className="text-5xl text-[#B5888A]/40"
              style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
            >
              MB
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
              Cartagena como punto de partida
            </h2>
            <div className="space-y-4 text-sm text-[#897568] leading-loose font-[300]">
              <p>
                Todo comenzó con una pregunta simple: ¿por qué es tan difícil encontrar ropa que se
                vea bonita <em>y</em> se sienta bien? Ropa que puedas llevar a la playa en la
                mañana y a cenar en la noche sin sentirte fuera de lugar.
              </p>
              <p>
                Mar Boutique nació en Cartagena — una ciudad que mezcla sin esfuerzo lo colonial
                con lo tropical, lo elegante con lo relajado. Esa esencia vive en cada prenda que
                curaduramos.
              </p>
              <p>
                No somos una tienda de tendencias. Somos una curaduría de piezas con intención,
                elegidas para mujeres que saben lo que quieren y lo usan con propósito.
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
              Lo que nos define
            </span>
            <h2
              className="text-4xl text-[#3D2B1F] mt-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Nuestros valores
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

      {/* Equipo */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <span className="text-[10px] tracking-[0.28em] uppercase text-[#B5888A] font-[500]">
            Las personas detrás de la marca
          </span>
          <h2
            className="text-4xl text-[#3D2B1F] mt-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            El equipo
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-8">
          {TEAM.map((person) => (
            <div key={person.name} className="border border-[#DDD5C4] bg-white p-8">
              {/* Avatar placeholder */}
              <div className="w-16 h-16 rounded-full bg-[#EAC9C9]/50 flex items-center justify-center mb-4">
                <span className="text-xl text-[#B5888A]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {person.name.charAt(0)}
                </span>
              </div>
              <h3
                className="text-lg text-[#3D2B1F] mb-0.5"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {person.name}
              </h3>
              <p className="text-[11px] uppercase tracking-[0.12em] text-[#B5888A] font-[500] mb-3">
                {person.role}
              </p>
              <p className="text-sm text-[#897568] leading-relaxed font-[300]">{person.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#3D2B1F] py-20 px-4 text-center">
        <span className="text-[10px] tracking-[0.3em] uppercase text-[#B5888A] font-[500]">
          Únete a nuestra comunidad
        </span>
        <h2
          className="text-3xl text-[#F3EDE0] mt-3 mb-5"
          style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
        >
          Viste con intención
        </h2>
        <p className="text-sm text-[#CEC3AB] mb-8 font-[300] max-w-md mx-auto">
          Descubre prendas curaduras para mujeres que saben lo que quieren.
        </p>
        <Link
          href="/catalogo"
          className="inline-flex items-center gap-2 px-8 py-3 bg-[#EAC9C9] text-[#3D2B1F] text-[11px] tracking-[0.2em] uppercase font-[600] hover:bg-[#F3EDE0] transition-colors"
        >
          Ver catálogo <ArrowRight size={13} />
        </Link>
      </section>
    </>
  );
}
