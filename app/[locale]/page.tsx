export const revalidate = 3600;

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

const BASE_URL = "https://mimi-coiffure.com";

const titles: Record<string, string> = {
  fr: "Salon Mimi — Tresses Rasta & Africaines Marrakech | Jamaa El Fna",
  en: "Salon Mimi — Rasta & African Braids Marrakech | Jamaa El Fna",
  es: "Salon Mimi — Trenzas Rasta y Africanas Marrakech | Jamaa El Fna",
};

const descriptions: Record<string, string> = {
  fr: "Salon de coiffure Rasta et Africaine à Marrakech, Place Jamaa El Fna. Tresses africaines, box braids, locks, knotless. Réservez en ligne.",
  en: "Rasta and African hair salon in Marrakech, Jamaa El Fna Square. African braids, box braids, locks, knotless. Book online.",
  es: "Salón de coiffure Rasta y Africano en Marrakech, Plaza Jamaa El Fna. Trenzas africanas, box braids, locks, knotless. Reserva en línea.",
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
        fr: `${BASE_URL}/fr`,
        en: `${BASE_URL}/en`,
        es: `${BASE_URL}/es`,
        "x-default": `${BASE_URL}/fr`,
      },
    },
  };
}
import HeroHome from "@/components/sections/HeroHome";
import TrustBadge from "@/components/sections/TrustBadge";
import GoogleReviews from "@/components/sections/GoogleReviews";
import ServicesGrid from "@/components/sections/ServicesGrid";
import PackageSignature from "@/components/sections/PackageSignature";
import CTAFinal from "@/components/sections/CTAFinal";
import LocationSection from "@/components/sections/LocationSection";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { services } from "@/lib/services-data";
import { getSettings } from "@/lib/settings";

const ctaTitles: Record<string, string> = {
  fr: "Prends soin de ta couronne",
  en: "Take care of your crown",
  es: "Cuida tu corona",
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hero" });
  const tBooking = await getTranslations({ locale, namespace: "booking" });
  const settings = await getSettings();
  const whatsappNumber = settings.whatsapp_number;
  const featuredServices = services.filter((s) => s.featured);

  const featuredPrices: Record<string, number> = {
    "box-braids-medium":
      parseInt(settings.price_featured_box_braids_medium) || 550,
    "knotless-braids": parseInt(settings.price_featured_knotless_braids) || 700,
    "boho-braids": parseInt(settings.price_featured_boho_braids) || 650,
    cornrows: parseInt(settings.price_featured_cornrows) || 300,
  };

  return (
    <>
      <HeroHome
        locale={locale}
        title={t("title")}
        subtitle={t("subtitle")}
        location={t("location")}
        ctaBook={t("cta_book")}
        ctaServices={t("cta_services")}
      />
      <TrustBadge locale={locale} />
      <GoogleReviews locale={locale} />
      <ServicesGrid
        services={featuredServices}
        locale={locale}
        bookLabel={tBooking("submit")}
        showAll={false}
        featuredPrices={featuredPrices}
      />
      <PackageSignature locale={locale} bookLabel={t("cta_book")} />
      <LocationSection locale={locale} whatsappNumber={whatsappNumber} />
      <CTAFinal
        locale={locale}
        title={ctaTitles[locale] ?? ctaTitles.fr}
        ctaBook={t("cta_book")}
        whatsappNumber={whatsappNumber}
      />
      <WhatsAppButton number={whatsappNumber} label="WhatsApp" />
    </>
  );
}
