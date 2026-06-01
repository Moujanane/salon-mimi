export const revalidate = 3600;

import type { Metadata } from "next";
import ServicesPageClient from "@/components/sections/ServicesPageClient";
import { getSettings } from "@/lib/settings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    fr: "Tresses africaines Marrakech — Box braids, Knotless, Locks",
    en: "African Braids Marrakech — Box braids, Knotless, Locks",
    es: "Trenzas africanas Marrakech — Box braids, Knotless, Locks",
  };

  const descriptions: Record<string, string> = {
    fr: "Tous les services du Salon Mimi : tresses africaines, knotless braids, box braids, locks, fulani braids. Tarifs dès 150 MAD. Réservation en ligne — Place Jamaa El Fna, Marrakech.",
    en: "All Salon Mimi services: African braids, knotless braids, box braids, locks, fulani braids. From 150 MAD. Book online — Jamaa El Fna, Marrakech.",
    es: "Todos los servicios de Salon Mimi: trenzas africanas, knotless braids, box braids, locks, fulani braids. Desde 150 MAD. Reserva online — Plaza Jamaa El Fna, Marrakech.",
  };

  return {
    title: titles[locale] ?? titles.fr,
    description: descriptions[locale] ?? descriptions.fr,
    alternates: {
      canonical: `https://mimi-coiffure.com/${locale}/services/`,
      languages: {
        fr: "https://mimi-coiffure.com/fr/services/",
        en: "https://mimi-coiffure.com/en/services/",
        es: "https://mimi-coiffure.com/es/services/",
        "x-default": "https://mimi-coiffure.com/fr/services/",
      },
    },
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const settings = await getSettings();

  const prices: Record<string, string> = {
    "tresses-africaines": settings.price_tresses_africaines,
    "tresses-et-nattes": settings.price_tresses_et_nattes,
    "box-braids": settings.price_box_braids,
    "fulani-braids": settings.price_tresses_fulani,
    "boho-braids": settings.price_tresses_boho,
    "locks-dreads": settings.price_locks_dreads,
    "cheveux-attaches": settings.price_cheveux_attaches,
    "perruques-tissage": settings.price_perruques_tissage,
    colorations: settings.price_colorations,
    "ongles-soins-epilation": settings.price_ongles_soins_epilation,
  };

  return <ServicesPageClient locale={locale} prices={prices} />;
}
