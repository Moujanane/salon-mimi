// lib/page-content.test.ts
//
// Contenus ajoutés pour le SEO (introduction de l'accueil, « L'essentiel » de
// la page À propos, infos pratiques du Contact, styles de la Galerie). Tous
// sont calculés depuis le catalogue et les constantes du salon : aucun prix ni
// coordonnée n'est écrit en dur, donc rien ne peut diverger du reste du site.
//
// Lancer : npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  homeIntro,
  aboutFacts,
  contactFacts,
  galleryStyles,
} from "./page-content";
import { services, packages } from "./services-data";
import { SALON } from "./salon-info";

const LOCALES = ["fr", "en", "es"] as const;
const all = [...services, ...packages];
const min = Math.min(...all.map((i) => i.priceMad));
const max = Math.max(...all.map((i) => i.priceMad));
const price = (id: string) => services.find((s) => s.id === id)!.priceMad;

test("introduction de l'accueil : réponse directe avec prix du catalogue (3 langues)", () => {
  for (const l of LOCALES) {
    const { title, text } = homeIntro(l);
    assert.ok(title.length > 10, `${l} titre`);
    assert.match(text, /Marrakech/, l);
    assert.match(text, /Jamaa El Fna/, l);
    assert.ok(
      text.includes(`${min} `) && text.includes(`${max} MAD`),
      `${l} fourchette`,
    );
    for (const id of ["box-braids-medium", "knotless-braids", "cornrows"]) {
      assert.ok(text.includes(`${price(id)} MAD`), `${l} : ${id}`);
    }
    assert.ok(
      text.includes(String(all.length)),
      `${l} : nombre de prestations`,
    );
    assert.doesNotMatch(text, /\b550\b/, l);
    const words = text.split(/\s+/).length;
    // ~80 mots de hero précèdent l'intro : <= 70 mots pour que la réponse
    // directe se termine avant le mot 150 de la page (critère GEO).
    assert.ok(words >= 45 && words <= 70, `${l} : ${words} mots`);
  }
});

test("introduction : langue inconnue -> français", () => {
  assert.deepEqual(homeIntro("de"), homeIntro("fr"));
});

test("À propos et Contact : coordonnées = constantes du salon", () => {
  for (const l of LOCALES) {
    for (const facts of [aboutFacts(l), contactFacts(l)]) {
      const joined = facts.items.join(" | ");
      assert.ok(facts.title.length > 5);
      assert.ok(joined.includes(SALON.telephone), `${l} téléphone`);
      assert.ok(joined.includes(SALON.address.streetAddress), `${l} adresse`);
    }
    assert.ok(
      aboutFacts(l).items.join(" ").includes(`${min}`),
      `${l} : tarif minimum dans À propos`,
    );
  }
});

test("pas d'horaires dans les contenus générés (non confirmés)", () => {
  for (const l of LOCALES) {
    const all = [
      homeIntro(l).text,
      ...aboutFacts(l).items,
      ...contactFacts(l).items,
    ].join(" ");
    assert.doesNotMatch(
      all,
      /\b\d{1,2}\s?h\s?([–-]|à|to|a)\s?\d{1,2}|am\s?[–-]|\b\d{1,2}:\d{2}|24\s?h\s?\/\s?24|\b(ouvert|open daily|open every|abierto|horaires?\s*:)/i,
      l,
    );
  }
});

test("Galerie : un lien de réservation valide par style de tresses", () => {
  for (const l of LOCALES) {
    const g = galleryStyles(l);
    assert.ok(g.items.length >= 5, `${l} : ${g.items.length} styles`);
    for (const it of g.items) {
      assert.match(
        it.href,
        new RegExp(`^/${l}/reservation\\?service=[a-z-]+$`),
      );
      const id = it.href.split("=")[1];
      assert.ok(
        services.some((s) => s.id === id),
        `id inconnu : ${id}`,
      );
      assert.ok(it.label.length > 3);
    }
    assert.equal(new Set(g.items.map((i) => i.href)).size, g.items.length);
  }
});

test("À propos : durées min et max citées = vraies bornes du catalogue", () => {
  const lower = (d: string) => Number(d.match(/\d+/)![0]);
  const upper = (d: string) => Number([...d.matchAll(/\d+/g)].pop()![0]);
  // Certaines prestations n'ont pas de durée ("—") : on les ignore.
  const durations = services
    .map((s) => s.durationFr)
    .filter((d) => /\d/.test(d));
  const minLow = Math.min(...durations.map(lower));
  const maxUp = Math.max(...durations.map(upper));
  const cornrows = services.find((s) => s.id === "cornrows")!.durationFr;
  const locks = services.find((s) => s.id === "depart-locks")!.durationFr;
  assert.equal(
    lower(cornrows),
    minLow,
    "cornrows n'est plus la prestation la plus courte",
  );
  assert.equal(
    upper(locks),
    maxUp,
    "départ de locks n'est plus la plus longue",
  );
});
