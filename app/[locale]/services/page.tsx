import type { Metadata } from "next";
import ServicesPageClient from "@/components/sections/ServicesPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    fr: "Tresses africaines Marrakech — Knotless, Box braids, Locks | Salon Mimi",
    en: "African Braids Marrakech — Knotless, Box braids, Locks | Salon Mimi",
    es: "Trenzas africanas Marrakech — Knotless, Box braids, Locks | Salon Mimi",
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
      canonical: `https://salonmimi-marrakech.com/${locale}/services`,
      languages: {
        fr: "https://salonmimi-marrakech.com/fr/services",
        en: "https://salonmimi-marrakech.com/en/services",
        es: "https://salonmimi-marrakech.com/es/services",
        "x-default": "https://salonmimi-marrakech.com/fr/services",
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
  return <ServicesPageClient locale={locale} />;
}
