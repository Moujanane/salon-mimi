"use client";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { INSTAGRAM_URL, TIKTOK_URL } from "@/lib/social";

const LOCALES = [
  { code: "fr", label: "FR", flag: "🇫🇷" },
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "es", label: "ES", flag: "🇪🇸" },
];

function SocialIcons({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram Salon Mimi"
        className="text-white/55 hover:text-ocre transition-colors"
      >
        <svg
          className="w-[18px] h-[18px]"
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
          className="w-[18px] h-[18px]"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M16.6 5.82a4.28 4.28 0 0 1-1.05-2.82h-3.11v12.4a2.6 2.6 0 0 1-2.6 2.5 2.6 2.6 0 0 1-2.6-2.6 2.6 2.6 0 0 1 3.4-2.48V7.03a5.72 5.72 0 0 0-.8-.06 5.72 5.72 0 0 0 0 11.44 5.72 5.72 0 0 0 5.72-5.72V9.01a7.35 7.35 0 0 0 4.3 1.38V7.28a4.3 4.3 0 0 1-3.26-1.46z" />
        </svg>
      </a>
    </div>
  );
}

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

        {/* Col 2 — Logo graphique + texte marque (compact, aligné à gauche) */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2.5 leading-none group"
        >
          <Image
            src="/images/logo-mimi.webp"
            alt="Salon Mimi — Rasta Africain Coiffure"
            width={68}
            height={68}
            priority
            className="w-[34px] h-[34px] flex-shrink-0"
          />
          <span className="flex flex-col items-start leading-none">
            <span
              className="font-playfair text-[14px] tracking-[3px] uppercase text-ocre transition-colors duration-300 group-hover:text-or"
              style={{ fontStyle: "normal", fontWeight: 700 }}
            >
              Salon Mimi
            </span>
            <span
              className="font-inter text-[8px] tracking-[3px] uppercase mt-0.5"
              style={{ color: "rgba(193,123,63,0.5)" }}
            >
              Marrakech
            </span>
          </span>
        </Link>

        {/* Col 3 — Droite : langue + réseaux + CTA + hamburger */}
        <div className="flex items-center gap-2 md:gap-3 justify-end">
          {/* Sélecteur de langue — pastilles toujours visibles (desktop + mobile) */}
          <LangPills locale={locale} pathWithoutLocale={pathWithoutLocale} />

          {/* Réseaux sociaux — desktop uniquement */}
          <SocialIcons className="hidden lg:flex" />

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

          <SocialIcons className="justify-center mt-6" />
        </div>
      )}
    </header>
  );
}
