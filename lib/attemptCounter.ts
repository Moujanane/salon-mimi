// lib/attemptCounter.ts
//
// Compteur d'essais avec expiration GARANTIE, sans dépendance à Redis (le client
// est injecté : testable). Utilisé par lib/rateLimit.ts (PIN de Mimi).
//
// Pourquoi pas « SET NX EX » puis « INCR » ? Ce sont deux appels séparés : si la
// clé est supprimée entre les deux (succès simultané qui remet le compteur à
// zéro), INCR la recrée SANS expiration. Les échecs s'additionneraient alors sans
// limite de temps et le bon PIN lui-même recevrait un refus, jusqu'à suppression
// manuelle de la clé (relecture sécurité du 19/10/2026).
//
// Ici : INCR (atomique), puis expiration posée si la clé vient d'être créée OU si
// elle n'a pas d'expiration (TTL < 0). Fenêtre FIXE : l'expiration d'une clé qui
// en a déjà une n'est jamais prolongée.

export type CounterRedis = {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<unknown>;
  ttl(key: string): Promise<number>;
};

export async function incrementWithTtl(
  redis: CounterRedis,
  key: string,
  windowSeconds: number,
): Promise<number> {
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  } else if ((await redis.ttl(key)) < 0) {
    // -1 : la clé existe sans expiration (course décrite ci-dessus) ; -2 : elle
    // vient de disparaître (expire n'aura alors aucun effet, sans erreur).
    await redis.expire(key, windowSeconds);
  }
  return count;
}
