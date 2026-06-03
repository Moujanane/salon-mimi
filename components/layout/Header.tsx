"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LOCALES = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
];

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const isActive = (path: string) =>
    pathname === `/${locale}${path}` || pathname === `/${locale}${path}/`;

  // Remplace le préfixe de locale dans le pathname pour le sélecteur de langue
  const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";

  const links = [
    { href: "", label: t("home") },
    { href: "/services", label: t("services") },
    { href: "/galerie", label: t("gallery") },
    { href: "/a-propos", label: t("about") },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-nuit border-b border-ocre/10">
      <div className="relative flex items-center justify-between px-5 md:px-12 py-4">
        {/* Liens gauche — masqués sur mobile */}
        <nav className="hidden lg:flex items-center gap-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={`/${locale}${l.href}`}
              className={`text-[9px] tracking-[1.5px] uppercase transition-colors whitespace-nowrap ${
                isActive(l.href)
                  ? "text-ocre"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Logo centré sur desktop, gauche sur mobile */}
        <Link
          href={`/${locale}`}
          className="lg:absolute lg:left-1/2 lg:-translate-x-1/2 text-[11px] tracking-[6px] uppercase text-white font-inter"
        >
          Salon Mimi
        </Link>

        {/* Droite : sélecteur de langue + CTA + hamburger */}
        <div className="flex items-center gap-3">
          {/* Sélecteur de langue — desktop */}
          <div className="hidden lg:block relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 text-[10px] tracking-[2px] uppercase text-white/60 hover:text-white transition-colors px-2 py-1"
            >
              {locale.toUpperCase()}
              <svg
                className={`w-2.5 h-2.5 transition-transform ${langOpen ? "rotate-180" : ""}`}
                viewBox="0 0 10 6"
                fill="none"
              >
                <path
                  d="M1 1l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 bg-nuit border border-ocre/20 rounded-xl overflow-hidden shadow-lg">
                {LOCALES.filter((l) => l.code !== locale).map((l) => (
                  <Link
                    key={l.code}
                    href={`/${l.code}${pathWithoutLocale}`}
                    onClick={() => setLangOpen(false)}
                    className="block px-4 py-2 text-[10px] tracking-[2px] uppercase text-white/60 hover:text-ocre hover:bg-ocre/10 transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href={`/${locale}/reservation`}
            className="hidden lg:flex items-center gap-2 bg-ocre hover:bg-or text-white text-[10px] tracking-[2px] uppercase px-5 py-2.5 rounded-full transition-colors"
          >
            <span>→</span>
            <span>{t("book")}</span>
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden flex flex-col gap-1.5 p-3 min-h-[44px] min-w-[44px] items-center justify-center"
            aria-label="Menu"
          >
            <span
              className={`block w-6 h-px bg-white transition-transform duration-200 ${
                open ? "rotate-45 translate-y-[7px]" : ""
              }`}
            />
            <span
              className={`block w-6 h-px bg-white transition-opacity duration-200 ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-6 h-px bg-white transition-transform duration-200 ${
                open ? "-rotate-45 -translate-y-[7px]" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Menu mobile drawer */}
      {open && (
        <div className="lg:hidden bg-nuit/98 border-t border-ocre/10 px-5 py-6 flex flex-col gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={`/${locale}${l.href}`}
              onClick={() => setOpen(false)}
              className={`text-[11px] tracking-[3px] uppercase py-2 transition-colors ${
                isActive(l.href) ? "text-ocre" : "text-white/70"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href={`/${locale}/reservation`}
            onClick={() => setOpen(false)}
            className="mt-2 flex items-center justify-center gap-2 bg-ocre text-white text-[10px] tracking-[2px] uppercase px-5 py-3 rounded-full"
          >
            → {t("book")}
          </Link>
          {/* Sélecteur de langue — mobile */}
          <div className="flex items-center gap-3 pt-2 border-t border-ocre/10">
            {LOCALES.map((l) => (
              <Link
                key={l.code}
                href={`/${l.code}${pathWithoutLocale}`}
                onClick={() => setOpen(false)}
                className={`text-[10px] tracking-[2px] uppercase transition-colors ${
                  l.code === locale
                    ? "text-ocre"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
