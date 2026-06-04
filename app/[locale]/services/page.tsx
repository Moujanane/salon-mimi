export const revalidate = 3600;

import type { Metadata } from "next";
import ServicesPageClient from "@/components/sections/ServicesPageClient";
import { getSettings } from "@/lib/settings";
import Script from "next/script";

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

  const servicesList = [
    {
      name: "Tresses africaines",
      nameEn: "African braids",
      nameEs: "Trenzas africanas",
      price: prices["tresses-africaines"] || "150",
    },
    {
      name: "Tresses et nattes",
      nameEn: "Braids & plaits",
      nameEs: "Trenzas y nattes",
      price: prices["tresses-et-nattes"] || "80",
    },
    {
      name: "Box braids",
      nameEn: "Box braids",
      nameEs: "Box braids",
      price: prices["box-braids"] || "200",
    },
    {
      name: "Tresses Fulani",
      nameEn: "Fulani braids",
      nameEs: "Trenzas Fulani",
      price: prices["fulani-braids"] || "180",
    },
    {
      name: "Tresses Boho",
      nameEn: "Boho braids",
      nameEs: "Trenzas Boho",
      price: prices["boho-braids"] || "220",
    },
    {
      name: "Locks & dreads",
      nameEn: "Locks & dreads",
      nameEs: "Locks & dreads",
      price: prices["locks-dreads"] || "250",
    },
    {
      name: "Cheveux attachés",
      nameEn: "Updos",
      nameEs: "Recogidos",
      price: prices["cheveux-attaches"] || "60",
    },
    {
      name: "Perruques et tissage",
      nameEn: "Wigs & weaves",
      nameEs: "Pelucas y extensiones",
      price: prices["perruques-tissage"] || "150",
    },
    {
      name: "Colorations capillaires",
      nameEn: "Hair colouring",
      nameEs: "Coloración capilar",
      price: prices["colorations"] || "100",
    },
    {
      name: "Ongles, soins & épilation",
      nameEn: "Nails, care & waxing",
      nameEs: "Uñas, cuidados & depilación",
      price: prices["ongles-soins-epilation"] || "50",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name:
      locale === "en"
        ? "Salon Mimi Services"
        : locale === "es"
          ? "Servicios Salon Mimi"
          : "Services Salon Mimi",
    description:
      locale === "en"
        ? "African hair salon services in Marrakech — braids, locks, knotless"
        : locale === "es"
          ? "Servicios de peluquería africana en Marrakech — trenzas, locks, knotless"
          : "Services de coiffure africaine à Marrakech — tresses, locks, knotless",
    url: `https://mimi-coiffure.com/${locale}/services/`,
    itemListElement: servicesList.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: locale === "en" ? s.nameEn : locale === "es" ? s.nameEs : s.name,
        provider: {
          "@type": "HairSalon",
          name: "Salon Mimi",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Place Jemaa el-Fna",
            addressLocality: "Marrakech",
            addressCountry: "MA",
          },
        },
        areaServed: "Marrakech",
        offers: {
          "@type": "Offer",
          price: s.price,
          priceCurrency: "MAD",
          availability: "https://schema.org/InStock",
          url: `https://mimi-coiffure.com/${locale}/reservation/`,
        },
      },
    })),
  };

  return (
    <>
      <Script
        id="services-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ServicesPageClient locale={locale} prices={prices} />
    </>
  );
}
