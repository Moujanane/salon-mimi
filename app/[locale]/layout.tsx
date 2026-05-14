// app/[locale]/layout.tsx
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "../globals.css";

const BASE_URL = "https://salonmimi-marrakech.com";

const descriptions: Record<string, string> = {
  fr: "Coiffures africaines authentiques au cœur de la médina de Marrakech. Box braids, knotless, locks, soins argan. Réservez en ligne.",
  en: "Authentic African hairstyles in the heart of Marrakech Medina. Box braids, knotless braids, locks, argan treatments. Book online.",
  es: "Peinados africanos auténticos en el corazón de la medina de Marrakech. Box braids, knotless, locks, tratamientos argán. Reserva en línea.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: "Salon Mimi — African Hair Braiding Marrakech",
    description: descriptions[locale] ?? descriptions.fr,
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        fr: `${BASE_URL}/fr`,
        en: `${BASE_URL}/en`,
        es: `${BASE_URL}/es`,
      },
    },
    openGraph: {
      title: "Salon Mimi — African Hair Braiding Marrakech",
      description: descriptions[locale] ?? descriptions.fr,
      locale,
      type: "website",
      url: `${BASE_URL}/${locale}`,
    },
  };
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HairSalon",
  name: "Salon Mimi — African Hair Braiding",
  url: BASE_URL,
  telephone: "+212710388204",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Place Jemaa el-Fna",
    addressLocality: "Marrakech",
    postalCode: "40000",
    addressCountry: "MA",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 31.625956,
    longitude: -7.989167,
  },
  openingHours: "Mo-Sa 09:00-19:00",
  priceRange: "200-950 MAD",
  servesCuisine: "African Hair Braiding",
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
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
