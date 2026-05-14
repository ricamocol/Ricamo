import type { Metadata } from "next";
import { Instrument_Serif, DM_Sans, Caveat } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Ricamo — lo creas, lo llevas",
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
    <html lang="es" className={`h-full ${instrumentSerif.variable} ${dmSans.variable} ${caveat.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
