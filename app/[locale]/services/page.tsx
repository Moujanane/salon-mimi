import ServicesPageClient from "@/components/sections/ServicesPageClient";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ServicesPageClient locale={locale} />;
}
