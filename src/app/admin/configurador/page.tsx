import Link from "next/link";
import Image from "next/image";
import { createServiceClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";
import { ToggleDesignButton } from "@/components/admin/ToggleDesignButton";

export default async function AdminConfiguradorPage() {
  const supabase = createServiceClient();

  const { data: designs } = await supabase
    .from("configurator_designs")
    .select("*")
    .order("sort_order")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-3xl text-[#3D2B1F]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Diseños del configurador
          </h1>
          <p className="text-sm text-[#897568] mt-1">
            Catálogo de diseños disponibles en el configurador visual
          </p>
        </div>
        <Link
          href="/admin/configurador/nuevo"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3D2B1F] text-[#F3EDE0] text-sm font-[500] hover:bg-[#5C3D2E] transition-colors"
        >
          <Plus size={15} />
          Nuevo diseño
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {(designs ?? []).map((d) => (
          <div key={d.id} className="bg-white border border-[#DDD5C4]">
            <div className="relative aspect-square overflow-hidden bg-[#F3EDE0]">
              {d.image_url ? (
                <Image
                  src={d.image_url}
                  alt={d.name}
                  fill
                  className="object-cover object-top"
                  sizes="200px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#897568] text-xs">
                  Sin imagen
                </div>
              )}
              {!d.is_active && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-[#897568] font-[600]">Inactivo</span>
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-[500] text-[#3D2B1F] truncate">{d.name}</p>
              <div className="flex gap-1.5 mt-1 flex-wrap">
                {d.event_tag && (
                  <span className="text-[9px] px-1.5 py-0.5 bg-orange-100 text-orange-700 uppercase tracking-wide">
                    {d.event_tag}
                  </span>
                )}
                {d.style_tag && (
                  <span className="text-[9px] px-1.5 py-0.5 bg-purple-100 text-purple-700 uppercase tracking-wide">
                    {d.style_tag}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-[#897568]">Orden: {d.sort_order}</span>
                <ToggleDesignButton id={d.id} isActive={d.is_active} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {!designs?.length && (
        <div className="py-16 text-center text-[#897568] text-sm">
          No hay diseños en el catálogo.{" "}
          <Link href="/admin/configurador/nuevo" className="text-[#B5888A] underline">
            Agregar el primero
          </Link>
        </div>
      )}
    </div>
  );
}
