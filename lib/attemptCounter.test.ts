// lib/attemptCounter.test.ts
//
// Compteur d'essais avec expiration GARANTIE. Constat de la relecture sécurité
// du 19/10/2026 : « SET NX EX » puis « INCR » sont deux appels séparés. Si la clé
// est supprimée entre les deux (succès simultané de Mimi qui remet le compteur à
// zéro), INCR la recrée SANS expiration : les échecs s'additionnent alors sans
// limite de temps et Mimi reste verrouillée, même avec le bon PIN, jusqu'à
// suppression manuelle de la clé dans Redis.
//
// Lancer : npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";
import { incrementWithTtl } from "./attemptCounter";
import { rateLimitIp } from "./clientIp";

/** Faux Redis : INCR atomique, TTL en secondes (-1 = sans expiration, -2 = absente). */
function fakeRedis() {
  const values = new Map<string, number>();
  const ttls = new Map<string, number>();
  return {
    values,
    ttls,
    incr: async (k: string) => {
      const n = (values.get(k) ?? 0) + 1;
      values.set(k, n);
      return n;
    },
    expire: async (k: string, s: number) => {
      if (!values.has(k)) return 0;
      ttls.set(k, s);
      return 1;
    },
    ttl: async (k: string) => {
      if (!values.has(k)) return -2;
      return ttls.get(k) ?? -1;
    },
  };
}

test("premier essai : le compteur vaut 1 et une expiration est posée", async () => {
  const r = fakeRedis();
  assert.equal(await incrementWithTtl(r, "k", 1800), 1);
  assert.equal(r.ttls.get("k"), 1800);
});

test("clé recréée SANS expiration (suppression entre deux appels) : expiration rétablie", async () => {
  const r = fakeRedis();
  // État laissé par la course : la clé existe avec 1 essai mais sans TTL
  r.values.set("k", 1);
  assert.equal(r.ttls.has("k"), false);
  const n = await incrementWithTtl(r, "k", 1800);
  assert.equal(n, 2);
  assert.equal(r.ttls.get("k"), 1800, "l'expiration doit être rétablie");
});

test("clé déjà munie d'une expiration : elle n'est pas prolongée (fenêtre fixe)", async () => {
  const r = fakeRedis();
  await incrementWithTtl(r, "k", 1800);
  r.ttls.set("k", 600); // 10 minutes restantes
  await incrementWithTtl(r, "k", 1800);
  assert.equal(r.ttls.get("k"), 600);
});

test("clé disparue entre INCR et TTL (expirée à l'instant) : aucune erreur", async () => {
  const r = fakeRedis();
  r.values.set("k", 4);
  const incr = r.incr;
  r.incr = async (k: string) => {
    const n = await incr(k);
    r.values.delete(k); // disparaît juste après
    return n;
  };
  assert.equal(await incrementWithTtl(r, "k", 1800), 5);
});

test("15 incréments simultanés : valeurs distinctes de 1 à 15", async () => {
  const r = fakeRedis();
  const out = await Promise.all(
    Array.from({ length: 15 }, () => incrementWithTtl(r, "k", 1800)),
  );
  assert.deepEqual(
    [...out].sort((a, b) => a - b),
    Array.from({ length: 15 }, (_, i) => i + 1),
  );
  assert.ok(r.ttls.has("k"));
});

test("clé IP : IPv4 et valeurs spéciales inchangées", () => {
  assert.equal(rateLimitIp("203.0.113.7"), "203.0.113.7");
  assert.equal(rateLimitIp("unknown"), "unknown");
  assert.equal(rateLimitIp("::ffff:203.0.113.7"), "203.0.113.7");
});

test("clé IP : toutes les adresses d'un même /64 IPv6 partagent la même clé", () => {
  const a = rateLimitIp("2001:db8:85a3:1::1");
  const b = rateLimitIp("2001:db8:85a3:1:ffff:eeee:dddd:cccc");
  const c = rateLimitIp("2001:0DB8:85A3:0001:0000:0000:0000:0002");
  assert.equal(a, b);
  assert.equal(a, c);
  assert.notEqual(a, rateLimitIp("2001:db8:85a3:2::1"));
  assert.match(a, /\/64$/);
});

test("clé IP : forme abrégée « :: » en tête, au milieu et en fin", () => {
  assert.equal(rateLimitIp("::1"), rateLimitIp("0:0:0:0:0:0:0:1"));
  assert.equal(rateLimitIp("2001:db8::"), rateLimitIp("2001:db8:0:0:0:0:0:0"));
  assert.equal(rateLimitIp("fe80::1:2"), rateLimitIp("fe80:0:0:0:0:0:1:2"));
});

test("clé IP : valeur invalide renvoyée telle quelle (pas d'exception)", () => {
  for (const v of ["", "pas-une-ip", "1:2:3:4:5:6:7:8:9", "2001:::1"]) {
    assert.doesNotThrow(() => rateLimitIp(v));
  }
});
