import { redirect } from "next/navigation";

// Redirigir URLs legacy /coleccion/[slug] → /evento/[slug]
// Mantenido para compatibilidad con links existentes
export default async function ColeccionLegacyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/evento/${slug}`);
}
