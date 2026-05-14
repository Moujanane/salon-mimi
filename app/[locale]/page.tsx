import { getTranslations } from "next-intl/server";
import Hero from "@/components/sections/Hero";
import TrustBadge from "@/components/sections/TrustBadge";
import ServicesGrid from "@/components/sections/ServicesGrid";
import PackageSignature from "@/components/sections/PackageSignature";
import CTAFinal from "@/components/sections/CTAFinal";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { services } from "@/lib/services-data";

const ctaTitles: Record<string, string> = {
  fr: "Prête pour votre transformation ?",
  en: "Ready for your transformation?",
  es: "¿Lista para tu transformación?",
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hero" });
  const tBooking = await getTranslations({ locale, namespace: "booking" });
  const whatsappNumber = "212710388204";
  const featuredServices = services.filter((s) => s.featured);

  return (
    <>
      <Hero
        locale={locale}
        title={t("title")}
        subtitle={t("subtitle")}
        location={t("location")}
        ctaBook={t("cta_book")}
        ctaServices={t("cta_services")}
      />
      <TrustBadge locale={locale} />
      <ServicesGrid
        services={featuredServices}
        locale={locale}
        bookLabel={tBooking("submit")}
        showAll={false}
      />
      <PackageSignature locale={locale} bookLabel={t("cta_book")} />
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
