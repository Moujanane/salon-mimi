import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { checkMimiPin } from "@/lib/mimiAuth";
import { validateSettingsUpdates } from "@/lib/validation";

const ALLOWED_KEYS = [
  "whatsapp_number",
  "price_tresses_africaines",
  "price_tresses_et_nattes",
  "price_box_braids",
  "price_tresses_fulani",
  "price_tresses_boho",
  "price_locks_dreads",
  "price_cheveux_attaches",
  "price_perruques_tissage",
  "price_colorations",
  "price_ongles_soins_epilation",
];

export async function GET(req: NextRequest) {
  const auth = await checkMimiPin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { data, error } = await supabaseAdmin
    .from("settings")
    .select("key, value");
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  const settings = Object.fromEntries(
    data
      .filter((r) => ALLOWED_KEYS.includes(r.key))
      .map((r) => [r.key, r.value]),
  );
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const auth = await checkMimiPin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const body = await req.json().catch(() => null);
  // Valeurs vérifiées côté serveur (lib/validation.ts). Tout ou rien.
  const parsed = validateSettingsUpdates(body, ALLOWED_KEYS);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  for (const [key, value] of parsed.value) {
    const { error } = await supabaseAdmin
      .from("settings")
      .upsert({ key, value }, { onConflict: "key" });
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
