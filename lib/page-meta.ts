// lib/page-meta.ts
//
// Titres et meta descriptions des pages principales, FR/EN/ES. Source unique :
// les pages (`generateMetadata`) importent d'ici, et `lib/page-meta.test.ts`
// vérifie les longueurs (title <= 60, description <= 160) pour éviter la
// troncature dans Google.
//
// Exception volontaire : le title de l'accueil (64 car. en FR) n'est PAS
// raccourci. Son dernier changement (rapprocher "Mimi" et "Marrakech", handoff
// §42, octobre 2026) est en cours de mesure ; le modifier fausserait la mesure.
// Seule la fin "| Jamaa El Fna" est tronquée. À revoir après le rapport.

export type MetaLocale = "fr" | "en" | "es";
export type PageKey =
  "home" | "services" | "reservation" | "aPropos" | "galerie";

type Meta = {
  titles: Record<MetaLocale, string>;
  descriptions: Record<MetaLocale, string>;
};

export const PAGE_META: Record<PageKey, Meta> = {
  home: {
    titles: {
      fr: "Salon Mimi Marrakech — Tresses Rasta & Africaines | Jamaa El Fna",
      en: "Salon Mimi Marrakech — Rasta & African Braids | Jamaa El Fna",
      es: "Salon Mimi Marrakech — Trenzas Rasta y Africanas | Jamaa El Fna",
    },
    descriptions: {
      fr: "Salon Mimi, salon de coiffure Rasta et Africaine à Marrakech, Place Jamaa El Fna. Tresses africaines, box braids, locks, knotless. Réservez en ligne.",
      en: "Salon Mimi, Rasta and African hair salon in Marrakech, Jamaa El Fna Square. African braids, box braids, locks, knotless. Book online.",
      es: "Salon Mimi, salón de peluquería Rasta y Africano en Marrakech, Plaza Jamaa El Fna. Trenzas africanas, box braids, locks, knotless. Reserva en línea.",
    },
  },
  services: {
    titles: {
      fr: "Tresses africaines Marrakech — Box braids, Knotless, Locks",
      en: "African Braids Marrakech — Box braids, Knotless, Locks",
      es: "Trenzas africanas Marrakech — Box braids, Knotless, Locks",
    },
    descriptions: {
      fr: "Tous les services du Salon Mimi : tresses africaines, knotless, box braids, locks, fulani. Dès 150 MAD. Réservation en ligne, Place Jamaa El Fna, Marrakech.",
      en: "All Salon Mimi services: African braids, knotless, box braids, locks, fulani. From 150 MAD. Book online, Jamaa El Fna Square, Marrakech.",
      es: "Todos los servicios de Salon Mimi: trenzas africanas, knotless, box braids, locks, fulani. Desde 150 MAD. Reserva online, Plaza Jamaa El Fna, Marrakech.",
    },
  },
  reservation: {
    titles: {
      fr: "Réserver tresses africaines Marrakech — Salon Mimi",
      en: "Book African braids Marrakech — Salon Mimi",
      es: "Reservar trenzas africanas Marrakech — Salon Mimi",
    },
    descriptions: {
      fr: "Prenez rendez-vous en ligne au Salon Mimi Marrakech. Tresses africaines, knotless braids, box braids, locks. Confirmation par WhatsApp. Place Jamaa El Fna.",
      en: "Book online at Salon Mimi Marrakech. African braids, knotless braids, box braids, locks. WhatsApp confirmation. Jamaa El Fna Square.",
      es: "Reserva online en Salon Mimi Marrakech. Trenzas africanas, knotless braids, box braids, locks. Confirmación por WhatsApp. Plaza Jamaa El Fna.",
    },
  },
  aPropos: {
    titles: {
      fr: "Salon Mimi — Coiffeuse africaine Marrakech Jamaa El Fna",
      en: "Salon Mimi — African hairstylist Marrakech Jamaa El Fna",
      es: "Salon Mimi — Peluquera africana Marrakech Jamaa El Fna",
    },
    descriptions: {
      fr: "Mimi, coiffeuse ivoirienne à Marrakech, spécialiste des tresses africaines, locks et knotless. Produits naturels : argan, karité, henné. Place Jamaa El Fna.",
      en: "Mimi, Ivorian hairstylist in Marrakech, specialist in African braids, locks and knotless. Natural products: argan, shea, henna. Jamaa El Fna Square.",
      es: "Mimi, peluquera marfileña en Marrakech, especialista en trenzas africanas, locks y knotless. Productos naturales: argán, karité, henna. Plaza Jamaa El Fna.",
    },
  },
  galerie: {
    titles: {
      fr: "Galerie — Tresses africaines & Locks Marrakech | Salon Mimi",
      en: "Gallery — African braids & Locks Marrakech | Salon Mimi",
      es: "Galería — Trenzas africanas y Locks Marrakech | Salon Mimi",
    },
    descriptions: {
      fr: "Les réalisations du Salon Mimi Marrakech : tresses africaines, knotless, box braids, locks, tresses rasta. Photos avant/après, Place Jamaa El Fna.",
      en: "Explore Salon Mimi Marrakech's work: African braids, knotless, box braids, locks, rasta braids. Before/after photos, Jamaa El Fna Square.",
      es: "Las creaciones del Salon Mimi Marrakech: trenzas africanas, knotless, box braids, locks, trenzas rasta. Fotos antes/después, Plaza Jamaa El Fna.",
    },
  },
};

/** Title + description d'une page, avec repli sur le français si langue inconnue. */
export function metaFor(page: PageKey, locale: string) {
  const l: MetaLocale = locale === "en" || locale === "es" ? locale : "fr";
  return {
    title: PAGE_META[page].titles[l],
    description: PAGE_META[page].descriptions[l],
  };
}
