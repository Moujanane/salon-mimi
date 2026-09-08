/** Formate un Date en 'YYYY-MM-DD' (UTC). */
function iso(d) {
  return d.toISOString().slice(0, 10);
}

/** Décale un Date de n jours (UTC), sans muter l'original. */
function addDays(d, n) {
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + n);
  return r;
}

/**
 * Deux fenêtres de 28 jours calées sur J-3 (latence GSC).
 * current  : [ref-30 .. ref-3]   (28 jours inclus)
 * previous : [ref-58 .. ref-31]  (28 jours inclus, contigus)
 */
export function computeDateWindows(ref = new Date()) {
  const base = new Date(
    Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate()),
  );
  const curEnd = addDays(base, -3);
  const curStart = addDays(curEnd, -27);
  const prevEnd = addDays(curStart, -1);
  const prevStart = addDays(prevEnd, -27);
  return {
    current: { start: iso(curStart), end: iso(curEnd) },
    previous: { start: iso(prevStart), end: iso(prevEnd) },
  };
}

/** Arrondit `n` à `digits` décimales. Helper partagé (non exporté). */
function round(n, digits) {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

/**
 * Variation d'une métrique. `lowerIsBetter` inverse le sens de `dir`
 * (utilisé pour la position moyenne : 3 vaut mieux que 10).
 */
function metricDelta(value, prev, { lowerIsBetter = false } = {}) {
  const abs = round(value - prev, 2);
  let pct = null;
  if (prev !== 0) pct = round(((value - prev) / prev) * 100, 1);
  let dir = "flat";
  if (abs !== 0) {
    const better = lowerIsBetter ? abs < 0 : abs > 0;
    dir = better ? "up" : "down";
  }
  return { value: round(value, 2), abs, pct, dir };
}

export function computeTotalsDelta(current, previous) {
  return {
    clicks: metricDelta(current.clicks, previous.clicks),
    impressions: metricDelta(current.impressions, previous.impressions),
    ctr: metricDelta(current.ctr, previous.ctr),
    position: metricDelta(current.position, previous.position, {
      lowerIsBetter: true,
    }),
  };
}

/** Normalise une ligne GSC { keys:[query], ... } en objet plat. */
function flatQueryRow(row) {
  return {
    query: row.keys[0],
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
  };
}

/** Requêtes en position 8 à 20 incluse, triées par impressions décroissantes. */
export function page2Opportunities(queryRows) {
  return queryRows
    .map(flatQueryRow)
    .filter((r) => r.position >= 8 && r.position <= 20)
    .sort((a, b) => b.impressions - a.impressions);
}

/** Requêtes contenant 'marrakech' ou 'marrakesh' (casse ignorée). */
export function marrakechQueries(queryRows) {
  return queryRows
    .map(flatQueryRow)
    .filter((r) => /marrake[cs]h/i.test(r.query));
}

/** Requêtes présentes aux 2 périodes ayant reculé de >= 3 places. */
export function positionLosses(currentRows, previousRows) {
  const prev = new Map(previousRows.map((r) => [r.keys[0], r.position]));
  const out = [];
  for (const row of currentRows) {
    const q = row.keys[0];
    if (!prev.has(q)) continue;
    const from = prev.get(q);
    const to = row.position;
    const drop = round(to - from, 1);
    if (drop >= 3)
      out.push({ query: q, from: round(from, 1), to: round(to, 1), drop });
  }
  return out.sort((a, b) => b.drop - a.drop);
}

// Code pays ISO-3166 alpha-3 (format GSC) -> libellé FR. Ordre = ordre d'affichage.
const COUNTRY_LABELS = [
  ["mar", "Maroc"],
  ["fra", "France"],
  ["esp", "Espagne"],
  ["gbr", "Royaume-Uni"],
  ["deu", "Allemagne"],
  ["usa", "États-Unis"],
];

/** 6 pays nommés (ordre fixe) + 'Autres' = somme du reste. */
export function groupByCountry(countryRows) {
  const byCode = new Map(countryRows.map((r) => [r.keys[0].toLowerCase(), r]));
  const out = [];
  let othersClicks = 0,
    othersImpr = 0;
  const named = new Set(COUNTRY_LABELS.map(([code]) => code));

  for (const [code, label] of COUNTRY_LABELS) {
    const r = byCode.get(code);
    out.push({
      country: label,
      clicks: r ? r.clicks : 0,
      impressions: r ? r.impressions : 0,
      position: r ? round(r.position, 1) : null,
    });
  }
  for (const r of countryRows) {
    if (named.has(r.keys[0].toLowerCase())) continue;
    othersClicks += r.clicks;
    othersImpr += r.impressions;
  }
  out.push({
    country: "Autres",
    clicks: othersClicks,
    impressions: othersImpr,
    position: null,
  });
  return out;
}

/** Flèche de tendance : ▲ amélioration, ▼ dégradation, ▬ stable. */
function arrow(dir) {
  return dir === "up" ? "▲" : dir === "down" ? "▼" : "▬";
}

/** Variation relative formatée, ou 'n/a' si non calculable. */
function pctStr(pct) {
  return pct === null ? "n/a" : `${pct > 0 ? "+" : ""}${pct} %`;
}

/** Position formatée, ou '—' si absente. */
function pos(p) {
  return p === null || p === undefined ? "—" : String(p);
}

/** CTR (ratio 0..1) formaté en pourcentage à 2 décimales. */
function pctCtr(ctr) {
  return `${round(ctr * 100, 2)} %`;
}

/** Tableau Markdown, ou '_Aucune._' si aucune ligne. */
function table(headers, rows) {
  if (rows.length === 0) return "_Aucune._\n";
  const head = `| ${headers.join(" | ")} |`;
  const sep = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((r) => `| ${r.join(" | ")} |`).join("\n");
  return `${head}\n${sep}\n${body}\n`;
}

/**
 * Rendu Markdown complet du rapport (8 sections). Pure : aucun I/O.
 * `data` a la forme produite par l'orchestration (Task 8).
 */
export function renderReport(dateStr, data) {
  const { site, windows: w, totals: t } = data;
  const L = [];

  L.push(`# Rapport SEO — ${site} — ${dateStr}`);
  L.push("");
  L.push(`Période courante : ${w.current.start} → ${w.current.end} (28 j)  `);
  L.push(`Période précédente : ${w.previous.start} → ${w.previous.end} (28 j)`);
  L.push("");

  L.push("## 1. Résumé");
  L.push("");
  L.push(
    table(
      ["Métrique", "Valeur", "Δ abs.", "Δ %", ""],
      [
        [
          "Clics",
          t.clicks.value,
          t.clicks.abs,
          pctStr(t.clicks.pct),
          arrow(t.clicks.dir),
        ],
        [
          "Impressions",
          t.impressions.value,
          t.impressions.abs,
          pctStr(t.impressions.pct),
          arrow(t.impressions.dir),
        ],
        [
          "CTR",
          pctCtr(t.ctr.value),
          `${t.ctr.abs > 0 ? "+" : ""}${round(t.ctr.abs * 100, 2)} pt`,
          pctStr(t.ctr.pct),
          arrow(t.ctr.dir),
        ],
        [
          "Position moy.",
          t.position.value,
          t.position.abs,
          pctStr(t.position.pct),
          arrow(t.position.dir),
        ],
      ],
    ),
  );
  L.push("_Position : ▲ = amélioration (chiffre plus bas)._");
  L.push("");

  L.push("## 2. Top 15 requêtes");
  L.push("");
  L.push(
    table(
      ["Requête", "Pos.", "Clics", "Impr.", "CTR"],
      data.topQueries
        .slice(0, 15)
        .map((q) => [
          q.query,
          round(q.position, 1),
          q.clicks,
          q.impressions,
          pctCtr(q.ctr),
        ]),
    ),
  );
  L.push("");

  L.push("## 3. Opportunités page 2");
  L.push("");
  if (data.opportunities.length > 0) {
    L.push(
      "_Requêtes en position 8 à 20 : un petit gain de position = beaucoup de clics._",
    );
    L.push("");
  }
  L.push(
    table(
      ["Requête", "Pos.", "Impr.", "Clics", "CTR"],
      data.opportunities.map((q) => [
        q.query,
        round(q.position, 1),
        q.impressions,
        q.clicks,
        pctCtr(q.ctr),
      ]),
    ),
  );
  L.push("");

  L.push("## 4. Requêtes « marrakech »");
  L.push("");
  L.push(
    table(
      ["Requête", "Pos.", "Clics", "Impr."],
      data.marrakech.map((q) => [
        q.query,
        round(q.position, 1),
        q.clicks,
        q.impressions,
      ]),
    ),
  );
  L.push("");

  L.push("## 5. Alertes — pertes de position");
  L.push("");
  if (data.losses.length > 0) {
    L.push(
      "_Requêtes ayant reculé de 3 places ou plus depuis la période précédente._",
    );
    L.push("");
  }
  L.push(
    table(
      ["Requête", "Avant", "Après", "Recul"],
      data.losses.map((x) => [x.query, x.from, x.to, `-${x.drop}`]),
    ),
  );
  L.push("");

  L.push("## 6. Pays");
  L.push("");
  L.push(
    table(
      ["Pays", "Clics", "Impr.", "Pos."],
      data.countries.map((c) => [
        c.country,
        c.clicks,
        c.impressions,
        pos(c.position),
      ]),
    ),
  );
  L.push("");

  L.push("## 7. Top 10 pages");
  L.push("");
  L.push(
    table(
      ["Page", "Clics", "Impr.", "CTR", "Pos."],
      data.topPages
        .slice(0, 10)
        .map((p) => [
          p.page,
          p.clicks,
          p.impressions,
          pctCtr(p.ctr),
          round(p.position, 1),
        ]),
    ),
  );
  L.push("");

  L.push("## 8. Recommandations");
  L.push("");
  L.push("<!-- AGENT: remplir 3 à 5 recommandations ci-dessous -->");
  L.push("");

  return L.join("\n");
}
