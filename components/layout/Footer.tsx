import { getTranslations } from "next-intl/server";

export default async function Footer() {
  const t = await getTranslations("footer");
  return (
    <footer className="bg-nuit text-white py-10 mt-20">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="font-playfair text-or text-xl mb-2">Salon Mimi</p>
        <p className="text-sm text-gray-400">{t("address")}</p>
        <p className="text-xs text-gray-600 mt-4">
          © {new Date().getFullYear()} Salon Mimi — {t("rights")}
        </p>
      </div>
    </footer>
  );
}
