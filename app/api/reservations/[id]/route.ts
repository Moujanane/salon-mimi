// app/api/reservations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthUser } from "@/lib/adminAuth";

const VALID_STATUTS = ["en_attente", "confirmee", "annulee"] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await request.json();
  const { statut } = body;

  if (typeof statut !== "string" || !VALID_STATUTS.includes(statut as never)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("reservations")
    .update({ statut: statut as (typeof VALID_STATUTS)[number] })
    .eq("id", id);

  if (error) {
    console.error("Erreur mise à jour statut:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { error } = await supabaseAdmin
    .from("reservations")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erreur suppression réservation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
