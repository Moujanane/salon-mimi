import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const PIN = process.env.MIMI_PIN ?? "1234";

export async function GET(request: NextRequest) {
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
