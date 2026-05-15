import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F3EDE0] flex flex-col">
      {/* Header minimal */}
      <header className="py-6 px-8 border-b border-[#DDD5C4]">
        <Link href="/" className="inline-block">
          <span
            className="text-2xl text-[#3D2B1F]"
            style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic" }}
          >
            Ricamo
          </span>
        </Link>
      </header>

      {/* Contenido */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      <footer className="py-4 text-center text-[10px] tracking-[0.15em] uppercase text-[#CEC3AB]">
        © {new Date().getFullYear()} Ricamo · Medellín, Colombia
      </footer>
    </div>
  );
}
