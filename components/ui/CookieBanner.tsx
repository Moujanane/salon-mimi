"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface CookieBannerProps {
  locale: string;
}

const texts: Record<
  string,
  { message: string; accept: string; policy: string }
> = {
  fr: {
    message:
      "Ce site utilise un cookie technique pour mémoriser votre langue. Aucune donnée personnelle n'est transmise à des tiers.",
    accept: "J'accepte",
    policy: "Politique de confidentialité",
  },
  en: {
    message:
      "This site uses a technical cookie to remember your language preference. No personal data is shared with third parties.",
    accept: "Accept",
    policy: "Privacy policy",
  },
  es: {
    message:
      "Este sitio usa una cookie técnica para recordar su idioma. No se comparten datos personales con terceros.",
    accept: "Aceptar",
    policy: "Política de privacidad",
  },
};

export default function CookieBanner({ locale }: CookieBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  }

  if (!visible) return null;

  const t = texts[locale] ?? texts.fr;

  return (
    <div
      role="dialog"
      aria-label="Bandeau cookies"
      className="fixed bottom-0 left-0 right-0 z-50 bg-panneau border-t border-ocre/20 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 shadow-2xl"
    >
      <p className="text-white/70 text-xs leading-relaxed flex-1 font-inter">
        {t.message}{" "}
        <Link
          href={`/${locale}/politique-de-confidentialite`}
          className="text-ocre underline underline-offset-2 hover:text-white transition-colors"
        >
          {t.policy}
        </Link>
      </p>
      <button
        onClick={accept}
        className="flex-shrink-0 bg-ocre hover:bg-or text-white text-[10px] tracking-[2px] uppercase px-5 py-2.5 rounded-full font-inter transition-colors"
      >
        {t.accept}
      </button>
    </div>
  );
}
