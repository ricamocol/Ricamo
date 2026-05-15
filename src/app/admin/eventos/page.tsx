import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { formatDateShort } from "@/lib/utils/format";
import { Plus } from "lucide-react";
import { ToggleEventButton } from "@/components/admin/ToggleEventButton";

export default async function AdminEventosPage() {
  const supabase = createServiceClient();

  const { data: events } = await supabase
    .from("active_events")
    .select("*")
    .order("starts_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-3xl text-[#3D2B1F]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Eventos activos
          </h1>
          <p className="text-sm text-[#897568] mt-1">
            Banner geo-segmentado para eventos y festivales — RB-EVT-01
          </p>
        </div>
        <Link
          href="/admin/eventos/nuevo"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3D2B1F] text-[#F3EDE0] text-sm font-[500] hover:bg-[#5C3D2E] transition-colors"
        >
          <Plus size={15} />
          Nuevo evento
        </Link>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 mb-6 text-sm text-amber-800">
        <strong>RB-EVT-01:</strong> Solo un evento puede estar activo a la vez en Fase 1.
        Desactiva el actual antes de activar uno nuevo.
      </div>

      <div className="bg-white border border-[#DDD5C4] overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#DDD5C4]">
              {["Evento", "Ciudad", "Banner", "Inicio", "Fin", "Estado", ""].map((h) => (
                <th key={h} className="text-left text-[9px] tracking-[0.2em] uppercase text-[#897568] font-[600] px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(events ?? []).map((ev) => (
              <tr key={ev.id} className="border-b border-[#F3EDE0] hover:bg-[#F3EDE0]/50">
                <td className="px-4 py-3 font-[500] text-[#3D2B1F]">{ev.name}</td>
                <td className="px-4 py-3 text-[#897568]">{ev.city}</td>
                <td className="px-4 py-3 text-[#6a6356] text-xs max-w-[200px] truncate">{ev.banner_text}</td>
                <td className="px-4 py-3 text-[#897568] text-xs whitespace-nowrap">
                  {formatDateShort(ev.starts_at)}
                </td>
                <td className="px-4 py-3 text-[#897568] text-xs whitespace-nowrap">
                  {formatDateShort(ev.ends_at)}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-[600] tracking-wide uppercase ${
                    ev.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                  }`}>
                    {ev.is_active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ToggleEventButton id={ev.id} isActive={ev.is_active} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!events?.length && (
          <div className="py-16 text-center text-[#897568] text-sm">
            No hay eventos registrados.{" "}
            <Link href="/admin/eventos/nuevo" className="text-[#B5888A] underline">
              Crear el primero
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
