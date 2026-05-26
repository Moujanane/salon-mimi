import nodemailer from "nodemailer";

function esc(str: string | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function createTransporter() {
  return nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

interface ReservationData {
  nom: string;
  telephone: string;
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
  if (!to || !process.env.SMTP_USER || !process.env.SMTP_PASS) return;

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

  const transporter = createTransporter();
  await transporter.sendMail({
    from: "Mimi Coiffure <contact@mimi-coiffure.com>",
    to,
    subject: `Nouvelle réservation — ${esc(reservation.nom)} · ${esc(reservation.service)}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#fff;border:1px solid #eee;border-radius:12px;">
        <h2 style="color:#1a0a00;margin-bottom:4px;">Nouvelle réservation</h2>
        <p style="color:#c9a96e;font-size:14px;margin-top:0;">Salon Mimi Coiffure</p>
        <hr style="border:none;border-top:1px solid #f0e8de;margin:16px 0;">
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#888;width:140px;">Client</td><td style="padding:6px 0;font-weight:600;color:#1a0a00;">${esc(reservation.nom)}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Téléphone</td><td style="padding:6px 0;color:#1a0a00;">${esc(reservation.telephone)}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Service</td><td style="padding:6px 0;color:#1a0a00;">${esc(reservation.service)}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Date</td><td style="padding:6px 0;color:#1a0a00;">${esc(date)}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Heure</td><td style="padding:6px 0;color:#1a0a00;">${esc(heure)}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Personnes</td><td style="padding:6px 0;color:#1a0a00;">${esc(personnes)}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">Message</td><td style="padding:6px 0;color:#1a0a00;font-style:italic;">${esc(messageClient)}</td></tr>
        </table>
        <hr style="border:none;border-top:1px solid #f0e8de;margin:16px 0;">
        <p style="font-size:12px;color:#aaa;text-align:center;">Mimi Coiffure · Marrakech</p>
      </div>
    `,
  });
}
