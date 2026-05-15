import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";

export default async function AdminInventarioPage() {
  const supabase = createServiceClient();

  const { data: variants } = await supabase
    .from("product_variants")
    .select(`
      id, sku, stock, reserved, attributes,
      stock_pre_producido, bajo_demanda_habilitado, tiempo_produccion_dias,
      product:products(id, name, slug, status)
    `)
    .order("stock_pre_producido", { ascending: true })
    .limit(500);

  const items = (variants ?? []).map((v: any) => ({
    ...v,
    available: Math.max(0, (v.stock ?? 0) - (v.reserved ?? 0)),
    pre: v.stock_pre_producido ?? 0,
    demanda: v.bajo_demanda_habilitado ?? false,
    produccion: v.tiempo_produccion_dias ?? 3,
    // Ricamo: agotado si no hay pre-stock Y bajo demanda desactivado
    ricamoSoldOut: (v.stock_pre_producido ?? 0) === 0 && !(v.bajo_demanda_habilitado ?? true),
  }));

  const soldOut = items.filter((v) => v.ricamoSoldOut);
  const onDemand = items.filter((v) => !v.ricamoSoldOut && v.pre === 0 && v.demanda);
  const lowStock = items.filter((v) => v.pre > 0 && v.pre <= 3);
  const inStock = items.filter((v) => v.pre > 3);

  return (
    <div>
      <h1
        className="text-3xl text-[#3D2B1F] mb-2"
        style={{ fontFamily: "'Instrument Serif', serif" }}
      >
        Inventario
      </h1>
      <p className="text-sm text-[#897568] mb-8">
        {soldOut.length} agotados ·{" "}
        {onDemand.length} bajo demanda ·{" "}
        {lowStock.length} pre-stock bajo ·{" "}
        {inStock.length} en stock
      </p>

      {[
        {
          label: "Agotados",
          subtitle: "stock_pre_producido = 0 y bajo demanda desactivado",
          items: soldOut,
          color: "text-red-600",
        },
        {
          label: "Solo bajo demanda",
          subtitle: "sin stock pre-producido — pedidos en producción al comprar",
          items: onDemand,
          color: "text-[#b85539]",
        },
        {
          label: "Pre-stock bajo (1–3 uds)",
          subtitle: "reponer pronto",
          items: lowStock,
          color: "text-amber-600",
        },
        {
          label: "En stock",
          subtitle: "pre-stock disponible",
          items: inStock,
          color: "text-green-700",
        },
      ].map(({ label, subtitle, items: group, color }) => (
        <div key={label} className="mb-10">
          <div className="mb-3">
            <h2 className={`text-[10px] tracking-[0.2em] uppercase font-[600] ${color}`}>
              {label} ({group.length})
            </h2>
            <p className="text-[10px] text-[#897568] mt-0.5">{subtitle}</p>
          </div>

          {group.length > 0 && (
            <div className="bg-white border border-[#DDD5C4] overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#DDD5C4]">
                    {[
                      "SKU",
                      "Producto",
                      "Atributos",
                      "Pre-stock",
                      "Bajo demanda",
                      "T. producción",
                      "Reservado",
                      "Disponible",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left text-[9px] tracking-[0.2em] uppercase text-[#897568] font-[600] px-4 py-2 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {group.map((v) => (
                    <tr key={v.id} className="border-b border-[#F3EDE0] hover:bg-[#F3EDE0]/50">
                      <td className="px-4 py-2.5 font-mono text-xs text-[#897568]">{v.sku}</td>
                      <td className="px-4 py-2.5">
                        {v.product?.slug ? (
                          <Link
                            href={`/admin/productos/${v.product.id}`}
                            className="text-[#3D2B1F] hover:text-[#b85539] transition-colors"
                          >
                            {v.product?.name}
                          </Link>
                        ) : (
                          <span className="text-[#3D2B1F]">{v.product?.name}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-[#897568]">
                        {Object.entries(v.attributes ?? {})
                          .map(([k, val]) => `${k}: ${val}`)
                          .join(" · ")}
                      </td>
                      {/* Pre-stock */}
                      <td className={`px-4 py-2.5 font-[600] tabular-nums ${
                        v.pre === 0 ? "text-red-500" : v.pre <= 3 ? "text-amber-600" : "text-green-700"
                      }`}>
                        {v.pre}
                      </td>
                      {/* Bajo demanda */}
                      <td className="px-4 py-2.5">
                        <span className={`text-[9px] px-2 py-0.5 font-[600] uppercase tracking-wide rounded-full ${
                          v.demanda
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          {v.demanda ? "Sí" : "No"}
                        </span>
                      </td>
                      {/* Tiempo producción */}
                      <td className="px-4 py-2.5 text-xs text-[#897568]">
                        {v.produccion} días
                      </td>
                      {/* Reservado (Flujo A) */}
                      <td className="px-4 py-2.5 text-xs text-[#897568]">{v.reserved ?? 0}</td>
                      {/* Disponible */}
                      <td className={`px-4 py-2.5 font-[600] tabular-nums ${
                        v.available === 0 ? "text-red-500" : v.available <= 3 ? "text-amber-600" : "text-green-700"
                      }`}>
                        {v.available}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
