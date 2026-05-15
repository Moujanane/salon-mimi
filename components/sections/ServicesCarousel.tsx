"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

export interface ServicesCarouselProps {
  locale: string;
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
  slides: string[];
  bookId: string;
}

const CATEGORIES: Category[] = [
  {
    id: "tresses",
    icon: "✦",
    labelFr: "Tresses & Nattes",
    labelEn: "Braids & Plaits",
    labelEs: "Trenzas & Nattes",
    descFr:
      "Box Braids · Knotless · Boho Braids · Fulani · Cornrows · Mini Braids",
    descEn:
      "Box Braids · Knotless · Boho Braids · Fulani · Cornrows · Mini Braids",
    descEs:
      "Box Braids · Knotless · Boho Braids · Fulani · Cornrows · Mini Braids",
    slides: [
      "/images/s-tresse-fille1.png",
      "/images/s-tresse-fille2.png",
      "/images/s-tresse-garcon.png",
      "/images/coiffure-1.jpg",
      "/images/s-box-braids-xl.jpg",
      "/images/s-knotless.jpg",
      "/images/s-boho.jpg",
      "/images/s-fulani.jpg",
      "/images/s-cornrows.jpg",
    ],
    bookId: "box-braids-medium",
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
      "/images/s-depart-locks.jpg",
      "/images/s-retouche-locks.jpg",
      "/images/s-faux-locks.png",
      "/images/s-marley.webp",
      "/images/s-crochet.webp",
    ],
    bookId: "depart-locks",
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
      "/images/s-brushing.png",
      "/images/s-tresse-fille2.png",
      "/images/coiffure-1.jpg",
    ],
    bookId: "brushing-argan",
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
      "/images/s-boho.jpg",
      "/images/s-faux-locks.png",
      "/images/s-crochet.webp",
      "/images/s-mini-braids.jpg",
    ],
    bookId: "boho-experience",
  },
];

const LABELS: Record<string, { title: string; sub: string; book: string }> = {
  fr: {
    title: "Nos Services",
    sub: "Tresses · Locks · Soins · Packages",
    book: "Réserver ce service",
  },
  en: {
    title: "Our Services",
    sub: "Braids · Locks · Treatments · Packages",
    book: "Book this service",
  },
  es: {
    title: "Nuestros Servicios",
    sub: "Trenzas · Locks · Tratamientos · Paquetes",
    book: "Reservar este servicio",
  },
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

export default function ServicesCarousel({ locale }: ServicesCarouselProps) {
  const [catIdx, setCatIdx] = useState(0);
  const [slideIdx, setSlideIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const ui = LABELS[locale] ?? LABELS.fr;
  const cat = CATEGORIES[catIdx];

  // Démarre (ou redémarre) le timer auto-avance
  const startTimer = useCallback((slidesLength: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % slidesLength);
    }, 4000);
  }, []);

  // Lance le timer au montage et à chaque changement de catégorie
  useEffect(() => {
    startTimer(cat.slides.length);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [catIdx, cat.slides.length, startTimer]);

  // Réinitialise le timer quand l'utilisateur clique sur une flèche ou un dot
  const goTo = useCallback(
    (idx: number) => {
      setSlideIdx(idx);
      startTimer(cat.slides.length);
    },
    [cat.slides.length, startTimer],
  );

  const prev = useCallback(
    () => goTo((slideIdx - 1 + cat.slides.length) % cat.slides.length),
    [slideIdx, cat.slides.length, goTo],
  );

  const next = useCallback(
    () => goTo((slideIdx + 1) % cat.slides.length),
    [slideIdx, cat.slides.length, goTo],
  );

  const selectCat = useCallback(
    (idx: number) => {
      if (idx === catIdx) return;
      setFading(true);
      setTimeout(() => {
        setCatIdx(idx);
        setSlideIdx(0);
        setFading(false);
      }, 250);
    },
    [catIdx],
  );

  return (
    <>
      {/* ══════════════════ DESKTOP ══════════════════ */}
      <section className="hidden lg:block bg-[#F5EDE0] py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-8 items-stretch" style={{ minHeight: 540 }}>
            {/* ── GAUCHE : panneau ocre arrondi ── */}
            <div
              className="w-[40%] flex-shrink-0 rounded-3xl flex flex-col justify-between px-10 py-12"
              style={{
                background: "linear-gradient(155deg, #C17B3F 0%, #7A3D0E 100%)",
              }}
            >
              <div>
                <p className="text-white/50 text-[10px] uppercase tracking-[0.3em] mb-2">
                  {ui.sub}
                </p>
                <h2 className="font-playfair text-5xl text-white leading-tight mb-10">
                  {ui.title}
                </h2>

                {/* Catégories cliquables */}
                <nav className="flex flex-col gap-3">
                  {CATEGORIES.map((c, idx) => {
                    const active = idx === catIdx;
                    return (
                      <button
                        key={c.id}
                        onClick={() => selectCat(idx)}
                        className={`flex items-center gap-4 px-6 py-4 rounded-2xl border text-left transition-all duration-300 ${
                          active
                            ? "bg-white border-transparent shadow-md"
                            : "border-white/30 hover:bg-white/10 hover:border-white/50"
                        }`}
                      >
                        <span
                          className={`text-sm ${active ? "text-ocre" : "text-white/60"}`}
                        >
                          {c.icon}
                        </span>
                        <span
                          className={`text-sm font-medium uppercase tracking-widest ${
                            active ? "text-ocre" : "text-white"
                          }`}
                        >
                          {getLabel(c, locale)}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Dots synchronisés avec la slide active */}
              <div className="flex items-center gap-2 mt-8">
                {cat.slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goTo(idx)}
                    aria-label={`Photo ${idx + 1}`}
                    className={`rounded-full transition-all duration-300 ${
                      idx === slideIdx
                        ? "bg-white w-7 h-2"
                        : "bg-white/30 w-2 h-2 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* ── DROITE : carte photo arrondie ── */}
            <div className="flex-1 relative rounded-3xl overflow-hidden shadow-2xl bg-nuit">
              {/* Slides superposées — opacité contrôlée */}
              {cat.slides.map((src, idx) => (
                <div
                  key={`${cat.id}-${idx}`}
                  className="absolute inset-0 transition-opacity duration-500"
                  style={{ opacity: idx === slideIdx && !fading ? 1 : 0 }}
                >
                  <Image
                    src={src}
                    alt={getLabel(cat, locale)}
                    fill
                    className="object-cover"
                    sizes="60vw"
                    priority={idx === 0}
                  />
                </div>
              ))}

              {/* Gradient bas — pointer-events-none pour ne pas bloquer les boutons */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

              {/* Flèche gauche */}
              <button
                onClick={prev}
                aria-label="Photo précédente"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/50 transition-colors duration-200"
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

              {/* Flèche droite */}
              <button
                onClick={next}
                aria-label="Photo suivante"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/50 transition-colors duration-200"
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

              {/* Overlay bas avec info service */}
              <div
                className="absolute bottom-0 left-0 right-0 p-8 z-10 transition-opacity duration-300"
                style={{ opacity: fading ? 0 : 1 }}
              >
                <span className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-md border border-white/20 text-white text-[10px] uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4">
                  {cat.icon} {getLabel(cat, locale)}
                </span>

                <p className="text-white font-medium text-lg leading-snug mb-6 max-w-sm">
                  {getDesc(cat, locale)}
                </p>

                <Link
                  href={`/${locale}/reservation?service=${encodeURIComponent(cat.bookId)}`}
                  className="inline-flex items-center gap-3 bg-white text-brun text-sm font-medium px-7 py-3 rounded-full hover:bg-fond transition-colors duration-200 shadow-sm"
                >
                  {ui.book}
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

      {/* ══════════════════ MOBILE ══════════════════ */}
      <section className="lg:hidden">
        {/* Header */}
        <div
          className="px-5 py-10 text-center"
          style={{
            background: "linear-gradient(155deg, #C17B3F 0%, #7A3D0E 100%)",
          }}
        >
          <h2 className="font-playfair text-4xl text-white">{ui.title}</h2>
          <p className="text-white/50 text-xs mt-2 uppercase tracking-widest">
            {ui.sub}
          </p>
        </div>

        {/* Onglets catégories */}
        <div className="flex gap-2 px-4 py-4 overflow-x-auto bg-white border-b border-or/10">
          {CATEGORIES.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => selectCat(idx)}
              className={`flex-shrink-0 flex items-center gap-2 text-[11px] font-medium uppercase tracking-widest px-4 py-2 rounded-full transition-all duration-200 ${
                idx === catIdx
                  ? "bg-ocre text-white"
                  : "border border-brun/20 text-brun/60"
              }`}
            >
              <span>{c.icon}</span>
              <span>{getLabel(c, locale)}</span>
            </button>
          ))}
        </div>

        {/* Carte photo mobile */}
        <div className="bg-[#F5EDE0] px-4 py-6">
          <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3]">
            {cat.slides.map((src, idx) => (
              <div
                key={`m-${cat.id}-${idx}`}
                className="absolute inset-0 transition-opacity duration-500"
                style={{ opacity: idx === slideIdx ? 1 : 0 }}
              >
                <Image
                  src={src}
                  alt={getLabel(cat, locale)}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
            ))}

            {/* Gradient — pointer-events-none pour ne pas capturer les clics */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent pointer-events-none" />

            {/* Dots mobile */}
            <div className="absolute top-3 right-3 flex gap-1.5 z-10">
              {cat.slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  aria-label={`Photo ${idx + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    idx === slideIdx
                      ? "bg-white w-5 h-1.5"
                      : "bg-white/40 w-1.5 h-1.5"
                  }`}
                />
              ))}
            </div>

            {/* Info bas */}
            <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
              <p className="text-white font-medium text-base leading-snug mb-4">
                {getDesc(cat, locale)}
              </p>
              <Link
                href={`/${locale}/reservation?service=${encodeURIComponent(cat.bookId)}`}
                className="inline-flex items-center gap-2 bg-white text-brun text-sm font-medium px-6 py-2.5 rounded-full"
              >
                {ui.book}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
