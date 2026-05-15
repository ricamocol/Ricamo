import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabaseAuth = await createClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { name, image_url, event_tag, style_tag, sort_order, is_active } = body;

  if (!name || !image_url) {
    return NextResponse.json({ error: "Nombre e imagen son requeridos" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("configurator_designs")
    .insert({
      name,
      image_url,
      event_tag: event_tag || null,
      style_tag: style_tag || null,
      sort_order: sort_order ?? 0,
      is_active: is_active ?? true,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ id: data.id }, { status: 201 });
}
