"use client";
import { useState } from "react";
import Image from "next/image";

type Locale = "fr" | "en" | "es";

interface GallerySection {
  id: string;
  title: Record<Locale, string>;
  desc: Record<Locale, string>;
  photos: { src: string; alt: string }[];
}

const SECTIONS: GallerySection[] = [
  {
    id: "salon",
    title: {
      fr: "Le salon",
      en: "The salon",
      es: "El salón",
    },
    desc: {
      fr: "Notre salon Place Jamaa El Fna, au cœur de la médina de Marrakech.",
      en: "Our salon on Jamaa El Fna Square, in the heart of the Marrakech medina.",
      es: "Nuestro salón en la Plaza Jamaa El Fna, en el corazón de la medina de Marrakech.",
    },
    photos: [
      {
        src: "/images/salon-mimi-1.jpeg",
        alt: "Salon Mimi Marrakech — intérieur salon coiffure africaine",
      },
      {
        src: "/images/salon-mimi-2.jpeg",
        alt: "Salon Mimi Marrakech — ambiance salon tresses africaines",
      },
      {
        src: "/images/salon-mimi-3.jpeg",
        alt: "Salon Mimi Marrakech — coiffeuse au travail Place Jamaa El Fna",
      },
      {
        src: "/images/hero-salon.jpg",
        alt: "Salon Mimi Marrakech — coiffeuse africaine Médina",
      },
    ],
  },
  {
    id: "box-braids",
    title: {
      fr: "Box Braids",
      en: "Box Braids",
      es: "Box Braids",
    },
    desc: {
      fr: "Tresses individuelles nettes, du format medium au XL, avec ou sans extensions.",
      en: "Clean individual braids, from medium to XL, with or without extensions.",
      es: "Trenzas individuales definidas, del tamaño medio al XL, con o sin extensiones.",
    },
    photos: [
      {
        src: "/images/s-box-braids-longues.jpg",
        alt: "Box braids longues Salon Mimi Marrakech",
      },
      {
        src: "/images/s-box-braids-profil.jpg",
        alt: "Box braids profil Salon Mimi Marrakech",
      },
      {
        src: "/images/s-box-braids-xl.jpg",
        alt: "Box braids XL Salon Mimi Marrakech",
      },
      {
        src: "/images/s-tresses-3.jpg",
        alt: "Tresses africaines Salon Mimi Marrakech — box braids",
      },
      {
        src: "/images/coiffure-1.jpg",
        alt: "Box braids knotless Salon Mimi Marrakech — Place Jamaa El Fna",
      },
    ],
  },
  {
    id: "knotless",
    title: {
      fr: "Knotless Braids",
      en: "Knotless Braids",
      es: "Knotless Braids",
    },
    desc: {
      fr: "Tresses sans nœud, légères et sans tension sur le cuir chevelu.",
      en: "Knotless braids, lightweight with no tension on the scalp.",
      es: "Trenzas sin nudo, ligeras y sin tensión en el cuero cabelludo.",
    },
    photos: [
      {
        src: "/images/s-knotless.jpg",
        alt: "Knotless braids Salon Mimi Marrakech",
      },
      {
        src: "/images/s-tresses-4.jpg",
        alt: "Tresses africaines Salon Mimi Marrakech — knotless",
      },
      {
        src: "/images/tresses-mimi-1.jpeg",
        alt: "Tresses africaines Salon Mimi Marrakech — réalisation knotless",
      },
    ],
  },
  {
    id: "cornrows-fulani",
    title: {
      fr: "Cornrows & Fulani",
      en: "Cornrows & Fulani",
      es: "Cornrows y Fulani",
    },
    desc: {
      fr: "Tresses collées géométriques, ornées de perles cauris sur demande.",
      en: "Geometric cornrows, finished with cowrie beads on request.",
      es: "Trenzas pegadas geométricas, con perlas cauri si se desea.",
    },
    photos: [
      {
        src: "/images/s-cornrows.jpg",
        alt: "Cornrows Salon Mimi Marrakech — tresses collées africaines",
      },
      {
        src: "/images/s-fulani.jpg",
        alt: "Tresses Fulani Salon Mimi Marrakech",
      },
    ],
  },
  {
    id: "boho",
    title: {
      fr: "Boho & Goddess",
      en: "Boho & Goddess",
      es: "Boho y Goddess",
    },
    desc: {
      fr: "Tresses bohème ondulées, effet naturel et volumineux.",
      en: "Wavy boho braids, for a natural and voluminous look.",
      es: "Trenzas boho onduladas, efecto natural y voluminoso.",
    },
    photos: [
      { src: "/images/s-boho.jpg", alt: "Tresses Boho Salon Mimi Marrakech" },
      {
        src: "/images/s-tressage-mains.jpg",
        alt: "Mains tresseuse Salon Mimi Marrakech — savoir-faire africain",
      },
    ],
  },
  {
    id: "locks",
    title: {
      fr: "Locks",
      en: "Locs",
      es: "Locks",
    },
    desc: {
      fr: "Pose de départ, entretien des racines et faux locks.",
      en: "Starter locs, root maintenance and faux locs.",
      es: "Inicio de rastas, mantenimiento de raíz y faux locks.",
    },
    photos: [
      {
        src: "/images/s-depart-locks.jpg",
        alt: "Départ locks Salon Mimi Marrakech — pose de locks",
      },
      {
        src: "/images/s-retouche-locks.jpg",
        alt: "Retouche locks Salon Mimi Marrakech — entretien locks",
      },
      {
        src: "/images/s-tresses-5.jpg",
        alt: "Tresses africaines Salon Mimi Marrakech — locks",
      },
    ],
  },
  {
    id: "enfants",
    title: {
      fr: "Enfants",
      en: "Children",
      es: "Niños",
    },
    desc: {
      fr: "Mini braids et tresses adaptées aux enfants, en douceur.",
      en: "Mini braids and gentle styles made for children.",
      es: "Mini trenzas y peinados suaves pensados para niños.",
    },
    photos: [
      {
        src: "/images/s-tresse-fille1.png",
        alt: "Tresses fille Salon Mimi Marrakech",
      },
      {
        src: "/images/s-tresse-fille2.png",
        alt: "Tresses petite fille Salon Mimi Marrakech",
      },
      {
        src: "/images/s-tresse-garcon.png",
        alt: "Tresses garçon Salon Mimi Marrakech",
      },
    ],
  },
  {
    id: "rasta-afro",
    title: {
      fr: "Tresses rasta & afro",
      en: "Rasta & afro braids",
      es: "Trenzas rasta y afro",
    },
    desc: {
      fr: "Nos réalisations récentes en tresses africaines et rasta.",
      en: "Our recent work in African and rasta braids.",
      es: "Nuestros trabajos recientes en trenzas africanas y rasta.",
    },
    photos: [
      {
        src: "/images/tresses-mimi-2.jpeg",
        alt: "Box braids Salon Mimi Marrakech — tresses africaines Médina",
      },
      {
        src: "/images/tresses-mimi-3.jpeg",
        alt: "Tresses rasta Salon Mimi Marrakech — coiffure afro Marrakech",
      },
      {
        src: "/images/tresses-mimi-4.jpeg",
        alt: "Tresses africaines Salon Mimi — Place Jamaa El Fna Marrakech",
      },
      {
        src: "/images/tresses-mimi-5.jpeg",
        alt: "Tresses africaines Salon Mimi Marrakech — juin 2026",
      },
      {
        src: "/images/tresses-mimi-6.jpeg",
        alt: "Tresses africaines Salon Mimi — réalisation récente",
      },
      {
        src: "/images/tresses-mimi-7.jpeg",
        alt: "Coiffure afro Salon Mimi Marrakech — tresses récentes",
      },
      {
        src: "/images/s-tresses-2.jpg",
        alt: "Tresses africaines Salon Mimi Marrakech",
      },
    ],
  },
  {
    id: "en-cabine",
    title: {
      fr: "En cabine",
      en: "In the chair",
      es: "En cabina",
    },
    desc: {
      fr: "Le tressage en cours — plusieurs heures de savoir-faire.",
      en: "Braiding in progress — several hours of craftsmanship.",
      es: "Trenzado en proceso — varias horas de oficio.",
    },
    photos: [
      {
        src: "/images/s-tressage-action.jpg",
        alt: "Tressage en cours Salon Mimi Marrakech",
      },
    ],
  },
];

const VIDEOS = [
  {
    src: "https://cdn.jsdelivr.net/gh/Moujanane/salon-mimi-media/pomelli-video-1.mp4",
    title: "Tresses africaines",
    poster: "/images/pomelli-image-5.png",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/Moujanane/salon-mimi-media/pomelli-video-2.mp4",
    title: "Knotless braids",
    poster: "/images/pomelli-image-2.png",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/Moujanane/salon-mimi-media/pomelli-video-3.mp4",
    title: "Box braids",
    poster: "/images/pomelli-image-3.png",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/Moujanane/salon-mimi-media/Salon-Mimi.mp4",
    title: "Salon Mimi — Marrakech",
    poster: "/images/s-tressage-mains.jpg",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/Moujanane/salon-mimi-media/POLLO-AI.mp4",
    title: "Tresses & Extensions",
    poster: "/images/s-box-braids-longues.jpg",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/Moujanane/salon-mimi-media/tresses-mimi-wa-1.mp4",
    title: "Tresses — Salon Mimi",
    poster: "/images/tresses-mimi-5.jpeg",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/Moujanane/salon-mimi-media/tresses-mimi-wa-2.mp4",
    title: "Coiffure afro — Marrakech",
    poster: "/images/tresses-mimi-6.jpeg",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/Moujanane/salon-mimi-media/salon-mimi-0606-1.mp4",
    title: "Tresses — Salon Mimi",
    poster: "/images/tresses-mimi-7.jpeg",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/Moujanane/salon-mimi-media/salon-mimi-0606-2.mp4",
    title: "Tresses africaines Marrakech",
    poster: "/images/s-tressage-action.jpg",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/Moujanane/salon-mimi-media/salon-mimi-vid-1.mp4",
    title: "Coiffure afro — Médina",
    poster: "/images/s-fulani.jpg",
  },
  {
    src: "https://cdn.jsdelivr.net/gh/Moujanane/salon-mimi-media/salon-mimi-vid-2.mp4",
    title: "Salon Mimi — Place Jamaa El Fna",
    poster: "/images/s-boho.jpg",
  },
];

const TAB_LABELS: Record<string, { photos: string; videos: string }> = {
  fr: { photos: "Photos", videos: "Vidéos" },
  en: { photos: "Photos", videos: "Videos" },
  es: { photos: "Fotos", videos: "Vídeos" },
};

export default function GalerieClient({ locale }: { locale: string }) {
  const [tab, setTab] = useState<"photos" | "videos">("photos");
  const labels = TAB_LABELS[locale] ?? TAB_LABELS.fr;
  const lang: Locale =
    locale === "en" || locale === "es" ? (locale as Locale) : "fr";

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div
        role="tablist"
        aria-label="Galerie"
        className="flex gap-3 mb-10 justify-center"
      >
        {(["photos", "videos"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`px-6 py-2 rounded-full text-sm font-inter tracking-widest uppercase transition-colors ${
              tab === t
                ? "bg-ocre text-nuit font-semibold"
                : "border border-ocre/40 text-ocre/60 hover:border-ocre hover:text-ocre"
            }`}
          >
            {t === "photos" ? labels.photos : labels.videos}
          </button>
        ))}
      </div>

      {tab === "photos" &&
        SECTIONS.map((section, si) => (
          <section key={section.id} className={si > 0 ? "mt-16" : ""}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-7 h-px bg-ocre flex-shrink-0" />
              <h2 className="text-brun text-[11px] tracking-[3px] uppercase font-inter">
                {section.title[lang]}
              </h2>
            </div>
            <p className="text-brun/60 text-sm font-inter mb-6 max-w-xl">
              {section.desc[lang]}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {section.photos.map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-2xl overflow-hidden bg-gray-800"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </section>
        ))}

      {tab === "videos" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {VIDEOS.map((v, i) => (
            <figure
              key={i}
              className="rounded-2xl overflow-hidden bg-gray-800 m-0"
            >
              <video
                src={v.src}
                poster={v.poster}
                autoPlay
                muted
                loop
                playsInline
                className="w-full aspect-[9/16] object-contain bg-black"
              />
              <figcaption className="text-center text-ocre text-sm font-inter py-3 tracking-widest uppercase">
                {v.title}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
