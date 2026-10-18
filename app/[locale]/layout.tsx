// app/[locale]/layout.tsx
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Playfair_Display, Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CookieBanner from "@/components/ui/CookieBanner";
import StickyBooking from "@/components/layout/StickyBooking";
import { routing } from "@/i18n/routing";
import { INSTAGRAM_URL, TIKTOK_URL, MAPS_URL, GBP_URL } from "@/lib/social";
import {
  SALON,
  priceRangeLabel,
  postalAddressLd,
  offerCatalogLd,
  areaServedLd,
  reserveActionLd,
} from "@/lib/salon-info";
import { getGoogleReviews } from "@/lib/google-reviews";
import "../globals.css";

// Seules /fr, /en, /es sont des routes valides. Toute autre valeur de [locale]
// (URLs aléatoires, /index.html, /de, etc.) tombe en 404 natif Next.js — le code
// ci-dessous ne s'exécute même pas. Corrige le motif GSC « Page en double sans
// URL canonique » (une URL à point comme /abc.xyz servait une copie de la home
// avec un canonical auto-référent).
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const dynamicParams = false;

function assertLocale(locale: string): asserts locale is "fr" | "en" | "es" {
  if (!(routing.locales as readonly string[]).includes(locale)) notFound();
}

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const BASE_URL = "https://mimi-coiffure.com";

const titles: Record<string, string> = {
  fr: "Salon Mimi Marrakech — Tresses Rasta & Africaines | Jamaa El Fna",
  en: "Salon Mimi Marrakech — Rasta & African Braids | Jamaa El Fna",
  es: "Salon Mimi Marrakech — Trenzas Rasta y Africanas | Jamaa El Fna",
};

const descriptions: Record<string, string> = {
  fr: "Salon de coiffure Rasta et Africaine à Marrakech, Place Jamaa El Fna — la place la plus touristique de la ville. Tresses africaines, box braids, locks, knotless. Réservez en ligne.",
  en: "Rasta and African hair salon in Marrakech, Jamaa El Fna Square — the most iconic square in the city. African braids, box braids, locks, knotless. Book online.",
  es: "Salón de coiffure Rasta y Africano en Marrakech, Plaza Jamaa El Fna — la plaza más turística de la ciudad. Trenzas africanas, box braids, locks, knotless. Reserva en línea.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  assertLocale(locale);

  return {
    metadataBase: new URL(BASE_URL),
    title: titles[locale] ?? titles.fr,
    description: descriptions[locale] ?? descriptions.fr,
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        fr: `${BASE_URL}/fr`,
        en: `${BASE_URL}/en`,
        es: `${BASE_URL}/es`,
        "x-default": `${BASE_URL}/fr`,
      },
    },
    openGraph: {
      title: titles[locale] ?? titles.fr,
      description: descriptions[locale] ?? descriptions.fr,
      siteName: "Salon Mimi",
      locale,
      type: "website",
      url: `${BASE_URL}/${locale}`,
      images: [
        {
          url: `${BASE_URL}/${locale}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: "Salon Mimi — Tresses africaines Marrakech",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titles[locale] ?? titles.fr,
      description: descriptions[locale] ?? descriptions.fr,
      images: [`${BASE_URL}/${locale}/opengraph-image`],
    },
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HairSalon",
  "@id": SALON.id,
  name: SALON.legalName,
  url: SALON.url,
  telephone: SALON.telephone,
  image: "https://mimi-coiffure.com/images/hero-salon.jpg",
  description:
    "Salon de coiffure Rasta et Africaine à Marrakech. Spécialisé en tresses africaines, box braids, locks, knotless braids. Situé Place Jamaa El Fna, Médina de Marrakech.",
  address: postalAddressLd(),
  geo: {
    "@type": "GeoCoordinates",
    latitude: SALON.geo.latitude,
    longitude: SALON.geo.longitude,
  },
  hasMap: MAPS_URL,
  // sameAs : profils publics stables uniquement (Google ignore les liens de
  // partage raccourcis type share.google).
  sameAs: [MAPS_URL, GBP_URL, INSTAGRAM_URL, TIKTOK_URL],
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
      opens: "09:00",
      closes: "19:00",
    },
  ],
  priceRange: priceRangeLabel(),
  hasOfferCatalog: offerCatalogLd(),
  areaServed: areaServedLd(),
  knowsLanguage: SALON.languages,
  potentialAction: reserveActionLd(),
  dateModified: SALON.lastReviewed,
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  assertLocale(locale);
  setRequestLocale(locale);
  const messages = await getMessages();

  const reviewsData = await getGoogleReviews();
  const aggregateRating = {
    "@type": "AggregateRating",
    ratingValue: (
      reviewsData?.rating ?? SALON.ratingFallback.ratingValue
    ).toFixed(1),
    reviewCount: String(
      reviewsData?.user_ratings_total ?? SALON.ratingFallback.reviewCount,
    ),
    bestRating: "5",
  };
  const jsonLdWithRating = { ...jsonLd, aggregateRating };

  return (
    <html lang={locale} className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWithRating) }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="pb-sticky-wa lg:pb-0">{children}</main>
          <Footer />
          <CookieBanner locale={locale} />
          <StickyBooking />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
