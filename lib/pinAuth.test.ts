// lib/pinAuth.test.ts
//
// Limite d'essais du PIN de Mimi. Constat de l'audit du 19/10/2026 : 15 essais
// SIMULTANÉS avec un faux PIN passaient tous (limite théorique : 3), car le code
// vérifiait « trop d'essais ? » puis enregistrait l'échec en deux temps. Ici le
// compteur est incrémenté AVANT de vérifier le PIN (opération atomique côté
// Redis), donc seuls les N premiers essais sont jamais comparés au vrai PIN.
//
// Lancer : npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluatePin } from "./pinAuth";

const PIN = "482915";
const MAX = 5;

/** Faux compteur Redis : incrément atomique (synchrone), réponse asynchrone. */
function fakeCounter() {
  let n = 0;
  let cleared = 0;
  return {
    consumeAttempt: async () => {
      n += 1;
      const value = n;
      await new Promise((r) => setTimeout(r, Math.random() * 5));
      return value;
    },
    clearAttempts: async () => {
      cleared += 1;
      n = 0;
    },
    get cleared() {
      return cleared;
    },
  };
}

test("15 essais simultanés avec un faux PIN : seuls MAX sont examinés", async () => {
  const c = fakeCounter();
  const results = await Promise.all(
    Array.from({ length: 15 }, (_, i) =>
      evaluatePin({
        expected: PIN,
        provided: `000${i}`,
        maxAttempts: MAX,
        ...c,
      }),
    ),
  );
  const refus401 = results.filter((r) => !r.ok && r.status === 401).length;
  const bloques429 = results.filter((r) => !r.ok && r.status === 429).length;
  assert.equal(refus401, MAX, "essais réellement comparés au PIN");
  assert.equal(bloques429, 15 - MAX, "essais bloqués sans comparaison");
});

test("le bon PIN est accepté et remet le compteur à zéro", async () => {
  const c = fakeCounter();
  const r = await evaluatePin({
    expected: PIN,
    provided: PIN,
    maxAttempts: MAX,
    ...c,
  });
  assert.deepEqual(r, { ok: true });
  assert.equal(c.cleared, 1);
});

test("plusieurs mauvais essais puis le bon, dans la limite : accepté", async () => {
  const c = fakeCounter();
  for (const mauvais of ["1111", "2222", "3333", "4444"]) {
    const r = await evaluatePin({
      expected: PIN,
      provided: mauvais,
      maxAttempts: MAX,
      ...c,
    });
    assert.equal(r.ok, false);
  }
  const bon = await evaluatePin({
    expected: PIN,
    provided: PIN,
    maxAttempts: MAX,
    ...c,
  });
  assert.deepEqual(bon, { ok: true });
});

test("après la limite, même le BON PIN est refusé (pas d'oracle pour l'attaquant)", async () => {
  const c = fakeCounter();
  for (let i = 0; i < MAX; i++) {
    await evaluatePin({
      expected: PIN,
      provided: `x${i}`,
      maxAttempts: MAX,
      ...c,
    });
  }
  const r = await evaluatePin({
    expected: PIN,
    provided: PIN,
    maxAttempts: MAX,
    ...c,
  });
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.status, 429);
  assert.equal(c.cleared, 0);
});

test("compteur indisponible (panne Redis) : refus 503, aucune comparaison", async () => {
  const r = await evaluatePin({
    expected: PIN,
    provided: PIN,
    maxAttempts: MAX,
    consumeAttempt: async () => null,
    clearAttempts: async () => {},
  });
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.status, 503);
});

test("PIN serveur non configuré : 503, même avec un PIN fourni", async () => {
  for (const expected of [undefined, ""]) {
    const r = await evaluatePin({
      expected,
      provided: "123456",
      maxAttempts: MAX,
      consumeAttempt: async () => 1,
      clearAttempts: async () => {},
    });
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.status, 503);
  }
});

test("PIN absent ou vide = un essai consommé et refusé (401)", async () => {
  let consommes = 0;
  const r = await evaluatePin({
    expected: PIN,
    provided: "",
    maxAttempts: MAX,
    consumeAttempt: async () => ++consommes,
    clearAttempts: async () => {},
  });
  assert.equal(consommes, 1);
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.status, 401);
});

test("PIN de longueur différente refusé sans erreur", async () => {
  const c = fakeCounter();
  for (const provided of ["1", "x".repeat(500), PIN + "0"]) {
    const r = await evaluatePin({
      expected: PIN,
      provided,
      maxAttempts: 1000,
      ...c,
    });
    assert.equal(r.ok, false);
  }
});
