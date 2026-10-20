#!/usr/bin/env node
// scripts/security-check.mjs
//
// Vérification de sécurité EN LECTURE SEULE d'un site déployé, du point de vue
// d'un visiteur anonyme. Refait les sondes de l'audit du 19/10/2026.
//
//   npm run audit:security                     (site de production)
//   npm run audit:security -- --base=https://exemple.com
//
// Ce que fait le script (aucune donnée lue, aucune ligne créée) :
//   1. cherche des secrets dans le JavaScript servi au navigateur ;
//   2. récupère la clé publique Supabase (publique par conception) ;
//   3. vérifie que les inscriptions Supabase sont fermées ;
//   4. vérifie qu'un anonyme ne lit ni les réservations, ni les abonnements
//      push, ni les réglages ;
//   5. vérifie qu'un anonyme ne peut pas insérer de réservation (insertion
//      VIDE : elle échoue toujours, mais le code d'erreur dit si la règle de
//      sécurité l'aurait autorisée) ;
//   6. vérifie que les routes d'administration refusent une requête sans session.
//
// Code de sortie : 0 si tout est conforme, 1 sinon.

const base =
  (process.argv.find((a) => a.startsWith("--base=")) ?? "").slice(7) ||
  "https://mimi-coiffure.com";

const results = [];
const record = (ok, titre, detail = "") => {
  results.push(ok);
  console.log(
    `${ok ? "OK    " : "ÉCHEC "} ${titre}${detail ? ` — ${detail}` : ""}`,
  );
};

async function text(url, init) {
  const res = await fetch(url, { redirect: "follow", ...init });
  return { status: res.status, body: await res.text(), headers: res.headers };
}

// ---------- 1. Secrets dans le JavaScript client ----------
console.log(`Site audité : ${base}\n`);
const pages = [
  "/fr",
  "/fr/reservation",
  "/admin/login",
  "/fr/contact",
  "/fr/services",
  "/fr/galerie",
];
const chunks = new Set();
for (const p of pages) {
  const { body } = await text(base + p);
  for (const m of body.matchAll(/\/_next\/static\/[^"']+?\.js/g))
    chunks.add(m[0]);
}
let js = "";
for (const c of chunks) js += (await text(base + c)).body + "\n";

const secretPatterns = {
  "clé Stripe": /sk_(live|test)_[A-Za-z0-9]{10,}/,
  "clé Resend": /\bre_[A-Za-z0-9]{20,}/,
  "clé Google": /AIza[0-9A-Za-z_-]{30,}/,
  "clé privée": /-----BEGIN [A-Z ]*PRIVATE KEY/,
  "clé secrète Supabase": /sb_secret_[A-Za-z0-9_-]{10,}/,
  "nom de variable secrète":
    /SUPABASE_SERVICE_ROLE_KEY|VAPID_PRIVATE_KEY|MIMI_PIN|UPSTASH_REDIS_REST_TOKEN/,
};
const trouves = Object.entries(secretPatterns)
  .filter(([, re]) => re.test(js))
  .map(([nom]) => nom);

const jwtRole = (payloadB64) => {
  try {
    return JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"))
      .role;
  } catch {
    return undefined;
  }
};
const jwts = [
  ...js.matchAll(
    /eyJ[A-Za-z0-9_-]{15,}\.([A-Za-z0-9_-]{15,})\.[A-Za-z0-9_-]{10,}/g,
  ),
];
// Un JWT « service_role » dans le client serait critique ; « anon » est normal.
const serviceRoleJwt = jwts.some((m) => jwtRole(m[1]) === "service_role");
record(
  trouves.length === 0 && !serviceRoleJwt,
  `Aucun secret dans le JavaScript client (${chunks.size} fichiers)`,
  [...trouves, serviceRoleJwt ? "JWT service_role" : null]
    .filter(Boolean)
    .join(", "),
);

// ---------- 2. Clé publique et URL Supabase ----------
const supabaseUrl = js.match(/https:\/\/[a-z0-9]+\.supabase\.co/)?.[0];
const publicKey =
  js.match(/sb_publishable_[A-Za-z0-9_-]{10,}/)?.[0] ??
  jwts.find((m) => jwtRole(m[1]) === "anon")?.[0];

if (!supabaseUrl || !publicKey) {
  console.log(
    "\nClé publique Supabase introuvable dans le JavaScript : sondes de base de données ignorées.",
  );
} else {
  const h = { apikey: publicKey, Authorization: `Bearer ${publicKey}` };
  const rest = (path, init = {}) =>
    text(`${supabaseUrl}/rest/v1/${path}`, {
      ...init,
      headers: { ...h, ...(init.headers ?? {}) },
    });

  // ---------- 3. Inscriptions ----------
  const auth = await text(`${supabaseUrl}/auth/v1/settings`, { headers: h });
  let signupsClosed = false;
  try {
    signupsClosed = JSON.parse(auth.body).disable_signup === true;
  } catch {
    /* réponse illisible : considéré comme ouvert */
  }
  record(signupsClosed, "Inscriptions Supabase fermées (disable_signup)");

  // ---------- 4. Lectures anonymes ----------
  const lignesVisibles = async (table, col) => {
    const r = await rest(`${table}?select=${col}&limit=1`);
    if (r.status === 401 || r.status === 403) return 0; // accès refusé = conforme
    try {
      const j = JSON.parse(r.body);
      return Array.isArray(j) ? j.length : 0;
    } catch {
      return 0;
    }
  };
  for (const [table, col] of [
    ["reservations", "id"],
    ["push_subscriptions", "id"],
    ["settings", "key"],
  ]) {
    const n = await lignesVisibles(table, col);
    record(
      n === 0,
      `Lecture anonyme de « ${table} » impossible`,
      n ? `${n} ligne(s) visible(s)` : "",
    );
  }

  // ---------- 5. Insertion anonyme (corps vide : ne crée jamais de ligne) ----------
  const ins = await rest("reservations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
    body: "{}",
  });
  let code = "";
  try {
    code = JSON.parse(ins.body).code ?? "";
  } catch {
    /* corps vide */
  }
  // 23502 = champ obligatoire manquant : la règle de sécurité a laissé passer (anormal).
  // 42501 ou 401/403 = refusé par la règle ou par les droits de table (conforme).
  record(
    code !== "23502",
    "Insertion anonyme dans « reservations » refusée",
    code === "23502" ? "règle d'insertion encore ouverte" : "",
  );
}

// ---------- 6. Routes d'administration sans session ----------
const faux = "00000000-0000-4000-8000-000000000000";
for (const [methode, chemin, corps] of [
  ["PATCH", "/api/settings", '{"__audit__":"x"}'],
  ["PATCH", `/api/reservations/${faux}`, '{"statut":"confirmee"}'],
  ["PATCH", `/api/gallery/${faux}`, "{}"],
  ["POST", "/api/gallery", "{}"],
]) {
  const r = await text(base + chemin, {
    method: methode,
    headers: { "Content-Type": "application/json" },
    body: corps,
  });
  record(
    r.status === 401,
    `${methode} ${chemin.replace(faux, "<id>")} sans session refusé`,
    `HTTP ${r.status}`,
  );
}

const echecs = results.filter((r) => !r).length;
console.log(
  `\n${results.length - echecs}/${results.length} contrôles conformes.`,
);
process.exit(echecs === 0 ? 0 : 1);
