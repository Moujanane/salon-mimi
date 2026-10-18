// lib/faq.ts
//
// FAQ de l'accueil, FR/EN/ES. Source unique pour :
//  - la section visible (components/sections/FaqSection.tsx)
//  - le balisage JSON-LD FAQPage (app/[locale]/page.tsx)
// Les règles de Google exigent que le contenu balisé soit visible : les deux
// viennent donc de ces mêmes textes. Les prix viennent du catalogue
// (lib/salon-info.ts -> faqTarifsAnswer).

import { faqTarifsAnswer } from "./salon-info";

export type FaqLocale = "fr" | "en" | "es";
export type FaqItem = { question: string; answer: string };

export const FAQ_TITLE: Record<FaqLocale, string> = {
  fr: "Questions fréquentes",
  en: "Frequently asked questions",
  es: "Preguntas frecuentes",
};

function toLocale(locale: string): FaqLocale {
  return locale === "en" || locale === "es" ? locale : "fr";
}

export function getFaq(locale: string): FaqItem[] {
  const l = toLocale(locale);

  const content: Record<FaqLocale, FaqItem[]> = {
    fr: [
      {
        question: "Où se trouve le salon Mimi à Marrakech ?",
        answer:
          "Le salon Mimi est situé Place Jamaa El Fna, dans la Médina de Marrakech.",
      },
      {
        question: "Quels services de tresses propose le salon Mimi ?",
        answer:
          "Le salon Mimi propose des tresses africaines, tresses rasta, box braids, knotless braids, tresses Fulani, tresses Boho, cornrows, locks et dreads, faux locks, Marley twists, cheveux attachés, perruques et tissage. Il coiffe aussi les enfants.",
      },
      {
        question: "Comment réserver au salon Mimi Marrakech ?",
        answer:
          "Vous pouvez réserver en ligne directement sur mimi-coiffure.com ou contacter le salon par WhatsApp.",
      },
      {
        question: "Quels sont les tarifs du salon Mimi Marrakech ?",
        answer: faqTarifsAnswer("fr"),
      },
    ],
    en: [
      {
        question: "Where is Salon Mimi in Marrakech?",
        answer:
          "Salon Mimi is on Jamaa El Fna Square, in the Medina of Marrakech.",
      },
      {
        question: "Which braiding services does Salon Mimi offer?",
        answer:
          "Salon Mimi offers African braids, rasta braids, box braids, knotless braids, Fulani braids, boho braids, cornrows, locs and dreads, faux locs, Marley twists, updos, wigs and weaves. It also styles children's hair.",
      },
      {
        question: "How do I book at Salon Mimi Marrakech?",
        answer:
          "You can book online at mimi-coiffure.com or contact the salon on WhatsApp.",
      },
      {
        question: "How much does Salon Mimi Marrakech charge?",
        answer: faqTarifsAnswer("en"),
      },
    ],
    es: [
      {
        question: "¿Dónde está el salón Mimi en Marrakech?",
        answer:
          "El salón Mimi está en la plaza Jamaa El Fna, en la Medina de Marrakech.",
      },
      {
        question: "¿Qué servicios de trenzas ofrece el salón Mimi?",
        answer:
          "El salón Mimi ofrece trenzas africanas, trenzas rasta, box braids, knotless braids, trenzas Fulani, trenzas boho, cornrows, rastas y dreads, faux locs, Marley twists, recogidos, pelucas y tejidos. También peina a niños y niñas.",
      },
      {
        question: "¿Cómo reservar en el salón Mimi Marrakech?",
        answer:
          "Puedes reservar en línea en mimi-coiffure.com o contactar con el salón por WhatsApp.",
      },
      {
        question: "¿Cuáles son los precios del salón Mimi Marrakech?",
        answer: faqTarifsAnswer("es"),
      },
    ],
  };

  return content[l];
}

/** Balisage schema.org FAQPage, construit depuis les textes visibles. */
export function faqJsonLd(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage" as const,
    mainEntity: getFaq(locale).map((item) => ({
      "@type": "Question" as const,
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer" as const,
        text: item.answer,
      },
    })),
  };
}
