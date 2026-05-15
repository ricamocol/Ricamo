import { createServiceClient } from "@/lib/supabase/server";
import { formatCOP } from "@/lib/utils/format";
import { ShoppingBag, DollarSign, Users, AlertTriangle } from "lucide-react";

async function getDashboardStats() {
  const supabase = createServiceClient();
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0)).toISOString();

  const [todayOrders, monthOrders, totalCustomers, lowStock, pendingBC, pendingPayment] = await Promise.all([
    supabase
      .from("orders")
      .select("id, total, status")
      .gte("created_at", startOfToday)
      .in("status", ["paid", "preparing", "en_produccion", "shipped", "delivered"]),
    supabase
      .from("orders")
      .select("id, total")
      .gte("created_at", startOfMonth)
      .in("status", ["paid", "preparing", "en_produccion", "shipped", "delivered"]),
    supabase.from("customers").select("id", { count: "exact", head: true }),
    supabase
      .from("product_variants")
      .select("id, sku, stock_pre_producido, product_id, products(name)")
      .lte("stock_pre_producido", 3)
      .gt("stock_pre_producido", 0),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("status", ["cotizacion_pendiente", "pendiente_aprobacion", "en_ajustes"]),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "aprobado_pendiente_pago"),
  ]);

  const todaySales = (todayOrders.data ?? []).reduce((s, o) => s + o.total, 0);
  const monthSales = (monthOrders.data ?? []).reduce((s, o) => s + o.total, 0);
  const pendingOrders = (todayOrders.data ?? []).filter(
    (o) => o.status === "paid" || o.status === "preparing" || o.status === "en_produccion"
  ).length;

  return {
    todaySales,
    todayOrders: todayOrders.data?.length ?? 0,
    monthSales,
    monthOrders: monthOrders.data?.length ?? 0,
    totalCustomers: totalCustomers.count ?? 0,
    pendingOrders,
    lowStock: lowStock.data ?? [],
    pendingBC: pendingBC.count ?? 0,
    pendingPayment: pendingPayment.count ?? 0,
  };
}

async function getRecentOrders() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("orders")
    .select("id, order_number, shipping_name, total, status, created_at")
    .order("created_at", { ascending: false })
    .limit(8);
  return data ?? [];
}

const STATUS_BADGE: Record<string, string> = {
  pending_payment: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  preparing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-[#EAC9C9] text-[#3D2B1F]",
  cancelled: "bg-red-100 text-red-700",
};
const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Pendiente",
  paid: "Pagado",
  preparing: "Preparando",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export default async function AdminDashboard() {
  const [stats, recentOrders] = await Promise.all([getDashboardStats(), getRecentOrders()]);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl text-[#3D2B1F]"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Dashboard
        </h1>
        <p className="text-sm text-[#897568] mt-1">Resumen de operaciones de Ricamo</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Ventas hoy"
          value={formatCOP(stats.todaySales)}
          sub={`${stats.todayOrders} pedidos`}
          icon={<DollarSign size={20} strokeWidth={1.5} className="text-[#B5888A]" />}
        />
        <StatCard
          title="Ventas del mes"
          value={formatCOP(stats.monthSales)}
          sub={`${stats.monthOrders} pedidos`}
          icon={<DollarSign size={20} strokeWidth={1.5} className="text-[#B5888A]" />}
        />
        <StatCard
          title="Pedidos pendientes"
          value={String(stats.pendingOrders)}
          sub="por despachar"
          icon={<ShoppingBag size={20} strokeWidth={1.5} className="text-[#B5888A]" />}
          alert={stats.pendingOrders > 0}
        />
        <StatCard
          title="Clientas totales"
          value={String(stats.totalCustomers)}
          sub="registradas + invitadas"
          icon={<Users size={20} strokeWidth={1.5} className="text-[#B5888A]" />}
        />
      </div>

      {/* Alertas B/C */}
      {(stats.pendingBC > 0 || stats.pendingPayment > 0) && (
        <div className="flex gap-3 mb-6 flex-wrap">
          {stats.pendingBC > 0 && (
            <a
              href="/admin/cotizaciones"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#b85539]/10 border border-[#b85539]/30 text-[#b85539] text-xs font-[500] hover:bg-[#b85539]/15 transition-colors"
            >
              <span className="w-5 h-5 rounded-full bg-[#b85539] text-white text-[10px] flex items-center justify-center font-[700]">
                {stats.pendingBC}
              </span>
              {stats.pendingBC === 1 ? "cotización requiere atención" : "cotizaciones requieren atención"} →
            </a>
          )}
          {stats.pendingPayment > 0 && (
            <a
              href="/admin/cotizaciones?status=aprobado_pendiente_pago"
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-[500] hover:bg-amber-100 transition-colors"
            >
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-[700]">
                {stats.pendingPayment}
              </span>
              {stats.pendingPayment === 1 ? "pedido aprobado esperando pago" : "pedidos aprobados esperando pago"} →
            </a>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PEDIDOS RECIENTES */}
        <div className="lg:col-span-2 bg-white border border-[#DDD5C4] p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[10px] tracking-[0.25em] uppercase text-[#897568] font-[600]">
              Pedidos recientes
            </h2>
            <a href="/admin/pedidos" className="text-xs text-[#B5888A] hover:text-[#3D2B1F]">
              Ver todos →
            </a>
          </div>
          <div className="space-y-0">
            {recentOrders.map((order, idx) => (
              <a
                key={order.id}
                href={`/admin/pedidos/${order.id}`}
                className={`flex items-center justify-between py-3 hover:bg-[#F3EDE0] -mx-2 px-2 transition-colors ${idx !== 0 ? "border-t border-[#F3EDE0]" : ""}`}
              >
                <div>
                  <p className="text-sm text-[#3D2B1F] font-[500]">{order.order_number}</p>
                  <p className="text-xs text-[#897568]">{order.shipping_name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-[600] tracking-wide uppercase ${STATUS_BADGE[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                  <span className="text-sm text-[#3D2B1F] font-[500]">
                    {formatCOP(order.total)}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* STOCK BAJO */}
        <div className="bg-white border border-[#DDD5C4] p-6">
          <h2 className="text-[10px] tracking-[0.25em] uppercase text-[#897568] font-[600] mb-5">
            Stock bajo (≤ 3 uds)
          </h2>
          {stats.lowStock.length === 0 ? (
            <p className="text-sm text-[#CEC3AB]">Sin alertas de stock.</p>
          ) : (
            <div className="space-y-3">
              {stats.lowStock.map((v: any) => (
                <div key={v.id} className="flex items-start gap-2">
                  <AlertTriangle size={14} className="text-[#B5888A] shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <p className="text-xs text-[#3D2B1F] font-[500] leading-snug">
                      {v.products?.name ?? v.sku}
                    </p>
                    <p className="text-[10px] text-[#897568]">
                      {v.sku} · {v.stock_pre_producido} pre-stock
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <a
            href="/admin/inventario"
            className="block mt-4 text-xs text-[#B5888A] hover:text-[#3D2B1F]"
          >
            Ver inventario completo →
          </a>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title, value, sub, icon, alert,
}: {
  title: string; value: string; sub: string; icon: React.ReactNode; alert?: boolean;
}) {
  return (
    <div className={`bg-white border p-5 ${alert ? "border-[#B5888A]" : "border-[#DDD5C4]"}`}>
      <div className="flex justify-between items-start mb-3">
        <p className="text-[9px] tracking-[0.2em] uppercase text-[#897568] font-[600]">{title}</p>
        {icon}
      </div>
      <p className="text-2xl text-[#3D2B1F] font-[600] leading-none mb-1">{value}</p>
      <p className="text-xs text-[#897568]">{sub}</p>
    </div>
  );
}
