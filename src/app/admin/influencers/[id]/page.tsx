import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { InfluencerForm } from "@/components/admin/InfluencerForm";
import { formatCOP, formatDateShort } from "@/lib/utils/format";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarInfluencerPage({ params }: Props) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: influencer } = await supabase
    .from("influencers")
    .select("*")
    .eq("id", id)
    .single();

  if (!influencer) notFound();

  const { data: promos } = await supabase
    .from("promotions")
    .select("id, code, discount_type, discount_value, used_count, is_active")
    .eq("influencer_id", id);

  const { data: attributions } = await supabase
    .from("influencer_attributions")
    .select("id, order_total, customer_email, created_at, orders(order_number)")
    .eq("influencer_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  const totalRevenue = (attributions ?? []).reduce((s, a) => s + (a.order_total ?? 0), 0);

  return (
    <div className="max-w-4xl">
      <h1
        className="text-3xl text-[#3D2B1F] mb-6"
        style={{ fontFamily: "'Instrument Serif', serif" }}
      >
        {influencer.name}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <section className="bg-white border border-[#DDD5C4] p-5">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#897568] font-[600] mb-4">Datos</h2>
            <InfluencerForm influencer={influencer} promos={promos ?? []} />
          </section>

          {/* Historial de atribuciones */}
          {(attributions?.length ?? 0) > 0 && (
            <section className="bg-white border border-[#DDD5C4] p-5">
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#897568] font-[600] mb-1">
                Atribuciones ({attributions!.length})
              </h2>
              <p className="text-sm text-[#3D2B1F] font-[500] mb-4">
                Revenue total: {formatCOP(totalRevenue)}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#DDD5C4]">
                      {["Pedido", "Cliente", "Monto", "Fecha"].map((h) => (
                        <th key={h} className="text-left text-[9px] tracking-[0.15em] uppercase text-[#897568] font-[600] pb-2 pr-4">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {attributions!.map((a) => (
                      <tr key={a.id} className="border-b border-[#F3EDE0]">
                        <td className="py-2 pr-4 font-[500] text-[#3D2B1F]">
                          {(a.orders as unknown as { order_number: string } | null)?.order_number ?? a.id.slice(0, 8)}
                        </td>
                        <td className="py-2 pr-4 text-[#897568]">{a.customer_email}</td>
                        <td className="py-2 pr-4 text-[#3D2B1F]">{formatCOP(a.order_total)}</td>
                        <td className="py-2 text-[#897568]">{formatDateShort(a.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>

        {/* Métricas */}
        <div className="space-y-4">
          <div className="bg-white border border-[#DDD5C4] p-5">
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-[#897568] font-[600] mb-3">Resumen</h2>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-[#897568] uppercase tracking-wide">Pedidos atribuidos</p>
                <p className="text-2xl font-[500] text-[#3D2B1F]">{attributions?.length ?? 0}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#897568] uppercase tracking-wide">Revenue generado</p>
                <p className="text-xl font-[500] text-[#3D2B1F]">{formatCOP(totalRevenue)}</p>
              </div>
              {promos?.map((p) => (
                <div key={p.id}>
                  <p className="text-[10px] text-[#897568] uppercase tracking-wide">Usos del código {p.code}</p>
                  <p className="text-xl font-[500] text-[#3D2B1F]">{p.used_count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
