import { createServiceClient } from "@/lib/supabase/server";
import { formatCOP, formatDateShort } from "@/lib/utils/format";
import { TrendingUp, ShoppingBag, Users, Package, Star, BarChart2 } from "lucide-react";

const PAID_STATUSES = ["paid", "preparing", "en_produccion", "shipped", "delivered"];

async function getReportData() {
  const supabase = createServiceClient();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

  const [
    allOrders,
    thisMonthOrders,
    lastMonthOrders,
    totalCustomers,
    topItems,
    recentOrders,
    ordersByFlow,
    influencerAttrs,
  ] = await Promise.all([
    supabase.from("orders").select("total, status, flow").in("status", PAID_STATUSES),
    supabase.from("orders").select("total, flow").gte("created_at", startOfMonth).in("status", PAID_STATUSES),
    supabase.from("orders").select("total").gte("created_at", lastMonthStart).lte("created_at", lastMonthEnd).in("status", PAID_STATUSES),
    supabase.from("customers").select("id", { count: "exact", head: true }),
    supabase.from("order_items").select("product_name, variant_sku, quantity, total_price").order("total_price", { ascending: false }).limit(200),
    supabase.from("orders").select("id, order_number, shipping_name, total, status, flow, created_at").order("created_at", { ascending: false }).limit(8),
    supabase.from("orders").select("flow, total, status").in("status", PAID_STATUSES),
    supabase
      .from("influencer_attributions")
      .select("order_total, influencer_id, influencers(name, handle)")
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  const totalRevenue = (allOrders.data ?? []).reduce((s, o) => s + Number(o.total), 0);
  const thisMonthRevenue = (thisMonthOrders.data ?? []).reduce((s, o) => s + Number(o.total), 0);
  const lastMonthRevenue = (lastMonthOrders.data ?? []).reduce((s, o) => s + Number(o.total), 0);
  const growth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : null;

  // Top productos por cantidad vendida (SKU demand analysis)
  const skuMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  for (const item of topItems.data ?? []) {
    const key = item.variant_sku ?? item.product_name;
    if (!skuMap[key]) skuMap[key] = { name: item.product_name, qty: 0, revenue: 0 };
    skuMap[key].qty += item.quantity;
    skuMap[key].revenue += Number(item.total_price);
  }
  const topSkus = Object.entries(skuMap)
    .sort((a, b) => b[1].qty - a[1].qty)
    .slice(0, 8);

  // Ventas por flujo
  const flowRevenue: Record<string, { count: number; revenue: number }> = { A: { count: 0, revenue: 0 }, B: { count: 0, revenue: 0 }, C: { count: 0, revenue: 0 } };
  for (const o of ordersByFlow.data ?? []) {
    const f = (o.flow as string) ?? "A";
    if (flowRevenue[f]) {
      flowRevenue[f].count++;
      flowRevenue[f].revenue += Number(o.total);
    }
  }

  // Top influencers
  const infMap: Record<string, { name: string; handle: string | null; orders: number; revenue: number }> = {};
  for (const a of influencerAttrs.data ?? []) {
    const inf = a.influencers as unknown as { name: string; handle: string | null } | null;
    const id = a.influencer_id;
    if (!infMap[id]) infMap[id] = { name: inf?.name ?? id, handle: inf?.handle ?? null, orders: 0, revenue: 0 };
    infMap[id].orders++;
    infMap[id].revenue += Number(a.order_total);
  }
  const topInfluencers = Object.values(infMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  return {
    totalRevenue,
    thisMonthRevenue,
    lastMonthRevenue,
    growth,
    totalOrders: allOrders.data?.length ?? 0,
    totalCustomers: totalCustomers.count ?? 0,
    topSkus,
    recentOrders: recentOrders.data ?? [],
    flowRevenue,
    topInfluencers,
  };
}

const STATUS_BADGE: Record<string, string> = {
  pending_payment: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  preparing: "bg-blue-100 text-blue-800",
  en_produccion: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-[#EAC9C9] text-[#3D2B1F]",
  cancelled: "bg-red-100 text-red-700",
  cotizacion_pendiente: "bg-orange-100 text-orange-700",
  pendiente_aprobacion: "bg-amber-100 text-amber-700",
  aprobado_pendiente_pago: "bg-lime-100 text-lime-700",
  rechazado: "bg-rose-100 text-rose-700",
};
const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Pend. pago",
  paid: "Pagado",
  preparing: "Preparando",
  en_produccion: "En prod.",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
  cotizacion_pendiente: "Cotiz.",
  pendiente_aprobacion: "Aprobación",
  aprobado_pendiente_pago: "Aprob.",
  rechazado: "Rechazado",
};

const FLOW_LABELS: Record<string, string> = {
  A: "A — Pre-diseñado",
  B: "B — Configurador",
  C: "C — Cotización",
};

export default async function AdminReportesPage() {
  const data = await getReportData();

  return (
    <div className="max-w-5xl space-y-10">
      <h1
        className="text-3xl text-[#3D2B1F]"
        style={{ fontFamily: "'Instrument Serif', serif" }}
      >
        Reportes
      </h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: TrendingUp, label: "Ingresos totales", value: formatCOP(data.totalRevenue), sub: null, color: "text-green-600" },
          {
            icon: TrendingUp, label: "Este mes", value: formatCOP(data.thisMonthRevenue),
            sub: data.growth !== null ? `${data.growth >= 0 ? "+" : ""}${data.growth.toFixed(1)}% vs mes ant.` : null,
            color: data.growth !== null && data.growth >= 0 ? "text-green-600" : "text-red-500",
          },
          { icon: ShoppingBag, label: "Pedidos completados", value: data.totalOrders.toLocaleString("es-CO"), sub: null, color: "text-[#b85539]" },
          { icon: Users, label: "Clientes", value: data.totalCustomers.toLocaleString("es-CO"), sub: null, color: "text-indigo-600" },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="bg-white border border-[#DDD5C4] p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] text-[#897568] uppercase tracking-wide">{label}</p>
              <Icon size={15} className={color} />
            </div>
            <p className="text-2xl font-[600] text-[#3D2B1F]">{value}</p>
            {sub && <p className={`text-xs mt-1 ${color}`}>{sub}</p>}
          </div>
        ))}
      </div>

      {/* Ventas por flujo */}
      <div>
        <h2
          className="text-[10px] tracking-[0.2em] uppercase text-[#897568] font-[600] mb-4 flex items-center gap-2"
        >
          <BarChart2 size={13} /> Ventas por flujo
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {["A", "B", "C"].map((f) => {
            const stats = data.flowRevenue[f] ?? { count: 0, revenue: 0 };
            return (
              <div key={f} className="bg-white border border-[#DDD5C4] p-5">
                <p className="text-[10px] text-[#897568] uppercase tracking-wide mb-1">
                  Flujo {f}
                </p>
                <p className="text-xs text-[#6a6356] mb-3">{FLOW_LABELS[f]}</p>
                <p className="text-2xl font-[600] text-[#3D2B1F]">{stats.count}</p>
                <p className="text-xs text-[#897568] mt-1">pedidos</p>
                <p className="text-sm font-[500] text-[#3D2B1F] mt-2">{formatCOP(stats.revenue)}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* SKU demand — top por cantidad */}
        <div className="bg-white border border-[#DDD5C4] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#F3EDE0]">
            <Package size={14} className="text-[#897568]" />
            <p className="text-[10px] tracking-[0.15em] uppercase font-[600] text-[#897568]">
              Demanda por SKU
            </p>
          </div>
          {data.topSkus.length === 0 ? (
            <p className="text-xs text-[#897568] text-center py-8">Sin datos.</p>
          ) : (
            <div>
              {data.topSkus.map(([sku, stats], i) => (
                <div key={sku} className="flex items-center justify-between px-5 py-3 border-b border-[#F3EDE0] last:border-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-[600] text-[#DDD5C4] w-5 shrink-0">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-xs text-[#3D2B1F] truncate">{stats.name}</p>
                      <p className="text-[10px] text-[#897568] font-mono">{sku}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-[600] text-[#3D2B1F]">{stats.qty} uds</p>
                    <p className="text-xs text-[#897568]">{formatCOP(stats.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pedidos recientes */}
        <div className="bg-white border border-[#DDD5C4] overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#F3EDE0]">
            <ShoppingBag size={14} className="text-[#897568]" />
            <p className="text-[10px] tracking-[0.15em] uppercase font-[600] text-[#897568]">
              Pedidos recientes
            </p>
          </div>
          {data.recentOrders.length === 0 ? (
            <p className="text-xs text-[#897568] text-center py-8">Sin pedidos.</p>
          ) : (
            <div>
              {data.recentOrders.map((o: any) => (
                <div key={o.id} className="flex items-center justify-between px-5 py-3 border-b border-[#F3EDE0] last:border-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-[500] text-[#3D2B1F] font-mono">{o.order_number}</p>
                      <span className="text-[9px] px-1.5 py-0.5 bg-[#F3EDE0] text-[#3D2B1F] font-[600]">
                        {o.flow ?? "A"}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#897568] truncate">{o.shipping_name}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-xs font-[600] text-[#3D2B1F]">{formatCOP(o.total)}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-[500] ${STATUS_BADGE[o.status] ?? "bg-gray-100 text-gray-500"}`}>
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top influencers */}
      <div>
        <h2 className="text-[10px] tracking-[0.2em] uppercase text-[#897568] font-[600] mb-4 flex items-center gap-2">
          <Star size={13} /> Influencers — atribución de revenue
        </h2>
        {data.topInfluencers.length === 0 ? (
          <div className="bg-white border border-[#DDD5C4] p-8 text-center">
            <p className="text-xs text-[#897568]">Sin atribuciones registradas aún.</p>
          </div>
        ) : (
          <div className="bg-white border border-[#DDD5C4] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#DDD5C4]">
                  {["#", "Influencer", "Handle", "Pedidos atribuidos", "Revenue generado"].map((h) => (
                    <th key={h} className="text-left text-[9px] tracking-[0.15em] uppercase text-[#897568] font-[600] px-5 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.topInfluencers.map((inf, i) => (
                  <tr key={inf.name} className="border-b border-[#F3EDE0] hover:bg-[#F3EDE0]/50">
                    <td className="px-5 py-3 text-[#DDD5C4] font-[600] text-xs">{i + 1}</td>
                    <td className="px-5 py-3 font-[500] text-[#3D2B1F]">{inf.name}</td>
                    <td className="px-5 py-3 text-[#897568] text-xs">{inf.handle ?? "—"}</td>
                    <td className="px-5 py-3 text-[#3D2B1F]">{inf.orders}</td>
                    <td className="px-5 py-3 font-[600] text-[#3D2B1F]">{formatCOP(inf.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
