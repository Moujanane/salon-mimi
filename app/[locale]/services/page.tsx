import { getTranslations } from "next-intl/server";
import ServicesCarousel from "@/components/sections/ServicesCarousel";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tBooking = await getTranslations({ locale, namespace: "booking" });

  return <ServicesCarousel locale={locale} bookLabel={tBooking("submit")} />;
}
