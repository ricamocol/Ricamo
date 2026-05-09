import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Mar Boutique — Mujeres que visten con intención",
    template: "%s | Mar Boutique",
  },
  description:
    "Ropa femenina con estilo playero y costero desde Cartagena, Colombia. Prendas versátiles, atemporales y auténticas.",
  keywords: ["ropa femenina", "boutique Cartagena", "moda playera", "vestidos Colombia", "ropa mujer"],
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "Mar Boutique",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
