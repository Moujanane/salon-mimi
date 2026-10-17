export const revalidate = 3600;

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { pageMetadata } from "@/lib/page-meta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    ...pageMetadata("home", locale, ""),
  };
}
import HeroHome from "@/components/sections/HeroHome";
import TrustBadge from "@/components/sections/TrustBadge";
import GoogleReviews from "@/components/sections/GoogleReviews";
import ServicesGrid from "@/components/sections/ServicesGrid";
import CTAFinal from "@/components/sections/CTAFinal";
import LocationSection from "@/components/sections/LocationSection";
import FaqSection from "@/components/sections/FaqSection";
import InfoBlock from "@/components/sections/InfoBlock";
import { homeIntro } from "@/lib/page-content";
import { faqJsonLd } from "@/lib/faq";
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
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "hero" });
  const tBooking = await getTranslations({ locale, namespace: "booking" });
  const settings = await getSettings();
  const whatsappNumber = settings.whatsapp_number;
  const featuredServices = services.filter((s) => s.featured);
  const intro = homeIntro(locale);

  return (
    <>
      <HeroHome
        locale={locale}
        title={t("title")}
        subtitle={t("subtitle")}
        location={t("location")}
        ctaBook={t("cta_book")}
        ctaServices={t("cta_services")}
        badge={t("badge")}
        h1Line1={t("h1_line1")}
        h1Line2={t("h1_line2")}
        tagline={t("tagline")}
        taglineEm={t("tagline_em")}
        body={t("body")}
        bodyEm={t("body_em")}
        ctaBookLabel={t("cta_book_label")}
        ctaServicesLabel={t("cta_services_label")}
      />
      <InfoBlock
        id="intro-title"
        tone="dark"
        title={intro.title}
        paragraph={intro.text}
      />
      <TrustBadge locale={locale} />
      <GoogleReviews locale={locale} />
      <ServicesGrid
        services={featuredServices}
        locale={locale}
        bookLabel={tBooking("submit")}
        showAll={false}
      />
      <LocationSection locale={locale} whatsappNumber={whatsappNumber} />
      <FaqSection locale={locale} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd(locale)).replace(/</g, "\\u003c"),
        }}
      />
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
