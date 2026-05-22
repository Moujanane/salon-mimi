"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  services,
  packages,
  getServiceName,
  getServiceDuration,
  getPackageDescription,
  getPackageDuration,
} from "@/lib/services-data";
import type { Service, Package } from "@/lib/services-data";

export interface ServicesLookbookProps {
  locale: string;
  bookLabel: string;
}

const SERVICE_IMAGES: Record<string, string> = {
  "box-braids-medium": "/images/coiffure-1.jpg",
  "box-braids-xl": "/images/unnamed(1).jpg",
  "knotless-braids": "/images/unnamed(2).jpg",
  "boho-braids": "/images/unnamed(3).jpg",
  "fulani-braids": "/images/unnamed(4).jpg",
  cornrows: "/images/unnamed(5).jpg",
  "mini-braids-enfant": "/images/unnamed(6).jpg",
  "depart-locks": "/images/unnamed(7).jpg",
  "retouche-locks": "/images/unnamed(8).jpg",
  "faux-locks": "/images/unnamed(9).png",
  "marley-twists": "/images/unnamed(10).webp",
  "crochet-braids": "/images/unnamed.png",
  "brushing-argan": "/images/unnamed.webp",
  "soin-argan": "/images/2025-11-20.jpg",
  "boho-experience": "/images/unnamed(3).jpg",
  "faux-locks-perles": "/images/unnamed(9).png",
};

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  fr: {
    title: "Services & Tarifs",
    subtitle: "Tous les prix incluent les produits et accessoires",
  },
  en: {
    title: "Services & Prices",
    subtitle: "All prices include products and accessories",
  },
  es: {
    title: "Servicios & Precios",
    subtitle: "Todos los precios incluyen productos y accesorios",
  },
};

const categoryLabels: Record<string, Record<string, string>> = {
  fr: {
    tresses: "Tresses",
    locks: "Locks & Twists",
    soins: "Soins",
    packages: "Packages",
  },
  en: {
    tresses: "Braids",
    locks: "Locks & Twists",
    soins: "Treatments",
    packages: "Packages",
  },
  es: {
    tresses: "Trenzas",
    locks: "Locks & Twists",
    soins: "Tratamientos",
    packages: "Paquetes",
  },
};

function getCategoryLabel(category: string, loc: string): string {
  return categoryLabels[loc]?.[category] ?? category;
}

type ActiveItem =
  | { type: "service"; item: Service }
  | { type: "package"; item: Package };

export default function ServicesLookbook({
  locale,
  bookLabel,
}: ServicesLookbookProps) {
  const [active, setActive] = useState<ActiveItem>({
    type: "service",
    item: services[0],
  });
  const [imageVisible, setImageVisible] = useState(true);

  const pageTitle = pageTitles[locale] ?? pageTitles.fr;

  function selectItem(newActive: ActiveItem) {
    setImageVisible(false);
    setTimeout(() => {
      setActive(newActive);
      setImageVisible(true);
    }, 200);
  }

  const tresses = services.filter((s) => s.category === "tresses");
  const locks = services.filter((s) => s.category === "locks");
  const soins = services.filter((s) => s.category === "soins");

  function isActiveService(id: string) {
    return active.type === "service" && active.item.id === id;
  }

  function isActivePackage(id: string) {
    return active.type === "package" && active.item.id === id;
  }

  const listItemClass = (isActive: boolean) =>
    `w-full text-left px-6 py-4 rounded-lg transition-all duration-150 ${
      isActive
        ? "bg-ocre/10 text-ocre font-medium"
        : "text-brun/70 hover:bg-ocre/5 hover:text-brun"
    }`;

  return (
    <div className="bg-fond min-h-screen">
      {/* Hero header */}
      <div className="bg-nuit py-16 text-center">
        <h1 className="font-playfair text-5xl text-or">{pageTitle.title}</h1>
        <p className="text-white/60 mt-3">{pageTitle.subtitle}</p>
      </div>

      {/* Split-screen container — desktop */}
      <div className="flex lg:h-[calc(100vh-64px)]">
        {/* LEFT — liste scrollable */}
        <div className="w-full lg:w-2/5 overflow-y-auto bg-fond border-r border-or/20 py-8">
          {/* Tresses */}
          <div className="mb-6">
            <h2 className="font-playfair text-xs uppercase tracking-widest text-or/70 px-8 mb-3">
              {getCategoryLabel("tresses", locale)}
            </h2>
            {tresses.map((service) => (
              <button
                key={service.id}
                onClick={() => selectItem({ type: "service", item: service })}
                className={listItemClass(isActiveService(service.id))}
              >
                <span className="font-medium text-sm">
                  {getServiceName(service, locale)}
                </span>
                <span className="block text-xs text-brun/40 mt-0.5">
                  {getServiceDuration(service, locale)}
                </span>
              </button>
            ))}
          </div>

          {/* Locks & Twists */}
          <div className="mb-6">
            <h2 className="font-playfair text-xs uppercase tracking-widest text-or/70 px-8 mb-3">
              {getCategoryLabel("locks", locale)}
            </h2>
            {locks.map((service) => (
              <button
                key={service.id}
                onClick={() => selectItem({ type: "service", item: service })}
                className={listItemClass(isActiveService(service.id))}
              >
                <span className="font-medium text-sm">
                  {getServiceName(service, locale)}
                </span>
                <span className="block text-xs text-brun/40 mt-0.5">
                  {getServiceDuration(service, locale)}
                </span>
              </button>
            ))}
          </div>

          {/* Soins */}
          <div className="mb-6">
            <h2 className="font-playfair text-xs uppercase tracking-widest text-or/70 px-8 mb-3">
              {getCategoryLabel("soins", locale)}
            </h2>
            {soins.map((service) => (
              <button
                key={service.id}
                onClick={() => selectItem({ type: "service", item: service })}
                className={listItemClass(isActiveService(service.id))}
              >
                <span className="font-medium text-sm">
                  {getServiceName(service, locale)}
                </span>
                <span className="block text-xs text-brun/40 mt-0.5">
                  {getServiceDuration(service, locale)}
                </span>
              </button>
            ))}
          </div>

          {/* Packages */}
          <div className="mb-6">
            <h2 className="font-playfair text-xs uppercase tracking-widest text-or/70 px-8 mb-3">
              {getCategoryLabel("packages", locale)}
            </h2>
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => selectItem({ type: "package", item: pkg })}
                className={listItemClass(isActivePackage(pkg.id))}
              >
                <span className="font-medium text-sm">
                  {getServiceName(pkg, locale)}
                </span>
                <span className="block text-xs text-brun/40 mt-0.5">
                  {getPackageDuration(pkg, locale)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT — panneau sticky */}
        <div className="hidden lg:block lg:w-3/5 sticky top-0 h-[calc(100vh-64px)] overflow-hidden relative">
          <div
            className={`absolute inset-0 transition-opacity duration-300 ${
              imageVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={SERVICE_IMAGES[active.item.id] ?? "/images/hero-salon.jpg"}
              alt={getServiceName(active.item, locale)}
              fill
              className="object-cover"
              priority
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-nuit/90 via-nuit/20 to-transparent" />

            {/* Info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-10">
              <p className="text-or/70 text-xs uppercase tracking-widest mb-2">
                {active.type === "service"
                  ? getCategoryLabel(active.item.category, locale)
                  : getCategoryLabel("packages", locale)}
              </p>
              <h3 className="font-playfair text-4xl text-white mb-2">
                {getServiceName(active.item, locale)}
              </h3>
              {active.type === "package" && (
                <p className="text-white/60 text-sm mb-4">
                  {getPackageDescription(active.item, locale)}
                </p>
              )}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-or">
                  {active.item.priceMad} MAD
                </span>
                <span className="text-white/50">~{active.item.priceEur}€</span>
                {active.type === "service" && (
                  <span className="text-white/55 text-sm">
                    · {getServiceDuration(active.item, locale)}
                  </span>
                )}
                {active.type === "package" && (
                  <span className="text-white/55 text-sm">
                    · {getPackageDuration(active.item, locale)}
                  </span>
                )}
              </div>
              <Link
                href={`/${locale}/reservation?service=${encodeURIComponent(active.item.id)}`}
                className="inline-block bg-ocre text-white px-8 py-3 rounded-full font-medium hover:bg-or transition-colors duration-200"
              >
                {bookLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile — cards empilées */}
      <div className="lg:hidden px-4 py-8 space-y-4">
        {([...services, ...packages] as (Service | Package)[]).map((item) => {
          const isPackage = !("category" in item);
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-or/10"
            >
              <div className="relative h-48">
                <Image
                  src={SERVICE_IMAGES[item.id] ?? "/images/hero-salon.jpg"}
                  alt={getServiceName(item, locale)}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="font-playfair text-lg text-brun mb-1">
                  {getServiceName(item, locale)}
                </h3>
                {isPackage && (
                  <p className="text-brun/60 text-xs mb-3">
                    {getPackageDescription(item as Package, locale)}
                  </p>
                )}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-xl font-bold text-vert">
                    {item.priceMad} MAD
                  </span>
                  <span className="text-brun/40 text-sm">
                    ~{item.priceEur}€
                  </span>
                </div>
                <Link
                  href={`/${locale}/reservation?service=${encodeURIComponent(item.id)}`}
                  className="block text-center bg-ocre text-white py-2.5 rounded-full text-sm font-medium hover:bg-or transition-colors"
                >
                  {bookLabel}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
