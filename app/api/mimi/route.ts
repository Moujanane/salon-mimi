import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const PIN = process.env.MIMI_PIN ?? "1234";

// Rate limiting : 5 tentatives par IP par fenêtre de 15 minutes
const pinAttempts = new Map<string, { count: number; resetAt: number }>();

function checkPinRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 5;
  const entry = pinAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    pinAttempts.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxAttempts) return false;
  entry.count++;
  return true;
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

  if (!checkPinRateLimit(ip)) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessaie dans 15 minutes." },
      { status: 429 },
    );
  }

  const pin = request.nextUrl.searchParams.get("pin");
  if (!pin || pin !== PIN) {
    return NextResponse.json({ error: "PIN incorrect" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("reservations")
    .select(
      "id, nom, telephone, service, date_souhaitee, heure_souhaitee, statut, created_at, message, nombre_personnes",
    )
    .order("date_souhaitee", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ reservations: data });
}
