import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";
import { ArchiveProductButton } from "@/components/admin/ArchiveProductButton";

type Props = { params: Promise<{ id: string }> };

export default async function EditarProductoPage({ params }: Props) {
  const { id } = await params;
  const service = await createServiceClient();

  const [
    { data: product },
    { data: categories },
    { data: collections },
    { data: occasions },
  ] = await Promise.all([
    service
      .from("products")
      .select(
        `id, name, slug, description, care_instructions, base_price, compare_price, status, images,
         product_categories(category_id),
         product_collections(collection_id),
         product_occasions(occasion_id),
         product_variants(sku, price, stock, attributes, stock_pre_producido, bajo_demanda_habilitado, tiempo_produccion_dias)`
      )
      .eq("id", id)
      .single(),
    service.from("categories").select("id, name, slug").order("name"),
    service.from("collections").select("id, name, slug").order("name"),
    service.from("occasions").select("id, name, slug").order("name"),
  ]);

  if (!product) notFound();

  const initial = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    care_instructions: product.care_instructions ?? "",
    base_price: String(product.base_price),
    compare_price: product.compare_price ? String(product.compare_price) : "",
    status: product.status as "draft" | "active" | "archived",
    images: product.images ?? [],
    category_ids: (product.product_categories ?? []).map((r: any) => r.category_id),
    collection_ids: (product.product_collections ?? []).map((r: any) => r.collection_id),
    occasion_ids: (product.product_occasions ?? []).map((r: any) => r.occasion_id),
    variants: (product.product_variants ?? []).map((v: any) => ({
      sku: v.sku,
      attributes: v.attributes,
      stock: v.stock,
      price: v.price,
      stock_pre_producido: v.stock_pre_producido ?? 0,
      bajo_demanda_habilitado: v.bajo_demanda_habilitado ?? true,
      tiempo_produccion_dias: v.tiempo_produccion_dias ?? 3,
    })),
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1
            className="text-3xl text-[#3D2B1F]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Editar producto
          </h1>
          <p className="text-sm text-[#897568] mt-1">{product.name}</p>
        </div>
        <ArchiveProductButton id={id} />
      </div>

      <ProductForm
        initial={initial}
        categories={categories ?? []}
        collections={collections ?? []}
        occasions={occasions ?? []}
      />
    </div>
  );
}
