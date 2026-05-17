// lib/settings.ts
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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

export async function getSettings(): Promise<Settings> {
  const { data, error } = await supabaseAdmin
    .from("settings")
    .select("key, value");

  if (error || !data) {
    return {
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
  }

  const map = Object.fromEntries(data.map((r) => [r.key, r.value]));
  return map as Settings;
}
