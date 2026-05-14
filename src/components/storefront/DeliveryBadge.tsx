import { Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { DeliveryMode } from "@/types";

interface DeliveryBadgeProps {
  mode: DeliveryMode;
  dias?: number;
  size?: "sm" | "md";
  className?: string;
}

export function DeliveryBadge({ mode, dias = 3, size = "sm", className }: DeliveryBadgeProps) {
  const base = cn(
    "inline-flex items-center gap-1 font-[500] uppercase tracking-[0.12em]",
    size === "sm" ? "text-[9px] px-2 py-0.5" : "text-[10px] px-2.5 py-1",
    className
  );

  if (mode === "fast") {
    return (
      <span className={cn(base, "bg-[#f0c419] text-[#0e0e0e]")}>
        <Zap size={size === "sm" ? 9 : 11} strokeWidth={2.5} />
        Entrega rápida
      </span>
    );
  }

  if (mode === "on_demand") {
    return (
      <span className={cn(base, "bg-[#e8e0c8] text-[#6a6356]")}>
        <Clock size={size === "sm" ? 9 : 11} strokeWidth={2} />
        Producción {dias} días
      </span>
    );
  }

  return null;
}
