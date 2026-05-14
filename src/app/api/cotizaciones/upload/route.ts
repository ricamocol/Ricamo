import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const MAX_SIZE = 8 * 1024 * 1024; // 8 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "Sin archivo" }, { status: 400 });

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Usa JPG, PNG, WEBP o PDF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Máximo 8 MB por archivo" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `cotizaciones/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const supabase = createServiceClient();
    const { error } = await supabase.storage
      .from("cotizacion-files")
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error) {
      console.error("[cotizaciones/upload]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage
      .from("cotizacion-files")
      .getPublicUrl(path);

    return NextResponse.json({ url: publicUrl, name: file.name, type: file.type });
  } catch (err) {
    console.error("[cotizaciones/upload]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
