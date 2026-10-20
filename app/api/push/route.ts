import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { checkMimiPin } from "@/lib/mimiAuth";
import { validatePushSubscription } from "@/lib/validation";

// Retourne la clé publique VAPID pour le client (non sensible : elle est
// destinée à être exposée au navigateur).
export async function GET() {
  return NextResponse.json({ publicKey: process.env.VAPID_PUBLIC_KEY ?? "" });
}

// Enregistrer un abonnement push (réservé à la PWA Mimi).
export async function POST(req: NextRequest) {
  const auth = await checkMimiPin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json().catch(() => null);
  // Le serveur enverra des requêtes vers `endpoint` : seules les URL des services
  // de notification des navigateurs sont acceptées (lib/validation.ts).
  const parsed = validatePushSubscription(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { endpoint, keys } = parsed.value;

  const { error } = await supabaseAdmin
    .from("push_subscriptions")
    .upsert({ endpoint, keys }, { onConflict: "endpoint" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// Supprimer un abonnement push (réservé à la PWA Mimi).
export async function DELETE(req: NextRequest) {
  const auth = await checkMimiPin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json().catch(() => null);
  const endpoint = body?.endpoint;
  if (typeof endpoint !== "string" || !endpoint || endpoint.length > 2048) {
    return NextResponse.json({ error: "Endpoint manquant" }, { status: 400 });
  }

  await supabaseAdmin
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint);
  return NextResponse.json({ success: true });
}
