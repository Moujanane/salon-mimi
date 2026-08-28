"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";

const LABELS: Record<string, string> = {
  fr: "Réserver un rendez-vous",
  en: "Book an appointment",
  es: "Reservar una cita",
};

// Bandeau fixe en bas d'écran, visible en mobile uniquement (< lg).
// Monté dans le layout [locale] → présent sur toutes les pages publiques.
// Mène vers /reservation (qui propose WhatsApp ET formulaire).
export default function StickyBooking() {
  const locale = useLocale();
  const label = LABELS[locale] ?? LABELS.fr;

  return (
    <Link
      href={`/${locale}/reservation`}
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 h-sticky-wa flex items-center justify-center gap-2 bg-whatsapp hover:bg-whatsapp-hover text-white text-sm font-inter font-medium transition-colors"
      aria-label={label}
    >
      <WhatsAppIcon className="w-5 h-5" />
      {label}
    </Link>
  );
}
