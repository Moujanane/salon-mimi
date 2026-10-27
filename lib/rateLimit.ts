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
//
// Toute panne Upstash (ici ou dans consumeAttempt, fail-closed pour le PIN
// de Mimi) déclenche une alerte par e-mail best-effort — lib/redisAlert.ts —
// pour qu'elle soit vue vite plutôt que découverte dans les logs Railway.

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import type { NextRequest } from "next/server";
import { incrementWithTtl } from "@/lib/attemptCounter";
import { rateLimitIp } from "@/lib/clientIp";
import { alertRedisFailure } from "@/lib/redisAlert";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  console.warn(
    "[rateLimit] UPSTASH_REDIS_REST_URL/TOKEN absents — rate limiting désactivé (fail-open).",
  );
}

const redis = url && token ? new Redis({ url, token }) : null;

/**
 * Extrait l'IP cliente réelle d'une requête, de façon fiable derrière
 * Cloudflare (le proxy devant Railway pour ce projet).
 *
 * `cf-connecting-ip` est posé par Cloudflare et contient toujours la vraie
 * IP du visiteur — contrairement à `x-forwarded-for`, qui peut contenir
 * plusieurs IPs séparées par virgule ET dont la valeur peut varier d'une
 * requête à l'autre pour un même visiteur selon le nœud edge Cloudflare qui
 * traite la requête (observé en prod le 5 sept. 2026 : 3 requêtes
 * consécutives du même testeur ont produit 3 x-forwarded-for différents,
 * empêchant tout rate limit par IP de fonctionner).
 *
 * ATTENTION : cet en-tête n'est digne de confiance que si le serveur d'origine
 * n'est joignable QUE via Cloudflare. Si l'adresse Railway (*.up.railway.app)
 * répond directement, un attaquant peut écrire lui-même `cf-connecting-ip` et
 * changer de « visiteur » à chaque requête. Vérifié le 19/10/2026 : l'accès direct
 * à l'IP d'origine répond 403 ; vérifier régulièrement dans Railway
 * (Settings > Networking) qu'aucun domaine *.up.railway.app inutilisé ne
 * répond en direct — ce point reste une vérification d'infrastructure que le
 * code ne peut pas garantir lui-même.
 *
 * En production, `x-forwarded-for` n'est PAS utilisé en repli : cet en-tête
 * est réécrit librement par n'importe quel client, donc l'accepter sans
 * passerelle de confiance connue reviendrait à laisser un attaquant choisir
 * lui-même sa clé de limitation (et donc la contourner en la changeant à
 * chaque requête). Une requête sans `cf-connecting-ip` en production est
 * anormale (Cloudflare le pose toujours) : elle est regroupée sous une seule
 * clé partagée, plus restrictive qu'un `x-forwarded-for` choisi par
 * l'attaquant. Le repli sur `x-forwarded-for` reste actif hors production,
 * uniquement pour le confort du développement local.
 *
 * Une IPv6 est ramenée à son préfixe /64 (lib/clientIp.ts).
 */
export function getClientIp(req: NextRequest): string {
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return rateLimitIp(cfIp.trim());

  if (process.env.NODE_ENV === "production") {
    return "no-cf-connecting-ip";
  }

  return rateLimitIp(
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown",
  );
}

/**
 * Compteur par fenêtre glissante : "au plus `max` requêtes par
 * `windowSeconds` secondes". Utilisé pour les routes /api/reservations et
 * /api/contact.
 *
 * `key` doit déjà inclure un préfixe distinguant l'appelant (ex.
 * "reservations:1.2.3.4") pour éviter toute collision entre routes.
 */
const limiters = new Map<string, Ratelimit>();

function getLimiter(max: number, windowSeconds: number): Ratelimit {
  const cacheKey = `${max}:${windowSeconds}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(max, `${windowSeconds} s`),
      prefix: "ratelimit",
    });
    limiters.set(cacheKey, limiter);
  }
  return limiter;
}

export async function checkWindowLimit(
  key: string,
  max: number,
  windowSeconds: number,
): Promise<boolean> {
  if (!redis) return true;

  try {
    const limiter = getLimiter(max, windowSeconds);
    const { success } = await limiter.limit(key);
    return success;
  } catch (err) {
    alertRedisFailure("anti-spam", err);
    return true;
  }
}

/**
 * Consomme UN essai de la fenêtre `windowSeconds` pour `key`, de façon
 * ATOMIQUE (INCR Redis), et retourne le nombre d'essais consommés (>= 1).
 * Utilisé pour le PIN de la PWA Mimi (lib/mimiAuth.ts), AVANT de comparer le
 * PIN : c'est ce qui empêche une rafale de requêtes simultanées de dépasser la
 * limite (l'ancien « vérifier puis enregistrer l'échec » ne le garantissait pas).
 *
 * Retourne `null` si le compteur est indisponible : l'appelant doit alors
 * REFUSER (fail-closed). Contrairement à l'anti-spam des formulaires (fail-open),
 * l'authentification ne doit jamais s'ouvrir quand sa protection tombe.
 * Exception : en développement local, sans Upstash, on retourne 0 (pas de limite).
 *
 * L'expiration est toujours posée, même si la clé est supprimée puis recréée par
 * une requête simultanée (lib/attemptCounter.ts) : une clé sans TTL verrouillerait
 * le PIN indéfiniment.
 */
export async function consumeAttempt(
  key: string,
  windowSeconds: number,
): Promise<number | null> {
  if (!redis) return process.env.NODE_ENV === "production" ? null : 0;

  try {
    return await incrementWithTtl(redis, key, windowSeconds);
  } catch (err) {
    alertRedisFailure("pin-mimi", err);
    return null;
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
