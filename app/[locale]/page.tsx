import { getTranslations } from "next-intl/server";
import HeroHome from "@/components/sections/HeroHome";
import TrustBadge from "@/components/sections/TrustBadge";
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
      <ServicesGrid
        services={featuredServices}
        locale={locale}
        bookLabel={tBooking("submit")}
        showAll={false}
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
