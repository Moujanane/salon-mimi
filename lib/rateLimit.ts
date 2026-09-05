// lib/rateLimit.ts
//
// Rate limiting persistant via Upstash Redis, partagé par toutes les routes
// qui en ont besoin (au lieu d'un Map en mémoire process, remis à zéro à
// chaque redéploiement/scale Railway).
//
// Fail-open : toute erreur (panne Upstash, credentials absents/invalides)
// autorise la requête plutôt que de bloquer un utilisateur légitime. Une
// panne Upstash dégrade la protection anti-spam, jamais la disponibilité
// du site.

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  console.warn(
    "[rateLimit] UPSTASH_REDIS_REST_URL/TOKEN absents — rate limiting désactivé (fail-open).",
  );
}

const redis = url && token ? new Redis({ url, token }) : null;

/**
 * Compteur par fenêtre glissante : "au plus `max` requêtes par
 * `windowSeconds` secondes". Utilisé pour les routes /api/reservations et
 * /api/contact.
 *
 * `key` doit déjà inclure un préfixe distinguant l'appelant (ex.
 * "reservations:1.2.3.4") pour éviter toute collision entre routes.
 */
export async function checkWindowLimit(
  key: string,
  max: number,
  windowSeconds: number,
): Promise<boolean> {
  if (!redis) return true;

  try {
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(max, `${windowSeconds} s`),
      prefix: "ratelimit",
    });
    const { success } = await limiter.limit(key);
    return success;
  } catch (err) {
    console.error("[rateLimit] checkWindowLimit error, fail-open:", err);
    return true;
  }
}

/**
 * Compteur d'échecs réinitialisable sur succès : "au plus `max` échecs
 * consécutifs par `windowSeconds` secondes, remis à zéro dès qu'un essai
 * réussit". Utilisé pour le PIN de la PWA Mimi (lib/mimiAuth.ts).
 *
 * Retourne `false` si la limite est dépassée (appel bloqué), `true` sinon.
 * N'incrémente PAS automatiquement — appeler `recordFailure` séparément
 * après un échec constaté par l'appelant.
 */
export async function isFailureLimitExceeded(
  key: string,
  max: number,
): Promise<boolean> {
  if (!redis) return false;

  try {
    const current = await redis.get<number>(key);
    return (current ?? 0) >= max;
  } catch (err) {
    console.error("[rateLimit] isFailureLimitExceeded error, fail-open:", err);
    return false;
  }
}

/**
 * Enregistre un échec : incrémente le compteur, pose une expiration de
 * `windowSeconds` uniquement si c'est le premier échec de la fenêtre (une
 * clé sans TTL ne doit jamais rester en Redis indéfiniment).
 */
export async function recordFailure(
  key: string,
  windowSeconds: number,
): Promise<void> {
  if (!redis) return;

  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }
  } catch (err) {
    console.error("[rateLimit] recordFailure error (ignoré, fail-open):", err);
  }
}

/**
 * Réinitialise le compteur d'échecs (appelé après un succès).
 */
export async function clearFailures(key: string): Promise<void> {
  if (!redis) return;

  try {
    await redis.del(key);
  } catch (err) {
    console.error("[rateLimit] clearFailures error (ignoré, fail-open):", err);
  }
}
