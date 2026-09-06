// lib/salon-info.ts
//
// Source unique de vérité pour l'identité du salon : nom, adresse, géoloc,
// fourchette de prix, identifiant d'entité.
//
// Objectif : que le JSON-LD, les mentions légales, les emails et le contenu
// visible affichent TOUS les mêmes valeurs. Un agent de recherche (AI Overviews,
// ChatGPT, Perplexity) recoupe ces informations entre le site et Google Business
// Profile ; la moindre divergence (orthographe de l'adresse, fourchette de prix
// contradictoire, note périmée) dégrade la confiance accordée à la source.
//
// Règle : ne jamais écrire une adresse ou une fourchette de prix en dur ailleurs.
// Importer depuis ce fichier.

/**
 * Orthographe unique de la place, alignée sur le contenu visible du site et sur
 * la fiche Google Business Profile.
 *
 * Ne PAS confondre avec l'identifiant Google Maps `Jemaa%20el-Fna` présent dans
 * les URLs `google.com/maps/embed` : celui-là est imposé par Google et doit
 * rester tel quel.
 */
export const SALON = {
  legalName: "Salon Mimi",
  url: "https://mimi-coiffure.com",
  /** Identifiant d'entité stable, référencé par `@id` dans le JSON-LD. */
  id: "https://mimi-coiffure.com/#salon",

  telephone: "+212710388204",

  address: {
    streetAddress: "Place Jamaa El Fna",
    addressLocality: "Marrakech",
    postalCode: "40000",
    /** ISO 3166-1 alpha-2. */
    addressCountry: "MA",
    /** Repère de quartier, utile en texte pour les moteurs et les humains. */
    neighborhood: "Médina",
  },

  geo: {
    latitude: 31.6258,
    longitude: -7.9892,
  },

  /**
   * Fourchette de prix réelle, dérivée de `lib/services-data.ts` :
   *  - min : soin argan seul (150 MAD)
   *  - max : package Faux Locks + bijoux perles (950 MAD)
   * À garder synchronisée si les prix de `services-data.ts` changent.
   */
  priceRange: {
    min: 150,
    max: 950,
    currency: "MAD",
  },

  /**
   * Valeurs de repli pour l'AggregateRating quand l'API Google Reviews ne
   * répond pas. Chiffres réels relevés sur le dashboard Google Business
   * (septembre 2026). À actualiser quand le nombre d'avis évolue nettement.
   */
  ratingFallback: {
    ratingValue: 4.5,
    reviewCount: 6,
  },
} as const;

/** Fourchette de prix formatée pour le champ `priceRange` de schema.org. */
export function priceRangeLabel(): string {
  const { min, max, currency } = SALON.priceRange;
  return `${min}–${max} ${currency}`;
}

/** Adresse postale schema.org (PostalAddress), sans le repère de quartier. */
export function postalAddressLd() {
  return {
    "@type": "PostalAddress" as const,
    streetAddress: SALON.address.streetAddress,
    addressLocality: SALON.address.addressLocality,
    postalCode: SALON.address.postalCode,
    addressCountry: SALON.address.addressCountry,
  };
}
