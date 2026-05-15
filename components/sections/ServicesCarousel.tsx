"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

export interface ServicesCarouselProps {
  locale: string;
  bookLabel: string;
}

interface ServiceItem {
  id: string;
  nameFr: string;
  nameEn: string;
  nameEs: string;
  image: string;
  durationFr: string;
  durationEn: string;
}

interface Category {
  id: string;
  labelFr: string;
  labelEn: string;
  labelEs: string;
  services: ServiceItem[];
}

const CATEGORIES: Category[] = [
  {
    id: "tresses",
    labelFr: "Tresses",
    labelEn: "Braids",
    labelEs: "Trenzas",
    services: [
      {
        id: "box-braids-medium",
        nameFr: "Box Braids medium",
        nameEn: "Box Braids medium",
        nameEs: "Box Braids medianas",
        image: "/images/coiffure-1.jpg",
        durationFr: "3–4h",
        durationEn: "3–4h",
      },
      {
        id: "box-braids-xl",
        nameFr: "Box Braids XL",
        nameEn: "Box Braids XL",
        nameEs: "Box Braids XL",
        image: "/images/s-box-braids-xl.jpg",
        durationFr: "2–3h",
        durationEn: "2–3h",
      },
      {
        id: "knotless-braids",
        nameFr: "Knotless Braids",
        nameEn: "Knotless Braids",
        nameEs: "Knotless Braids",
        image: "/images/s-knotless.jpg",
        durationFr: "4–5h",
        durationEn: "4–5h",
      },
      {
        id: "boho-braids",
        nameFr: "Boho / Goddess Braids",
        nameEn: "Boho / Goddess Braids",
        nameEs: "Boho / Goddess Braids",
        image: "/images/s-boho.jpg",
        durationFr: "3–4h",
        durationEn: "3–4h",
      },
      {
        id: "fulani-braids",
        nameFr: "Fulani Braids + perles",
        nameEn: "Fulani Braids + cowrie shells",
        nameEs: "Fulani Braids + perlas",
        image: "/images/s-fulani.jpg",
        durationFr: "2–3h",
        durationEn: "2–3h",
      },
      {
        id: "cornrows",
        nameFr: "Cornrows full head",
        nameEn: "Cornrows full head",
        nameEs: "Cornrows cabeza completa",
        image: "/images/s-cornrows.jpg",
        durationFr: "1–2h",
        durationEn: "1–2h",
      },
      {
        id: "mini-braids-enfant",
        nameFr: "Mini braids enfant",
        nameEn: "Mini braids (children)",
        nameEs: "Mini trenzas niñas",
        image: "/images/s-mini-braids.jpg",
        durationFr: "1–2h",
        durationEn: "1–2h",
      },
    ],
  },
  {
    id: "locks",
    labelFr: "Locks & Twists",
    labelEn: "Locks & Twists",
    labelEs: "Locks & Twists",
    services: [
      {
        id: "depart-locks",
        nameFr: "Départ de locks",
        nameEn: "Starter locs",
        nameEs: "Inicio de rastas",
        image: "/images/s-depart-locks.jpg",
        durationFr: "4–6h",
        durationEn: "4–6h",
      },
      {
        id: "retouche-locks",
        nameFr: "Retouche locks",
        nameEn: "Locs retouch",
        nameEs: "Retoque rastas",
        image: "/images/s-retouche-locks.jpg",
        durationFr: "2–3h",
        durationEn: "2–3h",
      },
      {
        id: "faux-locks",
        nameFr: "Faux Locks Bohemian",
        nameEn: "Faux Locs Bohemian",
        nameEs: "Faux Locks Bohemian",
        image: "/images/s-faux-locks.png",
        durationFr: "3–5h",
        durationEn: "3–5h",
      },
      {
        id: "marley-twists",
        nameFr: "Marley Twists",
        nameEn: "Marley Twists",
        nameEs: "Marley Twists",
        image: "/images/s-marley.webp",
        durationFr: "3–4h",
        durationEn: "3–4h",
      },
      {
        id: "crochet-braids",
        nameFr: "Crochet Braids",
        nameEn: "Crochet Braids",
        nameEs: "Crochet Braids",
        image: "/images/s-crochet.webp",
        durationFr: "2–3h",
        durationEn: "2–3h",
      },
    ],
  },
  {
    id: "soins",
    labelFr: "Soins capillaires",
    labelEn: "Hair treatments",
    labelEs: "Tratamientos",
    services: [
      {
        id: "brushing-argan",
        nameFr: "Brushing naturel argan",
        nameEn: "Natural argan blowout",
        nameEs: "Brushing natural argán",
        image: "/images/s-brushing.png",
        durationFr: "—",
        durationEn: "—",
      },
      {
        id: "soin-argan",
        nameFr: "Soin argan seul",
        nameEn: "Argan treatment",
        nameEs: "Tratamiento argán",
        image: "/images/2025-11-20.jpg",
        durationFr: "1h",
        durationEn: "1h",
      },
    ],
  },
  {
    id: "packages",
    labelFr: "Packages Signature",
    labelEn: "Signature Packages",
    labelEs: "Paquetes Signature",
    services: [
      {
        id: "boho-experience",
        nameFr: "Boho Experience",
        nameEn: "Boho Experience",
        nameEs: "Boho Experience",
        image: "/images/s-boho.jpg",
        durationFr: "4h",
        durationEn: "4h",
      },
      {
        id: "faux-locks-perles",
        nameFr: "Faux Locks + bijoux perles",
        nameEn: "Faux Locs + pearl jewelry",
        nameEs: "Faux Locks + bisutería perlas",
        image: "/images/s-faux-locks.png",
        durationFr: "5h",
        durationEn: "5h",
      },
    ],
  },
];

const ICONS: Record<string, string> = {
  tresses: "✦",
  locks: "◈",
  soins: "◇",
  packages: "★",
};

function getName(s: ServiceItem, locale: string) {
  if (locale === "en") return s.nameEn;
  if (locale === "es") return s.nameEs;
  return s.nameFr;
}

function getCatLabel(cat: Category, locale: string) {
  if (locale === "en") return cat.labelEn;
  if (locale === "es") return cat.labelEs;
  return cat.labelFr;
}

const PAGE = {
  fr: { title: "Nos Services", sub: "Tresses · Locks · Soins · Packages" },
  en: { title: "Our Services", sub: "Braids · Locks · Treatments · Packages" },
  es: {
    title: "Nuestros Servicios",
    sub: "Trenzas · Locks · Tratamientos · Paquetes",
  },
};

export default function ServicesCarousel({
  locale,
  bookLabel,
}: ServicesCarouselProps) {
  const [activeCat, setActiveCat] = useState(0);
  const [activeCard, setActiveCard] = useState(0);

  const page = PAGE[locale as keyof typeof PAGE] ?? PAGE.fr;
  const cat = CATEGORIES[activeCat];
  const items = cat.services;
  const total = items.length;

  const selectCat = useCallback((idx: number) => {
    setActiveCat(idx);
    setActiveCard(0);
  }, []);

  const prev = useCallback(() => setActiveCard((c) => Math.max(0, c - 1)), []);
  const next = useCallback(
    () => setActiveCard((c) => Math.min(total - 1, c + 1)),
    [total],
  );

  return (
    <section className="bg-fond min-h-screen">
      {/* ────── DESKTOP ────── */}
      <div className="hidden lg:flex" style={{ height: "calc(100vh - 64px)" }}>
        {/* LEFT — fond ocre */}
        <div
          className="w-[38%] flex flex-col justify-center px-14 gap-10 relative overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #C17B3F 0%, #A0622E 100%)",
          }}
        >
          {/* Motif subtil */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)`,
              backgroundSize: "20px 20px",
            }}
          />

          {/* Titre */}
          <div className="relative">
            <p className="text-white/50 text-[10px] uppercase tracking-[0.25em] mb-3 font-inter">
              {page.sub}
            </p>
            <h1 className="font-playfair text-6xl text-white leading-tight">
              {page.title}
            </h1>
            <div className="mt-4 w-12 h-px bg-white/30" />
          </div>

          {/* Catégories */}
          <nav className="flex flex-col gap-3 relative">
            {CATEGORIES.map((c, idx) => {
              const active = idx === activeCat;
              return (
                <button
                  key={c.id}
                  onClick={() => selectCat(idx)}
                  className={`
                    group flex items-center gap-4 px-6 py-4 rounded-2xl
                    border transition-all duration-300 text-left w-full
                    ${
                      active
                        ? "bg-white border-transparent shadow-lg"
                        : "border-white/25 hover:bg-white/10 hover:border-white/40"
                    }
                  `}
                >
                  <span
                    className={`text-base transition-colors duration-300 ${active ? "text-ocre" : "text-white/60 group-hover:text-white"}`}
                  >
                    {ICONS[c.id]}
                  </span>
                  <span
                    className={`text-sm font-medium uppercase tracking-widest transition-colors duration-300 ${active ? "text-ocre" : "text-white"}`}
                  >
                    {getCatLabel(c, locale)}
                  </span>
                  {active && (
                    <span className="ml-auto text-ocre/40 text-xs">
                      {items.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Dots */}
          <div className="flex items-center gap-2 relative">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCard(idx)}
                aria-label={`Service ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  idx === activeCard
                    ? "bg-white w-8 h-1.5"
                    : "bg-white/30 w-1.5 h-1.5 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* RIGHT — carousel */}
        <div className="w-[62%] relative flex items-center overflow-hidden bg-fond">
          {/* Flèche gauche */}
          <button
            onClick={prev}
            disabled={activeCard === 0}
            aria-label="Précédent"
            className="absolute left-5 z-20 w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center disabled:opacity-20 hover:shadow-lg transition-all duration-200 hover:-translate-x-0.5"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2C1508"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Flèche droite */}
          <button
            onClick={next}
            disabled={activeCard === total - 1}
            aria-label="Suivant"
            className="absolute right-5 z-20 w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center disabled:opacity-20 hover:shadow-lg transition-all duration-200 hover:translate-x-0.5"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2C1508"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Track */}
          <div className="w-full overflow-hidden px-16">
            <div
              className="flex gap-5 transition-transform duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
              style={{
                transform: `translateX(calc(-${activeCard * 82}% + 0%))`,
              }}
            >
              {items.map((service, idx) => {
                const isActive = idx === activeCard;
                return (
                  <div
                    key={service.id}
                    onClick={() => setActiveCard(idx)}
                    className={`flex-shrink-0 w-[78%] relative rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-500 ${
                      isActive
                        ? "opacity-100 scale-100 shadow-2xl"
                        : "opacity-35 scale-[0.94]"
                    }`}
                    style={{ height: "72vh", maxHeight: "600px" }}
                  >
                    <Image
                      src={service.image}
                      alt={getName(service, locale)}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 50vw, 80vw"
                      priority={idx === 0}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      {/* Badge catégorie */}
                      <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 text-white text-[10px] uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-5">
                        <span>{ICONS[cat.id]}</span>
                        <span>{getCatLabel(cat, locale)}</span>
                      </div>

                      {/* Nom service */}
                      <h3 className="font-playfair text-4xl text-white leading-tight mb-2">
                        {getName(service, locale)}
                      </h3>

                      {/* Durée */}
                      <p className="text-white/50 text-sm mb-7 font-inter">
                        {locale === "en"
                          ? service.durationEn
                          : service.durationFr}
                      </p>

                      {/* Bouton */}
                      <Link
                        href={`/${locale}/reservation?service=${encodeURIComponent(service.id)}`}
                        className="inline-flex items-center gap-3 bg-white text-brun text-sm font-medium px-7 py-3.5 rounded-full hover:bg-fond transition-colors duration-200 shadow-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {bookLabel}
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ────── MOBILE ────── */}
      <div className="lg:hidden">
        {/* Header */}
        <div
          className="py-14 px-6 text-center"
          style={{
            background: "linear-gradient(145deg, #C17B3F 0%, #A0622E 100%)",
          }}
        >
          <p className="text-white/50 text-[10px] uppercase tracking-[0.2em] mb-2">
            {page.sub}
          </p>
          <h1 className="font-playfair text-5xl text-white">{page.title}</h1>
        </div>

        {/* Tabs catégories */}
        <div
          className="overflow-x-auto scrollbar-none"
          style={{ background: "#A0622E" }}
        >
          <div className="flex gap-2 px-4 py-3 min-w-max">
            {CATEGORIES.map((c, idx) => {
              const active = idx === activeCat;
              return (
                <button
                  key={c.id}
                  onClick={() => selectCat(idx)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs uppercase tracking-widest whitespace-nowrap font-medium transition-all duration-200 border ${
                    active
                      ? "bg-white text-ocre border-transparent"
                      : "text-white border-white/30 hover:bg-white/10"
                  }`}
                >
                  <span>{ICONS[c.id]}</span>
                  {getCatLabel(c, locale)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cards */}
        <div className="px-4 py-8 space-y-5">
          {items.map((service) => (
            <div
              key={service.id}
              className="rounded-3xl overflow-hidden relative shadow-lg"
              style={{ height: "300px" }}
            >
              <Image
                src={service.image}
                alt={getName(service, locale)}
                fill
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 text-white text-[9px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-full mb-3">
                  <span>{ICONS[cat.id]}</span>
                  <span>{getCatLabel(cat, locale)}</span>
                </div>
                <h3 className="font-playfair text-2xl text-white mb-1">
                  {getName(service, locale)}
                </h3>
                <p className="text-white/50 text-xs mb-4">
                  {locale === "en" ? service.durationEn : service.durationFr}
                </p>
                <Link
                  href={`/${locale}/reservation?service=${encodeURIComponent(service.id)}`}
                  className="inline-flex items-center gap-2 bg-white text-brun text-xs font-medium px-5 py-2.5 rounded-full hover:bg-fond transition-colors"
                >
                  {bookLabel}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
