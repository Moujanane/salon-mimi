// app/api/reservations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { nom, telephone, service, date_souhaitee, message } = body;

  if (!nom || !telephone || !service) {
    return NextResponse.json(
      { error: "Champs requis manquants" },
      { status: 400 },
    );
  }

  const { error } = await supabaseAdmin.from("reservations").insert({
    nom,
    telephone,
    service,
    date_souhaitee: date_souhaitee || null,
    message: message || null,
    statut: "en_attente",
  });

  if (error) {
    console.error("Erreur insertion réservation:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
