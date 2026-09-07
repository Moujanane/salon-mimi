// lib/gallery-categories.ts
//
// Liste FIXE des catégories de la galerie. Source unique de vérité, utilisée
// par :
//  - l'admin (menu déroulant du formulaire d'ajout + édition par vignette)
//  - les API routes (validation : une valeur hors liste est refusée)
//  - la galerie publique (barre de filtres)
//
// Pour ajouter/retirer une catégorie : modifier CE tableau uniquement.
// Les médias déjà en base avec une catégorie retirée d'ici retombent dans
// « Tout » (traités comme non classés).

export const GALLERY_CATEGORIES = [
  "Tresses africaines",
  "Box braids",
  "Knotless braids",
  "Cornrows",
  "Locks",
  "Tresses rasta",
  "Enfants",
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

/** true si la valeur est une catégorie connue (non vide). */
export function isGalleryCategory(value: unknown): value is GalleryCategory {
  return (
    typeof value === "string" &&
    (GALLERY_CATEGORIES as readonly string[]).includes(value)
  );
}

/**
 * Normalise une entrée pour la base : une catégorie connue, sinon null
 * (chaîne vide, undefined, valeur inconnue → non classé).
 */
export function normalizeCategory(value: unknown): GalleryCategory | null {
  return isGalleryCategory(value) ? value : null;
}
