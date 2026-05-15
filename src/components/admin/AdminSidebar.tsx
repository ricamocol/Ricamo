"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  Tag, BarChart2, Settings, Archive, LogOut, Layers,
  Palette, CalendarDays, Star, MessageSquare, ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/cotizaciones", label: "Cotizaciones", icon: MessageSquare },
  { href: "/admin/inventario", label: "Inventario dual", icon: Archive },
  { href: "/admin/configurador", label: "Diseños config.", icon: Palette },
  { href: "/admin/eventos", label: "Eventos activos", icon: CalendarDays },
  { href: "/admin/influencers", label: "Influencers", icon: Star },
  { href: "/admin/colecciones", label: "Colecciones", icon: Layers },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/descuentos", label: "Descuentos", icon: Tag },
  { href: "/admin/marca", label: "Marca personal", icon: ImageIcon },
  { href: "/admin/reportes", label: "Reportes", icon: BarChart2 },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-[#3D2B1F] flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-[#4D3B2F]">
        <Link href="/" target="_blank">
          <span
            className="text-xl text-[#F3EDE0]"
            style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
          >
            Ricamo
          </span>
        </Link>
        <p className="text-[9px] tracking-[0.2em] uppercase text-[#897568] mt-0.5">
          Panel admin
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors",
                active
                  ? "bg-[#EAC9C9]/15 text-[#EAC9C9] font-[500]"
                  : "text-[#897568] hover:text-[#CEC3AB] hover:bg-white/5"
              )}
            >
              <Icon size={16} strokeWidth={1.5} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-[#4D3B2F]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-[#897568] hover:text-[#CEC3AB] transition-colors"
        >
          <LogOut size={16} strokeWidth={1.5} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
