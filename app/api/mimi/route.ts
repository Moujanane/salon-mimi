import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { checkMimiPin } from "@/lib/mimiAuth";

export async function GET(request: NextRequest) {
  const auth = checkMimiPin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
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
