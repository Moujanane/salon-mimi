#!/usr/bin/env node
import { writeFile, mkdir } from "node:fs/promises";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createGscClient } from "./lib/gsc.mjs";
import {
  computeDateWindows,
  computeTotalsDelta,
  page2Opportunities,
  marrakechQueries,
  positionLosses,
  groupByCountry,
  renderReport,
} from "./lib/report.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DRY_RUN = process.argv.includes("--dry-run");

/**
 * Charge un fichier .env.seo dédié (Node --env-file échoue sur .env.local ici).
 * Parser tolérant : lignes invalides ignorées. L'env réel prime sur le fichier.
 */
function loadEnvSeo(path) {
  if (!existsSync(path)) return;
  for (const rawLine of readFileSync(path, "utf8").split("\n")) {
    const line = rawLine.replace(/\r$/, "").trim();
    if (!line || line.startsWith("#")) continue;
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let value = m[2].trimEnd();
    if (value.length >= 2 && /^"[\s\S]*"$|^'[\s\S]*'$/.test(value)) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvSeo(join(ROOT, ".env.seo"));

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Variable d'environnement manquante : ${name}`);
  return v;
}

/** Un seul objet de totaux depuis une réponse GSC sans dimension. */
function totalsFromRows(rows) {
  const r = rows[0] ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  return {
    clicks: r.clicks,
    impressions: r.impressions,
    ctr: r.ctr,
    position: r.position,
  };
}

async function main() {
  const siteUrl = requireEnv("GSC_SITE_URL");
  const client = createGscClient(
    {
      clientId: requireEnv("GSC_OAUTH_CLIENT_ID"),
      clientSecret: requireEnv("GSC_OAUTH_CLIENT_SECRET"),
      refreshToken: requireEnv("GSC_OAUTH_REFRESH_TOKEN"),
    },
    siteUrl,
  );

  const today = new Date().toISOString().slice(0, 10);
  const w = computeDateWindows(new Date());
  const cur = { startDate: w.current.start, endDate: w.current.end };
  const prev = { startDate: w.previous.start, endDate: w.previous.end };

  // 6 requêtes (voir spec §4)
  const [
    totalsCurRows,
    totalsPrevRows,
    queryCurRows,
    queryPrevRows,
    pageRows,
    countryRows,
  ] = await Promise.all([
    client.query({ ...cur }),
    client.query({ ...prev }),
    client.query({ ...cur, dimensions: ["query"], rowLimit: 100 }),
    client.query({ ...prev, dimensions: ["query"], rowLimit: 100 }),
    client.query({ ...cur, dimensions: ["page"], rowLimit: 20 }),
    client.query({ ...cur, dimensions: ["country"], rowLimit: 250 }),
  ]);

  const flat = (rows) =>
    rows.map((r) => ({
      query: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: r.ctr,
      position: r.position,
    }));

  const data = {
    site: siteUrl
      .replace(/^sc-domain:/, "")
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, ""),
    windows: w,
    totals: computeTotalsDelta(
      totalsFromRows(totalsCurRows),
      totalsFromRows(totalsPrevRows),
    ),
    topQueries: flat(queryCurRows).sort((a, b) => b.clicks - a.clicks),
    opportunities: page2Opportunities(queryCurRows),
    marrakech: marrakechQueries(queryCurRows),
    losses: positionLosses(queryCurRows, queryPrevRows),
    countries: groupByCountry(countryRows),
    topPages: pageRows
      .map((r) => ({
        page: r.keys[0],
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: r.ctr,
        position: r.position,
      }))
      .sort((a, b) => b.clicks - a.clicks),
  };

  const md = renderReport(today, data);

  if (DRY_RUN) {
    process.stdout.write(md + "\n");
    return;
  }
  const outDir = join(ROOT, "docs", "seo");
  await mkdir(outDir, { recursive: true });
  const outPath = join(outDir, `${today}.md`);
  await writeFile(outPath, md, "utf8");
  process.stdout.write(`Écrit : ${outPath}\n`);
}

main().catch(async (err) => {
  const today = new Date().toISOString().slice(0, 10);
  const raw = err?.stack ?? String(err);
  const safe = raw
    .replace(/GOCSPX-[\w-]+/g, "GOCSPX-***")
    .replace(/1\/\/[\w-]+/g, "1//***")
    .replace(/ya29\.[\w.-]+/g, "ya29.***");
  const msg = `# Rapport SEO — ÉCHEC — ${today}\n\n\`\`\`\n${safe}\n\`\`\`\n`;
  if (DRY_RUN) {
    process.stderr.write(msg);
    process.exit(1);
  }
  const outDir = join(ROOT, "docs", "seo");
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, `${today}-ERREUR.md`), msg, "utf8");
  process.stderr.write(msg);
  process.exit(1);
});
