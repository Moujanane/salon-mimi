import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import Link from "next/link";
import { INSTAGRAM_URL, TIKTOK_URL, MAPS_URL } from "@/lib/social";

const legalLinks: Record<string, { mentions: string; privacy: string }> = {
  fr: { mentions: "Mentions légales", privacy: "Politique de confidentialité" },
  en: { mentions: "Legal notice", privacy: "Privacy policy" },
  es: { mentions: "Aviso legal", privacy: "Política de privacidad" },
};

const followLabel: Record<string, string> = {
  fr: "Suivez-nous",
  en: "Follow us",
  es: "Síguenos",
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

        <p className="text-[11px] tracking-[3px] uppercase text-white/40 mt-6 mb-3">
          {followLabel[locale] ?? followLabel.fr}
        </p>
        <div className="flex justify-center items-center gap-5">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram Salon Mimi"
            className="text-white/55 hover:text-ocre transition-colors"
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.8c-3.15 0-3.5.01-4.74.07-.9.04-1.39.19-1.71.32-.43.17-.74.37-1.06.69-.32.32-.52.63-.69 1.06-.13.32-.28.81-.32 1.71-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.04.9.19 1.39.32 1.71.17.43.37.74.69 1.06.32.32.63.52 1.06.69.32.13.81.28 1.71.32 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c.9-.04 1.39-.19 1.71-.32.43-.17.74-.37 1.06-.69.32-.32.52-.63.69-1.06.13-.32.28-.81.32-1.71.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.04-.9-.19-1.39-.32-1.71a2.85 2.85 0 0 0-.69-1.06 2.85 2.85 0 0 0-1.06-.69c-.32-.13-.81-.28-1.71-.32-1.24-.06-1.59-.07-4.74-.07zm0 3.06a4.98 4.98 0 1 1 0 9.96 4.98 4.98 0 0 1 0-9.96zm0 8.22a3.24 3.24 0 1 0 0-6.48 3.24 3.24 0 0 0 0 6.48zm6.34-8.42a1.16 1.16 0 1 1-2.32 0 1.16 1.16 0 0 1 2.32 0z" />
            </svg>
          </a>
          <a
            href={TIKTOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok Salon Mimi"
            className="text-white/55 hover:text-ocre transition-colors"
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M16.6 5.82a4.28 4.28 0 0 1-1.05-2.82h-3.11v12.4a2.6 2.6 0 0 1-2.6 2.5 2.6 2.6 0 0 1-2.6-2.6 2.6 2.6 0 0 1 3.4-2.48V7.03a5.72 5.72 0 0 0-.8-.06 5.72 5.72 0 0 0 0 11.44 5.72 5.72 0 0 0 5.72-5.72V9.01a7.35 7.35 0 0 0 4.3 1.38V7.28a4.3 4.3 0 0 1-3.26-1.46z" />
            </svg>
          </a>
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Salon Mimi sur Google Maps"
            className="text-white/55 hover:text-ocre transition-colors"
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2a7 7 0 0 0-7 7c0 4.7 6.2 12.4 6.47 12.73a.68.68 0 0 0 1.06 0C12.8 21.4 19 13.7 19 9a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
            </svg>
          </a>
        </div>

        <div className="flex justify-center gap-6 mt-7">
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
