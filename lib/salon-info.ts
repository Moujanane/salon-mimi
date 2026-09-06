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

import { services, packages } from "./services-data";

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

/** Libellé de catégorie pour le champ `serviceType` de chaque Service. */
const CATEGORY_LABEL: Record<"tresses" | "locks" | "soins", string> = {
  tresses: "Tresses africaines",
  locks: "Locks et twists",
  soins: "Soins capillaires",
};

const RESERVATION_URL = `${SALON.url}/fr/reservation`;

/**
 * Catalogue d'offres schema.org (OfferCatalog) : une Offer par prestation, avec
 * un prix numérique exact. Permet à un agent de recherche de citer le prix
 * d'une coiffure précise ("les box braids medium coûtent 550 MAD").
 *
 * Source : `lib/services-data.ts` (14 services + 2 packages). Ces mêmes prix
 * alimentent déjà la page d'accueil et les carrousels, donc le catalogue reste
 * cohérent avec ce que le visiteur voit.
 *
 * ATTENTION : les prix éditables par Mimi dans /admin/settings (clés
 * `settings.price_*`) sont un système SÉPARÉ et approximatif ("dès 150 MAD").
 * Si un prix change ici, le mettre à jour aussi dans `services-data.ts`.
 *
 * Contenu en français uniquement : le reste du JSON-LD de layout.tsx l'est
 * aussi, et schema.org n'a pas de mécanisme i18n propre.
 */
export function offerCatalogLd() {
  const serviceOffers = services.map((s) => ({
    "@type": "Offer" as const,
    itemOffered: {
      "@type": "Service" as const,
      name: s.nameFr,
      serviceType: CATEGORY_LABEL[s.category],
      ...(s.descFr ? { description: s.descFr } : {}),
    },
    price: String(s.priceMad),
    priceCurrency: SALON.priceRange.currency,
    availability: "https://schema.org/InStock",
    url: RESERVATION_URL,
  }));

  const packageOffers = packages.map((p) => ({
    "@type": "Offer" as const,
    itemOffered: {
      "@type": "Service" as const,
      name: p.nameFr,
      serviceType: "Forfait",
      description: p.descFr,
    },
    price: String(p.priceMad),
    priceCurrency: SALON.priceRange.currency,
    availability: "https://schema.org/InStock",
    url: RESERVATION_URL,
  }));

  return {
    "@type": "OfferCatalog" as const,
    name: "Prestations Salon Mimi",
    itemListElement: [...serviceOffers, ...packageOffers],
  };
}
