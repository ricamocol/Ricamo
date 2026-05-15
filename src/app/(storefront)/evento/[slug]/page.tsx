import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/storefront/ProductCard";
import { getProductDeliveryMode } from "@/types";
import type { Product } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("collections")
    .select("name, description")
    .eq("slug", slug)
    .single();
  if (!data) return { title: "Evento no encontrado" };
  return {
    title: `${data.name} — Ricamo`,
    description: data.description ?? `Colección ${data.name} de Ricamo — camisetas para el evento`,
  };
}

export default async function EventoPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: collection } = await supabase
    .from("collections")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!collection) notFound();

  const { data: productLinks } = await supabase
    .from("product_collections")
    .select(`
      sort_order,
      products:product_id (
        *,
        variants:product_variants(
          id, product_id, sku, price, stock, reserved, attributes,
          available_stock, stock_pre_producido, bajo_demanda_habilitado,
          tiempo_produccion_dias
        )
      )
    `)
    .eq("collection_id", collection.id)
    .order("sort_order", { ascending: true });

  const products: Product[] = (productLinks ?? [])
    .map((l: any) => l.products)
    .filter((p: any) => p && p.status === "active")
    .map((p: any) => ({
      ...p,
      delivery_mode: getProductDeliveryMode(p.variants),
    }));

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[50vh] flex items-end overflow-hidden bg-[#0e0e0e]">
        {collection.hero_url && (
          <Image
            src={collection.hero_url}
            alt={collection.name}
            fill
            className="object-cover object-top opacity-60"
            priority
          />
        )}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
          <Link
            href="/colecciones"
            className="text-[10px] tracking-[0.2em] uppercase text-[#f0c419] hover:text-white transition-colors mb-4 inline-block"
          >
            ← Todos los eventos
          </Link>
          <p className="text-[11px] tracking-[0.28em] uppercase font-[500] text-[#f0c419] mb-2">
            Colección de evento
          </p>
          <h1
            className="text-5xl sm:text-6xl text-white mb-3"
            style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
          >
            {collection.name}
          </h1>
          {collection.description && (
            <p className="text-sm text-[#faf7f1]/80 max-w-md leading-relaxed">
              {collection.description}
            </p>
          )}
        </div>
      </section>

      {/* PRODUCTOS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-[#6a6356]">
              Esta colección no tiene productos disponibles aún.
            </p>
            <Link
              href="/catalogo"
              className="mt-4 inline-block text-xs uppercase tracking-[0.15em] font-[500] text-[#b85539] hover:text-[#0e0e0e] transition-colors"
            >
              Ver catálogo completo →
            </Link>
          </div>
        ) : (
          <>
            <p className="text-xs text-[#6a6356] mb-8 uppercase tracking-[0.1em]">
              {products.length} {products.length === 1 ? "prenda" : "prendas"} en esta colección
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
