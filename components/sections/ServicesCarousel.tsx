"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

export interface ServicesCarouselProps {
  locale: string;
}

interface MediaItem {
  type: "image" | "video";
  src: string;
}

interface Category {
  id: string;
  icon: string;
  labelFr: string;
  labelEn: string;
  labelEs: string;
  descFr: string;
  descEn: string;
  descEs: string;
  slides: MediaItem[];
}

const CATEGORIES: Category[] = [
  {
    id: "tresses",
    icon: "✦",
    labelFr: "Tresses & Nattes",
    labelEn: "Braids & Plaits",
    labelEs: "Trenzas & Trenzados",
    descFr:
      "Box Braids · Knotless · Boho Braids · Fulani · Cornrows · Mini Braids",
    descEn:
      "Box Braids · Knotless · Boho Braids · Fulani · Cornrows · Mini Braids",
    descEs:
      "Box Braids · Knotless · Boho Braids · Fulani · Cornrows · Mini Braids",
    slides: [
      { type: "video", src: "/videos/Tresses.mp4" },
      { type: "video", src: "/videos/Tresses2.mp4" },
      { type: "video", src: "/videos/Tresses3.mp4" },
      { type: "video", src: "/videos/Tresses4.mp4" },
      { type: "video", src: "/videos/Tresses5mp4.mp4" },
    ],
  },
  {
    id: "locks",
    icon: "◈",
    labelFr: "Locks & Twists",
    labelEn: "Locks & Twists",
    labelEs: "Locks & Twists",
    descFr:
      "Départ de Locks · Retouche Locks · Faux Locks · Marley Twists · Crochet Braids",
    descEn:
      "Starter Locs · Loc Retouch · Faux Locs · Marley Twists · Crochet Braids",
    descEs:
      "Inicio Locks · Retoque Locks · Faux Locks · Marley Twists · Crochet Braids",
    slides: [
      { type: "video", src: "/videos/Mimi.mp4" },
      { type: "video", src: "/videos/Mimi2.mp4" },
      { type: "image", src: "/images/s-depart-locks.jpg" },
      { type: "image", src: "/images/s-retouche-locks.jpg" },
      { type: "image", src: "/images/s-marley.webp" },
    ],
  },
  {
    id: "soins",
    icon: "◇",
    labelFr: "Soins Capillaires",
    labelEn: "Hair Treatments",
    labelEs: "Tratamientos Capilares",
    descFr: "Brushing naturel · Soin à l'huile d'argan · Masque hydratant",
    descEn: "Natural blowout · Argan oil treatment · Moisturizing mask",
    descEs: "Brushing natural · Tratamiento argán · Mascarilla hidratante",
    slides: [
      { type: "image", src: "/images/2025-11-20.jpg" },
      { type: "image", src: "/images/s-brushing.png" },
    ],
  },
  {
    id: "packages",
    icon: "★",
    labelFr: "Packages Signature",
    labelEn: "Signature Packages",
    labelEs: "Paquetes Signature",
    descFr: "Boho Experience · Faux Locks + Bijoux Perles",
    descEn: "Boho Experience · Faux Locs + Pearl Jewelry",
    descEs: "Boho Experience · Faux Locks + Bisutería Perlas",
    slides: [
      { type: "image", src: "/images/s-boho.jpg" },
      { type: "image", src: "/images/s-faux-locks.png" },
      { type: "image", src: "/images/s-crochet.webp" },
    ],
  },
];

const PAGE_LABELS: Record<
  string,
  { title: string; sub: string; book: string; price: string }
> = {
  fr: {
    title: "Nos Services",
    sub: "Tresses · Locks · Soins · Packages",
    book: "Réserver ce service",
    price: "À partir de",
  },
  en: {
    title: "Our Services",
    sub: "Braids · Locks · Treatments · Packages",
    book: "Book this service",
    price: "From",
  },
  es: {
    title: "Nuestros Servicios",
    sub: "Trenzas · Locks · Tratamientos · Paquetes",
    book: "Reservar este servicio",
    price: "Desde",
  },
};

const PRICES: Record<string, string> = {
  tresses: "150 MAD",
  locks: "200 MAD",
  soins: "80 MAD",
  packages: "300 MAD",
};

function getLabel(cat: Category, locale: string) {
  if (locale === "en") return cat.labelEn;
  if (locale === "es") return cat.labelEs;
  return cat.labelFr;
}

function getDesc(cat: Category, locale: string) {
  if (locale === "en") return cat.descEn;
  if (locale === "es") return cat.descEs;
  return cat.descFr;
}

function SlideMedia({ slide, active }: { slide: MediaItem; active: boolean }) {
  if (slide.type === "video") {
    return (
      <video
        src={slide.src}
        autoPlay={active}
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }
  return (
    <Image
      src={slide.src}
      alt=""
      fill
      className="object-cover"
      sizes="(min-width: 1024px) 55vw, 100vw"
      priority
    />
  );
}

export default function ServicesCarousel({ locale }: ServicesCarouselProps) {
  const [activeCatIdx, setActiveCatIdx] = useState(0);
  const [slideIdx, setSlideIdx] = useState(0);
  const [fading, setFading] = useState(false);

  const labels = PAGE_LABELS[locale] ?? PAGE_LABELS.fr;
  const cat = CATEGORIES[activeCatIdx];

  // Auto-avance toutes les 4s
  useEffect(() => {
    const t = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % cat.slides.length);
    }, 4000);
    return () => clearInterval(t);
  }, [activeCatIdx, cat.slides.length]);

  const selectCat = useCallback(
    (idx: number) => {
      if (idx === activeCatIdx) return;
      setFading(true);
      setTimeout(() => {
        setActiveCatIdx(idx);
        setSlideIdx(0);
        setFading(false);
      }, 250);
    },
    [activeCatIdx],
  );

  const goSlide = useCallback((idx: number) => {
    setSlideIdx(idx);
  }, []);

  const prevSlide = useCallback(() => {
    setSlideIdx((prev) => (prev - 1 + cat.slides.length) % cat.slides.length);
  }, [cat.slides.length]);

  const nextSlide = useCallback(() => {
    setSlideIdx((prev) => (prev + 1) % cat.slides.length);
  }, [cat.slides.length]);

  return (
    <>
      {/* ═══════════ DESKTOP ═══════════ */}
      <section className="hidden lg:block bg-[#F5EDE0] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-8 items-stretch min-h-[520px]">
            {/* ── GAUCHE : panneau ocre ── */}
            <div
              className="w-[42%] flex-shrink-0 rounded-3xl flex flex-col justify-center px-10 py-12"
              style={{
                background: "linear-gradient(150deg, #C17B3F 0%, #8C4F1A 100%)",
              }}
            >
              {/* Titre */}
              <p className="text-white/50 text-[10px] uppercase tracking-[0.3em] mb-2 font-inter">
                {labels.sub}
              </p>
              <h2 className="font-playfair text-5xl text-white leading-tight mb-8">
                {labels.title}
              </h2>

              {/* Liste catégories */}
              <nav className="flex flex-col gap-3">
                {CATEGORIES.map((c, idx) => {
                  const isActive = idx === activeCatIdx;
                  return (
                    <button
                      key={c.id}
                      onClick={() => selectCat(idx)}
                      className={`flex items-center gap-4 px-6 py-4 rounded-2xl border text-left transition-all duration-300 ${
                        isActive
                          ? "bg-white border-transparent shadow-md"
                          : "border-white/30 hover:bg-white/10 hover:border-white/50"
                      }`}
                    >
                      <span
                        className={`text-sm flex-shrink-0 ${isActive ? "text-ocre" : "text-white/60"}`}
                      >
                        {c.icon}
                      </span>
                      <span
                        className={`text-sm font-medium uppercase tracking-widest ${isActive ? "text-ocre" : "text-white"}`}
                      >
                        {getLabel(c, locale)}
                      </span>
                    </button>
                  );
                })}
              </nav>

              {/* Dots navigation */}
              <div className="flex items-center gap-2 mt-8">
                {cat.slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goSlide(idx)}
                    aria-label={`Slide ${idx + 1}`}
                    className={`rounded-full transition-all duration-300 ${
                      idx === slideIdx
                        ? "bg-white w-7 h-2"
                        : "bg-white/30 w-2 h-2 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* ── DROITE : carte carousel arrondie ── */}
            <div className="flex-1 relative rounded-3xl overflow-hidden shadow-2xl">
              {/* Slides — toutes présentes, on fade la courante */}
              {cat.slides.map((slide, idx) => (
                <div
                  key={`${cat.id}-${idx}`}
                  className="absolute inset-0 transition-opacity duration-500"
                  style={{ opacity: idx === slideIdx && !fading ? 1 : 0 }}
                >
                  <SlideMedia slide={slide} active={idx === slideIdx} />
                </div>
              ))}

              {/* Gradient bas */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent pointer-events-none" />

              {/* Flèches */}
              <button
                onClick={prevSlide}
                aria-label="Précédent"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/50 transition-all duration-200"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                aria-label="Suivant"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/50 transition-all duration-200"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              {/* Overlay info bas */}
              <div
                className="absolute bottom-0 left-0 right-0 p-8 transition-opacity duration-300"
                style={{ opacity: fading ? 0 : 1 }}
              >
                {/* Badge catégorie */}
                <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-md border border-white/20 text-white text-[10px] uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4">
                  <span>{cat.icon}</span>
                  <span>{getLabel(cat, locale)}</span>
                </div>

                {/* Description services */}
                <p className="text-white font-medium text-lg leading-snug mb-1 max-w-sm">
                  {getDesc(cat, locale)}
                </p>

                {/* Prix */}
                <p className="text-white/60 text-sm mb-6 uppercase tracking-widest">
                  {labels.price} {PRICES[cat.id]}
                </p>

                {/* Bouton */}
                <Link
                  href={`/${locale}/reservation?service=${encodeURIComponent(cat.id)}`}
                  className="inline-flex items-center gap-3 bg-white text-brun text-sm font-medium px-7 py-3 rounded-full hover:bg-fond transition-colors duration-200 shadow-sm"
                >
                  {labels.book}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ MOBILE ═══════════ */}
      <section className="lg:hidden">
        {/* Header */}
        <div
          className="px-5 py-10 text-center"
          style={{
            background: "linear-gradient(150deg, #C17B3F 0%, #8C4F1A 100%)",
          }}
        >
          <h2 className="font-playfair text-4xl text-white">{labels.title}</h2>
          <p className="text-white/50 text-xs mt-2 uppercase tracking-widest">
            {labels.sub}
          </p>
        </div>

        {/* Onglets */}
        <div className="flex gap-2 px-4 py-4 overflow-x-auto bg-white border-b border-or/10">
          {CATEGORIES.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => selectCat(idx)}
              className={`flex-shrink-0 flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest px-4 py-2 rounded-full transition-all duration-200 ${
                idx === activeCatIdx
                  ? "bg-ocre text-white"
                  : "border border-brun/20 text-brun/60"
              }`}
            >
              <span>{c.icon}</span>
              <span>{getLabel(c, locale)}</span>
            </button>
          ))}
        </div>

        {/* Carte carousel mobile */}
        <div className="bg-[#F5EDE0] px-4 py-6">
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-xl">
            {cat.slides.map((slide, idx) => (
              <div
                key={`m-${cat.id}-${idx}`}
                className="absolute inset-0 transition-opacity duration-500"
                style={{ opacity: idx === slideIdx ? 1 : 0 }}
              >
                <SlideMedia slide={slide} active={idx === slideIdx} />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

            {/* Info */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="text-white font-medium text-base leading-snug mb-1">
                {getDesc(cat, locale)}
              </p>
              <p className="text-white/50 text-xs mb-4 uppercase tracking-widest">
                {labels.price} {PRICES[cat.id]}
              </p>
              <Link
                href={`/${locale}/reservation?service=${encodeURIComponent(cat.id)}`}
                className="inline-flex items-center gap-2 bg-white text-brun text-sm font-medium px-6 py-2.5 rounded-full"
              >
                {labels.book}
              </Link>
            </div>

            {/* Dots mobile */}
            <div className="absolute top-3 right-3 flex gap-1.5">
              {cat.slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goSlide(idx)}
                  className={`rounded-full transition-all duration-300 ${
                    idx === slideIdx
                      ? "bg-white w-5 h-1.5"
                      : "bg-white/40 w-1.5 h-1.5"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
