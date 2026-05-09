import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#3D2B1F] text-[#CEC3AB] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* MARCA */}
          <div className="md:col-span-2">
            <span
              className="block text-2xl text-white mb-3"
              style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}
            >
              Mar Boutique
            </span>
            <p className="text-sm leading-relaxed text-[#897568] max-w-xs">
              Mujeres que visten con intención. Ropa femenina con alma costera
              desde Cartagena, Colombia.
            </p>
            <div className="flex gap-4 mt-5">
              <a
                href="https://instagram.com/marboutique"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-[#897568] hover:text-[#EAC9C9] transition-colors text-sm font-[500] tracking-wide"
              >
                IG
              </a>
              <a
                href="https://facebook.com/marboutique"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-[#897568] hover:text-[#EAC9C9] transition-colors text-sm font-[500] tracking-wide"
              >
                FB
              </a>
            </div>
          </div>

          {/* TIENDA */}
          <div>
            <h4 className="text-[10px] tracking-[0.2em] uppercase text-[#EAC9C9] mb-4 font-[500]">
              Tienda
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/catalogo", label: "Catálogo" },
                { href: "/colecciones", label: "Colecciones" },
                { href: "/cuenta/wishlist", label: "Favoritos" },
                { href: "/seguimiento", label: "Seguir mi pedido" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#897568] hover:text-[#CEC3AB] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* INFORMACIÓN */}
          <div>
            <h4 className="text-[10px] tracking-[0.2em] uppercase text-[#EAC9C9] mb-4 font-[500]">
              Información
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/nosotras", label: "Nosotras" },
                { href: "/terminos", label: "Términos y condiciones" },
                { href: "/privacidad", label: "Política de privacidad" },
                { href: "/devoluciones", label: "Política de devoluciones" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#897568] hover:text-[#CEC3AB] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#4D3B2F] mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-[#6B5548]">
            © {new Date().getFullYear()} Mar Boutique. Todos los derechos reservados.
          </p>
          <p className="text-xs text-[#6B5548]">
            Cartagena, Colombia 🇨🇴
          </p>
        </div>
      </div>
    </footer>
  );
}
