// Rendu à la demande, jamais pré-rendu ni mis en cache au niveau page.
// Historique : la version `revalidate = 3600` faisait pré-rendre la page au
// build de Railway ; quand ce pré-rendu échouait (fetch Supabase indisponible
// pendant le build), Next mettait en cache un 404 pour toute la fenêtre de
// revalidation (`x-nextjs-cache: HIT` sur une 404). Le fetch des médias garde
// malgré tout son propre cache : `getGalleryItems()` utilise `unstable_cache`
// (revalidate 1 h, tag `gallery-items`), donc pas d'appels Supabase répétés.
export const dynamic = "force-dynamic";
export const fetchCache = "default-no-store";

import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { setRequestLocale } from "next-intl/server";
import GalerieClient from "@/components/sections/GalerieClient";
import GalleryMasonry from "@/components/sections/GalleryMasonry";
import { getGalleryItems } from "@/lib/gallery";

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
      canonical: `https://mimi-coiffure.com/${locale}/galerie`,
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
  fr: "Galerie photos — Tresses africaines Marrakech",
  en: "Photo gallery — African braids Marrakech",
  es: "Galería de fotos — Trenzas africanas Marrakech",
};

const subtitles: Record<string, string> = {
  fr: "Nos réalisations",
  en: "Our work",
  es: "Nuestras creaciones",
};

const indexText: Record<string, string> = {
  fr: "Tresses africaines, box braids, knotless braids, cornrows, locks, tresses rasta et coiffures enfants réalisées au Salon Mimi, Place Jamaa El Fna, Marrakech.",
  en: "African braids, box braids, knotless braids, cornrows, locks, rasta braids and children's styles done at Salon Mimi, Jamaa El Fna Square, Marrakech.",
  es: "Trenzas africanas, box braids, knotless braids, cornrows, locks, trenzas rasta y peinados infantiles realizados en el Salon Mimi, Plaza Jamaa El Fna, Marrakech.",
};

const GALLERY_DYNAMIC = process.env.NEXT_PUBLIC_GALLERY_DYNAMIC === "true";

export default async function GaleriePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  noStore();
  const { locale } = await params;
  setRequestLocale(locale);
  const displayLocale = locale || "fr";

  const items = GALLERY_DYNAMIC ? await getGalleryItems() : [];

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
      <div className="max-w-2xl mx-auto px-4 pt-10 text-center">
        <p className="text-brun/60 text-sm leading-relaxed">
          {indexText[displayLocale] ?? indexText.fr}
        </p>
      </div>
      {GALLERY_DYNAMIC ? (
        <GalleryMasonry items={items} />
      ) : (
        <GalerieClient locale={displayLocale} />
      )}
    </div>
  );
}
