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

  const { data: design } = await supabase
    .from("configurator_designs")
    .select("is_active")
    .eq("id", id)
    .single();

  if (!design) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  await supabase
    .from("configurator_designs")
    .update({ is_active: !design.is_active })
    .eq("id", id);

  return NextResponse.json({ ok: true, is_active: !design.is_active });
}
