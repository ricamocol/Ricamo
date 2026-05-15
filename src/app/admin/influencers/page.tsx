import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { formatDateShort, formatCOP } from "@/lib/utils/format";
import { Plus } from "lucide-react";

export default async function AdminInfluencersPage() {
  const supabase = createServiceClient();

  const { data: influencers } = await supabase
    .from("influencers")
    .select(`
      id, name, handle, email, phone, is_active, created_at,
      promotions(id, code, discount_type, discount_value, used_count)
    `)
    .order("created_at", { ascending: false });

  // Atribuciones totales por influencer
  const { data: attributions } = await supabase
    .from("influencer_attributions")
    .select("influencer_id, order_total");

  const totalsByInfluencer: Record<string, { orders: number; revenue: number }> = {};
  for (const a of attributions ?? []) {
    if (!totalsByInfluencer[a.influencer_id]) {
      totalsByInfluencer[a.influencer_id] = { orders: 0, revenue: 0 };
    }
    totalsByInfluencer[a.influencer_id].orders++;
    totalsByInfluencer[a.influencer_id].revenue += a.order_total ?? 0;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-3xl text-[#3D2B1F]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Influencers
          </h1>
          <p className="text-sm text-[#897568] mt-1">
            Gestiona afiliados y códigos de descuento — RB-INF-01
          </p>
        </div>
        <Link
          href="/admin/influencers/nuevo"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3D2B1F] text-[#F3EDE0] text-sm font-[500] hover:bg-[#5C3D2E] transition-colors"
        >
          <Plus size={15} />
          Nuevo influencer
        </Link>
      </div>

      <div className="bg-white border border-[#DDD5C4] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#DDD5C4]">
              {["Influencer", "Handle", "Código", "Descuento", "Pedidos", "Revenue atribuido", "Estado", ""].map((h) => (
                <th key={h} className="text-left text-[9px] tracking-[0.2em] uppercase text-[#897568] font-[600] px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(influencers ?? []).map((inf) => {
              const promos = (inf.promotions as Array<{ id: string; code: string; discount_type: string; discount_value: number; used_count: number }>) ?? [];
              const promo = promos[0];
              const stats = totalsByInfluencer[inf.id] ?? { orders: 0, revenue: 0 };

              return (
                <tr key={inf.id} className="border-b border-[#F3EDE0] hover:bg-[#F3EDE0]/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-[500] text-[#3D2B1F]">{inf.name}</p>
                    {inf.email && <p className="text-xs text-[#897568]">{inf.email}</p>}
                  </td>
                  <td className="px-4 py-3 text-[#897568]">
                    {inf.handle ? `@${inf.handle}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {promo ? (
                      <span className="font-mono text-sm font-[600] text-[#3D2B1F] bg-[#F3EDE0] px-2 py-0.5">
                        {promo.code}
                      </span>
                    ) : (
                      <span className="text-[#897568] text-xs">Sin código</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#3D2B1F]">
                    {promo ? (
                      promo.discount_type === "percentage"
                        ? `${promo.discount_value}%`
                        : formatCOP(promo.discount_value)
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 font-[500] text-[#3D2B1F]">
                    {stats.orders}
                  </td>
                  <td className="px-4 py-3 font-[500] text-[#3D2B1F]">
                    {stats.revenue > 0 ? formatCOP(stats.revenue) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-[600] tracking-wide uppercase ${
                      inf.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                    }`}>
                      {inf.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/influencers/${inf.id}`}
                      className="text-xs text-[#B5888A] hover:text-[#3D2B1F] font-[500]"
                    >
                      Editar →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!influencers?.length && (
          <div className="py-16 text-center text-[#897568] text-sm">
            No hay influencers registrados aún.{" "}
            <Link href="/admin/influencers/nuevo" className="text-[#B5888A] underline">
              Agregar el primero
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
