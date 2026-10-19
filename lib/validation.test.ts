// lib/validation.test.ts
//
// Validation CÔTÉ SERVEUR des champs saisis par les visiteurs et par l'admin.
// Avant : heure_souhaitee et nombre_personnes n'étaient pas vérifiés (injection
// HTML possible dans la page de Mimi), les réglages (WhatsApp, e-mail, prix)
// n'étaient vérifiés que dans le navigateur.
//
// Lancer : npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validateReservationExtras,
  validateSettingValue,
  validateContactBody,
  validateSettingsUpdates,
  isValidEmail,
} from "./validation";

const XSS = [
  "<img src=x onerror=alert(1)>",
  '" onmouseover="alert(1)',
  "<script>alert(1)</script>",
  "javascript:alert(1)",
  "x'><svg/onload=alert(1)>",
];

test("réservation : valeurs légitimes du formulaire (3 langues) acceptées", () => {
  for (const personnes of [
    "1 personne",
    "4 personnes et +",
    "2 people",
    "4 people or more",
    "3 personas",
    "4 personas o más",
  ]) {
    assert.equal(
      validateReservationExtras({
        date_souhaitee: "2026-11-02",
        heure_souhaitee: "14:30",
        nombre_personnes: personnes,
      }),
      null,
      personnes,
    );
  }
});

test("réservation : champs optionnels vides, absents ou null acceptés", () => {
  assert.equal(validateReservationExtras({}), null);
  assert.equal(
    validateReservationExtras({
      date_souhaitee: "",
      heure_souhaitee: "",
      nombre_personnes: "",
    }),
    null,
  );
  assert.equal(
    validateReservationExtras({
      date_souhaitee: null,
      heure_souhaitee: undefined,
      nombre_personnes: null,
    }),
    null,
  );
});

test("réservation : date invalide refusée", () => {
  for (const d of [
    "2026-13-45",
    "2026-02-30",
    "02/11/2026",
    "1999-01-01",
    "2099-01-01",
    "demain",
    ...XSS,
  ]) {
    assert.ok(
      validateReservationExtras({ date_souhaitee: d }),
      `devrait être refusée : ${d}`,
    );
  }
});

test("réservation : heure invalide refusée", () => {
  for (const h of ["25:00", "14h30", "9:7", "14:30:00", "midi", ...XSS]) {
    assert.ok(
      validateReservationExtras({ heure_souhaitee: h }),
      `devrait être refusée : ${h}`,
    );
  }
  assert.equal(validateReservationExtras({ heure_souhaitee: "9:05" }), null);
});

test("réservation : nombre de personnes avec balises ou trop long refusé", () => {
  for (const n of [...XSS, "a".repeat(41), "2 personnes <b>"]) {
    assert.ok(
      validateReservationExtras({ nombre_personnes: n }),
      `devrait être refusé : ${n}`,
    );
  }
});

test("réservation : types non textuels refusés (objet, tableau, nombre)", () => {
  assert.ok(validateReservationExtras({ heure_souhaitee: { a: 1 } }));
  assert.ok(validateReservationExtras({ nombre_personnes: ["2"] }));
  assert.ok(validateReservationExtras({ date_souhaitee: 20261102 }));
});

test("réglages : numéro WhatsApp normalisé et validé", () => {
  const ok = (v: string) => validateSettingValue("whatsapp_number", v);
  assert.deepEqual(ok("+212 710-388 204"), {
    ok: true,
    value: "+212710388204",
  });
  assert.deepEqual(ok("212710388204"), { ok: true, value: "212710388204" });
  for (const bad of ["abc", "+1", "1".repeat(20), "javascript:alert(1)", ""]) {
    assert.equal(ok(bad).ok, false, bad);
  }
});

test("réglages : e-mail de notification (vide autorisé, injection refusée)", () => {
  const ok = (v: unknown) => validateSettingValue("notification_email", v);
  assert.deepEqual(ok(""), { ok: true, value: "" });
  assert.deepEqual(ok(" mimi@exemple.com "), {
    ok: true,
    value: "mimi@exemple.com",
  });
  for (const bad of [
    "a@b",
    "mimi@exemple.com\r\nBcc: x@y.com",
    "mimi exemple@x.com",
    `${"a".repeat(250)}@x.com`,
    42,
    { a: 1 },
  ]) {
    assert.equal(ok(bad).ok, false, String(bad));
  }
});

test("réglages : prix = entier positif raisonnable", () => {
  const ok = (v: unknown) => validateSettingValue("price_box_braids", v);
  assert.deepEqual(ok("550"), { ok: true, value: "550" });
  assert.deepEqual(ok(" 150 "), { ok: true, value: "150" });
  assert.deepEqual(ok(200), { ok: true, value: "200" });
  for (const bad of ["12.5", "-5", "1000000", "abc", "", "5e3", "1 0"]) {
    assert.equal(ok(bad).ok, false, bad);
  }
});

test("réglages : clé inconnue refusée", () => {
  assert.equal(validateSettingValue("role", "admin").ok, false);
  assert.equal(validateSettingValue("price_inconnu", "1").ok, false);
});

test("contact : message valide nettoyé, invalide refusé", () => {
  const good = validateContactBody({
    prenom: " Awa ",
    nom: "Diallo",
    telephone: "+212 600 000 000",
    email: "awa@exemple.com",
    demande: "Bonjour, je voudrais des tresses.",
  });
  assert.equal(good.ok, true);
  if (good.ok) assert.equal(good.value.prenom, "Awa");

  const base = {
    prenom: "Awa",
    nom: "Diallo",
    telephone: "+212600000000",
    email: "awa@exemple.com",
    demande: "Bonjour",
  };
  for (const patch of [
    { prenom: undefined },
    { prenom: { a: 1 } },
    { nom: "x".repeat(81) },
    { telephone: "abc" },
    { email: "pas-un-email" },
    { email: "a@b.com\r\nBcc: z@z.com" },
    { demande: "x".repeat(2001) },
    { demande: "" },
  ]) {
    assert.equal(
      validateContactBody({ ...base, ...patch }).ok,
      false,
      JSON.stringify(patch).slice(0, 40),
    );
  }
  assert.equal(validateContactBody(null).ok, false);
  assert.equal(validateContactBody("texte").ok, false);
});

test("isValidEmail : refuse CRLF, espaces et longueur excessive", () => {
  assert.equal(isValidEmail("mimi@exemple.com"), true);
  assert.equal(isValidEmail("a@b.co"), true);
  assert.equal(isValidEmail("a@b"), false);
  assert.equal(isValidEmail("a b@c.com"), false);
  assert.equal(isValidEmail("a@c.com\nBcc: x@y.com"), false);
  assert.equal(isValidEmail(`${"a".repeat(255)}@c.com`), false);
  assert.equal(isValidEmail(undefined), false);
});

test("mise à jour de réglages : tout ou rien, clés inconnues ignorées", () => {
  const allowed = ["whatsapp_number", "price_box_braids"];
  const ok = validateSettingsUpdates(
    { whatsapp_number: "+212 600 000 000", price_box_braids: " 200 ", role: "admin" },
    allowed,
  );
  assert.deepEqual(ok, {
    ok: true,
    value: [
      ["whatsapp_number", "+212600000000"],
      ["price_box_braids", "200"],
    ],
  });
  // une seule valeur invalide refuse toute la requête (rien n'est écrit)
  assert.equal(
    validateSettingsUpdates({ whatsapp_number: "+212600000000", price_box_braids: "gratuit" }, allowed).ok,
    false,
  );
  assert.equal(validateSettingsUpdates({ role: "admin" }, allowed).ok, false);
  assert.equal(validateSettingsUpdates(null, allowed).ok, false);
  assert.equal(validateSettingsUpdates([1, 2], allowed).ok, false);
  assert.equal(validateSettingsUpdates("x", allowed).ok, false);
});
