"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname === `/${locale}${path}` || pathname === `/${locale}${path}/`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-nuit/92 backdrop-blur-md border-b border-ocre/10">
      <div className="flex items-center justify-between px-12 py-4">
        {/* Liens gauche */}
        <nav className="flex items-center gap-8">
          <Link
            href={`/${locale}`}
            className={`text-[10px] tracking-[3px] uppercase transition-colors ${
              isActive("") ? "text-ocre" : "text-white/70 hover:text-white"
            }`}
          >
            {t("home")}
          </Link>
          <Link
            href={`/${locale}/services`}
            className={`text-[10px] tracking-[3px] uppercase transition-colors ${
              isActive("/services")
                ? "text-ocre"
                : "text-white/70 hover:text-white"
            }`}
          >
            {t("services")}
          </Link>
          <Link
            href={`/${locale}/a-propos`}
            className={`text-[10px] tracking-[3px] uppercase transition-colors ${
              isActive("/a-propos")
                ? "text-ocre"
                : "text-white/70 hover:text-white"
            }`}
          >
            {t("about")}
          </Link>
          <Link
            href={`/${locale}/contact`}
            className={`text-[10px] tracking-[3px] uppercase transition-colors ${
              isActive("/contact")
                ? "text-ocre"
                : "text-white/70 hover:text-white"
            }`}
          >
            {t("contact")}
          </Link>
        </nav>

        {/* Logo centré */}
        <Link
          href={`/${locale}`}
          className="absolute left-1/2 -translate-x-1/2 text-[11px] tracking-[6px] uppercase text-white font-inter"
        >
          Salon Mimi
        </Link>

        {/* CTA droite */}
        <Link
          href={`/${locale}/reservation`}
          className="flex items-center gap-2 bg-ocre hover:bg-or text-white text-[10px] tracking-[2px] uppercase px-5 py-2.5 rounded-full transition-colors"
        >
          <span>→</span>
          <span>{t("book")}</span>
        </Link>
      </div>
    </header>
  );
}
