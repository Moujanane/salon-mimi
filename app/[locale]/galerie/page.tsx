export const revalidate = 3600;

import type { Metadata } from "next";
import GalerieClient from "@/components/sections/GalerieClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    fr: "Galerie — Tresses africaines & Locks Marrakech | Salon Mimi",
    en: "Gallery — African braids & Locks Marrakech | Salon Mimi",
    es: "Galería — Trenzas africanas y Locks Marrakech | Salon Mimi",
  };

  const descriptions: Record<string, string> = {
    fr: "Découvrez les réalisations du Salon Mimi Marrakech : tresses africaines, knotless braids, box braids, locks, tresses rasta. Photos avant/après — Place Jamaa El Fna.",
    en: "Explore Salon Mimi Marrakech's work: African braids, knotless braids, box braids, locks, rasta braids. Before/after photos — Jamaa El Fna Square.",
    es: "Descubre las creaciones del Salon Mimi Marrakech: trenzas africanas, knotless braids, box braids, locks, trenzas rasta. Fotos antes/después — Plaza Jamaa El Fna.",
  };

  return {
    title: titles[locale] ?? titles.fr,
    description: descriptions[locale] ?? descriptions.fr,
    alternates: {
      canonical: `https://mimi-coiffure.com/${locale}/galerie/`,
      languages: {
        fr: "https://mimi-coiffure.com/fr/galerie",
        en: "https://mimi-coiffure.com/en/galerie",
        es: "https://mimi-coiffure.com/es/galerie",
        "x-default": "https://mimi-coiffure.com/fr/galerie",
      },
    },
  };
}

const titles: Record<string, string> = {
  fr: "Galerie",
  en: "Gallery",
  es: "Galería",
};

const subtitles: Record<string, string> = {
  fr: "Nos réalisations",
  en: "Our work",
  es: "Nuestras creaciones",
};

export default async function GaleriePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const displayLocale = locale || "fr";

  return (
    <div className="bg-fond min-h-screen">
      <div className="bg-nuit py-16 text-center">
        <h1 className="font-playfair text-5xl text-or">
          {titles[displayLocale] ?? titles.fr}
        </h1>
        <p className="text-white/60 mt-3">
          {subtitles[displayLocale] ?? subtitles.fr}
        </p>
      </div>
      <GalerieClient locale={displayLocale} />
    </div>
  );
}
