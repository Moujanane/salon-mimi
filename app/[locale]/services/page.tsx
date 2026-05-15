import ServicesCarousel from "@/components/sections/ServicesCarousel";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ServicesCarousel locale={locale} />;
}
