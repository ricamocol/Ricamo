import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { variantId, quantity, sessionId } = await req.json();

    if (!variantId || !quantity || !sessionId) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Check variant inventory mode — RB-CHK-01
    const { data: variant } = await supabase
      .from("product_variants")
      .select("stock_pre_producido, bajo_demanda_habilitado")
      .eq("id", variantId)
      .single();

    if (!variant) {
      return NextResponse.json({ error: "Variante no encontrada" }, { status: 404 });
    }

    // Bajo demanda: no stock to reserve, just accept the order — RB-INV-01
    if ((variant.stock_pre_producido ?? 0) === 0 && variant.bajo_demanda_habilitado) {
      return NextResponse.json({ success: true, reservedUntil: null, mode: "on_demand" });
    }

    // Pre-stock: atomic stock reservation — RB-CHK-01
    const { data, error } = await supabase.rpc("reserve_stock", {
      p_variant_id: variantId,
      p_session_id: sessionId,
      p_quantity: quantity,
      p_minutes: 10,
    });

    if (error || !data) {
      return NextResponse.json(
        { error: "Sin stock disponible" },
        { status: 409 }
      );
    }

    const reservedUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    return NextResponse.json({ success: true, reservedUntil, mode: "fast" });
  } catch (err) {
    console.error("[reserve_stock]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
