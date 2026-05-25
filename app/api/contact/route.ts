import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function esc(str: string | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

const rateLimitMap = new Map<string, { count: number; ts: number }>();

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (entry && now - entry.ts < 60_000 && entry.count >= 3) {
    return NextResponse.json({ error: "Trop de demandes" }, { status: 429 });
  }
  rateLimitMap.set(ip, {
    count: (entry?.count ?? 0) + 1,
    ts: entry?.ts ?? now,
  });

  const body = await req.json().catch(() => null);
  if (!body)
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });

  const { prenom, nom, telephone, email, demande } = body;
  if (!prenom || !nom || !telephone || !email || !demande) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "Service email non configuré" },
      { status: 500 },
    );
  }

  try {
    await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ??
        "Mimi Coiffure <onboarding@resend.dev>",
      to: "contact@mimi-coiffure.com",
      subject: `Nouvelle demande de contact — ${esc(prenom)} ${esc(nom)}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#fff;border:1px solid #eee;border-radius:12px;">
          <h2 style="color:#1a0a00;margin-bottom:4px;">Nouvelle demande de contact</h2>
          <p style="color:#c9a96e;font-size:14px;margin-top:0;">Salon Mimi Coiffure</p>
          <hr style="border:none;border-top:1px solid #f0e8de;margin:16px 0;">
          <table style="width:100%;font-size:14px;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#888;width:140px;">Prénom</td><td style="padding:6px 0;font-weight:600;color:#1a0a00;">${esc(prenom)}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Nom</td><td style="padding:6px 0;color:#1a0a00;">${esc(nom)}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Téléphone</td><td style="padding:6px 0;color:#1a0a00;">${esc(telephone)}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Email</td><td style="padding:6px 0;color:#1a0a00;">${esc(email)}</td></tr>
            <tr><td style="padding:6px 0;color:#888;vertical-align:top;">Demande</td><td style="padding:6px 0;color:#1a0a00;font-style:italic;">${esc(demande)}</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid #f0e8de;margin:16px 0;">
          <p style="font-size:12px;color:#aaa;text-align:center;">Mimi Coiffure · Marrakech</p>
        </div>
      `,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur envoi email" }, { status: 500 });
  }
}
