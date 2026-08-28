"use client";

import { useLocale } from "next-intl";
import { genericWhatsAppLink } from "@/lib/whatsapp";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";

const LABELS: Record<string, string> = {
  fr: "Réserver sur WhatsApp",
  en: "Book on WhatsApp",
  es: "Reservar por WhatsApp",
};

// Bandeau fixe en bas d'écran, visible en mobile uniquement (< lg).
// Monté dans le layout [locale] → présent sur toutes les pages publiques.
export default function StickyWhatsApp() {
  const locale = useLocale();
  const label = LABELS[locale] ?? LABELS.fr;

  return (
    <a
      href={genericWhatsAppLink(locale)}
      target="_blank"
      rel="noopener noreferrer"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 h-sticky-wa flex items-center justify-center gap-2 bg-whatsapp hover:bg-whatsapp-hover text-white text-sm font-inter font-medium transition-colors"
      aria-label={label}
    >
      <WhatsAppIcon className="w-5 h-5" />
      {label}
    </a>
  );
}
