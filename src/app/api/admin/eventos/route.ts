import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabaseAuth = await createClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { name, city, starts_at, ends_at, banner_text, is_active } = body;

  if (!name || !city || !starts_at || !ends_at || !banner_text) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // RB-EVT-01: solo un evento activo en Fase 1
  if (is_active) {
    await supabase.from("active_events").update({ is_active: false }).eq("is_active", true);
  }

  const { data, error } = await supabase
    .from("active_events")
    .insert({ name, city, starts_at, ends_at, banner_text, is_active: is_active ?? false })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ id: data.id }, { status: 201 });
}
