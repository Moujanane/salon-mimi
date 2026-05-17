// lib/settings.ts
import { createClient } from "@supabase/supabase-js";

export type Settings = {
  whatsapp_number: string;
  price_tresses_africaines: string;
  price_tresses_et_nattes: string;
  price_box_braids: string;
  price_tresses_fulani: string;
  price_tresses_boho: string;
  price_locks_dreads: string;
  price_cheveux_attaches: string;
  price_perruques_tissage: string;
  price_colorations: string;
  price_ongles_soins_epilation: string;
};

const DEFAULTS: Settings = {
  whatsapp_number: "+212600000000",
  price_tresses_africaines: "150",
  price_tresses_et_nattes: "80",
  price_box_braids: "200",
  price_tresses_fulani: "180",
  price_tresses_boho: "220",
  price_locks_dreads: "250",
  price_cheveux_attaches: "60",
  price_perruques_tissage: "150",
  price_colorations: "100",
  price_ongles_soins_epilation: "50",
};

export async function getSettings(): Promise<Settings> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error(
      "[getSettings] Variables manquantes — url:",
      !!url,
      "key:",
      !!key,
    );
    return DEFAULTS;
  }

  const client = createClient(url, key);
  const { data, error } = await client.from("settings").select("key, value");

  if (error || !data || data.length === 0) {
    console.error(
      "[getSettings] Erreur ou table vide:",
      error?.message ?? "data.length=" + (data?.length ?? "null"),
    );
    return DEFAULTS;
  }

  const map = Object.fromEntries(data.map((r) => [r.key, r.value]));
  console.log("[getSettings] data:", JSON.stringify(map));
  return map as Settings;
}
