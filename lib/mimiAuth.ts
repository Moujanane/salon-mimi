// lib/mimiAuth.ts
//
// Authentification par PIN de la PWA planning de Mimi (/mimi.html) et de ses
// API (/api/mimi, /api/mimi-settings, /api/push).
//
// Règles de sécurité :
//  - PIN lu UNIQUEMENT dans le header `x-mimi-pin` (jamais en query string :
//    les query strings sont loggées par Railway/Cloudflare et restent dans
//    l'historique navigateur).
//  - PAS de fallback en dur : si MIMI_PIN n'est pas défini côté serveur, toute
//    requête est rejetée (503). Un déploiement sans la variable ne doit pas
//    ouvrir l'accès avec un PIN devinable.
//  - Comparaison à temps constant (crypto.timingSafeEqual).
//  - Rate limit par IP : 3 tentatives échouées / 30 min. En mémoire (se
//    réinitialise à chaque redéploiement/scale Railway — limite connue, à
//    remplacer par un store persistant type Upstash si le besoin grandit).

import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

const WINDOW_MS = 30 * 60 * 1000;
const MAX_FAILURES = 3;

type Entry = { failures: number; resetAt: number };
const attempts = new Map<string, Entry>();

function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  // timingSafeEqual exige des longueurs égales : on compare d'abord la longueur
  // (l'info « longueur du PIN » n'est pas un secret exploitable ici).
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export type MimiAuthResult =
  { ok: true } | { ok: false; status: 401 | 429 | 503; error: string };

/**
 * Vérifie le PIN Mimi d'une requête API.
 * Usage :
 *   const auth = checkMimiPin(req);
 *   if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
 */
export function checkMimiPin(req: NextRequest): MimiAuthResult {
  const expected = process.env.MIMI_PIN;
  if (!expected) {
    return {
      ok: false,
      status: 503,
      error: "Service indisponible (configuration manquante).",
    };
  }

  const ip = clientIp(req);
  const now = Date.now();
  const entry = attempts.get(ip);
  if (entry && now < entry.resetAt && entry.failures >= MAX_FAILURES) {
    return {
      ok: false,
      status: 429,
      error: "Trop de tentatives. Réessaie plus tard.",
    };
  }

  const provided = req.headers.get("x-mimi-pin") ?? "";
  if (provided && constantTimeEqual(provided, expected)) {
    attempts.delete(ip);
    return { ok: true };
  }

  // Échec : incrémente le compteur
  if (!entry || now >= entry.resetAt) {
    attempts.set(ip, { failures: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.failures++;
  }
  return { ok: false, status: 401, error: "PIN incorrect" };
}
