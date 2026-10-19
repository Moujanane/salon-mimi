// lib/adminPolicy.test.ts
//
// Qui est administrateur ? Avant : n'importe quel compte Supabase connecté
// (les inscriptions étant ouvertes, n'importe qui pouvait se créer un compte
// et modifier les réglages, la galerie et les réservations). Désormais : seules
// les adresses de la variable ADMIN_EMAILS, avec e-mail confirmé.
//
// Lancer : npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAdminEmails, isAdminUser } from "./adminPolicy";

const confirme = "2026-10-19T10:00:00Z";

test("parseAdminEmails : minuscules, espaces et vides ignorés", () => {
  assert.deepEqual(parseAdminEmails(" A@x.com, b@Y.com ,, "), [
    "a@x.com",
    "b@y.com",
  ]);
  assert.deepEqual(parseAdminEmails(""), []);
  assert.deepEqual(parseAdminEmails(undefined), []);
  assert.deepEqual(parseAdminEmails(null), []);
});

test("isAdminUser : e-mail de la liste (casse ignorée) et confirmé -> admin", () => {
  assert.equal(
    isAdminUser(
      { email: "Mimi@Exemple.com", email_confirmed_at: confirme },
      "mimi@exemple.com",
    ),
    true,
  );
  assert.equal(
    isAdminUser(
      { email: "b@y.com", email_confirmed_at: confirme },
      "a@x.com, b@y.com",
    ),
    true,
  );
});

test("isAdminUser : compte quelconque (inscription ouverte) refusé", () => {
  assert.equal(
    isAdminUser(
      { email: "pirate@evil.com", email_confirmed_at: confirme },
      "mimi@exemple.com",
    ),
    false,
  );
});

test("isAdminUser : adresses qui ressemblent à celle de l'admin refusées", () => {
  const liste = "mimi@exemple.com";
  for (const email of [
    "evilmimi@exemple.com",
    "mimi@exemple.com.evil.com",
    "mimi@exemple.co",
    "mimi+x@exemple.com",
    " mimi@exemple.com@evil.com",
  ]) {
    assert.equal(
      isAdminUser({ email, email_confirmed_at: confirme }, liste),
      false,
      email,
    );
  }
});

test("isAdminUser : e-mail non confirmé refusé", () => {
  assert.equal(
    isAdminUser(
      { email: "mimi@exemple.com", email_confirmed_at: null },
      "mimi@exemple.com",
    ),
    false,
  );
  assert.equal(
    isAdminUser({ email: "mimi@exemple.com" }, "mimi@exemple.com"),
    false,
  );
});

test("isAdminUser : liste absente ou vide = personne n'est admin (refus par défaut)", () => {
  for (const liste of [undefined, null, "", "  ,  "]) {
    assert.equal(
      isAdminUser(
        { email: "mimi@exemple.com", email_confirmed_at: confirme },
        liste,
      ),
      false,
      String(liste),
    );
  }
});

test("isAdminUser : pas d'utilisateur ou pas d'e-mail refusé", () => {
  assert.equal(isAdminUser(null, "mimi@exemple.com"), false);
  assert.equal(isAdminUser(undefined, "mimi@exemple.com"), false);
  assert.equal(
    isAdminUser(
      { email: null, email_confirmed_at: confirme },
      "mimi@exemple.com",
    ),
    false,
  );
});
