import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabaseAuth = await createClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user || user.app_metadata?.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { name, handle, email, phone, is_active, code, discount_type, discount_value } = body;

  if (!name?.trim() || !code?.trim() || !discount_type || !discount_value) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // 1. Verificar que el código no exista
  const { data: existingCode } = await supabase
    .from("promotions")
    .select("id")
    .eq("code", code.toUpperCase())
    .maybeSingle();

  if (existingCode) {
    return NextResponse.json({ error: `El código ${code} ya existe` }, { status: 409 });
  }

  // 2. Crear influencer
  const { data: influencer, error: infError } = await supabase
    .from("influencers")
    .insert({ name: name.trim(), handle: handle || null, email: email || null, phone: phone || null, is_active: is_active ?? true })
    .select("id")
    .single();

  if (infError || !influencer) {
    return NextResponse.json({ error: "Error al crear influencer" }, { status: 500 });
  }

  // 3. Crear cupón asociado (ilimitado — RB-INF-01)
  const now = new Date().toISOString();
  const { error: promoError } = await supabase
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
      ends_at: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 10 años
      is_active: true,
      is_cumulative: false,
      influencer_id: influencer.id,
    });

  if (promoError) {
    return NextResponse.json({ error: "Influencer creado pero error al crear el cupón" }, { status: 207 });
  }

  return NextResponse.json({ id: influencer.id }, { status: 201 });
}
