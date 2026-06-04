import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const PIN = process.env.MIMI_PIN ?? "1234";

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
  "price_featured_box_braids_medium",
  "price_featured_knotless_braids",
  "price_featured_boho_braids",
  "price_featured_cornrows",
];

function checkPin(req: NextRequest): boolean {
  const pin =
    req.nextUrl.searchParams.get("pin") ?? req.headers.get("x-mimi-pin");
  return pin === PIN;
}

export async function GET(req: NextRequest) {
  if (!checkPin(req)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
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
  if (!checkPin(req)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const body = await req.json();
  const updates = Object.entries(body).filter(([key]) =>
    ALLOWED_KEYS.includes(key),
  );
  if (updates.length === 0) {
    return NextResponse.json({ error: "Aucune clé valide" }, { status: 400 });
  }
  for (const [key, value] of updates) {
    const { error } = await supabaseAdmin
      .from("settings")
      .upsert({ key, value: String(value) }, { onConflict: "key" });
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
