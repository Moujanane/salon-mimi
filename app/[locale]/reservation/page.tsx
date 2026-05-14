import { getTranslations } from "next-intl/server";
import ReservationForm from "@/components/sections/ReservationForm";

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
    <div className="bg-fond min-h-screen">
      <div className="bg-nuit py-16 text-center">
        <h1 className="font-playfair text-5xl text-ocre">{t("title")}</h1>
      </div>
      <div className="max-w-xl mx-auto px-4 py-16">
        <ReservationForm locale={locale} labels={labels} />
      </div>
    </div>
  );
}
