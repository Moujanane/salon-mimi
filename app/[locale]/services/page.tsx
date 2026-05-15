import { getTranslations } from "next-intl/server";
import ServicesLookbook from "@/components/sections/ServicesLookbook";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tBooking = await getTranslations({ locale, namespace: "booking" });

  return <ServicesLookbook locale={locale} bookLabel={tBooking("submit")} />;
}
