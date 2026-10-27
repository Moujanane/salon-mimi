// lib/redisAlert.ts
//
// Alerte par e-mail quand Upstash Redis tombe en panne : sans ça, la panne
// est invisible pour tout le monde tant que personne ne va lire les logs
// Railway. Deux pannes très différentes déclenchent cette alerte :
//  - anti-spam (fail-open, lib/rateLimit.ts::checkWindowLimit) : les
//    formulaires de réservation et de contact ne sont plus limités en débit
//    tant que Redis est indisponible ;
//  - pin-mimi (fail-closed, lib/rateLimit.ts::consumeAttempt) : la PWA de
//    planning de Mimi répond 503 tant que Redis est indisponible. C'est le
//    comportement voulu (cf. lib/pinAuth.ts, correctif de l'audit du
//    19/10/2026) — mais ça coupe un outil de travail quotidien sans qu'aucun
//    bug ne soit en cause côté site, donc ça doit être vu vite plutôt que
//    découvert par Mimi en ouvrant la page.
//
// Best-effort et non bloquant : jamais `await`é par l'appelant, et une
// erreur d'envoi ne doit jamais remonter (cf. .catch ci-dessous).
//
// Au plus un e-mail toutes les 15 minutes par type de panne (compteur en
// mémoire process), pour ne pas noyer la boîte mail pendant une panne
// prolongée. Ce compteur est local à CHAQUE instance Railway : avec
// plusieurs instances, jusqu'à une alerte par instance et par fenêtre peut
// partir — acceptable pour un e-mail d'alerte (ce n'est pas une protection
// de sécurité, qui reste entièrement dans lib/rateLimit.ts).

import { Resend } from "resend";

export type RedisFailureKind = "anti-spam" | "pin-mimi";

const LABELS: Record<RedisFailureKind, string> = {
  "anti-spam":
    "Protection anti-spam désactivée (fail-open) : les formulaires de réservation et de contact ne sont plus limités en débit.",
  "pin-mimi":
    "PIN de Mimi bloqué (fail-closed) : la PWA de planning répond 503 tant qu'Upstash est en panne.",
};

const ADMIN_EMAIL = "mouj.business@gmail.com";
const ALERT_WINDOW_MS = 15 * 60 * 1000;

const lastAlertAt = new Map<RedisFailureKind, number>();

type Deps = {
  /** Injectable pour les tests. Par défaut : Date.now. */
  now?: () => number;
  /** Injectable pour les tests. Par défaut : envoi réel via Resend. */
  sendEmail?: (subject: string, html: string) => Promise<void>;
};

async function defaultSendEmail(subject: string, html: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Mimi Coiffure <noreply@atlas-swincar.com>",
    to: ADMIN_EMAIL,
    subject,
    html,
  });
}

/**
 * Signale une panne Upstash Redis. Toujours loggée (préfixe grep-able
 * `[ALERTE REDIS]`, utile pour une alerte branchée sur les logs Railway) ;
 * un e-mail est en plus envoyé au plus une fois par fenêtre de 15 minutes et
 * par type de panne.
 */
export function alertRedisFailure(
  kind: RedisFailureKind,
  err: unknown,
  deps: Deps = {},
): void {
  const now = deps.now ?? Date.now;
  const sendEmail = deps.sendEmail ?? defaultSendEmail;
  const nowMs = now();

  console.error(`[ALERTE REDIS] ${kind} — ${LABELS[kind]}`, err);

  const last = lastAlertAt.get(kind) ?? -Infinity;
  if (nowMs - last < ALERT_WINDOW_MS) return;
  lastAlertAt.set(kind, nowMs);

  const when = new Date(nowMs).toISOString();
  sendEmail(
    `⚠️ Panne Upstash Redis — ${kind}`,
    `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;">
        <h2 style="margin-bottom:4px;">Panne Upstash Redis détectée</h2>
        <p style="margin-top:0;color:#555;">${LABELS[kind]}</p>
        <p style="font-size:13px;color:#888;">Détectée à ${when}. Au plus un e-mail toutes les 15 minutes par type de panne : d'autres échecs du même type ont pu se produire entre-temps — voir les logs Railway (rechercher « [ALERTE REDIS] ») pour le détail complet.</p>
      </div>
    `,
  ).catch((sendErr) => {
    console.error(
      "[ALERTE REDIS] échec de l'envoi de l'e-mail d'alerte:",
      sendErr,
    );
  });
}

/** Réservé aux tests : remet le débounce à zéro entre les cas. */
export function _resetAlertStateForTests(): void {
  lastAlertAt.clear();
}
