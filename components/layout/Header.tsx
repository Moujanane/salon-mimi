"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

const locales = ["fr", "en", "es"] as const;

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(newLocale: string) {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  }

  return (
    <header className="bg-nuit text-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href={`/${locale}`} className="font-playfair text-xl text-or">
          Salon Mimi
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href={`/${locale}`} className="hover:text-or transition-colors">
            {t("home")}
          </Link>
          <Link
            href={`/${locale}/services`}
            className="hover:text-or transition-colors"
          >
            {t("services")}
          </Link>
          <Link
            href={`/${locale}/galerie`}
            className="hover:text-or transition-colors"
          >
            {t("gallery")}
          </Link>
          <Link
            href={`/${locale}/a-propos`}
            className="hover:text-or transition-colors"
          >
            {t("about")}
          </Link>
          <Link
            href={`/${locale}/contact`}
            className="hover:text-or transition-colors"
          >
            {t("contact")}
          </Link>
          <Link
            href={`/${locale}/reservation`}
            className="bg-ocre text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-or transition-colors"
          >
            {t("booking")}
          </Link>
        </nav>
        <div className="flex gap-2 text-xs">
          {locales.map((l) => (
            <button
              key={l}
              onClick={() => switchLocale(l)}
              className={`uppercase px-2 py-1 rounded ${
                locale === l
                  ? "bg-or text-nuit font-bold"
                  : "text-white hover:text-or"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
