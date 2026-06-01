// app/[locale]/layout.tsx
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Playfair_Display, Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CookieBanner from "@/components/ui/CookieBanner";
import "../globals.css";

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
  fr: "Salon Mimi — Tresses Rasta & Africaines Marrakech | Jamaa El Fna",
  en: "Salon Mimi — Rasta & African Braids Marrakech | Jamaa El Fna",
  es: "Salon Mimi — Trenzas Rasta y Africanas Marrakech | Jamaa El Fna",
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

  return {
    title: titles[locale] ?? titles.fr,
    description: descriptions[locale] ?? descriptions.fr,
    alternates: {
      canonical: `${BASE_URL}/${locale}/`,
      languages: {
        fr: `${BASE_URL}/fr/`,
        en: `${BASE_URL}/en/`,
        es: `${BASE_URL}/es/`,
        "x-default": `${BASE_URL}/fr/`,
      },
    },
    openGraph: {
      title: titles[locale] ?? titles.fr,
      description: descriptions[locale] ?? descriptions.fr,
      locale,
      type: "website",
      url: `${BASE_URL}/${locale}/`,
      images: [
        {
          url: `${BASE_URL}/${locale}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: "Salon Mimi — Tresses africaines Marrakech",
        },
      ],
    },
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HairSalon",
  name: "Salon Mimi",
  url: "https://mimi-coiffure.com",
  telephone: "+212710388204",
  image: "https://mimi-coiffure.com/images/hero-salon.jpg",
  description:
    "Salon de coiffure Rasta et Africaine à Marrakech. Spécialisé en tresses africaines, box braids, locks, knotless braids. Situé Place Jamaa El Fna, Médina de Marrakech.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Place Jemaa el-Fna",
    addressLocality: "Marrakech",
    postalCode: "40000",
    addressCountry: "MA",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 31.6258,
    longitude: -7.9892,
  },
  hasMap: "https://maps.app.goo.gl/siZDajFcmc85HF519",
  sameAs: [
    "https://maps.app.goo.gl/siZDajFcmc85HF519",
    "https://share.google/t4j91V4ZgAESOoNwp",
    "https://www.instagram.com/Salonmimi.marrakech",
  ],
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
  priceRange: "150-950 MAD",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.5",
    reviewCount: "6",
    bestRating: "5",
  },
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Où se trouve le salon Mimi à Marrakech ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Le salon Mimi est situé Place Jamaa El Fna, dans la Médina de Marrakech.",
      },
    },
    {
      "@type": "Question",
      name: "Quels services de tresses propose le salon Mimi ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Le salon Mimi propose des tresses africaines, tresses rasta, box braids, knotless braids, tresses Fulani, tresses Boho, locks et dreads, cheveux attachés, perruques et tissage.",
      },
    },
    {
      "@type": "Question",
      name: "Comment réserver au salon Mimi Marrakech ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Vous pouvez réserver en ligne directement sur mimi-coiffure.com ou contacter le salon par WhatsApp.",
      },
    },
    {
      "@type": "Question",
      name: "Quels sont les tarifs du salon Mimi Marrakech ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Les tarifs du salon Mimi varient entre 65 MAD et 220 MAD selon la prestation. Les tresses africaines commencent à 125 MAD.",
      },
    },
  ],
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${playfair.variable} ${inter.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
        <script
          defer
          src="https://umami-production-2141.up.railway.app/script.js"
          data-website-id="a779a13d-9789-46fc-95c2-958ead141b9d"
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main>{children}</main>
          <Footer />
          <CookieBanner locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
