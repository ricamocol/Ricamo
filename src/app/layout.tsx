import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Ricamo — Camisetas para festivales y eventos de Colombia",
    template: "%s | Ricamo",
  },
  description:
    "Camisetas temáticas para festivales y eventos de Colombia. Feria Ganadera, Fiestas del Mar, Feria de las Flores y más. También personalizadas — diseña la tuya.",
  keywords: ["camisetas eventos colombia", "camisetas feria ganadera", "camisetas personalizadas", "ricamo", "camisetas festivales colombia", "María José"],
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "Ricamo",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`h-full ${playfair.variable} ${dmSans.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
