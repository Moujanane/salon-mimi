// app/[locale]/reservation-v2/page.tsx
// Page de PREVIEW du nouveau design de réservation. noindex tant qu'elle
// n'a pas remplacé /reservation. Ne pas ajouter d'alternates/canonical ni
// d'entrée sitemap : elle ne doit pas être indexée.
export const revalidate = 3600;

import { getTranslations } from "next-intl/server";
import ReservationLayoutV2 from "@/components/sections/ReservationLayoutV2";
import { getSettings } from "@/lib/settings";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    fr: "Réserver (nouvelle version) — Salon Mimi Marrakech",
    en: "Book (new version) — Salon Mimi Marrakech",
    es: "Reservar (nueva versión) — Salon Mimi Marrakech",
  };

  return {
    title: titles[locale] ?? titles.fr,
    robots: { index: false, follow: false },
  };
}

export default async function ReservationV2Page({
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
    email: "Email",
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
    <ReservationLayoutV2 labels={labels} prices={prices} locale={locale} />
  );
}
