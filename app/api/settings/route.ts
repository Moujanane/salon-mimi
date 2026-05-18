// app/api/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

async function getAuthUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } },
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("settings")
    .select("key, value");
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const settings = Object.fromEntries(data.map((r) => [r.key, r.value]));
  return NextResponse.json(settings);
}

export async function PATCH(request: NextRequest) {
  const user = await getAuthUser();
  if (!user)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const allowedKeys = [
    "whatsapp_number",
    "notification_email",
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

  const updates = Object.entries(body).filter(([key]) =>
    allowedKeys.includes(key),
  );
  if (updates.length === 0) {
    return NextResponse.json({ error: "Aucune clé valide" }, { status: 400 });
  }

  for (const [key, value] of updates) {
    const { error } = await supabaseAdmin
      .from("settings")
      .upsert(
        { key, value: String(value), updated_at: new Date().toISOString() },
        { onConflict: "key" },
      );
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
