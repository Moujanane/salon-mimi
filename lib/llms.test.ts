// lib/llms.test.ts
//
// llms.txt : résumé du site pour les moteurs IA, généré depuis le catalogue
// (jamais écrit à la main) pour ne pas diverger des prix du site.
//
// Lancer : npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";
import { llmsTxt } from "./llms";
import { services, packages } from "./services-data";
import { SALON } from "./salon-info";

const txt = llmsTxt();

test("format llms.txt : titre H1, résumé en citation, sections H2", () => {
  assert.ok(txt.startsWith("# Salon Mimi\n"));
  assert.match(txt, /\n> .{60,}/, "résumé en blockquote");
  assert.match(txt, /\n## Pages principales\n/);
  assert.match(txt, /\n## Tarifs indicatifs/);
  assert.match(txt, /\n## Coordonnées\n/);
});

test("chaque prestation et chaque forfait est listé avec son prix du catalogue", () => {
  for (const item of [...services, ...packages]) {
    const line = txt.split("\n").find((l) => l.includes(item.nameFr));
    assert.ok(line, `manquant : ${item.nameFr}`);
    assert.ok(
      line.includes(`${item.priceMad} MAD`),
      `${item.nameFr} : ${line}`,
    );
  }
  assert.doesNotMatch(txt, /\b550\b/);
});

test("liens vers les 6 pages principales en français, en anglais et en espagnol", () => {
  for (const p of [
    "",
    "/services",
    "/galerie",
    "/reservation",
    "/a-propos",
    "/contact",
  ]) {
    assert.ok(txt.includes(`${SALON.url}/fr${p})`), `fr${p}`);
  }
  assert.ok(txt.includes(`${SALON.url}/en)`));
  assert.ok(txt.includes(`${SALON.url}/es)`));
});

test("coordonnées et date de mise à jour = constantes du site", () => {
  assert.ok(txt.includes(SALON.telephone));
  assert.ok(txt.includes(SALON.address.streetAddress));
  assert.ok(txt.includes(SALON.lastReviewed));
});

test("uniquement des URLs https du domaine du salon, taille raisonnable", () => {
  const urls = txt.match(/https?:\/\/[^\s)]+/g) ?? [];
  assert.ok(urls.length >= 8);
  for (const u of urls) {
    assert.ok(u.startsWith("https://mimi-coiffure.com"), u);
  }
  assert.ok(txt.length < 6000, `${txt.length} caractères`);
});

test("le résumé annonce le minimum réel (65 MAD, cheveux attachés) et le maximum du catalogue", () => {
  assert.match(txt, /Tarifs de 65 à 950 MAD/);
});
