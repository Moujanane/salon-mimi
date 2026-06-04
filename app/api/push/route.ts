import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const PIN = process.env.MIMI_PIN ?? "1234";

// Retourne la clé publique VAPID pour le client
export async function GET() {
  return NextResponse.json({ publicKey: process.env.VAPID_PUBLIC_KEY ?? "" });
}

// Enregistrer un abonnement push
export async function POST(req: NextRequest) {
  const pin = req.nextUrl.searchParams.get("pin");
  if (pin !== PIN) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const { endpoint, keys } = body;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: "Abonnement invalide" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("push_subscriptions")
    .upsert({ endpoint, keys }, { onConflict: "endpoint" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// Supprimer un abonnement push
export async function DELETE(req: NextRequest) {
  const pin = req.nextUrl.searchParams.get("pin");
  if (pin !== PIN) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const { endpoint } = body;

  await supabaseAdmin
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint);
  return NextResponse.json({ success: true });
}
