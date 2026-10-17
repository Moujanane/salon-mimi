// lib/page-meta.test.ts
//
// Garde-fou SEO : longueur des titres et meta descriptions des pages
// principales, dans les 3 langues. Au-delà de ~60 caractères (title) et ~160
// (description), Google tronque l'affichage.
//
// Lancer : npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";
import { PAGE_META, type PageKey, type MetaLocale } from "./page-meta";

const LOCALES: MetaLocale[] = ["fr", "en", "es"];
const PAGES = Object.keys(PAGE_META) as PageKey[];

test("les 5 pages principales sont définies dans les 3 langues", () => {
  assert.deepEqual([...PAGES].sort(), [
    "aPropos",
    "galerie",
    "home",
    "reservation",
    "services",
  ]);
  for (const page of PAGES) {
    for (const l of LOCALES) {
      assert.ok(PAGE_META[page].titles[l], `${page}/${l} : title manquant`);
      assert.ok(
        PAGE_META[page].descriptions[l],
        `${page}/${l} : description manquante`,
      );
    }
  }
});

test("titles <= 60 caractères (sauf l'accueil, voir test suivant)", () => {
  for (const page of PAGES) {
    if (page === "home") continue;
    for (const l of LOCALES) {
      const t = PAGE_META[page].titles[l];
      assert.ok(t.length <= 60, `${page}/${l} : ${t.length} car. -> "${t}"`);
    }
  }
});

test("accueil : title commence par 'Salon Mimi Marrakech' (fix 'mimi marrakech' du 10/2026, en cours de mesure)", () => {
  for (const l of LOCALES) {
    const t = PAGE_META.home.titles[l];
    assert.ok(t.startsWith("Salon Mimi Marrakech"), `${l} : "${t}"`);
    assert.ok(t.length <= 66, `${l} : ${t.length} car.`);
  }
});

test("descriptions entre 100 et 160 caractères", () => {
  for (const page of PAGES) {
    for (const l of LOCALES) {
      const d = PAGE_META[page].descriptions[l];
      assert.ok(
        d.length >= 100 && d.length <= 160,
        `${page}/${l} : ${d.length} car. -> "${d}"`,
      );
    }
  }
});

test("chaque page a un title et une description uniques par langue", () => {
  for (const l of LOCALES) {
    const titles = PAGES.map((p) => PAGE_META[p].titles[l]);
    const descs = PAGES.map((p) => PAGE_META[p].descriptions[l]);
    assert.equal(
      new Set(titles).size,
      titles.length,
      `titles dupliqués (${l})`,
    );
    assert.equal(
      new Set(descs).size,
      descs.length,
      `descriptions dupliquées (${l})`,
    );
  }
});

test("toutes les descriptions citent Marrakech", () => {
  for (const page of PAGES) {
    for (const l of LOCALES) {
      assert.match(
        PAGE_META[page].descriptions[l],
        /Marrakech/,
        `${page}/${l}`,
      );
    }
  }
});
