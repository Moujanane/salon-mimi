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

function LangPills({
  locale,
  pathWithoutLocale,
  onNavigate,
}: {
  locale: string;
  pathWithoutLocale: string;
  onNavigate?: () => void;
}) {
  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label="Choix de la langue"
    >
      {LOCALES.map((l) => {
        const active = l.code === locale;
        return (
          <Link
            key={l.code}
            href={`/${l.code}${pathWithoutLocale}`}
            onClick={onNavigate}
            aria-current={active ? "true" : undefined}
            className={`font-inter text-xs tracking-[1px] uppercase px-2.5 py-1 rounded-full border transition-colors ${
              active
                ? "bg-ocre text-nuit border-ocre font-semibold"
                : "border-ocre/40 text-white/70 hover:border-ocre hover:text-ocre"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </div>
  );
}

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
        <div className="flex items-center gap-2 md:gap-3 justify-end">
          {/* Sélecteur de langue — pastilles toujours visibles (desktop + mobile) */}
          <LangPills locale={locale} pathWithoutLocale={pathWithoutLocale} />

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
            className="flex items-center justify-center gap-2 bg-ocre text-white font-inter text-[11px] tracking-[2px] uppercase px-5 py-3.5 rounded-full"
          >
            → {t("book")}
          </Link>
        </div>
      )}
    </header>
  );
}
