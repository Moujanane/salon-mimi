// lib/faq.test.ts
//
// La FAQ de l'accueil (section visible) et son balisage JSON-LD (FAQPage)
// doivent venir de la même source, dans les 3 langues, avec les prix du
// catalogue. Les règles de Google exigent que le contenu balisé soit visible.
//
// Lancer : npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";
import { getFaq, faqJsonLd, FAQ_TITLE } from "./faq";
import { services, packages } from "./services-data";
import { SALON } from "./salon-info";

const LOCALES = ["fr", "en", "es"] as const;

test("4 questions par langue, toutes avec une réponse non vide", () => {
  for (const l of LOCALES) {
    const faq = getFaq(l);
    assert.equal(faq.length, 4, l);
    for (const item of faq) {
      assert.ok(item.question.trim().endsWith("?"), `${l} : ${item.question}`);
      assert.ok(item.answer.trim().length > 30, `${l} : réponse trop courte`);
    }
    assert.ok(FAQ_TITLE[l].length > 5, `titre de section ${l}`);
  }
});

test("la réponse tarifs cite les prix du catalogue dans chaque langue", () => {
  const all = [...services, ...packages].map((i) => i.priceMad);
  const price = (id: string) => services.find((s) => s.id === id)!.priceMad;
  for (const l of LOCALES) {
    const tarifs = getFaq(l)[3].answer;
    for (const id of [
      "box-braids-medium",
      "knotless-braids",
      "cornrows",
      "depart-locks",
    ]) {
      assert.ok(tarifs.includes(`${price(id)} MAD`), `${l} : ${id}`);
    }
    assert.match(
      tarifs,
      new RegExp(`\\b${SALON.priceRange.min} MAD`),
      `${l} : minimum`,
    );
    assert.ok(tarifs.includes(`${Math.max(...all)} MAD`), `${l} : maximum`);
    assert.doesNotMatch(tarifs, /\b550\b/, `${l} : ancien prix`);
  }
});

test("le JSON-LD reprend exactement les textes visibles (même source)", () => {
  for (const l of LOCALES) {
    const faq = getFaq(l);
    const ld = faqJsonLd(l);
    assert.equal(ld["@type"], "FAQPage");
    assert.equal(ld.mainEntity.length, faq.length);
    ld.mainEntity.forEach((q, i) => {
      assert.equal(q["@type"], "Question");
      assert.equal(q.name, faq[i].question, `${l} #${i} question`);
      assert.equal(q.acceptedAnswer.text, faq[i].answer, `${l} #${i} réponse`);
    });
  }
});

test("langue inconnue : retombe sur le français", () => {
  assert.deepEqual(getFaq("de"), getFaq("fr"));
});
