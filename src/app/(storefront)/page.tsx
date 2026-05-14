import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/storefront/ProductCard";
import type { Product } from "@/types";

const COLLECTIONS = [
  { name: "Feria Ganadera", city: "Montería", emoji: "🐄", color: "#f0c419" },
  { name: "Fiestas del Mar", city: "Santa Marta", emoji: "🌊", color: "#0e0e0e" },
  { name: "Feria de las Flores", city: "Medellín", emoji: "🌸", color: "#b85539" },
];

async function getNewestProducts(): Promise<Product[]> {
  const db = createServiceClient();
  const { data } = await db
    .from("products")
    .select(`id, name, slug, base_price, compare_price, images, is_on_sale, effective_price, is_sold_out`)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(4);
  return (data ?? []) as Product[];
}

export default async function HomePage() {
  const products = await getNewestProducts();

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[95vh] flex items-center bg-[#faf7f1] pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* TEXTO */}
            <div>
              <span className="inline-block text-[11px] tracking-[0.3em] uppercase text-[#6a6356] mb-6 font-[500]">
                Colecciones 2026
              </span>

              <h1
                className="text-[72px] sm:text-[96px] leading-[0.9] text-[#0e0e0e] mb-6"
                style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
              >
                Vístete<br />
                <span className="text-[#f0c419]" style={{ fontFamily: "'Caveat', cursive", fontStyle: "normal", fontSize: "0.85em" }}>
                  de lo que
                </span><br />
                amas.
              </h1>

              <p className="text-base text-[#6a6356] mb-10 leading-relaxed max-w-sm font-[300]">
                Camisetas temáticas para festivales y eventos de Colombia.
                Diseñadas con alma, llevadas con orgullo.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/catalogo"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#0e0e0e] text-[#faf7f1] text-[11px] tracking-[0.2em] uppercase font-[600] hover:bg-[#f0c419] hover:text-[#0e0e0e] transition-all duration-300"
                >
                  Ver catálogo <ArrowRight size={14} />
                </Link>
                <Link
                  href="/configura"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-[#0e0e0e] text-[#0e0e0e] text-[11px] tracking-[0.2em] uppercase font-[600] hover:bg-[#0e0e0e] hover:text-[#faf7f1] transition-all duration-300"
                >
                  Diseña la tuya
                </Link>
              </div>
            </div>

            {/* BLOQUE AMARILLO DECORATIVO */}
            <div className="hidden md:flex items-center justify-center">
              <div className="relative w-[420px] h-[480px] bg-[#f0c419]">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  {/* Smiley grande */}
                  <svg width="160" height="160" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M25 4 C13.4 4.8 4.8 13.4 4 25 C3.2 36.6 11.8 46.4 23.4 47.8 C35 49.2 46 41.2 47.8 29.6 C49.6 18 41.8 6.8 30.2 4.4 C28.5 4.1 26.8 3.9 25 4Z" stroke="#0e0e0e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                    <circle cx="18" cy="22" r="2.2" fill="#0e0e0e"/>
                    <circle cx="32" cy="22" r="2.2" fill="#0e0e0e"/>
                    <path d="M16 31 Q25 39.5 34 31" stroke="#0e0e0e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                    <path d="M20.5 18 L21.5 16" stroke="#0e0e0e" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M23 17.5 L24 15.5" stroke="#0e0e0e" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  <span
                    className="text-[#0e0e0e] text-5xl leading-none"
                    style={{ fontFamily: "'Caveat', cursive", fontWeight: 700 }}
                  >
                    Ricamo
                  </span>
                  <span className="text-[#0e0e0e]/60 text-sm tracking-[0.15em] uppercase">
                    lo creas, lo llevas
                  </span>
                </div>
                {/* Detalles decorativos */}
                <div className="absolute bottom-6 right-6 w-16 h-16 border border-[#0e0e0e]/20 rounded-full" />
                <div className="absolute top-6 left-6 w-8 h-8 border border-[#0e0e0e]/20 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-[9px] tracking-[0.25em] uppercase text-[#6a6356]">Scroll</span>
          <div className="w-px h-10 bg-[#6a6356]" />
        </div>
      </section>

      {/* ── COLECCIONES ─────────────────────────────────────────── */}
      <section className="bg-[#0e0e0e] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-[10px] tracking-[0.25em] uppercase text-[#f0c419] font-[500]">
                Temporada 2026
              </span>
              <h2
                className="text-4xl text-white mt-1"
                style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
              >
                Eventos de Colombia
              </h2>
            </div>
            <Link
              href="/colecciones"
              className="hidden sm:inline-flex items-center gap-1.5 text-[11px] tracking-[0.15em] uppercase text-[#6a6356] hover:text-[#f0c419] transition-colors font-[500]"
            >
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#2a2a2a]">
            {COLLECTIONS.map((col) => (
              <Link
                key={col.name}
                href="/colecciones"
                className="group bg-[#0e0e0e] p-10 flex flex-col justify-between min-h-[280px] hover:bg-[#f0c419] transition-colors duration-500"
              >
                <span className="text-5xl">{col.emoji}</span>
                <div>
                  <p className="text-[11px] tracking-[0.2em] uppercase text-[#6a6356] group-hover:text-[#0e0e0e]/60 mb-1 transition-colors">
                    {col.city}
                  </p>
                  <h3
                    className="text-2xl text-white group-hover:text-[#0e0e0e] transition-colors"
                    style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
                  >
                    {col.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── NUEVA COLECCIÓN ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#b85539] font-[500]">
              Lo más nuevo
            </span>
            <h2
              className="text-4xl text-[#0e0e0e] mt-1"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Recién llegado
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="hidden sm:inline-flex items-center gap-1.5 text-[11px] tracking-[0.15em] uppercase text-[#6a6356] hover:text-[#0e0e0e] transition-colors font-[500]"
          >
            Ver todo <ArrowRight size={12} />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-[#e8e0c8] animate-pulse" />
            ))}
          </div>
        )}

        <div className="text-center mt-10 sm:hidden">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.15em] uppercase text-[#6a6356] hover:text-[#0e0e0e] transition-colors font-[500]"
          >
            Ver todo el catálogo <ArrowRight size={12} />
          </Link>
        </div>
      </section>

      {/* ── PERSONALIZACIÓN ─────────────────────────────────────── */}
      <section className="bg-[#f0c419] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[10px] tracking-[0.3em] uppercase text-[#0e0e0e]/50 font-[500]">
                Personalización
              </span>
              <h2
                className="text-5xl text-[#0e0e0e] mt-2 mb-5 leading-tight"
                style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
              >
                Tu diseño,<br />tu camiseta.
              </h2>
              <p className="text-sm text-[#0e0e0e]/60 leading-loose mb-8 font-[300]">
                Escoge la base, aplica tu diseño favorito y agrega tu nombre o frase.
                Producida especialmente para ti.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/configura"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#0e0e0e] text-[#faf7f1] text-[11px] tracking-[0.2em] uppercase font-[600] hover:bg-[#2a2a2a] transition-colors"
                >
                  Ir al configurador <ArrowRight size={12} />
                </Link>
                <Link
                  href="/cotiza"
                  className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-[#0e0e0e] border-b-2 border-[#0e0e0e] pb-0.5 hover:border-[#2a2a2a]/50 transition-colors font-[600] self-center"
                >
                  ¿Idea más compleja? Cotízala <ArrowRight size={12} />
                </Link>
              </div>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="w-72 h-72 bg-[#0e0e0e] flex items-center justify-center">
                <svg width="120" height="120" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M25 4 C13.4 4.8 4.8 13.4 4 25 C3.2 36.6 11.8 46.4 23.4 47.8 C35 49.2 46 41.2 47.8 29.6 C49.6 18 41.8 6.8 30.2 4.4 C28.5 4.1 26.8 3.9 25 4Z" stroke="#f0c419" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                  <circle cx="18" cy="22" r="2.2" fill="#f0c419"/>
                  <circle cx="32" cy="22" r="2.2" fill="#f0c419"/>
                  <path d="M16 31 Q25 39.5 34 31" stroke="#f0c419" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                  <path d="M20.5 18 L21.5 16" stroke="#f0c419" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M23 17.5 L24 15.5" stroke="#f0c419" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BANNER MARÍA JOSÉ ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <span className="text-[10px] tracking-[0.3em] uppercase text-[#b85539] font-[500]">
          La cara detrás de Ricamo
        </span>
        <h2
          className="text-5xl text-[#0e0e0e] mt-2 mb-4"
          style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
        >
          María José
        </h2>
        <p className="text-sm text-[#6a6356] mb-8 font-[300] max-w-md mx-auto leading-relaxed">
          Fundadora, diseñadora e influencer costeña. Sus colecciones nacen del amor
          por los festivales y la identidad colombiana.
        </p>
        <Link
          href="/maria-jose"
          className="inline-flex items-center gap-2 px-8 py-4 border border-[#0e0e0e] text-[#0e0e0e] text-[11px] tracking-[0.2em] uppercase font-[600] hover:bg-[#0e0e0e] hover:text-[#faf7f1] transition-all duration-300"
        >
          Conocer su historia <ArrowRight size={12} />
        </Link>
      </section>
    </>
  );
}
