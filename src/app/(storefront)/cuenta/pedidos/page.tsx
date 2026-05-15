import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { formatCOP, formatDate } from "@/lib/utils/format";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending_payment:       { label: "Pendiente de pago", cls: "text-amber-700 bg-amber-50 border-amber-200" },
  paid:                  { label: "Pago confirmado", cls: "text-blue-700 bg-blue-50 border-blue-200" },
  en_produccion:         { label: "En producción", cls: "text-indigo-700 bg-indigo-50 border-indigo-200" },
  preparing:             { label: "Empacando", cls: "text-purple-700 bg-purple-50 border-purple-200" },
  shipped:               { label: "En camino", cls: "text-cyan-700 bg-cyan-50 border-cyan-200" },
  delivered:             { label: "Entregado", cls: "text-green-700 bg-green-50 border-green-200" },
  cancelled:             { label: "Cancelado", cls: "text-gray-500 bg-gray-50 border-gray-200" },
  cotizacion_pendiente:  { label: "Cotización en proceso", cls: "text-orange-700 bg-orange-50 border-orange-200" },
  pendiente_aprobacion:  { label: "Revisando diseño", cls: "text-amber-700 bg-amber-50 border-amber-200" },
  en_ajustes:            { label: "Diseño en ajustes", cls: "text-sky-700 bg-sky-50 border-sky-200" },
  aprobado_pendiente_pago: { label: "¡Lista para pagar!", cls: "text-[#b85539] bg-orange-50 border-[#b85539]" },
  rechazado:             { label: "No aprobado", cls: "text-gray-500 bg-gray-50 border-gray-200" },
};

export const metadata = { title: "Mis pedidos" };

export default async function PedidosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=/cuenta/pedidos");

  const db = createServiceClient();

  // Buscar customer por auth_user_id, si no por email (checkout no vincula auth_user_id)
  let customerId: string | null = null;
  const { data: byAuthId } = await db
    .from("customers")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (byAuthId) {
    customerId = byAuthId.id;
  } else if (user.email) {
    const { data: byEmail } = await db
      .from("customers")
      .select("id")
      .eq("email", user.email.toLowerCase())
      .single();

    if (byEmail) {
      customerId = byEmail.id;
      await db
        .from("customers")
        .update({ auth_user_id: user.id, is_guest: false })
        .eq("id", byEmail.id);
    }
  }

  const { data: orders } = customerId
    ? await db
        .from("orders")
        .select("id, order_number, flow, status, total, created_at, shipping_city, shipping_department, wompi_link_url")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div>
      <h2
        className="text-xl text-[#3D2B1F] mb-5"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Mis pedidos
      </h2>

      {!orders?.length ? (
        <div className="bg-white border border-[#DDD5C4] py-16 text-center">
          <Package size={40} className="mx-auto mb-4 text-[#CEC3AB]" />
          <p className="text-sm text-[#897568] mb-4">Aún no tienes pedidos.</p>
          <Link
            href="/catalogo"
            className="inline-block text-[11px] uppercase tracking-[0.15em] text-[#3D2B1F] border-b border-[#3D2B1F] pb-0.5"
          >
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {orders.map((order: any) => {
            const s =
              STATUS_MAP[order.status] ?? {
                label: order.status,
                cls: "text-gray-500 bg-gray-50 border-gray-200",
              };
            const needsPayment =
              order.status === "aprobado_pendiente_pago" && order.wompi_link_url;
            return (
              <div key={order.id} className="bg-white border border-[#DDD5C4] hover:border-[#B5888A] transition-colors">
                <Link
                  href={`/cuenta/pedidos/${order.id}`}
                  className="block px-5 py-4 group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-[600] text-[#3D2B1F] group-hover:text-[#B5888A] transition-colors">
                        {order.order_number}
                      </p>
                      <p className="text-[11px] text-[#897568] mt-0.5">
                        {formatDate(order.created_at)} · {order.shipping_city},{" "}
                        {order.shipping_department}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[10px] px-2.5 py-1 border font-[500] ${s.cls}`}>
                        {s.label}
                      </span>
                      <p className="text-sm font-[600] text-[#3D2B1F]">{formatCOP(order.total)}</p>
                      <ArrowRight
                        size={14}
                        className="text-[#CEC3AB] group-hover:text-[#897568] transition-colors"
                      />
                    </div>
                  </div>
                </Link>
                {needsPayment && (
                  <div className="px-5 pb-4">
                    <a
                      href={order.wompi_link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-6 py-2 bg-[#f0c419] text-[#0e0e0e] text-[11px] tracking-[0.18em] uppercase font-[700] hover:bg-[#e0b410] transition-colors"
                    >
                      Pagar ahora →
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
