// scripts/gallery-contact-sheet.ts
//
// Génère une planche de contact HTML de la table `gallery_items` : chaque média
// en vignette avec son sort_order, son type et son id. Sert à repérer
// visuellement une photo/vidéo à supprimer ou réordonner, en attendant l'admin
// galerie (Spec 2).
//
// Lancer : npm run gallery:sheet
//   puis ouvrir le fichier affiché dans le navigateur.
//
// En lecture seule — ne modifie NI la table NI le Storage.

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Variables Supabase absentes. Abandon.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

type Row = {
  id: string;
  type: "photo" | "video";
  url: string;
  poster_url: string | null;
  alt: string;
  sort_order: number;
};

async function main() {
  const { data, error } = await supabase
    .from("gallery_items")
    .select("id, type, url, poster_url, alt, sort_order")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  const rows = (data ?? []) as Row[];

  const cards = rows
    .map((r) => {
      const thumb = r.type === "video" ? (r.poster_url ?? r.url) : r.url;
      const badge = r.type === "video" ? "▶ vidéo" : "photo";
      return `
      <figure>
        <div class="thumb">
          <img src="${thumb}" alt="" loading="lazy" />
          <span class="badge">${badge}</span>
        </div>
        <figcaption>
          <div class="order">#${r.sort_order}</div>
          <div class="alt">${escapeHtml(r.alt)}</div>
          <code class="id" onclick="navigator.clipboard.writeText('${r.id}')" title="Cliquer pour copier l'id">${r.id}</code>
        </figcaption>
      </figure>`;
    })
    .join("");

  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Planche galerie — Salon Mimi</title>
<style>
  body { font-family: -apple-system, sans-serif; margin: 0; padding: 24px; background: #f5f0e6; color: #2c1508; }
  h1 { font-size: 18px; margin: 0 0 6px; }
  p.hint { font-size: 13px; color: #7a6a52; margin: 0 0 20px; max-width: 60ch; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
  figure { margin: 0; background: #fff; border: 1px solid #e3d6c0; border-radius: 12px; overflow: hidden; }
  .thumb { position: relative; aspect-ratio: 1; background: #ddd; }
  .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .badge { position: absolute; left: 8px; top: 8px; background: rgba(0,0,0,.6); color: #fff; font-size: 11px; padding: 2px 7px; border-radius: 99px; }
  figcaption { padding: 10px; }
  .order { font-size: 20px; font-weight: 700; color: #c08a3e; }
  .alt { font-size: 12px; color: #5a4a36; margin: 4px 0 8px; min-height: 2.4em; line-height: 1.2; }
  code.id { display: block; font-size: 10.5px; background: #f0e9dc; padding: 4px 6px; border-radius: 6px; cursor: pointer; word-break: break-all; }
  code.id:hover { background: #e6dcc8; }
  .count { font-size: 13px; color: #7a6a52; margin-top: 20px; }
</style>
</head>
<body>
  <h1>Planche galerie — ${rows.length} médias</h1>
  <p class="hint">
    Repère le média à supprimer ou déplacer. Le grand numéro orange est son
    <strong>sort_order</strong> (position d'affichage). Clique sur l'identifiant
    en bas de la carte pour le copier. Ensuite, dans Supabase : Table Editor →
    gallery_items → filtre sur cet id → supprime la ligne. Puis Storage →
    bucket gallery → supprime le fichier correspondant.
  </p>
  <div class="grid">${cards}</div>
  <p class="count">Généré le ${new Date().toLocaleString("fr-FR")}.</p>
</body>
</html>`;

  const outPath = join(process.cwd(), "gallery-sheet.html");
  writeFileSync(outPath, html);
  console.log(`\nPlanche générée : ${outPath}`);
  console.log(`Ouvre-la : open "${outPath}"`);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

main().catch((e) => {
  console.error("Échec :", e);
  process.exit(1);
});
