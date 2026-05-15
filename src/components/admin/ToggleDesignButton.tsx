"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Props {
  id: string;
  isActive: boolean;
}

export function ToggleDesignButton({ id, isActive }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await fetch(`/api/admin/configurador/${id}/toggle`, { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-[10px] px-2 py-1 font-[500] transition-colors disabled:opacity-50 ${
        isActive
          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
          : "bg-green-100 text-green-700 hover:bg-green-200"
      }`}
    >
      {loading ? <Loader2 size={10} className="animate-spin" /> : isActive ? "Ocultar" : "Activar"}
    </button>
  );
}
