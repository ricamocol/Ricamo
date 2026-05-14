"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ShoppingBag, Heart, User, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useCartStore } from "@/lib/store/cart";

const NAV_LINKS = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/colecciones", label: "Eventos" },
  { href: "/configura", label: "Diseña" },
  { href: "/cotiza", label: "Cotiza" },
  { href: "/maria-jose", label: "María José" },
];

function SmileyLogo({ size = 28, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M25 4 C13.4 4.8 4.8 13.4 4 25 C3.2 36.6 11.8 46.4 23.4 47.8 C35 49.2 46 41.2 47.8 29.6 C49.6 18 41.8 6.8 30.2 4.4 C28.5 4.1 26.8 3.9 25 4Z" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <circle cx="18" cy="22" r="2.2" fill={color}/>
      <circle cx="32" cy="22" r="2.2" fill={color}/>
      <path d="M16 31 Q25 39.5 34 31" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M20.5 18 L21.5 16" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M23 17.5 L24 15.5" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const itemCount = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#faf7f1]/95 backdrop-blur-md shadow-[0_1px_12px_rgba(14,14,14,0.08)]"
          : "bg-[#faf7f1]"
      )}
    >
      {/* MARQUEE ANUNCIO */}
      <div className="bg-[#0e0e0e] text-[#f0c419] text-[10px] tracking-[0.2em] uppercase py-1.5 overflow-hidden">
        <div className="flex marquee-track whitespace-nowrap">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="mx-8 flex items-center gap-4">
              <SmileyLogo size={12} color="#f0c419" />
              <span>Camisetas para festivales y eventos de Colombia</span>
              <SmileyLogo size={12} color="#f0c419" />
              <span>lo creas, lo llevas</span>
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* NAV LINKS — izquierda */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.slice(0, 3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-[11px] tracking-[0.15em] uppercase font-[500] transition-colors duration-200",
                  pathname === link.href
                    ? "text-[#0e0e0e]"
                    : "text-[#6a6356] hover:text-[#0e0e0e]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* LOGO — centro */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2"
          >
            <SmileyLogo size={26} color="#0e0e0e" />
            <span
              className="text-[26px] text-[#0e0e0e] leading-none select-none"
              style={{ fontFamily: "'Caveat', cursive", fontWeight: 600 }}
            >
              Ricamo
            </span>
          </Link>

          {/* NAV LINKS — derecha (desktop) */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.slice(3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-[11px] tracking-[0.15em] uppercase font-[500] transition-colors duration-200",
                  pathname === link.href
                    ? "text-[#0e0e0e]"
                    : "text-[#6a6356] hover:text-[#0e0e0e]"
                )}
              >
                {link.label}
              </Link>
            ))}

            <div className="flex items-center gap-4 ml-2 border-l border-[#d8cfbb] pl-5">
              <Link href="/cuenta/wishlist" aria-label="Wishlist" className="text-[#6a6356] hover:text-[#0e0e0e] transition-colors">
                <Heart size={17} strokeWidth={1.5} />
              </Link>
              <Link href="/cuenta" aria-label="Mi cuenta" className="text-[#6a6356] hover:text-[#0e0e0e] transition-colors">
                <User size={17} strokeWidth={1.5} />
              </Link>
              <Link href="/carrito" aria-label={`Carrito (${itemCount})`} className="relative text-[#6a6356] hover:text-[#0e0e0e] transition-colors">
                <ShoppingBag size={17} strokeWidth={1.5} />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#f0c419] text-[#0e0e0e] text-[9px] font-[700] flex items-center justify-center">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </Link>
            </div>
          </nav>

          {/* ICONOS MÓVIL */}
          <div className="md:hidden flex items-center gap-4 ml-auto">
            <Link href="/carrito" className="relative text-[#6a6356]">
              <ShoppingBag size={20} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#f0c419] text-[#0e0e0e] text-[9px] font-[700] flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              aria-label="Menú"
              onClick={() => setMenuOpen((v) => !v)}
              className="text-[#0e0e0e]"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* MENÚ MÓVIL */}
      {menuOpen && (
        <div className="md:hidden bg-[#faf7f1] border-t border-[#d8cfbb] px-6 py-6 flex flex-col gap-5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "text-[13px] tracking-[0.15em] uppercase font-[500]",
                pathname === link.href ? "text-[#0e0e0e]" : "text-[#6a6356]"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-[#d8cfbb] pt-5 flex gap-6">
            <Link href="/cuenta/wishlist" onClick={() => setMenuOpen(false)} className="text-[#6a6356]">
              <Heart size={20} strokeWidth={1.5} />
            </Link>
            <Link href="/cuenta" onClick={() => setMenuOpen(false)} className="text-[#6a6356]">
              <User size={20} strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
