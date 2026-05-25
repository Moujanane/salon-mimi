// app/[locale]/reservation/page.tsx
export const revalidate = 3600;

import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import ReservationLayout from "@/components/sections/ReservationLayout";
import { getSettings } from "@/lib/settings";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    fr: "Réserver au Salon Mimi Marrakech — Tresses africaines en ligne",
    en: "Book at Salon Mimi Marrakech — African braids online booking",
    es: "Reservar en Salon Mimi Marrakech — Trenzas africanas reserva online",
  };

  const descriptions: Record<string, string> = {
    fr: "Prenez rendez-vous en ligne au Salon Mimi Marrakech. Tresses africaines, knotless braids, box braids, locks. Confirmation par WhatsApp. Place Jamaa El Fna.",
    en: "Book online at Salon Mimi Marrakech. African braids, knotless braids, box braids, locks. WhatsApp confirmation. Jamaa El Fna Square.",
    es: "Reserva online en Salon Mimi Marrakech. Trenzas africanas, knotless braids, box braids, locks. Confirmación por WhatsApp. Plaza Jamaa El Fna.",
  };

  return {
    title: titles[locale] ?? titles.fr,
    description: descriptions[locale] ?? descriptions.fr,
    alternates: {
      canonical: `https://mimi-coiffure.com/${locale}/reservation/`,
      languages: {
        fr: "https://mimi-coiffure.com/fr/reservation",
        en: "https://mimi-coiffure.com/en/reservation",
        es: "https://mimi-coiffure.com/es/reservation",
        "x-default": "https://mimi-coiffure.com/fr/reservation",
      },
    },
  };
}

export default async function ReservationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "booking" });
  const settings = await getSettings();

  const labels = {
    name: t("name"),
    phone: t("phone"),
    service: t("service"),
    date: t("date"),
    message: t("message"),
    submit: t("submit"),
    success: t("success"),
    error: t("error"),
  };

  const prices: Record<string, string> = {
    "tresses-africaines": settings.price_tresses_africaines,
    "tresses-et-nattes": settings.price_tresses_et_nattes,
    "box-braids": settings.price_box_braids,
    "fulani-braids": settings.price_tresses_fulani,
    "boho-braids": settings.price_tresses_boho,
    "locks-dreads": settings.price_locks_dreads,
    "cheveux-attaches": settings.price_cheveux_attaches,
    "perruques-tissage": settings.price_perruques_tissage,
    colorations: settings.price_colorations,
    "ongles-soins-epilation": settings.price_ongles_soins_epilation,
  };

  return (
    <Suspense fallback={<div className="h-screen bg-nuit" />}>
      <ReservationLayout labels={labels} prices={prices} />
    </Suspense>
  );
}
