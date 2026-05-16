// app/api/reservations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const VALID_SERVICES = [
  "Tresses africaines",
  "Tresses et nattes",
  "Box braids",
  "Tresses Fulani",
  "Tresses Boho",
  "Locks & dreads",
  "Cheveux attachés",
  "Perruques et tissage",
  "Colorations capillaires",
  "Ongles, soins & épilation",
];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { nom, telephone, service, date_souhaitee, message } = body;

  if (
    !nom ||
    typeof nom !== "string" ||
    nom.trim().length < 2 ||
    nom.length > 100
  ) {
    return NextResponse.json({ error: "Nom invalide" }, { status: 400 });
  }
  if (
    !telephone ||
    typeof telephone !== "string" ||
    !/^\+?[\d\s\-().]{6,20}$/.test(telephone)
  ) {
    return NextResponse.json({ error: "Téléphone invalide" }, { status: 400 });
  }
  if (!service || !VALID_SERVICES.includes(service)) {
    return NextResponse.json({ error: "Service invalide" }, { status: 400 });
  }
  if (message && typeof message === "string" && message.length > 1000) {
    return NextResponse.json({ error: "Message trop long" }, { status: 400 });
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
