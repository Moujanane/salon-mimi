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
//  - Rate limit par IP : 3 tentatives échouées / 30 min. Persistant via
//    Upstash Redis (lib/rateLimit.ts) — ne se réinitialise plus à chaque
//    redéploiement/scale Railway, contrairement à l'ancienne implémentation
//    en mémoire.

import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";
import {
  isFailureLimitExceeded,
  recordFailure,
  clearFailures,
} from "@/lib/rateLimit";

const WINDOW_SECONDS = 30 * 60;
const MAX_FAILURES = 3;

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
 *   const auth = await checkMimiPin(req);
 *   if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
 */
export async function checkMimiPin(req: NextRequest): Promise<MimiAuthResult> {
  const expected = process.env.MIMI_PIN;
  if (!expected) {
    return {
      ok: false,
      status: 503,
      error: "Service indisponible (configuration manquante).",
    };
  }

  const ip = clientIp(req);
  const key = `mimi-auth:${ip}`;

  if (await isFailureLimitExceeded(key, MAX_FAILURES)) {
    return {
      ok: false,
      status: 429,
      error: "Trop de tentatives. Réessaie plus tard.",
    };
  }

  const provided = req.headers.get("x-mimi-pin") ?? "";
  if (provided && constantTimeEqual(provided, expected)) {
    await clearFailures(key);
    return { ok: true };
  }

  await recordFailure(key, WINDOW_SECONDS);
  return { ok: false, status: 401, error: "PIN incorrect" };
}
