"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) =>
    pathname === `/${locale}${path}` || pathname === `/${locale}${path}/`;

  const links = [
    { href: "", label: t("home") },
    { href: "/services", label: t("services") },
    { href: "/a-propos", label: t("about") },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-nuit/92 backdrop-blur-md border-b border-ocre/10">
      <div className="relative flex items-center justify-between px-5 md:px-12 py-4">
        {/* Liens gauche — masqués sur mobile */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={`/${locale}${l.href}`}
              className={`text-[10px] tracking-[3px] uppercase transition-colors ${
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
          className="md:absolute md:left-1/2 md:-translate-x-1/2 text-[11px] tracking-[6px] uppercase text-white font-inter"
        >
          Salon Mimi
        </Link>

        {/* Droite : CTA + hamburger */}
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/reservation`}
            className="hidden sm:flex items-center gap-2 bg-ocre hover:bg-or text-white text-[10px] tracking-[2px] uppercase px-5 py-2.5 rounded-full transition-colors"
          >
            <span>→</span>
            <span>{t("book")}</span>
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden flex flex-col gap-1.5 p-3 min-h-[44px] min-w-[44px] items-center justify-center"
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
        <div className="md:hidden bg-nuit/98 border-t border-ocre/10 px-5 py-6 flex flex-col gap-4">
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
        </div>
      )}
    </header>
  );
}
