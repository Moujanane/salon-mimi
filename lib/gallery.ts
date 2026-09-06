// lib/gallery.ts
//
// Lecture serveur des médias de la galerie publique.
// Modèle identique à lib/settings.ts : client supabase-js avec la
// service_role key, résultat mis en cache par unstable_cache avec le tag
// "gallery-items" (que l'API admin de la Spec 2 invalidera après chaque
// modification).

import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

export type GalleryItem = {
  id: string;
  type: "photo" | "video";
  url: string;
  poster_url: string | null;
  alt: string;
  sort_order: number;
  width: number | null;
  height: number | null;
};

async function fetchGalleryItems(): Promise<GalleryItem[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return [];
  }

  const client = createClient(url, key);
  const { data, error } = await client
    .from("gallery_items")
    .select("id, type, url, poster_url, alt, sort_order, width, height")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error("[gallery] échec de lecture de gallery_items", error);
    return [];
  }

  return data as GalleryItem[];
}

export const getGalleryItems = unstable_cache(
  fetchGalleryItems,
  ["gallery-items"],
  { revalidate: 3600, tags: ["gallery-items"] },
);
