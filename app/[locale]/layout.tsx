// app/[locale]/layout.tsx
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "../globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const BASE_URL = "https://salonmimi-marrakech.com";

const titles: Record<string, string> = {
  fr: "Salon Mimi — Tresses africaines Marrakech | Place Jamaa El Fna",
  en: "Salon Mimi — African Hair Braiding Marrakech | Jamaa El Fna",
  es: "Salon Mimi — Trenzas africanas Marrakech | Plaza Jamaa El Fna",
};

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
      locale,
      type: "website",
      url: `${BASE_URL}/${locale}`,
      images: [
        {
          url: `${BASE_URL}/og-image.jpg`,
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
  url: "https://salonmimi-marrakech.com",
  telephone: "+212710388204",
  description:
    "Salon de coiffure afro spécialisé en tresses africaines, knotless braids, locks et styles naturels. Situé près de la Place Jamaa El Fna, Médina de Marrakech.",
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
      closes: "20:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday"],
      opens: "10:00",
      closes: "18:00",
    },
  ],
  priceRange: "150–950 MAD",
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
