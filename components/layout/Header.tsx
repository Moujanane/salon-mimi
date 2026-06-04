"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LOCALES = [
  { code: "fr", label: "FR", flag: "🇫🇷" },
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "es", label: "ES", flag: "🇪🇸" },
];

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const isActive = (path: string) =>
    pathname === `/${locale}${path}` || pathname === `/${locale}${path}/`;

  const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";

  const links = [
    { href: "", label: t("home") },
    { href: "/services", label: t("services") },
    { href: "/galerie", label: t("gallery") },
    { href: "/a-propos", label: t("about") },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "linear-gradient(to bottom, #2C1508 0%, #241206 100%)",
        borderBottom: "1px solid rgba(193,123,63,0.18)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
      }}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-5 md:px-10 py-3 gap-4">
        {/* Col 1 — Liens gauche */}
        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={`/${locale}${l.href}`}
              className={`nav-link${isActive(l.href) ? " active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        {/* Mobile : col vide */}
        <div className="lg:hidden" />

        {/* Col 2 — Logo centré, taille fixe */}
        <Link
          href={`/${locale}`}
          className="flex flex-col items-center leading-none group"
        >
          <span
            className="font-playfair text-[16px] tracking-[5px] uppercase text-ocre transition-colors duration-300 group-hover:text-or"
            style={{ fontStyle: "normal", fontWeight: 700 }}
          >
            Salon Mimi
          </span>
          <span
            className="font-inter text-[8px] tracking-[4px] uppercase mt-0.5"
            style={{ color: "rgba(193,123,63,0.5)" }}
          >
            Marrakech
          </span>
        </Link>

        {/* Col 3 — Droite : langue + CTA + hamburger */}
        <div className="flex items-center gap-3 justify-end">
          {/* Sélecteur de langue */}
          <div className="hidden lg:block relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 font-inter text-[10px] tracking-[2px] uppercase transition-colors px-2 py-1"
              style={{ color: "rgba(255,255,255,0.45)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.8)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.45)")
              }
            >
              <span>{LOCALES.find((l) => l.code === locale)?.flag}</span>
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
              <div
                className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden"
                style={{
                  background: "#2C1508",
                  border: "1px solid rgba(193,123,63,0.2)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                }}
              >
                {LOCALES.filter((l) => l.code !== locale).map((l) => (
                  <Link
                    key={l.code}
                    href={`/${l.code}${pathWithoutLocale}`}
                    onClick={() => setLangOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 font-inter text-[10px] tracking-[2px] uppercase transition-colors"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "#C17B3F";
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "rgba(193,123,63,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "rgba(255,255,255,0.55)";
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "transparent";
                    }}
                  >
                    <span>{l.flag}</span>
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* CTA RDV */}
          <Link
            href={`/${locale}/reservation`}
            className="hidden lg:flex items-center gap-2 text-white font-inter text-[10px] tracking-[2px] uppercase px-5 py-2.5 rounded-full transition-all duration-300"
            style={{
              background: "#C17B3F",
              boxShadow: "0 0 0 1px rgba(193,123,63,0.4)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background =
                "#D4A843";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 0 0 1px rgba(212,168,67,0.6), 0 4px 16px rgba(193,123,63,0.3)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background =
                "#C17B3F";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 0 0 1px rgba(193,123,63,0.4)";
            }}
          >
            <span>→</span>
            <span>{t("book")}</span>
          </Link>

          {/* Hamburger mobile */}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden flex flex-col gap-1.5 p-3 min-h-[44px] min-w-[44px] items-center justify-center"
            aria-label="Menu"
          >
            <span
              className={`block w-6 h-px bg-white transition-transform duration-300 ${open ? "rotate-45 translate-y-[7px]" : ""}`}
            />
            <span
              className={`block w-6 h-px bg-white transition-opacity duration-300 ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`block w-6 h-px bg-white transition-transform duration-300 ${open ? "-rotate-45 -translate-y-[7px]" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {open && (
        <div
          className="lg:hidden px-6 py-6 flex flex-col"
          style={{
            background: "#1f0e04",
            borderTop: "1px solid rgba(193,123,63,0.12)",
          }}
        >
          <div className="flex flex-col mb-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={`/${locale}${l.href}`}
                onClick={() => setOpen(false)}
                className={`mobile-link${isActive(l.href) ? " active" : ""}`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <Link
            href={`/${locale}/reservation`}
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 bg-ocre text-white font-inter text-[11px] tracking-[2px] uppercase px-5 py-3.5 rounded-full mb-6"
          >
            → {t("book")}
          </Link>

          <div
            className="flex items-center gap-4 pt-4"
            style={{ borderTop: "1px solid rgba(193,123,63,0.1)" }}
          >
            {LOCALES.map((l) => (
              <Link
                key={l.code}
                href={`/${l.code}${pathWithoutLocale}`}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-1.5 font-inter text-[10px] tracking-[2px] uppercase transition-colors ${
                  l.code === locale
                    ? "text-ocre"
                    : "text-white/40 hover:text-white"
                }`}
              >
                <span>{l.flag}</span>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
