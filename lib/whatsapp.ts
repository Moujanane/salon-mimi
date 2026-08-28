// lib/whatsapp.ts

import { WHATSAPP_NUMBER } from "@/lib/social";

export interface ReservationData {
  nom: string;
  telephone: string;
  service: string;
  dateSouhaitee?: string;
  message?: string;
}

export function generateWhatsAppLink(
  data: ReservationData,
  whatsappNumber?: string,
): string {
  const number =
    whatsappNumber ??
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ??
    WHATSAPP_NUMBER;
  const text = [
    `Bonjour Mimi, je souhaite réserver une prestation.`,
    `Nom : ${data.nom}`,
    `Service : ${data.service}`,
    data.dateSouhaitee ? `Date souhaitée : ${data.dateSouhaitee}` : null,
    data.message ? `Message : ${data.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

const GENERIC_MESSAGES: Record<string, string> = {
  fr: "Bonjour Mimi, je voudrais réserver une coiffure.",
  en: "Hello Mimi, I'd like to book an appointment.",
  es: "Hola Mimi, quería reservar una cita.",
};

// Lien wa.me avec un message d'ouverture générique (pas de données de formulaire).
// Utilisé par le CTA WhatsApp direct et le bandeau sticky.
export function genericWhatsAppLink(locale: string): string {
  const msg = GENERIC_MESSAGES[locale] ?? GENERIC_MESSAGES.fr;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}
