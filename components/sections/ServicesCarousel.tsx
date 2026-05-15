"use client";

import { useState } from "react";
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
}

interface Category {
  id: string;
  labelFr: string;
  labelEn: string;
  labelEs: string;
  image: string;
  services: ServiceItem[];
}

const CATEGORIES: Category[] = [
  {
    id: "tresses",
    labelFr: "Tresses",
    labelEn: "Braids",
    labelEs: "Trenzas",
    image: "/images/coiffure-1.jpg",
    services: [
      {
        id: "box-braids-medium",
        nameFr: "Box Braids medium",
        nameEn: "Box Braids medium",
        nameEs: "Box Braids medianas",
        image: "/images/unnamed(1).jpg",
      },
      {
        id: "box-braids-xl",
        nameFr: "Box Braids XL",
        nameEn: "Box Braids XL",
        nameEs: "Box Braids XL",
        image: "/images/unnamed(2).jpg",
      },
      {
        id: "knotless-braids",
        nameFr: "Knotless Braids",
        nameEn: "Knotless Braids",
        nameEs: "Knotless Braids",
        image: "/images/unnamed(3).jpg",
      },
      {
        id: "boho-braids",
        nameFr: "Boho / Goddess Braids",
        nameEn: "Boho / Goddess Braids",
        nameEs: "Boho / Goddess Braids",
        image: "/images/unnamed(4).jpg",
      },
      {
        id: "fulani-braids",
        nameFr: "Fulani Braids + perles",
        nameEn: "Fulani Braids + cowrie shells",
        nameEs: "Fulani Braids + perlas",
        image: "/images/unnamed(5).jpg",
      },
      {
        id: "cornrows",
        nameFr: "Cornrows full head",
        nameEn: "Cornrows full head",
        nameEs: "Cornrows cabeza completa",
        image: "/images/unnamed(6).jpg",
      },
      {
        id: "mini-braids-enfant",
        nameFr: "Mini braids enfant",
        nameEn: "Mini braids children",
        nameEs: "Mini trenzas niñas",
        image: "/images/unnamed(7).jpg",
      },
    ],
  },
  {
    id: "locks",
    labelFr: "Locks & Twists",
    labelEn: "Locks & Twists",
    labelEs: "Locks & Twists",
    image: "/images/unnamed(8).jpg",
    services: [
      {
        id: "depart-locks",
        nameFr: "Départ de locks",
        nameEn: "Starter locs",
        nameEs: "Inicio de rastas",
        image: "/images/unnamed(8).jpg",
      },
      {
        id: "retouche-locks",
        nameFr: "Retouche locks",
        nameEn: "Locs retouch",
        nameEs: "Retoque rastas",
        image: "/images/unnamed(9).png",
      },
      {
        id: "faux-locks",
        nameFr: "Faux Locks / Bohemian",
        nameEn: "Faux Locs / Bohemian",
        nameEs: "Faux Locks / Bohemian",
        image: "/images/unnamed(10).webp",
      },
      {
        id: "marley-twists",
        nameFr: "Marley Twists",
        nameEn: "Marley Twists",
        nameEs: "Marley Twists",
        image: "/images/unnamed.webp",
      },
      {
        id: "crochet-braids",
        nameFr: "Crochet Braids",
        nameEn: "Crochet Braids",
        nameEs: "Crochet Braids",
        image: "/images/unnamed.png",
      },
    ],
  },
  {
    id: "soins",
    labelFr: "Soins capillaires",
    labelEn: "Hair treatments",
    labelEs: "Tratamientos",
    image: "/images/2025-11-20.jpg",
    services: [
      {
        id: "brushing-argan",
        nameFr: "Brushing naturel argan",
        nameEn: "Natural argan blowout",
        nameEs: "Brushing natural argán",
        image: "/images/2025-11-20.jpg",
      },
      {
        id: "soin-argan",
        nameFr: "Soin argan seul",
        nameEn: "Argan treatment",
        nameEs: "Tratamiento argán",
        image: "/images/coiffure-1.jpg",
      },
    ],
  },
  {
    id: "packages",
    labelFr: "Packages Signature",
    labelEn: "Signature Packages",
    labelEs: "Paquetes Signature",
    image: "/images/unnamed(3).jpg",
    services: [
      {
        id: "boho-experience",
        nameFr: "Boho Experience",
        nameEn: "Boho Experience",
        nameEs: "Boho Experience",
        image: "/images/unnamed(3).jpg",
      },
      {
        id: "faux-locks-perles",
        nameFr: "Faux Locks + bijoux perles",
        nameEn: "Faux Locs + pearl jewelry",
        nameEs: "Faux Locks + bisutería perlas",
        image: "/images/unnamed(9).png",
      },
    ],
  },
];

function getName(service: ServiceItem, locale: string): string {
  if (locale === "en") return service.nameEn;
  if (locale === "es") return service.nameEs;
  return service.nameFr;
}

function getCategoryLabel(categoryIndex: number, locale: string): string {
  const cat = CATEGORIES[categoryIndex];
  if (!cat) return "";
  if (locale === "en") return cat.labelEn;
  if (locale === "es") return cat.labelEs;
  return cat.labelFr;
}

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  fr: {
    title: "Nos Services",
    subtitle: "Tresses africaines · Locks · Soins capillaires",
  },
  en: {
    title: "Our Services",
    subtitle: "African braids · Locs · Hair treatments",
  },
  es: {
    title: "Nuestros Servicios",
    subtitle: "Trenzas africanas · Rastas · Tratamientos",
  },
};

export default function ServicesCarousel({
  locale,
  bookLabel,
}: ServicesCarouselProps) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [activeCard, setActiveCard] = useState(0);

  const pageTitle = PAGE_TITLES[locale] ?? PAGE_TITLES.fr;
  const currentCategory = CATEGORIES[activeCategory];
  const currentServices = currentCategory.services;

  function selectCategory(index: number) {
    setActiveCategory(index);
    setActiveCard(0);
  }

  function prev() {
    setActiveCard((c) => Math.max(0, c - 1));
  }

  function next() {
    const max = currentServices.length - 1;
    setActiveCard((c) => Math.min(max, c + 1));
  }

  return (
    <div className="bg-fond min-h-screen">
      {/* ── Desktop layout ── */}
      <div className="hidden lg:flex h-screen">
        {/* LEFT 40% — fond ocre, catégories pill */}
        <div className="w-[40%] bg-ocre flex flex-col justify-center px-12 gap-8">
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest mb-2 font-inter">
              {pageTitle.subtitle}
            </p>
            <h2 className="font-playfair text-5xl text-white leading-tight">
              {pageTitle.title}
            </h2>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            {CATEGORIES.map((cat, idx) => {
              const isActive = idx === activeCategory;
              return (
                <button
                  key={cat.id}
                  onClick={() => selectCategory(idx)}
                  className={`border border-white/40 rounded-full px-6 py-3 flex items-center gap-3 text-sm uppercase tracking-wider transition-all duration-200 text-left ${
                    isActive
                      ? "bg-white text-ocre font-semibold"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <span className="text-lg leading-none">✦</span>
                  <span>
                    {locale === "en"
                      ? cat.labelEn
                      : locale === "es"
                        ? cat.labelEs
                        : cat.labelFr}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dots navigation */}
          <div className="flex gap-2 mt-4">
            {currentServices.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCard(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === activeCard ? "bg-white w-8" : "bg-white/30 w-1.5"
                }`}
                aria-label={`Card ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* RIGHT 60% — carousel */}
        <div className="w-[60%] bg-fond flex flex-col justify-center overflow-hidden relative">
          {/* Flèches navigation */}
          <div className="absolute top-1/2 -translate-y-1/2 left-4 z-10">
            <button
              onClick={prev}
              disabled={activeCard === 0}
              className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md disabled:opacity-20 hover:bg-white transition-colors"
              aria-label="Précédent"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-brun"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </div>

          <div className="absolute top-1/2 -translate-y-1/2 right-4 z-10">
            <button
              onClick={next}
              disabled={activeCard === currentServices.length - 1}
              className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md disabled:opacity-20 hover:bg-white transition-colors"
              aria-label="Suivant"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-brun"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Track */}
          <div className="overflow-hidden px-[10%]">
            <div
              style={{
                transform: `translateX(calc(-${activeCard * 85}% + 0%))`,
              }}
              className="flex gap-6 transition-transform duration-500 ease-in-out"
            >
              {currentServices.map((service, idx) => (
                <div
                  key={service.id}
                  onClick={() => setActiveCard(idx)}
                  className={`flex-shrink-0 w-[80%] cursor-pointer transition-all duration-500 rounded-3xl overflow-hidden relative h-[500px] ${
                    idx === activeCard
                      ? "opacity-100 scale-100 shadow-2xl"
                      : "opacity-40 scale-95"
                  }`}
                >
                  <Image
                    src={service.image}
                    alt={getName(service, locale)}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 48vw, 80vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-nuit/90 via-nuit/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
                      {getCategoryLabel(activeCategory, locale)}
                    </span>
                    <h3 className="font-playfair text-3xl text-white mb-6 leading-tight">
                      {getName(service, locale)}
                    </h3>
                    <Link
                      href={`/${locale}/reservation?service=${encodeURIComponent(service.id)}`}
                      className="inline-block bg-white text-brun text-sm font-medium px-6 py-3 rounded-full hover:bg-fond transition-colors"
                    >
                      {bookLabel}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile layout ── */}
      <div className="lg:hidden">
        {/* Header */}
        <div className="bg-ocre py-12 px-6 text-center">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-2 font-inter">
            {pageTitle.subtitle}
          </p>
          <h1 className="font-playfair text-4xl text-white">
            {pageTitle.title}
          </h1>
        </div>

        {/* Tabs catégories scrollables */}
        <div className="bg-ocre border-t border-white/10 overflow-x-auto">
          <div className="flex gap-2 px-4 pb-4 min-w-max">
            {CATEGORIES.map((cat, idx) => {
              const isActive = idx === activeCategory;
              return (
                <button
                  key={cat.id}
                  onClick={() => selectCategory(idx)}
                  className={`border border-white/40 rounded-full px-5 py-2.5 text-xs uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "bg-white text-ocre font-semibold"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  {locale === "en"
                    ? cat.labelEn
                    : locale === "es"
                      ? cat.labelEs
                      : cat.labelFr}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cards verticales */}
        <div className="px-4 py-8 space-y-5">
          {currentServices.map((service) => (
            <div
              key={service.id}
              className="rounded-3xl overflow-hidden relative h-72 shadow-md"
            >
              <Image
                src={service.image}
                alt={getName(service, locale)}
                fill
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-nuit/90 via-nuit/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs uppercase tracking-widest px-3 py-1 rounded-full mb-3">
                  {getCategoryLabel(activeCategory, locale)}
                </span>
                <h3 className="font-playfair text-2xl text-white mb-4 leading-tight">
                  {getName(service, locale)}
                </h3>
                <Link
                  href={`/${locale}/reservation?service=${encodeURIComponent(service.id)}`}
                  className="inline-block bg-white text-brun text-sm font-medium px-5 py-2.5 rounded-full hover:bg-fond transition-colors"
                >
                  {bookLabel}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
