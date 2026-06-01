// lib/settings.ts
import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

export type Settings = {
  whatsapp_number: string;
  notification_email: string;
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
  price_featured_box_braids_medium: string;
  price_featured_knotless_braids: string;
  price_featured_boho_braids: string;
  price_featured_cornrows: string;
};

const DEFAULTS: Settings = {
  whatsapp_number: "+212600000000",
  notification_email: "",
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
  price_featured_box_braids_medium: "550",
  price_featured_knotless_braids: "700",
  price_featured_boho_braids: "650",
  price_featured_cornrows: "300",
};

async function fetchSettings(): Promise<Settings> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return DEFAULTS;
  }

  const client = createClient(url, key);
  const { data, error } = await client.from("settings").select("key, value");

  if (error || !data || data.length === 0) {
    return DEFAULTS;
  }

  const map = Object.fromEntries(data.map((r) => [r.key, r.value]));
  return { ...DEFAULTS, ...map } as Settings;
}

export const getSettings = unstable_cache(fetchSettings, ["settings"], {
  revalidate: 3600,
  tags: ["settings"],
});
