import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("hero");

  return (
    <main className="p-8">
      <h1 className="text-4xl font-bold">{t("title")}</h1>
      <p className="mt-2 text-lg">
        {t("subtitle")} — {t("location")}
      </p>
    </main>
  );
}
