// lib/pricing.test.ts
//
// Garde-fou de cohérence des prix : le catalogue (`services-data.ts`) est la
// seule source de vérité. La page d'accueil, le JSON-LD (OfferCatalog,
// priceRange) et la réponse FAQ « tarifs » doivent tous en dériver.
//
// Lancer : npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";
import { services, packages } from "./services-data";
import { SALON, offerCatalogLd, faqTarifsAnswerFr } from "./salon-info";

/** Taux MAD par EUR utilisé dans le catalogue (ex. 700 MAD -> 66 EUR). */
const MAD_PER_EUR = 10.6;

const byId = (id: string) => {
  const s = services.find((x) => x.id === id);
  assert.ok(s, `service introuvable : ${id}`);
  return s;
};

test("prix des 4 services vedettes (confirmés par le salon le 17/10/2026)", () => {
  assert.equal(byId("box-braids-medium").priceMad, 500);
  assert.equal(byId("knotless-braids").priceMad, 700);
  assert.equal(byId("boho-braids").priceMad, 650);
  assert.equal(byId("cornrows").priceMad, 300);
});

test("chaque prix en euros correspond au prix en MAD (arrondi, écart <= 0,75 EUR)", () => {
  for (const item of [...services, ...packages]) {
    const expected = item.priceMad / MAD_PER_EUR;
    assert.ok(
      Math.abs(item.priceEur - expected) <= 0.75,
      `${item.id} : ${item.priceMad} MAD devrait valoir ~${expected.toFixed(1)} EUR, trouvé ${item.priceEur}`,
    );
  }
});

test("priceRange du schéma = min et max réels du catalogue", () => {
  const prices = [...services, ...packages].map((i) => i.priceMad);
  assert.equal(SALON.priceRange.min, Math.min(...prices));
  assert.equal(SALON.priceRange.max, Math.max(...prices));
});

test("OfferCatalog : le prix de chaque offre = prix du catalogue", () => {
  const offers = offerCatalogLd().itemListElement;
  for (const s of services) {
    const offer = offers.find((o) => o.itemOffered.name === s.nameFr);
    assert.ok(offer, `offre manquante : ${s.nameFr}`);
    assert.equal(offer.price, String(s.priceMad), s.nameFr);
  }
});

test("réponse FAQ tarifs : dérivée du catalogue, sans ancien prix", () => {
  const text = faqTarifsAnswerFr();
  assert.match(text, /box braids medium sont à 500 MAD/);
  assert.match(text, /knotless braids à 700 MAD/);
  assert.match(text, /cornrows tête entière à 300 MAD/);
  assert.match(text, /départ de locks à 900 MAD/);
  assert.match(text, /de 150 MAD/);
  assert.match(text, /à 950 MAD/);
  assert.doesNotMatch(text, /\b550\b/);
});
