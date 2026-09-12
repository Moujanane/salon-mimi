import { test } from "node:test";
import assert from "node:assert/strict";
import {
  computeDateWindows,
  computeTotalsDelta,
  page2Opportunities,
  marrakechQueries,
  positionLosses,
  groupByCountry,
  renderReport,
} from "./report.mjs";

const QUERY_ROWS = [
  {
    keys: ["balade swincar marrakech"],
    clicks: 5,
    impressions: 400,
    ctr: 0.0125,
    position: 12.3,
  },
  {
    keys: ["swincar ourika"],
    clicks: 30,
    impressions: 800,
    ctr: 0.0375,
    position: 4.1,
  },
  {
    keys: ["quad marrakech"],
    clicks: 2,
    impressions: 1200,
    ctr: 0.0017,
    position: 9.8,
  },
  {
    keys: ["location buggy agafay"],
    clicks: 1,
    impressions: 150,
    ctr: 0.0067,
    position: 15.0,
  },
  {
    keys: ["marrakesh electric car tour"],
    clicks: 8,
    impressions: 600,
    ctr: 0.0133,
    position: 7.2,
  },
];

const FIXTURE = {
  site: "atlas-swincar.com",
  windows: {
    current: { start: "2026-08-09", end: "2026-09-05" },
    previous: { start: "2026-07-12", end: "2026-08-08" },
  },
  totals: {
    clicks: { value: 120, abs: 20, pct: 20, dir: "up" },
    impressions: { value: 3000, abs: 500, pct: 20, dir: "up" },
    ctr: { value: 0.04, abs: 0, pct: 0, dir: "flat" },
    position: { value: 8.5, abs: -1, pct: -10.5, dir: "up" },
  },
  topQueries: [
    {
      query: "swincar ourika",
      clicks: 30,
      impressions: 800,
      ctr: 0.0375,
      position: 4.1,
    },
  ],
  opportunities: [
    {
      query: "quad marrakech",
      clicks: 2,
      impressions: 1200,
      ctr: 0.0017,
      position: 9.8,
    },
  ],
  marrakech: [
    {
      query: "quad marrakech",
      clicks: 2,
      impressions: 1200,
      ctr: 0.0017,
      position: 9.8,
    },
  ],
  losses: [{ query: "balade ourika", from: 5, to: 11, drop: 6 }],
  countries: [
    { country: "Maroc", clicks: 50, impressions: 1000, position: 7 },
    { country: "France", clicks: 20, impressions: 500, position: 9 },
    { country: "Espagne", clicks: 0, impressions: 0, position: null },
    { country: "Royaume-Uni", clicks: 0, impressions: 0, position: null },
    { country: "Allemagne", clicks: 0, impressions: 0, position: null },
    { country: "États-Unis", clicks: 0, impressions: 0, position: null },
    { country: "Autres", clicks: 3, impressions: 120, position: null },
  ],
  topPages: [
    {
      page: "https://atlas-swincar.com/",
      clicks: 60,
      impressions: 1500,
      ctr: 0.04,
      position: 6.2,
    },
  ],
};

test("computeDateWindows: 2 fenêtres de 28 jours calées sur J-3", () => {
  // Réf : mardi 2026-09-08
  const ref = new Date("2026-09-08T12:00:00Z");
  const w = computeDateWindows(ref);

  // Fin période courante = J-3 = 2026-09-05
  assert.equal(w.current.end, "2026-09-05");
  // Début période courante = fin - 27 jours = 2026-08-09 (28 jours inclus)
  assert.equal(w.current.start, "2026-08-09");
  // Période précédente : les 28 jours juste avant
  assert.equal(w.previous.end, "2026-08-08");
  assert.equal(w.previous.start, "2026-07-12");
});

test("computeDateWindows: fenêtres contiguës et sans chevauchement", () => {
  const w = computeDateWindows(new Date("2026-01-15T00:00:00Z"));
  const prevEnd = new Date(w.previous.end);
  const curStart = new Date(w.current.start);
  const diffDays = (curStart - prevEnd) / 86_400_000;
  assert.equal(diffDays, 1); // previous.end + 1 jour === current.start
});

test("computeTotalsDelta: calcule les variations absolues et relatives", () => {
  const current = { clicks: 120, impressions: 3000, ctr: 0.04, position: 8.5 };
  const previous = { clicks: 100, impressions: 2500, ctr: 0.04, position: 9.5 };
  const d = computeTotalsDelta(current, previous);

  assert.equal(d.clicks.value, 120);
  assert.equal(d.clicks.abs, 20);
  assert.equal(d.clicks.pct, 20); // +20 %
  assert.equal(d.clicks.dir, "up");

  // Position : plus BAS = meilleur. 8.5 vs 9.5 => amélioration.
  assert.equal(d.position.abs, -1);
  assert.equal(d.position.dir, "up"); // "up" = amélioration, pas "chiffre plus grand"
});

test("computeTotalsDelta: previous à zéro => pct null, dir 'up' si current > 0", () => {
  const d = computeTotalsDelta(
    { clicks: 10, impressions: 0, ctr: 0, position: 0 },
    { clicks: 0, impressions: 0, ctr: 0, position: 0 },
  );
  assert.equal(d.clicks.pct, null);
  assert.equal(d.clicks.dir, "up");
  assert.equal(d.impressions.dir, "flat");
});

test("page2Opportunities: position 8..20, triées par impressions desc", () => {
  const r = page2Opportunities(QUERY_ROWS);
  assert.deepEqual(
    r.map((x) => x.query),
    [
      "quad marrakech", // pos 9.8, 1200 imp
      "balade swincar marrakech", // pos 12.3, 400 imp
      "location buggy agafay", // pos 15.0, 150 imp
    ],
  );
  // "swincar ourika" (pos 4.1) et "marrakesh electric car tour" (pos 7.2) exclus : < 8
});

test("marrakechQueries: match 'marrakech' et 'marrakesh', insensible à la casse", () => {
  const r = marrakechQueries(QUERY_ROWS);
  assert.deepEqual(r.map((x) => x.query).sort(), [
    "balade swincar marrakech",
    "marrakesh electric car tour",
    "quad marrakech",
  ]);
});

test("positionLosses: recul >= 3 places, trié par recul décroissant", () => {
  const current = [
    { keys: ["a"], clicks: 1, impressions: 10, ctr: 0.1, position: 14 },
    { keys: ["b"], clicks: 1, impressions: 10, ctr: 0.1, position: 6 },
    { keys: ["c"], clicks: 1, impressions: 10, ctr: 0.1, position: 9 },
  ];
  const previous = [
    { keys: ["a"], clicks: 1, impressions: 10, ctr: 0.1, position: 8 }, // 8 -> 14 : -6
    { keys: ["b"], clicks: 1, impressions: 10, ctr: 0.1, position: 5 }, // 5 -> 6  : -1 (ignoré)
    { keys: ["c"], clicks: 1, impressions: 10, ctr: 0.1, position: 3 }, // 3 -> 9  : -6
  ];
  const r = positionLosses(current, previous);
  assert.deepEqual(
    r.map((x) => x.query),
    ["a", "c"],
  ); // les deux à -6, ordre stable d'entrée
  assert.equal(r[0].drop, 6);
  assert.equal(r[0].from, 8);
  assert.equal(r[0].to, 14);
});

test("positionLosses: requête absente de previous => ignorée", () => {
  const r = positionLosses(
    [{ keys: ["new"], clicks: 0, impressions: 5, ctr: 0, position: 20 }],
    [],
  );
  assert.deepEqual(r, []);
});

test("groupByCountry: 6 pays nommés + 'Autres' agrégé", () => {
  const rows = [
    { keys: ["mar"], clicks: 50, impressions: 1000, ctr: 0.05, position: 7 },
    { keys: ["fra"], clicks: 20, impressions: 500, ctr: 0.04, position: 9 },
    { keys: ["esp"], clicks: 5, impressions: 100, ctr: 0.05, position: 10 },
    { keys: ["gbr"], clicks: 3, impressions: 80, ctr: 0.0375, position: 11 },
    { keys: ["deu"], clicks: 2, impressions: 60, ctr: 0.033, position: 12 },
    { keys: ["usa"], clicks: 4, impressions: 90, ctr: 0.044, position: 8 },
    { keys: ["ita"], clicks: 1, impressions: 30, ctr: 0.033, position: 15 },
    { keys: ["nld"], clicks: 1, impressions: 20, ctr: 0.05, position: 14 },
  ];
  const r = groupByCountry(rows);
  assert.deepEqual(
    r.map((x) => x.country),
    [
      "Maroc",
      "France",
      "Espagne",
      "Royaume-Uni",
      "Allemagne",
      "États-Unis",
      "Autres",
    ],
  );
  const autres = r.find((x) => x.country === "Autres");
  assert.equal(autres.clicks, 2); // ita + nld
  assert.equal(autres.impressions, 50); // 30 + 20
});

test("renderReport: contient les 8 sections et le placeholder recommandations", () => {
  const md = renderReport("2026-09-08", FIXTURE);
  assert.match(md, /^# Rapport SEO — atlas-swincar\.com — 2026-09-08/m);
  assert.match(md, /## 1\. Résumé/);
  assert.match(md, /## 2\. Top 15 requêtes/);
  assert.match(md, /## 3\. Opportunités page 2/);
  assert.match(md, /## 4\. Requêtes « marrakech »/);
  assert.match(md, /## 5\. Alertes — pertes de position/);
  assert.match(md, /## 6\. Pays/);
  assert.match(md, /## 7\. Top 10 pages/);
  assert.match(md, /## 8\. Recommandations/);
  assert.match(md, /<!-- AGENT: remplir 3 à 5 recommandations ci-dessous -->/);
  // Flèche up sur les clics
  assert.match(md, /120 .*▲/);
  // Une ligne de tableau pays
  assert.match(md, /\| Maroc \| 50 \| 1000 \| 7 \|/);
});

test("renderReport: sections vides affichent un tiret, pas un tableau vide", () => {
  const empty = { ...FIXTURE, opportunities: [], marrakech: [], losses: [] };
  const md = renderReport("2026-09-08", empty);
  assert.match(md, /## 3\. Opportunités page 2\s+_Aucune._/);
  assert.match(md, /## 5\. Alertes — pertes de position\s+_Aucune._/);
});
