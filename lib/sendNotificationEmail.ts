import { Resend } from "resend";

function esc(str: string | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

interface ReservationData {
  nom: string;
  telephone: string;
  email?: string;
  service: string;
  date_souhaitee?: string;
  heure_souhaitee?: string;
  nombre_personnes?: string;
  message?: string;
}

export async function sendNotificationEmail(
  to: string,
  reservation: ReservationData,
) {
  if (!to || !process.env.RESEND_API_KEY) return;
  const resend = new Resend(process.env.RESEND_API_KEY);

  const date = reservation.date_souhaitee
    ? new Date(reservation.date_souhaitee).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : "Non précisée";

  const heure = reservation.heure_souhaitee ?? "Non précisée";
  const personnes = reservation.nombre_personnes ?? "1";
  const messageClient = reservation.message ?? "—";

  await resend.emails.send({
    from: "Mimi Coiffure <noreply@atlas-swincar.com>",
    to: "mouj.business@gmail.com",
    subject: `Nouvelle réservation — ${esc(reservation.nom)} · ${esc(reservation.service)}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#fff;border:1px solid #eee;border-radius:12px;">
        <h2 style="color:#1a0a00;margin-bottom:4px;">Nouvelle réservation</h2>
        <p style="color:#c9a96e;font-size:14px;margin-top:0;">Salon Mimi Coiffure</p>
        <hr style="border:none;border-top:1px solid #f0e8de;margin:16px 0;">
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#888;width:140px;">Client</td><td style="padding:6px 0;font-weight:600;color:#1a0a00;">${esc(reservation.nom)}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Téléphone</td><td style="padding:6px 0;color:#1a0a00;">${esc(reservation.telephone)}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Email</td><td style="padding:6px 0;color:#1a0a00;">${esc(reservation.email) || "—"}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Service</td><td style="padding:6px 0;color:#1a0a00;">${esc(reservation.service)}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Date</td><td style="padding:6px 0;color:#1a0a00;">${esc(date)}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Heure</td><td style="padding:6px 0;color:#1a0a00;">${esc(heure)}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Personnes</td><td style="padding:6px 0;color:#1a0a00;">${esc(personnes)}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Message</td><td style="padding:6px 0;color:#1a0a00;font-style:italic;">${esc(messageClient)}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #f0e8de;margin:16px 0;">
        <div style="text-align:center;margin-bottom:16px;">
          <a href="https://g.page/r/CXqJtbaOg9FUEBM/review" target="_blank" style="display:inline-block;background:#c9a96e;color:#fff;text-decoration:none;padding:10px 24px;border-radius:999px;font-size:13px;font-weight:600;">⭐ Laisser un avis Google</a>
        </div>
        <p style="font-size:12px;color:#aaa;text-align:center;">Mimi Coiffure · Marrakech</p>
      </div>
    `,
  });
}
