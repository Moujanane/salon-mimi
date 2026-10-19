// lib/pinAuth.ts
//
// Décision d'authentification par PIN (page de Mimi), sans dépendance à Next.js
// ni à Redis : testable. Branchée sur Redis par lib/mimiAuth.ts.
//
// Correctif de l'audit du 19/10/2026 : l'ancien code vérifiait « trop d'essais ? »
// PUIS enregistrait l'échec (deux opérations séparées). Des requêtes envoyées en
// même temps passaient toutes la vérification avant que le compteur ne monte :
// 15 essais simultanés étaient tous examinés au lieu de 3.
//
// Ici, le compteur est incrémenté AVANT toute comparaison avec le vrai PIN
// (`consumeAttempt`, atomique côté Redis). Seuls les `maxAttempts` premiers
// essais d'une fenêtre sont donc comparés au PIN, même en rafale. Au-delà, la
// requête est refusée sans comparer (y compris avec le bon PIN : pas d'oracle).

import { timingSafeEqual } from "crypto";

export type MimiAuthResult =
  { ok: true } | { ok: false; status: 401 | 429 | 503; error: string };

function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  // timingSafeEqual exige des longueurs égales : on compare d'abord la longueur
  // (l'info « longueur du PIN » n'est pas un secret exploitable ici).
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export async function evaluatePin(opts: {
  /** PIN attendu (variable MIMI_PIN). Absent = service indisponible (503). */
  expected: string | undefined;
  /** PIN reçu dans le header x-mimi-pin ("" si absent). */
  provided: string;
  /** Nombre d'essais autorisés par fenêtre et par adresse IP. */
  maxAttempts: number;
  /**
   * Consomme UN essai de la fenêtre, de façon atomique, et retourne le nombre
   * d'essais consommés (>= 1). null = compteur indisponible : on refuse (503)
   * plutôt que de laisser passer sans limite.
   */
  consumeAttempt: () => Promise<number | null>;
  /** Remet le compteur à zéro après un succès. */
  clearAttempts: () => Promise<void>;
}): Promise<MimiAuthResult> {
  if (!opts.expected) {
    return {
      ok: false,
      status: 503,
      error: "Service indisponible (configuration manquante).",
    };
  }

  const attempts = await opts.consumeAttempt();
  if (attempts === null) {
    return {
      ok: false,
      status: 503,
      error: "Service momentanément indisponible. Réessaie dans un instant.",
    };
  }
  if (attempts > opts.maxAttempts) {
    return {
      ok: false,
      status: 429,
      error: "Trop de tentatives. Réessaie plus tard.",
    };
  }

  if (opts.provided && constantTimeEqual(opts.provided, opts.expected)) {
    await opts.clearAttempts();
    return { ok: true };
  }
  return { ok: false, status: 401, error: "PIN incorrect" };
}
