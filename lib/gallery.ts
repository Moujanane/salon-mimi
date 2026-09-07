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
  category: string | null;
};

// Colonnes lues partout. `category` est optionnelle en base tant que la
// migration Spec 3 n'est pas passée : fetchGalleryItems retente sans elle si
// PostgREST se plaint d'une colonne inconnue (code 42703).
const SELECT_WITH_CATEGORY =
  "id, type, url, poster_url, alt, sort_order, width, height, category";
const SELECT_LEGACY =
  "id, type, url, poster_url, alt, sort_order, width, height";

async function fetchGalleryItems(): Promise<GalleryItem[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return [];
  }

  const client = createClient(url, key);

  const run = (columns: string) =>
    client
      .from("gallery_items")
      .select(columns)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

  let res = await run(SELECT_WITH_CATEGORY);

  // Colonne category encore absente (migration Spec 3 non appliquée) :
  // on relit sans elle et on complète avec category: null.
  if (res.error?.code === "42703") {
    res = await run(SELECT_LEGACY);
  }

  if (res.error || !res.data) {
    console.error("[gallery] échec de lecture de gallery_items", res.error);
    return [];
  }

  return (res.data as unknown as Record<string, unknown>[]).map((row) => ({
    ...row,
    category: (row.category as string | null) ?? null,
  })) as GalleryItem[];
}

export const getGalleryItems = unstable_cache(
  fetchGalleryItems,
  ["gallery-items"],
  { revalidate: 3600, tags: ["gallery-items"] },
);
