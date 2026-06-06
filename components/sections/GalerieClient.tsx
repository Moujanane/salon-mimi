"use client";
import { useState } from "react";
import Image from "next/image";

const PHOTOS = [
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
    src: "/images/tresses-mimi-1.jpeg",
    alt: "Tresses africaines Salon Mimi Marrakech — réalisation knotless",
  },
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
    src: "/images/pomelli-image-1.png",
    alt: "Coiffure africaine Marrakech — création artistique Salon Mimi",
  },
  {
    src: "/images/pomelli-image-2.png",
    alt: "Tresses africaines créatives Marrakech — Salon Mimi",
  },
  {
    src: "/images/pomelli-image-3.png",
    alt: "Box braids artistiques Marrakech — Salon Mimi coiffure afro",
  },
  {
    src: "/images/pomelli-image-4.png",
    alt: "Coiffure afro créative Salon Mimi — tresses Marrakech",
  },
  {
    src: "/images/pomelli-image-5.png",
    alt: "Coiffure africaine Salon Mimi Marrakech — tresses et locks",
  },
  {
    src: "/images/pomelli-image-6.png",
    alt: "Photoshoot Salon Mimi Marrakech — coiffure africaine",
  },
  { src: "/images/s-boho.jpg", alt: "Tresses Boho Salon Mimi Marrakech" },
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
    src: "/images/s-cornrows.jpg",
    alt: "Cornrows Salon Mimi Marrakech — tresses collées africaines",
  },
  {
    src: "/images/s-depart-locks.jpg",
    alt: "Départ locks Salon Mimi Marrakech — pose de locks",
  },
  { src: "/images/s-fulani.jpg", alt: "Tresses Fulani Salon Mimi Marrakech" },
  {
    src: "/images/s-knotless.jpg",
    alt: "Knotless braids Salon Mimi Marrakech",
  },
  { src: "/images/s-mini-braids.jpg", alt: "Mini braids Salon Mimi Marrakech" },
  {
    src: "/images/s-retouche-locks.jpg",
    alt: "Retouche locks Salon Mimi Marrakech — entretien locks",
  },
  {
    src: "/images/s-tressage-action.jpg",
    alt: "Tressage en cours Salon Mimi Marrakech",
  },
  {
    src: "/images/s-tressage-mains.jpg",
    alt: "Mains tresseuse Salon Mimi Marrakech — savoir-faire africain",
  },
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
  {
    src: "/images/s-tresses-2.jpg",
    alt: "Tresses africaines Salon Mimi Marrakech",
  },
  {
    src: "/images/s-tresses-3.jpg",
    alt: "Tresses africaines Salon Mimi Marrakech — box braids",
  },
  {
    src: "/images/s-tresses-4.jpg",
    alt: "Tresses africaines Salon Mimi Marrakech — knotless",
  },
  {
    src: "/images/s-tresses-5.jpg",
    alt: "Tresses africaines Salon Mimi Marrakech — locks",
  },
  {
    src: "/images/coiffure-1.jpg",
    alt: "Box braids knotless Salon Mimi Marrakech — Place Jamaa El Fna",
  },
  {
    src: "/images/hero-salon.jpg",
    alt: "Salon Mimi Marrakech — coiffeuse africaine Médina",
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
];

const TAB_LABELS: Record<string, { photos: string; videos: string }> = {
  fr: { photos: "Photos", videos: "Vidéos" },
  en: { photos: "Photos", videos: "Videos" },
  es: { photos: "Fotos", videos: "Vídeos" },
};

export default function GalerieClient({ locale }: { locale: string }) {
  const [tab, setTab] = useState<"photos" | "videos">("photos");
  const labels = TAB_LABELS[locale] ?? TAB_LABELS.fr;

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

      {tab === "photos" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PHOTOS.map((img, i) => (
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
      )}

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
