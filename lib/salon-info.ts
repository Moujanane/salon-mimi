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

  /**
   * Langues parlées au salon. Utilisé pour `knowsLanguage` (BCP 47) — signale
   * à un agent de recherche que la clientèle touristique est prise en charge.
   */
  languages: ["fr", "en", "es"],

  /**
   * Date de la dernière révision des informations du salon (adresse, horaires,
   * prestations, tarifs). Alimente `dateModified` dans le JSON-LD — signal de
   * fraîcheur pour les moteurs génératifs.
   * À bumper à la main quand une de ces infos change. Format YYYY-MM-DD.
   */
  lastReviewed: "2026-09-06",
} as const;

/** Fourchette de prix formatée pour le champ `priceRange` de schema.org. */
export function priceRangeLabel(): string {
  const { min, max, currency } = SALON.priceRange;
  return `${min}–${max} ${currency}`;
}

/**
 * Réponse FAQ « Quels sont les tarifs ? » (français), calculée depuis le
 * catalogue pour ne jamais diverger des prix affichés ni du JSON-LD.
 */
export function faqTarifsAnswer(locale: string): string {
  const all = [...services, ...packages];
  const cheapest = all.reduce((a, b) => (b.priceMad < a.priceMad ? b : a));
  const priciest = all.reduce((a, b) => (b.priceMad > a.priceMad ? b : a));
  const price = (id: string) => {
    const item = services.find((s) => s.id === id);
    if (!item) throw new Error(`Service introuvable dans le catalogue : ${id}`);
    return item.priceMad;
  };
  const box = price("box-braids-medium");
  const knotless = price("knotless-braids");
  const cornrows = price("cornrows");
  const locks = price("depart-locks");

  if (locale === "en") {
    return (
      `Prices range from ${cheapest.priceMad} MAD (${cheapest.nameEn}) to ${priciest.priceMad} MAD (${priciest.nameEn}). ` +
      `Medium box braids are ${box} MAD, knotless braids ${knotless} MAD, full-head cornrows ${cornrows} MAD and starter locs ${locks} MAD.`
    );
  }
  if (locale === "es") {
    return (
      `Los precios van de ${cheapest.priceMad} MAD (${cheapest.nameEs}) a ${priciest.priceMad} MAD (${priciest.nameEs}). ` +
      `Las box braids medianas cuestan ${box} MAD, las knotless braids ${knotless} MAD, los cornrows de cabeza completa ${cornrows} MAD y el inicio de rastas ${locks} MAD.`
    );
  }
  return (
    `Les tarifs vont de ${cheapest.priceMad} MAD (${cheapest.nameFr}) à ${priciest.priceMad} MAD (${priciest.nameFr}). ` +
    `Les box braids medium sont à ${box} MAD, les knotless braids à ${knotless} MAD, ` +
    `les cornrows tête entière à ${cornrows} MAD, le départ de locks à ${locks} MAD.`
  );
}

/** Version française, conservée pour les tests existants. */
export function faqTarifsAnswerFr(): string {
  return faqTarifsAnswer("fr");
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
 * d'une coiffure précise ("les box braids medium coûtent 500 MAD").
 *
 * Source : `lib/services-data.ts` (14 services + 2 packages). Ces mêmes prix
 * alimentent la page d'accueil (cartes « Services vedettes »), les carrousels
 * et la réponse FAQ « tarifs » (`faqTarifsAnswerFr`), donc tout reste cohérent.
 *
 * ATTENTION : les prix éditables par Mimi dans /admin/settings (clés
 * `settings.price_*`) sont un système SÉPARÉ et approximatif ("dès 150 MAD").
 * Ils ne pilotent PAS les cartes vedettes de l'accueil. Pour changer un prix
 * précis, modifier `services-data.ts` (MAD et EUR, taux ~10,6) puis lancer
 * `npm run test:unit`.
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

/** Zone desservie schema.org (City). Remplace un simple string "Marrakech". */
export function areaServedLd() {
  return {
    "@type": "City" as const,
    name: SALON.address.addressLocality,
  };
}

/**
 * Action de réservation schema.org (ReserveAction) : pointe explicitement vers
 * la page de prise de rendez-vous. Ne crée PAS de réservation automatique — le
 * flux reste formulaire puis confirmation WhatsApp. C'est un pointeur normalisé
 * qu'un agent peut suivre pour amener l'utilisateur au bon endroit.
 */
export function reserveActionLd() {
  return {
    "@type": "ReserveAction" as const,
    target: {
      "@type": "EntryPoint" as const,
      urlTemplate: RESERVATION_URL,
      actionPlatform: [
        "http://schema.org/DesktopWebPlatform",
        "http://schema.org/MobileWebPlatform",
      ],
    },
    result: {
      "@type": "Reservation" as const,
      name: "Rendez-vous au Salon Mimi",
    },
  };
}
