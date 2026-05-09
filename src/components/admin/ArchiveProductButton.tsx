"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ArchiveProductButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function archive() {
    setLoading(true);
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    router.push("/admin/productos");
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-xs text-[#897568]">¿Archivar este producto?</span>
        <button
          onClick={archive}
          disabled={loading}
          className="text-xs text-[#B5888A] hover:text-[#3D2B1F] font-[500]"
        >
          {loading ? "Archivando…" : "Sí, archivar"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-[#CEC3AB] hover:text-[#897568]"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-xs text-[#CEC3AB] hover:text-[#B5888A] transition-colors"
    >
      Archivar producto
    </button>
  );
}
