import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// Devuelve los eventos activos en este momento.
// Usado por EventBanner para geo-segmentación en el cliente.
export async function GET() {
  try {
    const supabase = createServiceClient();
    const now = new Date().toISOString();

    const { data: events } = await supabase
      .from("active_events")
      .select("id, name, city, banner_text, starts_at, ends_at")
      .eq("is_active", true)
      .lte("starts_at", now)
      .gte("ends_at", now)
      .order("starts_at");

    return NextResponse.json({ events: events ?? [] });
  } catch {
    return NextResponse.json({ events: [] });
  }
}
