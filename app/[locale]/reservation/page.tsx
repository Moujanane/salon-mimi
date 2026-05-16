import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import ReservationLayout from "@/components/sections/ReservationLayout";

export default async function ReservationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "booking" });

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

  return (
    <Suspense fallback={<div className="h-screen bg-nuit" />}>
      <ReservationLayout locale={locale} labels={labels} />
    </Suspense>
  );
}
