import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/storefront/ProductCard";
import type { Product } from "@/types";

const BRAND_VALUES = [
  { title: "Temáticas", desc: "Diseñadas para cada feria y festival. La camiseta perfecta para cada evento." },
  { title: "Personalizadas", desc: "Diseña la tuya con tu nombre, frase o imagen favorita." },
  { title: "A tu medida", desc: "Producción bajo demanda. Llega justo como la imaginaste." },
  { title: "Con historia", desc: "Cada colección narra el espíritu de un evento único de Colombia." },
];

async function getNewestProducts(): Promise<Product[]> {
  const db = createServiceClient();
  const { data } = await db
    .from("products")
    .select(`
      id, name, slug, base_price, compare_price, images,
      is_on_sale, effective_price, is_sold_out
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(4);

  return (data ?? []) as Product[];
}

export default async function HomePage() {
  const products = await getNewestProducts();

  return (
    <>
      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#F3EDE0]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F3EDE0] via-[#EAC9C9]/20 to-[#CEC3AB]/30" />

        <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
          <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-[#B5888A] mb-6 font-[500]">
            Nueva colección
          </span>

          <h1
            className="text-5xl sm:text-6xl md:text-7xl text-[#3D2B1F] mb-4 leading-[1.05]"
            style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
          >
            Ricamo
          </h1>

          <p className="text-base text-[#897568] mb-10 leading-relaxed font-[300]">
            Camisetas para festivales y eventos de Colombia
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#3D2B1F] text-[#F3EDE0] text-[11px] tracking-[0.2em] uppercase font-[500] hover:bg-[#5A3E2E] transition-colors rounded-none"
            >
              Ver catálogo <ArrowRight size={14} />
            </Link>
            <Link
              href="/configura"
              className="inline-flex items-center gap-2 px-8 py-3 border border-[#3D2B1F] text-[#3D2B1F] text-[11px] tracking-[0.2em] uppercase font-[500] hover:bg-[#3D2B1F] hover:text-[#F3EDE0] transition-colors rounded-none"
            >
              Diseña la tuya
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <span className="text-[9px] tracking-[0.25em] uppercase text-[#897568]">Scroll</span>
          <div className="w-px h-12 bg-[#897568]" />
        </div>
      </section>

      {/* ── VALORES DE MARCA ───────────────────────────────────── */}
      <section className="bg-[#F3EDE0] border-y border-[#DDD5C4] py-12">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {BRAND_VALUES.map((v) => (
            <div key={v.title}>
              <h3
                className="text-lg text-[#3D2B1F] mb-1"
                style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
              >
                {v.title}
              </h3>
              <p className="text-xs text-[#897568] leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── NUEVA COLECCIÓN ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#B5888A] font-[500]">
              Lo más nuevo
            </span>
            <h2
              className="text-4xl text-[#3D2B1F] mt-1"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Recién llegado
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="hidden sm:inline-flex items-center gap-1.5 text-[11px] tracking-[0.15em] uppercase text-[#897568] hover:text-[#3D2B1F] transition-colors font-[500]"
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
              <div key={i} className="aspect-[3/4] bg-[#EAC9C9]/30 animate-pulse" />
            ))}
          </div>
        )}

        <div className="text-center mt-10 sm:hidden">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.15em] uppercase text-[#897568] hover:text-[#3D2B1F] transition-colors font-[500]"
          >
            Ver todo el catálogo <ArrowRight size={12} />
          </Link>
        </div>
      </section>

      {/* ── DISEÑA TU CAMISETA ─────────────────────────────────── */}
      <section className="bg-[#EAC9C9]/40 py-20">
        <div className="max-w-2xl mx-auto text-center px-4">
          <span className="text-[10px] tracking-[0.3em] uppercase text-[#B5888A] font-[500]">
            Personalización
          </span>
          <h2
            className="text-4xl text-[#3D2B1F] mt-2 mb-5"
            style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
          >
            Diseña tu camiseta
          </h2>
          <p className="text-sm text-[#897568] leading-loose mb-8 font-[300]">
            Escoge la base, aplica uno de nuestros diseños y agrega tu nombre o frase.
            Producida especialmente para ti.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/configura"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#3D2B1F] text-[#F3EDE0] text-[11px] tracking-[0.2em] uppercase font-[500] hover:bg-[#5A3E2E] transition-colors"
            >
              Ir al configurador <ArrowRight size={12} />
            </Link>
            <Link
              href="/cotiza"
              className="inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-[#3D2B1F] border-b border-[#3D2B1F] pb-0.5 hover:border-[#B5888A] hover:text-[#B5888A] transition-colors font-[500] self-center"
            >
              ¿Idea más compleja? Cotízala <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── BANNER MARÍA JOSÉ ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <span className="text-[10px] tracking-[0.3em] uppercase text-[#B5888A] font-[500]">
          La cara detrás de Ricamo
        </span>
        <h2
          className="text-3xl text-[#3D2B1F] mt-2 mb-3"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          María José
        </h2>
        <p className="text-sm text-[#897568] mb-8 font-[300]">
          Fundadora, diseñadora e influencer. Sus videos orgánicos son la razón por la que Ricamo existe.
        </p>
        <Link
          href="/maria-jose"
          className="inline-flex items-center gap-2 px-8 py-3 border border-[#3D2B1F] text-[#3D2B1F] text-[11px] tracking-[0.2em] uppercase font-[500] hover:bg-[#3D2B1F] hover:text-[#F3EDE0] transition-colors"
        >
          Conocer su historia <ArrowRight size={12} />
        </Link>
      </section>
    </>
  );
}
