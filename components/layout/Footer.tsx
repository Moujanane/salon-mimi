import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import Link from "next/link";

const legalLinks: Record<string, { mentions: string; privacy: string }> = {
  fr: { mentions: "Mentions légales", privacy: "Politique de confidentialité" },
  en: { mentions: "Legal notice", privacy: "Privacy policy" },
  es: { mentions: "Aviso legal", privacy: "Política de privacidad" },
};

export default async function Footer() {
  const t = await getTranslations("footer");
  const locale = await getLocale();
  const links = legalLinks[locale] ?? legalLinks.fr;

  return (
    <footer className="bg-nuit text-white py-10 mt-20">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="font-playfair text-or text-xl mb-2">Salon Mimi</p>
        <p className="text-sm text-white/55">{t("address")}</p>
        <div className="flex justify-center gap-6 mt-5">
          <Link
            href={`/${locale}/mentions-legales`}
            className="text-xs text-white/40 hover:text-ocre transition-colors"
          >
            {links.mentions}
          </Link>
          <Link
            href={`/${locale}/politique-de-confidentialite`}
            className="text-xs text-white/40 hover:text-ocre transition-colors"
          >
            {links.privacy}
          </Link>
        </div>
        <p className="text-xs text-white/35 mt-4">
          © {new Date().getFullYear()} Salon Mimi. {t("rights")}
        </p>
      </div>
    </footer>
  );
}
