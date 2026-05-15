import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabaseAuth = await createClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, handle, email, phone, is_active, code, discount_type, discount_value } = body;

  const supabase = createServiceClient();

  // Actualizar influencer
  const { error: infError } = await supabase
    .from("influencers")
    .update({
      name: name?.trim(),
      handle: handle || null,
      email: email || null,
      phone: phone || null,
      is_active: is_active ?? true,
    })
    .eq("id", id);

  if (infError) {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }

  // Actualizar o crear cupón
  if (code && discount_type && discount_value) {
    const { data: existingPromo } = await supabase
      .from("promotions")
      .select("id")
      .eq("influencer_id", id)
      .maybeSingle();

    if (existingPromo) {
      await supabase
        .from("promotions")
        .update({ code: code.toUpperCase(), discount_type, discount_value })
        .eq("id", existingPromo.id);
    } else {
      const now = new Date().toISOString();
      await supabase
        .from("promotions")
        .insert({
          code: code.toUpperCase(),
          name: `Cupón de ${name}`,
          discount_type,
          discount_value,
          scope: "global",
          scope_id: null,
          max_uses: null,
          max_uses_per_customer: 99999,
          starts_at: now,
          ends_at: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true,
          is_cumulative: false,
          influencer_id: id,
        });
    }
  }

  return NextResponse.json({ ok: true });
}
