// lib/sitemap.test.ts
//
// Le sitemap doit annoncer une date de dernière modification RÉELLE
// (SALON.lastReviewed), pas la date du build : un lastmod qui change à chaque
// déploiement perd sa valeur de signal de fraîcheur pour Google.
//
// Lancer : npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";
import sitemap from "../app/sitemap";
import { SALON } from "./salon-info";

test("24 URLs (8 pages x 3 langues), sans slash final", () => {
  const entries = sitemap();
  assert.equal(entries.length, 24);
  for (const e of entries) {
    assert.match(
      e.url,
      /^https:\/\/mimi-coiffure\.com\/(fr|en|es)(\/[a-z-]+)?$/,
    );
    assert.ok(!e.url.endsWith("/"), e.url);
  }
  const urls = entries.map((e) => e.url);
  assert.ok(urls.includes("https://mimi-coiffure.com/fr"));
  assert.ok(urls.includes("https://mimi-coiffure.com/en/services"));
  assert.equal(new Set(urls).size, urls.length, "URLs dupliquées");
});

test("lastModified = SALON.lastReviewed (date réelle, pas la date du build)", () => {
  for (const e of sitemap()) {
    assert.ok(e.lastModified instanceof Date, e.url);
    assert.equal(
      (e.lastModified as Date).toISOString().slice(0, 10),
      SALON.lastReviewed,
      e.url,
    );
  }
});

test("SALON.lastReviewed est une date ISO valide, pas dans le futur", () => {
  assert.match(SALON.lastReviewed, /^\d{4}-\d{2}-\d{2}$/);
  const d = new Date(`${SALON.lastReviewed}T00:00:00Z`);
  assert.ok(!Number.isNaN(d.getTime()));
  assert.ok(d.getTime() <= Date.now() + 24 * 3600 * 1000, "date dans le futur");
});
