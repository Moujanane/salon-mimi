// lib/page-content.ts
//
// Contenus ajoutés pour le SEO : introduction de l'accueil, « L'essentiel » de
// la page À propos, infos pratiques du Contact, styles de la Galerie.
//
// Règle : tout est calculé depuis le catalogue (lib/services-data.ts) et les
// constantes du salon (lib/salon-info.ts). Aucun prix ni coordonnée n'est écrit
// en dur ici, donc rien ne peut diverger du reste du site.
// Les horaires n'y figurent volontairement pas tant qu'ils ne sont pas
// confirmés (le balisage Lun-Sam 9h-19h et le texte visible 9h-23h divergent).
//
// Seuls les faits déjà publiés sur le site sont repris (ex. "plus de 10 ans à
// Marrakech", page À propos). Rien n'est inventé.

import { services, packages } from "./services-data";
import { SALON } from "./salon-info";

export type ContentLocale = "fr" | "en" | "es";

function toLocale(locale: string): ContentLocale {
  return locale === "en" || locale === "es" ? locale : "fr";
}

const all = [...services, ...packages];
const MIN = Math.min(...all.map((i) => i.priceMad));
const MAX = Math.max(...all.map((i) => i.priceMad));
const N = all.length;

function price(id: string): number {
  const s = services.find((x) => x.id === id);
  if (!s) throw new Error(`Service introuvable dans le catalogue : ${id}`);
  return s.priceMad;
}

function duration(id: string, l: ContentLocale): string {
  const s = services.find((x) => x.id === id);
  if (!s) throw new Error(`Service introuvable dans le catalogue : ${id}`);
  return l === "en" ? s.durationEn : l === "es" ? s.durationEs : s.durationFr;
}

function name(
  s: { nameFr: string; nameEn: string; nameEs: string },
  l: ContentLocale,
): string {
  return l === "en" ? s.nameEn : l === "es" ? s.nameEs : s.nameFr;
}

const A = SALON.address;

/** Paragraphe « réponse directe » de l'accueil (80-110 mots). */
export function homeIntro(locale: string): { title: string; text: string } {
  const l = toLocale(locale);
  const box = price("box-braids-medium");
  const knotless = price("knotless-braids");
  const cornrows = price("cornrows");

  if (l === "en") {
    return {
      title: "African braiding salon in Marrakech",
      text: `Salon Mimi is an Afro hair salon on Jamaa El Fna Square, in the Medina of Marrakech. Mimi, an Ivorian hairstylist in Marrakech for over 10 years, does African braids, rasta braids, box braids, knotless braids, locs and cornrows. ${N} services and packages, from ${MIN} to ${MAX} MAD: medium box braids ${box} MAD, knotless ${knotless} MAD, full-head cornrows ${cornrows} MAD. Book online, confirmation by WhatsApp.`,
    };
  }
  if (l === "es") {
    return {
      title: "Salón de trenzas africanas en Marrakech",
      text: `Salon Mimi es un salón de peluquería afro en la plaza Jamaa El Fna, en la Medina de Marrakech. Mimi, peluquera marfileña en Marrakech desde hace más de 10 años, hace trenzas africanas, rasta, box braids, knotless braids, rastas y cornrows. ${N} servicios y paquetes, de ${MIN} a ${MAX} MAD: box braids medianas ${box} MAD, knotless ${knotless} MAD, cornrows cabeza completa ${cornrows} MAD. Reserva en línea, confirmación por WhatsApp.`,
    };
  }
  return {
    title: "Salon de tresses africaines à Marrakech",
    text: `Salon Mimi est un salon de coiffure afro Place Jamaa El Fna, dans la Médina de Marrakech. Mimi, coiffeuse ivoirienne à Marrakech depuis plus de 10 ans, réalise tresses africaines, tresses rasta, box braids, knotless braids, locks et cornrows. ${N} prestations et forfaits, de ${MIN} à ${MAX} MAD : box braids medium ${box} MAD, knotless ${knotless} MAD, cornrows tête entière ${cornrows} MAD. Réservation en ligne, confirmation par WhatsApp.`,
  };
}

type Facts = { title: string; items: string[] };

function addressLine(l: ContentLocale): string {
  const district = A.neighborhood;
  if (l === "en") {
    return `Address: ${A.streetAddress}, ${district} of ${A.addressLocality}, ${A.postalCode}, Morocco`;
  }
  if (l === "es") {
    return `Dirección: ${A.streetAddress}, ${district} de ${A.addressLocality}, ${A.postalCode}, Marruecos`;
  }
  return `Adresse : ${A.streetAddress}, ${district} de ${A.addressLocality}, ${A.postalCode}, Maroc`;
}

/** Liste « L'essentiel » de la page À propos. */
export function aboutFacts(locale: string): Facts {
  const l = toLocale(locale);
  const dMin = duration("cornrows", l);
  const dMax = duration("depart-locks", l);

  if (l === "en") {
    return {
      title: "At a glance",
      items: [
        "Specialities: African braids, rasta braids, box braids, knotless braids, locs, cornrows",
        "Experience: over 10 years in Marrakech",
        `Prices: from ${MIN} to ${MAX} MAD (${N} services and packages)`,
        `Duration: from ${dMin} (full-head cornrows) to ${dMax} (starter locs)`,
        addressLine(l),
        "Languages: French, English, Spanish",
        `Booking: online or on WhatsApp at ${SALON.telephone}`,
      ],
    };
  }
  if (l === "es") {
    return {
      title: "De un vistazo",
      items: [
        "Especialidades: trenzas africanas, trenzas rasta, box braids, knotless braids, rastas, cornrows",
        "Experiencia: más de 10 años en Marrakech",
        `Precios: de ${MIN} a ${MAX} MAD (${N} servicios y paquetes)`,
        `Duración: de ${dMin} (cornrows de cabeza completa) a ${dMax} (inicio de rastas)`,
        addressLine(l),
        "Idiomas: francés, inglés, español",
        `Reserva: en línea o por WhatsApp al ${SALON.telephone}`,
      ],
    };
  }
  return {
    title: "L'essentiel en un coup d'œil",
    items: [
      "Spécialités : tresses africaines, tresses rasta, box braids, knotless braids, locks, cornrows",
      "Expérience : plus de 10 ans à Marrakech",
      `Tarifs : de ${MIN} à ${MAX} MAD (${N} prestations et forfaits)`,
      `Durée : de ${dMin} (cornrows tête entière) à ${dMax} (départ de locks)`,
      addressLine(l),
      "Langues : français, anglais, espagnol",
      `Réservation : en ligne ou par WhatsApp au ${SALON.telephone}`,
    ],
  };
}

/** Liste « Informations pratiques » de la page Contact (sans horaires). */
export function contactFacts(locale: string): Facts {
  const l = toLocale(locale);

  if (l === "en") {
    return {
      title: "Practical information",
      items: [
        addressLine(l),
        `WhatsApp and phone: ${SALON.telephone}`,
        "Languages spoken: French, English, Spanish",
        "Booking: online, with confirmation by WhatsApp",
        `Prices: from ${MIN} to ${MAX} MAD depending on the service`,
      ],
    };
  }
  if (l === "es") {
    return {
      title: "Información práctica",
      items: [
        addressLine(l),
        `WhatsApp y teléfono: ${SALON.telephone}`,
        "Idiomas: francés, inglés, español",
        "Reserva: en línea, con confirmación por WhatsApp",
        `Precios: de ${MIN} a ${MAX} MAD según el servicio`,
      ],
    };
  }
  return {
    title: "Informations pratiques",
    items: [
      addressLine(l),
      `WhatsApp et téléphone : ${SALON.telephone}`,
      "Langues parlées : français, anglais, espagnol",
      "Réservation : en ligne, avec confirmation par WhatsApp",
      `Tarifs : de ${MIN} à ${MAX} MAD selon la prestation`,
    ],
  };
}

const GALLERY_STYLE_IDS = [
  "box-braids-medium",
  "knotless-braids",
  "boho-braids",
  "fulani-braids",
  "cornrows",
  "mini-braids-enfant",
  "depart-locks",
  "faux-locks",
  "marley-twists",
];

/** Liste de styles (avec lien de réservation) pour la page Galerie. */
export function galleryStyles(locale: string): {
  title: string;
  intro: string;
  items: { label: string; href: string }[];
} {
  const l = toLocale(locale);
  const items = GALLERY_STYLE_IDS.map((id) => {
    const s = services.find((x) => x.id === id);
    if (!s) throw new Error(`Service introuvable dans le catalogue : ${id}`);
    return {
      label: `${name(s, l)} : ${s.priceMad} MAD`,
      href: `/${l}/reservation?service=${id}`,
    };
  });

  if (l === "en") {
    return {
      title: "Braid styles we do at the salon",
      intro: "Each style can be booked directly, with its price:",
      items,
    };
  }
  if (l === "es") {
    return {
      title: "Estilos de trenzas que hacemos en el salón",
      intro: "Cada estilo se puede reservar directamente, con su precio:",
      items,
    };
  }
  return {
    title: "Styles de tresses réalisés au salon",
    intro: "Chaque style peut être réservé directement, avec son prix :",
    items,
  };
}
