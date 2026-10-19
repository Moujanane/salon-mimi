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
//  - Comparaison à temps constant (crypto.timingSafeEqual) : lib/pinAuth.ts.
//  - Limite par IP : MAX_ATTEMPTS essais / 30 min, comptés de façon ATOMIQUE
//    AVANT la comparaison du PIN (lib/pinAuth.ts + lib/rateLimit.ts), donc une
//    rafale de requêtes simultanées ne dépasse pas la limite (constat de
//    l'audit du 19/10/2026 : 15 essais simultanés passaient tous au lieu de 3).
//    Persistant via Upstash Redis. Si le compteur est indisponible, on REFUSE
//    (fail-closed) : l'authentification ne s'ouvre jamais quand sa protection
//    tombe.
//  - MAX_ATTEMPTS vaut 5 et non 3 : après la connexion, la page de Mimi envoie
//    jusqu'à 3 requêtes simultanées (réglages, notifications). Chaque succès
//    remet le compteur à zéro.
//  - La force du PIN reste déterminante : 5 essais / 30 min / IP n'empêche pas
//    un attaquant disposant de nombreuses IP. Utiliser un PIN d'au moins 8
//    caractères (idéalement alphanumérique).

import type { NextRequest } from "next/server";
import { consumeAttempt, clearFailures, getClientIp } from "@/lib/rateLimit";
import { evaluatePin, type MimiAuthResult } from "@/lib/pinAuth";

export type { MimiAuthResult };

const WINDOW_SECONDS = 30 * 60;
const MAX_ATTEMPTS = 5;

/**
 * Vérifie le PIN Mimi d'une requête API.
 * Usage :
 *   const auth = await checkMimiPin(req);
 *   if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
 */
export async function checkMimiPin(req: NextRequest): Promise<MimiAuthResult> {
  const key = `mimi-auth:${getClientIp(req)}`;

  return evaluatePin({
    expected: process.env.MIMI_PIN,
    provided: req.headers.get("x-mimi-pin") ?? "",
    maxAttempts: MAX_ATTEMPTS,
    consumeAttempt: () => consumeAttempt(key, WINDOW_SECONDS),
    clearAttempts: () => clearFailures(key),
  });
}
