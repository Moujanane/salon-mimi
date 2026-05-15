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
  media: { type: "image" | "video"; src: string };
  durationFr: string;
  durationEn: string;
  category: string;
}

const SERVICES: ServiceItem[] = [
  // — TRESSES —
  {
    id: "box-braids-medium",
    nameFr: "Box Braids Medium",
    nameEn: "Box Braids Medium",
    nameEs: "Box Braids Medianas",
    media: { type: "video", src: "/videos/Tresses.mp4" },
    durationFr: "3–4h",
    durationEn: "3–4h",
    category: "tresses",
  },
  {
    id: "box-braids-xl",
    nameFr: "Box Braids XL",
    nameEn: "Box Braids XL",
    nameEs: "Box Braids XL",
    media: { type: "video", src: "/videos/Tresses2.mp4" },
    durationFr: "2–3h",
    durationEn: "2–3h",
    category: "tresses",
  },
  {
    id: "knotless-braids",
    nameFr: "Knotless Braids",
    nameEn: "Knotless Braids",
    nameEs: "Knotless Braids",
    media: { type: "video", src: "/videos/Tresses3.mp4" },
    durationFr: "4–5h",
    durationEn: "4–5h",
    category: "tresses",
  },
  {
    id: "boho-braids",
    nameFr: "Boho Braids",
    nameEn: "Boho Braids",
    nameEs: "Boho Braids",
    media: { type: "video", src: "/videos/Tresses4.mp4" },
    durationFr: "5–6h",
    durationEn: "5–6h",
    category: "tresses",
  },
  {
    id: "fulani-braids",
    nameFr: "Fulani Braids",
    nameEn: "Fulani Braids",
    nameEs: "Fulani Braids",
    media: { type: "video", src: "/videos/Tresses5mp4.mp4" },
    durationFr: "4–5h",
    durationEn: "4–5h",
    category: "tresses",
  },
  {
    id: "cornrows",
    nameFr: "Cornrows",
    nameEn: "Cornrows",
    nameEs: "Cornrows",
    media: { type: "video", src: "/videos/Mimi.mp4" },
    durationFr: "2–3h",
    durationEn: "2–3h",
    category: "tresses",
  },
  {
    id: "mini-braids-enfant",
    nameFr: "Mini Braids Enfant",
    nameEn: "Mini Braids (Child)",
    nameEs: "Mini Braids Niña",
    media: { type: "video", src: "/videos/Mimi2.mp4" },
    durationFr: "1–2h",
    durationEn: "1–2h",
    category: "tresses",
  },
  // — LOCKS & TWISTS —
  {
    id: "depart-locks",
    nameFr: "Départ de Locks",
    nameEn: "Starter Locs",
    nameEs: "Inicio de Locks",
    media: { type: "image", src: "/images/s-depart-locks.jpg" },
    durationFr: "3–5h",
    durationEn: "3–5h",
    category: "locks",
  },
  {
    id: "retouche-locks",
    nameFr: "Retouche Locks",
    nameEn: "Loc Retouch",
    nameEs: "Retoque Locks",
    media: { type: "image", src: "/images/s-retouche-locks.jpg" },
    durationFr: "2–4h",
    durationEn: "2–4h",
    category: "locks",
  },
  {
    id: "faux-locks",
    nameFr: "Faux Locks",
    nameEn: "Faux Locs",
    nameEs: "Faux Locks",
    media: { type: "image", src: "/images/s-faux-locks.png" },
    durationFr: "4–6h",
    durationEn: "4–6h",
    category: "locks",
  },
  {
    id: "marley-twists",
    nameFr: "Marley Twists",
    nameEn: "Marley Twists",
    nameEs: "Marley Twists",
    media: { type: "image", src: "/images/s-marley.webp" },
    durationFr: "3–4h",
    durationEn: "3–4h",
    category: "locks",
  },
  {
    id: "crochet-braids",
    nameFr: "Crochet Braids",
    nameEn: "Crochet Braids",
    nameEs: "Crochet Braids",
    media: { type: "image", src: "/images/s-crochet.webp" },
    durationFr: "2–3h",
    durationEn: "2–3h",
    category: "locks",
  },
  // — SOINS —
  {
    id: "brushing-argan",
    nameFr: "Brushing Naturel Argan",
    nameEn: "Natural Argan Blowout",
    nameEs: "Brushing Natural Argán",
    media: { type: "image", src: "/images/s-brushing.png" },
    durationFr: "1–2h",
    durationEn: "1–2h",
    category: "soins",
  },
  {
    id: "soin-argan",
    nameFr: "Soin Argan",
    nameEn: "Argan Treatment",
    nameEs: "Tratamiento Argán",
    media: { type: "image", src: "/images/2025-11-20.jpg" },
    durationFr: "1h",
    durationEn: "1h",
    category: "soins",
  },
  // — PACKAGES —
  {
    id: "boho-experience",
    nameFr: "Boho Experience",
    nameEn: "Boho Experience",
    nameEs: "Boho Experience",
    media: { type: "image", src: "/images/s-boho.jpg" },
    durationFr: "4h",
    durationEn: "4h",
    category: "packages",
  },
  {
    id: "faux-locks-perles",
    nameFr: "Faux Locks + Bijoux Perles",
    nameEn: "Faux Locs + Pearl Jewelry",
    nameEs: "Faux Locks + Bisutería Perlas",
    media: { type: "image", src: "/images/s-faux-locks.png" },
    durationFr: "5h",
    durationEn: "5h",
    category: "packages",
  },
];

const CATEGORIES = [
  {
    id: "tresses",
    labelFr: "Tresses Africaines",
    labelEn: "African Braids",
    labelEs: "Trenzas Africanas",
  },
  {
    id: "locks",
    labelFr: "Locks & Twists",
    labelEn: "Locks & Twists",
    labelEs: "Locks & Twists",
  },
  {
    id: "soins",
    labelFr: "Soins Capillaires",
    labelEn: "Hair Treatments",
    labelEs: "Tratamientos",
  },
  {
    id: "packages",
    labelFr: "Packages Signature",
    labelEn: "Signature Packages",
    labelEs: "Paquetes Signature",
  },
];

const PAGE_LABELS: Record<
  string,
  { title: string; sub: string; duration: string }
> = {
  fr: {
    title: "Nos Services",
    sub: "Tresses · Locks · Soins · Packages",
    duration: "Durée",
  },
  en: {
    title: "Our Services",
    sub: "Braids · Locks · Treatments · Packages",
    duration: "Duration",
  },
  es: {
    title: "Nuestros Servicios",
    sub: "Trenzas · Locks · Tratamientos · Paquetes",
    duration: "Duración",
  },
};

function getName(s: ServiceItem, locale: string) {
  if (locale === "en") return s.nameEn;
  if (locale === "es") return s.nameEs;
  return s.nameFr;
}

function getCatLabel(cat: (typeof CATEGORIES)[number], locale: string) {
  if (locale === "en") return cat.labelEn;
  if (locale === "es") return cat.labelEs;
  return cat.labelFr;
}

export default function ServicesCarousel({
  locale,
  bookLabel,
}: ServicesCarouselProps) {
  const [activeCat, setActiveCat] = useState("tresses");
  const [activeId, setActiveId] = useState("box-braids-medium");
  const [fading, setFading] = useState(false);

  const labels = PAGE_LABELS[locale] ?? PAGE_LABELS.fr;
  const filtered = SERVICES.filter((s) => s.category === activeCat);
  const active = SERVICES.find((s) => s.id === activeId) ?? filtered[0];

  function selectService(id: string) {
    if (id === activeId) return;
    setFading(true);
    setTimeout(() => {
      setActiveId(id);
      setFading(false);
    }, 220);
  }

  function selectCat(id: string) {
    const first = SERVICES.find((s) => s.category === id);
    if (!first) return;
    setActiveCat(id);
    setFading(true);
    setTimeout(() => {
      setActiveId(first.id);
      setFading(false);
    }, 220);
  }

  return (
    <>
      {/* ═══════════════ DESKTOP ═══════════════ */}
      <div className="hidden lg:flex" style={{ height: "calc(100vh - 64px)" }}>
        {/* ── GAUCHE : fond ocre, liste des services ── */}
        <div
          className="w-[42%] flex flex-col overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #B8722E 0%, #8C4F1A 100%)",
          }}
        >
          {/* En-tête */}
          <div className="px-10 pt-10 pb-6 flex-shrink-0">
            <p className="text-white/50 text-[10px] uppercase tracking-[0.3em] mb-2 font-inter">
              {labels.sub}
            </p>
            <h1 className="font-playfair text-5xl text-white leading-tight">
              {labels.title}
            </h1>
            <div className="mt-4 w-10 h-px bg-white/30" />
          </div>

          {/* Onglets catégories */}
          <div className="flex gap-2 px-10 pb-5 flex-shrink-0 flex-wrap">
            {CATEGORIES.map((cat) => {
              const isActive = cat.id === activeCat;
              return (
                <button
                  key={cat.id}
                  onClick={() => selectCat(cat.id)}
                  className={`text-[11px] font-medium uppercase tracking-widest px-4 py-2 rounded-full transition-all duration-200 ${
                    isActive
                      ? "bg-white text-ocre shadow-sm"
                      : "border border-white/30 text-white/70 hover:border-white/60 hover:text-white"
                  }`}
                >
                  {getCatLabel(cat, locale)}
                </button>
              );
            })}
          </div>

          {/* Liste services — scrollable */}
          <div className="flex-1 overflow-y-auto px-10 pb-8 space-y-1">
            {filtered.map((service) => {
              const isActive = service.id === activeId;
              return (
                <button
                  key={service.id}
                  onClick={() => selectService(service.id)}
                  className={`w-full text-left px-5 py-4 rounded-xl transition-all duration-200 flex items-center justify-between group ${
                    isActive
                      ? "bg-white/15 border border-white/25"
                      : "hover:bg-white/8 border border-transparent"
                  }`}
                >
                  <div>
                    <span
                      className={`block font-medium text-[15px] leading-snug transition-colors duration-200 ${
                        isActive
                          ? "text-white"
                          : "text-white/70 group-hover:text-white"
                      }`}
                    >
                      {getName(service, locale)}
                    </span>
                    <span className="block text-xs text-white/40 mt-0.5">
                      {locale === "en"
                        ? service.durationEn
                        : service.durationFr}
                    </span>
                  </div>
                  {/* Indicateur vidéo */}
                  {service.media.type === "video" && (
                    <span className="text-white/30 group-hover:text-white/60 transition-colors duration-200 flex-shrink-0 ml-3">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </span>
                  )}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70 flex-shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── DROITE : media du service sélectionné ── */}
        <div className="w-[58%] relative bg-nuit overflow-hidden">
          {/* Media avec fade */}
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{ opacity: fading ? 0 : 1 }}
          >
            {active.media.type === "video" ? (
              <video
                key={active.id}
                src={active.media.src}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <Image
                key={active.id}
                src={active.media.src}
                alt={getName(active, locale)}
                fill
                className="object-cover"
                sizes="60vw"
                priority
              />
            )}

            {/* Gradient du bas */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

            {/* Info overlay en bas */}
            <div className="absolute bottom-0 left-0 right-0 p-10">
              <p className="text-white/50 text-[10px] uppercase tracking-[0.25em] mb-2 font-inter">
                {CATEGORIES.find((c) => c.id === active.category)
                  ? getCatLabel(
                      CATEGORIES.find((c) => c.id === active.category)!,
                      locale,
                    )
                  : ""}
              </p>
              <h2 className="font-playfair text-4xl text-white mb-1 leading-tight">
                {getName(active, locale)}
              </h2>
              <p className="text-white/40 text-sm mb-8 font-inter">
                {labels.duration} ·{" "}
                {locale === "en" ? active.durationEn : active.durationFr}
              </p>
              <Link
                href={`/${locale}/reservation?service=${encodeURIComponent(active.id)}`}
                className="inline-flex items-center gap-3 bg-ocre text-white text-sm font-medium px-8 py-3.5 rounded-full hover:bg-or transition-colors duration-200 shadow-lg"
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
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ MOBILE ═══════════════ */}
      <div className="lg:hidden">
        {/* En-tête mobile */}
        <div
          className="px-5 py-10 text-center"
          style={{
            background: "linear-gradient(160deg, #B8722E 0%, #8C4F1A 100%)",
          }}
        >
          <h1 className="font-playfair text-4xl text-white">{labels.title}</h1>
          <p className="text-white/50 text-xs mt-2 uppercase tracking-widest">
            {labels.sub}
          </p>
        </div>

        {/* Onglets catégories mobile */}
        <div className="flex gap-2 px-4 py-4 overflow-x-auto scrollbar-hide bg-white border-b border-or/10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => selectCat(cat.id)}
              className={`flex-shrink-0 text-[11px] font-medium uppercase tracking-widest px-4 py-2 rounded-full transition-all duration-200 ${
                cat.id === activeCat
                  ? "bg-ocre text-white"
                  : "border border-brun/20 text-brun/60 hover:border-ocre"
              }`}
            >
              {getCatLabel(cat, locale)}
            </button>
          ))}
        </div>

        {/* Cards mobile */}
        <div className="px-4 py-6 space-y-4 bg-fond">
          {filtered.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-or/10"
            >
              {/* Media */}
              <div className="relative h-56">
                {service.media.type === "video" ? (
                  <video
                    src={service.media.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={service.media.src}
                    alt={getName(service, locale)}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                )}
              </div>
              {/* Infos */}
              <div className="p-5">
                <h3 className="font-playfair text-xl text-brun mb-1">
                  {getName(service, locale)}
                </h3>
                <p className="text-brun/40 text-xs mb-4">
                  {labels.duration} ·{" "}
                  {locale === "en" ? service.durationEn : service.durationFr}
                </p>
                <Link
                  href={`/${locale}/reservation?service=${encodeURIComponent(service.id)}`}
                  className="block text-center bg-ocre text-white py-3 rounded-full text-sm font-medium hover:bg-or transition-colors"
                >
                  {bookLabel}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
