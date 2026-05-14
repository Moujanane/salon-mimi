// lib/whatsapp.ts

export interface ReservationData {
  nom: string;
  telephone: string;
  service: string;
  dateSouhaitee?: string;
  message?: string;
}

export function generateWhatsAppLink(data: ReservationData): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "212710388204";
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
