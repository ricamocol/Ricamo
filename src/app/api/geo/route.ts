import { NextRequest, NextResponse } from "next/server";

// Detecta ciudad por IP — usado por EventBanner para geo-segmentación.
// Degrada elegantemente: si la API falla, devuelve city: null sin lanzar excepción.
// RB-EVT-02: solo aplica banner cuando ciudad y fechas coinciden.
export async function GET(req: NextRequest) {
  try {
    // Obtener IP del cliente (respetar X-Forwarded-For de Vercel)
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor?.split(",")[0]?.trim()
      ?? req.headers.get("x-real-ip")
      ?? "1.1.1.1";

    // No geo-localizar IPs locales
    if (ip.startsWith("127.") || ip.startsWith("192.168.") || ip === "::1" || ip === "1.1.1.1") {
      return NextResponse.json({ city: null });
    }

    // Usar ipapi.co (free tier: 1000 req/día)
    const geoRes = await fetch(
      `https://ipapi.co/${ip}/json/`,
      { next: { revalidate: 3600 } } // cachear 1 hora por IP
    );

    if (!geoRes.ok) {
      return NextResponse.json({ city: null });
    }

    const data = await geoRes.json();
    const city: string | null = data.city ?? null;

    return NextResponse.json({ city });
  } catch {
    // Degradar elegantemente — nunca romper el storefront
    return NextResponse.json({ city: null });
  }
}
