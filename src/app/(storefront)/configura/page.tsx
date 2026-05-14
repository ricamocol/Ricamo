import type { Metadata } from "next";
import { ConfiguradorClient } from "@/components/storefront/Configurador/ConfiguradorClient";

export const metadata: Metadata = {
  title: "Diseña tu camiseta — Ricamo",
  description: "Crea tu diseño personalizado con el configurador de Ricamo.",
};

export default function ConfiguraPage() {
  return <ConfiguradorClient />;
}
