// lib/slug.ts
//
// Helpers pour l'admin galerie :
//  - slugify : nom de fichier sûr pour Supabase Storage (pas d'accent, pas
//    d'espace, pas de séparateur de chemin)
//  - storagePathFromUrl : chemin dans le bucket "gallery" à partir d'une URL
//    publique Supabase (pour supprimer le fichier)

/**
 * Transforme un nom de fichier arbitraire en slug ASCII sûr, sans extension.
 * "Ma Photo Été (2).JPG" -> "ma-photo-ete-2"
 */
export function slugify(name: string): string {
  const withoutExt = name.replace(/\.[^.]+$/, "");
  return (
    withoutExt
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "") // enlève les diacritiques
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "media"
  );
}

/**
 * Extrait le chemin relatif dans le bucket "gallery" à partir d'une URL
 * publique. Retourne null si l'URL n'a pas le format attendu.
 * ".../storage/v1/object/public/gallery/photos/x.jpg" -> "photos/x.jpg"
 */
export function storagePathFromUrl(url: string): string | null {
  const marker = "/storage/v1/object/public/gallery/";
  const i = url.indexOf(marker);
  if (i === -1) return null;
  return url.slice(i + marker.length) || null;
}
