export const revalidate = 3600;

import type { Metadata } from "next";
import Image from "next/image";

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

const images = [
  {
    src: "/images/coiffure-1.jpg",
    alt: "Box braids knotless réalisation Salon Mimi Marrakech — tresses africaines Place Jamaa El Fna",
  },
  {
    src: "/images/hero-salon.jpg",
    alt: "Salon Mimi Marrakech — coiffeuse africaine spécialiste tresses, Médina Place Jamaa El Fna",
  },
];

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

const emptyMessages: Record<string, string> = {
  fr: "Galerie bientôt disponible",
  en: "Gallery coming soon",
  es: "Galería próximamente",
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
      <div className="max-w-6xl mx-auto px-4 py-16">
        {images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((img) => (
              <div
                key={img.src}
                className="relative aspect-square rounded-2xl overflow-hidden bg-gray-200"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-20">
            {emptyMessages[displayLocale] ?? emptyMessages.fr}
          </p>
        )}
      </div>
    </div>
  );
}
