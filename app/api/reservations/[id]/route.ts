// app/api/reservations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const VALID_STATUTS = ["en_attente", "confirmee", "annulee"] as const;
type Statut = (typeof VALID_STATUTS)[number];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await request.json();
  const { statut } = body as { statut: Statut };

  if (!VALID_STATUTS.includes(statut)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("reservations")
    .update({ statut })
    .eq("id", params.id);

  if (error) {
    console.error("Erreur mise à jour statut:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
