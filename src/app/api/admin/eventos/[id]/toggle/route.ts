import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabaseAuth = await createClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createServiceClient();

  const { data: ev } = await supabase.from("active_events").select("is_active").eq("id", id).single();
  if (!ev) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const newValue = !ev.is_active;

  // RB-EVT-01: si activando, desactivar los demás
  if (newValue) {
    await supabase.from("active_events").update({ is_active: false }).neq("id", id);
  }

  await supabase.from("active_events").update({ is_active: newValue }).eq("id", id);

  return NextResponse.json({ ok: true, is_active: newValue });
}
