// lib/page-meta.test.ts
//
// Garde-fou SEO : longueur des titres et meta descriptions des pages
// principales, dans les 3 langues. Au-delà de ~60 caractères (title) et ~160
// (description), Google tronque l'affichage.
//
// Lancer : npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PAGE_META,
  pageMetadata,
  type PageKey,
  type MetaLocale,
} from "./page-meta";

const LOCALES: MetaLocale[] = ["fr", "en", "es"];
const PAGES = Object.keys(PAGE_META) as PageKey[];

test("les 6 pages principales sont définies dans les 3 langues", () => {
  assert.deepEqual([...PAGES].sort(), [
    "aPropos",
    "contact",
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

const PATHS: Record<PageKey, string> = {
  home: "",
  services: "/services",
  reservation: "/reservation",
  aPropos: "/a-propos",
  galerie: "/galerie",
  contact: "/contact",
};

test("pageMetadata : titre/description de partage propres à chaque page", () => {
  for (const page of PAGES) {
    for (const l of LOCALES) {
      const m = pageMetadata(page, l, PATHS[page]);
      const url = `https://mimi-coiffure.com/${l}${PATHS[page]}`;
      assert.equal(m.title, PAGE_META[page].titles[l], `${page}/${l} title`);
      assert.equal(m.description, PAGE_META[page].descriptions[l]);
      assert.equal(m.alternates?.canonical, url, `${page}/${l} canonical`);
      assert.equal(m.openGraph?.title, m.title, `${page}/${l} og:title`);
      assert.equal(m.openGraph?.description, m.description);
      assert.equal(m.openGraph?.url, url, `${page}/${l} og:url`);
      assert.equal(m.twitter?.title, m.title, `${page}/${l} twitter:title`);
      const langs = m.alternates?.languages as Record<string, string>;
      assert.equal(langs["x-default"], `https://mimi-coiffure.com/fr${PATHS[page]}`);
      assert.equal(Object.keys(langs).length, 4);
    }
  }
});

test("pageMetadata : image de partage présente, langue inconnue -> français", () => {
  const m = pageMetadata("services", "de", "/services");
  assert.equal(m.title, PAGE_META.services.titles.fr);
  const images = m.openGraph?.images as { url: string }[];
  assert.ok(images[0].url.endsWith("/fr/opengraph-image"));
});
