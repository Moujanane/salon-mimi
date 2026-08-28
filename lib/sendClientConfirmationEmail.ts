import { Resend } from "resend";
import { esc } from "./sendNotificationEmail";

// Copies internes reçues en Bcc (le client ne les voit pas).
const INTERNAL_BCC = ["contact@mimi-coiffure.com", "mouj.business@gmail.com"];

// Numéro WhatsApp du salon (format international sans "+").
const WHATSAPP_NUMBER = "212710388204";

interface ReservationData {
  nom: string;
  service: string;
  date_souhaitee?: string;
  heure_souhaitee?: string;
}

type Locale = "fr" | "en" | "es";

const TEXTS: Record<
  Locale,
  {
    subject: string;
    hello: (name: string) => string;
    intro: string;
    yourRequest: string;
    serviceLabel: string;
    dateLabel: string;
    noDate: string;
    lostTitle: string;
    lostText: string;
    whatsappBtn: string;
    whatsappMsg: string;
    signoff: string;
    salonLine: string;
  }
> = {
  fr: {
    subject: "Votre demande de réservation — Salon Mimi",
    hello: (name) => `Bonjour ${name},`,
    intro:
      "Merci pour votre demande de réservation au Salon Mimi. Nous l'avons bien reçue et Mimi vous recontacte très vite pour la confirmer.",
    yourRequest: "Votre demande",
    serviceLabel: "Prestation",
    dateLabel: "Date souhaitée",
    noDate: "à préciser",
    lostTitle: "Vous ne trouvez pas le salon ?",
    lostText:
      "Rendez-vous devant le restaurant Argana, Place Jamaa El Fna. Appelez Mimi — elle viendra vous chercher.",
    whatsappBtn: "Écrire à Mimi sur WhatsApp",
    whatsappMsg: "Bonjour Mimi, je viens de faire une demande de réservation.",
    signoff: "À très bientôt,",
    salonLine: "Salon Mimi · Place Jamaa El Fna, Marrakech",
  },
  en: {
    subject: "Your booking request — Salon Mimi",
    hello: (name) => `Hello ${name},`,
    intro:
      "Thank you for your booking request at Salon Mimi. We have received it and Mimi will get back to you very soon to confirm.",
    yourRequest: "Your request",
    serviceLabel: "Service",
    dateLabel: "Preferred date",
    noDate: "to be confirmed",
    lostTitle: "Can't find the salon?",
    lostText:
      "Head to the Argana restaurant, Jamaa El Fna Square. Call Mimi — she will come and meet you.",
    whatsappBtn: "Message Mimi on WhatsApp",
    whatsappMsg: "Hello Mimi, I have just sent a booking request.",
    signoff: "See you soon,",
    salonLine: "Salon Mimi · Jamaa El Fna Square, Marrakech",
  },
  es: {
    subject: "Tu solicitud de reserva — Salon Mimi",
    hello: (name) => `Hola ${name},`,
    intro:
      "Gracias por tu solicitud de reserva en el Salon Mimi. La hemos recibido y Mimi se pondrá en contacto contigo muy pronto para confirmarla.",
    yourRequest: "Tu solicitud",
    serviceLabel: "Servicio",
    dateLabel: "Fecha deseada",
    noDate: "por concretar",
    lostTitle: "¿No encuentras el salón?",
    lostText:
      "Ve al restaurante Argana, Plaza Jamaa El Fna. Llama a Mimi — ella vendrá a buscarte.",
    whatsappBtn: "Escribir a Mimi por WhatsApp",
    whatsappMsg: "Hola Mimi, acabo de enviar una solicitud de reserva.",
    signoff: "¡Hasta pronto!",
    salonLine: "Salon Mimi · Plaza Jamaa El Fna, Marrakech",
  },
};

export async function sendClientConfirmationEmail(
  clientEmail: string,
  reservation: ReservationData,
  locale: string,
) {
  if (!clientEmail || !process.env.RESEND_API_KEY) return;

  const lang: Locale =
    locale === "en" || locale === "es" ? (locale as Locale) : "fr";
  const t = TEXTS[lang];
  const resend = new Resend(process.env.RESEND_API_KEY);

  const dateStr = reservation.date_souhaitee
    ? new Date(reservation.date_souhaitee).toLocaleDateString(
        lang === "fr" ? "fr-FR" : lang === "es" ? "es-ES" : "en-GB",
        { weekday: "long", day: "numeric", month: "long" },
      )
    : t.noDate;
  const heure = reservation.heure_souhaitee
    ? ` — ${reservation.heure_souhaitee}`
    : "";

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    t.whatsappMsg,
  )}`;

  await resend.emails.send({
    from: "Salon Mimi <noreply@atlas-swincar.com>",
    to: clientEmail,
    bcc: INTERNAL_BCC,
    replyTo: "contact@mimi-coiffure.com",
    subject: t.subject,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#fff;border:1px solid #eee;border-radius:12px;color:#1a0a00;">
        <h2 style="margin:0 0 4px;">Salon Mimi</h2>
        <p style="color:#c9a96e;font-size:13px;margin:0 0 16px;">Tresses africaines & rasta · Marrakech</p>

        <p style="font-size:14px;margin:0 0 8px;">${esc(t.hello(reservation.nom))}</p>
        <p style="font-size:14px;line-height:1.6;margin:0 0 20px;">${t.intro}</p>

        <div style="background:#faf6ef;border-radius:10px;padding:14px 16px;margin-bottom:20px;">
          <p style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#a08a6a;margin:0 0 8px;">${t.yourRequest}</p>
          <p style="font-size:14px;margin:0 0 4px;"><strong>${t.serviceLabel} :</strong> ${esc(reservation.service)}</p>
          <p style="font-size:14px;margin:0;"><strong>${t.dateLabel} :</strong> ${esc(dateStr)}${esc(heure)}</p>
        </div>

        <div style="border-top:1px solid #f0e8de;padding-top:16px;margin-bottom:20px;">
          <p style="font-size:14px;font-weight:600;margin:0 0 6px;">${t.lostTitle}</p>
          <p style="font-size:14px;line-height:1.6;color:#555;margin:0 0 14px;">${t.lostText}</p>
          <a href="${whatsappHref}" target="_blank" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;padding:11px 24px;border-radius:999px;font-size:13px;font-weight:600;">${t.whatsappBtn}</a>
        </div>

        <p style="font-size:14px;margin:0 0 2px;">${t.signoff}</p>
        <p style="font-size:12px;color:#aaa;margin:4px 0 0;">${t.salonLine}</p>
      </div>
    `,
  });
}
