import { redirect } from "next/navigation";

// Ruta heredada de Mar Boutique — redirige permanentemente a la vitrina de María José
export default function NosotrasPage() {
  redirect("/maria-jose");
}
