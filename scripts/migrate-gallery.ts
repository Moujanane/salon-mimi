// scripts/migrate-gallery.ts
//
// Migration UNIQUE des médias existants (photos public/images/ + vidéos jsDelivr
// référencées dans components/sections/GalerieClient.tsx) vers :
//   - le bucket Supabase Storage "gallery"
//   - la table "gallery_items"
//
// Idempotent : ne réinsère pas une ligne si son `url` finale existe déjà.
// N'écrit rien si NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY absents.
//
// Lancer : npm run migrate:gallery
// Prérequis : ffprobe sur le PATH (dimensions vidéo), variables Supabase dans
// l'environnement (charger .env.local au besoin : `set -a; source .env.local; set +a`).

// Prérequis DB supplémentaire : contrainte UNIQUE sur gallery_items.url
//   alter table gallery_items add constraint gallery_items_url_key unique (url);
// (permet l'upsert onConflict:"url" ci-dessous et empêche les doublons)

import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Variables Supabase absentes. Abandon (aucune écriture).");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const PUBLIC_URL_BASE = `${SUPABASE_URL}/storage/v1/object/public/gallery`;
const REPO_ROOT = process.cwd();

type PhotoSrc = { file: string; alt: string };
const PHOTOS: PhotoSrc[] = [
  { file: "salon-mimi-1.jpeg", alt: "Salon Mimi Marrakech — intérieur salon coiffure africaine" },
  { file: "salon-mimi-2.jpeg", alt: "Salon Mimi Marrakech — ambiance salon tresses africaines" },
  { file: "salon-mimi-3.jpeg", alt: "Salon Mimi Marrakech — coiffeuse au travail Place Jamaa El Fna" },
  { file: "hero-salon.jpg", alt: "Salon Mimi Marrakech — coiffeuse africaine Médina" },
  { file: "s-box-braids-longues.jpg", alt: "Box braids longues Salon Mimi Marrakech" },
  { file: "s-box-braids-profil.jpg", alt: "Box braids profil Salon Mimi Marrakech" },
  { file: "s-box-braids-xl.jpg", alt: "Box braids XL Salon Mimi Marrakech" },
  { file: "s-tresses-3.jpg", alt: "Tresses africaines Salon Mimi Marrakech — box braids" },
  { file: "coiffure-1.jpg", alt: "Box braids knotless Salon Mimi Marrakech — Place Jamaa El Fna" },
  { file: "s-knotless.jpg", alt: "Knotless braids Salon Mimi Marrakech" },
  { file: "s-tresses-4.jpg", alt: "Tresses africaines Salon Mimi Marrakech — knotless" },
  { file: "tresses-mimi-1.jpeg", alt: "Tresses africaines Salon Mimi Marrakech — réalisation knotless" },
  { file: "s-cornrows.jpg", alt: "Cornrows Salon Mimi Marrakech — tresses collées africaines" },
  { file: "s-fulani.jpg", alt: "Tresses Fulani Salon Mimi Marrakech" },
  { file: "cornrows-mimi-2509-1.jpeg", alt: "Cornrows dessin spirale Salon Mimi Marrakech — tresses collées géométriques" },
  { file: "s-boho.jpg", alt: "Tresses Boho Salon Mimi Marrakech" },
  { file: "s-tressage-mains.jpg", alt: "Mains tresseuse Salon Mimi Marrakech — savoir-faire africain" },
  { file: "boho-mimi-2509-1.jpeg", alt: "Tresses boho cornrows et boucles Salon Mimi Marrakech — effet naturel" },
  { file: "s-depart-locks.jpg", alt: "Départ locks Salon Mimi Marrakech — pose de locks" },
  { file: "s-retouche-locks.jpg", alt: "Retouche locks Salon Mimi Marrakech — entretien locks" },
  { file: "s-tresses-5.jpg", alt: "Tresses africaines Salon Mimi Marrakech — locks" },
  { file: "s-tresse-fille1.png", alt: "Tresses fille Salon Mimi Marrakech" },
  { file: "s-tresse-fille2.png", alt: "Tresses petite fille Salon Mimi Marrakech" },
  { file: "s-tresse-garcon.png", alt: "Tresses garçon Salon Mimi Marrakech" },
  { file: "tresses-mimi-2.jpeg", alt: "Box braids Salon Mimi Marrakech — tresses africaines Médina" },
  { file: "tresses-mimi-3.jpeg", alt: "Tresses rasta Salon Mimi Marrakech — coiffure afro Marrakech" },
  { file: "tresses-mimi-4.jpeg", alt: "Tresses africaines Salon Mimi — Place Jamaa El Fna Marrakech" },
  { file: "tresses-mimi-5.jpeg", alt: "Tresses africaines Salon Mimi Marrakech — juin 2026" },
  { file: "tresses-mimi-6.jpeg", alt: "Tresses africaines Salon Mimi — réalisation récente" },
  { file: "tresses-mimi-7.jpeg", alt: "Coiffure afro Salon Mimi Marrakech — tresses récentes" },
  { file: "s-tresses-2.jpg", alt: "Tresses africaines Salon Mimi Marrakech" },
  { file: "s-tressage-action.jpg", alt: "Tressage en cours Salon Mimi Marrakech" },
];

type VideoSrc = { file: string; alt: string; poster: string };
const VIDEOS: VideoSrc[] = [
  { file: "tresses-mimi-wa-1.mp4", alt: "Tresses — Salon Mimi Marrakech", poster: "tresses-mimi-5.jpeg" },
  { file: "tresses-mimi-wa-2.mp4", alt: "Coiffure afro — Salon Mimi Marrakech", poster: "tresses-mimi-6.jpeg" },
  { file: "salon-mimi-vid-1.mp4", alt: "Coiffure afro — Médina Marrakech", poster: "s-fulani.jpg" },
  { file: "salon-mimi-vid-2.mp4", alt: "Salon Mimi — Place Jamaa El Fna Marrakech", poster: "s-boho.jpg" },
  { file: "salon-mimi-boxbraids-2509-1.mp4", alt: "Box braids longues Salon Mimi Marrakech", poster: "s-box-braids-xl.jpg" },
  { file: "salon-mimi-twists-2509-1.mp4", alt: "Twists Salon Mimi Marrakech", poster: "s-marley.webp" },
  { file: "salon-mimi-enfants-2509-1.mp4", alt: "Tresses enfants Salon Mimi Marrakech", poster: "s-tresse-fille1.png" },
  { file: "salon-mimi-enfants-2509-2.mp4", alt: "Cornrows enfants Salon Mimi Marrakech", poster: "s-tresse-garcon.png" },
];

const JSDELIVR_BASE = "https://cdn.jsdelivr.net/gh/Moujanane/salon-mimi-media";

async function alreadyMigrated(url: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("gallery_items")
    .select("id")
    .eq("url", url)
    .limit(1);
  if (error) {
    throw new Error(
      `Impossible de vérifier si ${url} est déjà migré : ${error.message}`,
    );
  }
  return !!data && data.length > 0;
}

async function uploadBuffer(
  path: string,
  buf: Buffer,
  contentType: string,
): Promise<string> {
  const { error } = await supabase.storage
    .from("gallery")
    .upload(path, buf, { contentType, upsert: true });
  if (error) throw error;
  return `${PUBLIC_URL_BASE}/${path}`;
}

function videoDimensions(buf: Buffer): { w: number; h: number } | null {
  // ffprobe ne peut pas "seeker" sur un pipe stdin : les MP4 dont l'atome moov
  // est en fin de fichier (exports téléphone / WhatsApp) échouent. On passe par
  // un fichier temporaire.
  const tmp = join(tmpdir(), `mig-probe-${Date.now()}-${Math.random().toString(36).slice(2)}.mp4`);
  try {
    writeFileSync(tmp, buf);
    const out = execFileSync(
      "ffprobe",
      [
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-show_entries",
        "stream=width,height",
        "-of",
        "csv=p=0:s=x",
        tmp,
      ],
      { encoding: "utf8" },
    ).trim();
    const [w, h] = out.split("x").map((n) => parseInt(n, 10));
    if (w > 0 && h > 0) return { w, h };
  } catch {
    /* ignore — dimensions restent null, le rendu a un ratio par défaut */
  } finally {
    try {
      unlinkSync(tmp);
    } catch {
      /* ignore */
    }
  }
  return null;
}

async function main() {
  let order = 0;
  let inserted = 0;
  let skipped = 0;

  for (const p of PHOTOS) {
    const finalUrl = `${PUBLIC_URL_BASE}/photos/${p.file}`;
    if (await alreadyMigrated(finalUrl)) {
      skipped++;
      order++;
      continue;
    }
    const localPath = join(REPO_ROOT, "public", "images", p.file);
    let buf: Buffer;
    try {
      buf = readFileSync(localPath);
    } catch {
      console.warn(`  photo introuvable, ignorée : ${p.file}`);
      order++;
      continue;
    }
    const meta = await sharp(buf).metadata();
    const url = await uploadBuffer(
      `photos/${p.file}`,
      buf,
      p.file.endsWith(".png") ? "image/png" : "image/jpeg",
    );
    const { error } = await supabase.from("gallery_items").upsert(
      {
        type: "photo",
        url,
        poster_url: null,
        alt: p.alt,
        sort_order: order,
        width: meta.width ?? null,
        height: meta.height ?? null,
      },
      { onConflict: "url" },
    );
    if (error) throw error;
    inserted++;
    order++;
    console.log(`  photo OK : ${p.file}`);
  }

  for (const v of VIDEOS) {
    const finalUrl = `${PUBLIC_URL_BASE}/videos/${v.file}`;
    if (await alreadyMigrated(finalUrl)) {
      skipped++;
      order++;
      continue;
    }
    const res = await fetch(`${JSDELIVR_BASE}/${v.file}`);
    if (!res.ok) {
      console.warn(`  vidéo injoignable (${res.status}), ignorée : ${v.file}`);
      order++;
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const dims = videoDimensions(buf);
    const url = await uploadBuffer(`videos/${v.file}`, buf, "video/mp4");

    let posterUrl: string | null = null;
    try {
      const posterBuf = readFileSync(
        join(REPO_ROOT, "public", "images", v.poster),
      );
      posterUrl = await uploadBuffer(
        `posters/${v.poster}`,
        posterBuf,
        v.poster.endsWith(".png")
          ? "image/png"
          : v.poster.endsWith(".webp")
            ? "image/webp"
            : "image/jpeg",
      );
    } catch {
      console.warn(`  poster introuvable pour ${v.file} : ${v.poster}`);
    }

    const { error } = await supabase.from("gallery_items").upsert(
      {
        type: "video",
        url,
        poster_url: posterUrl,
        alt: v.alt,
        sort_order: order,
        width: dims?.w ?? null,
        height: dims?.h ?? null,
      },
      { onConflict: "url" },
    );
    if (error) throw error;
    inserted++;
    order++;
    console.log(`  vidéo OK : ${v.file}`);
  }

  console.log(
    `\nMigration terminée : ${inserted} insérés, ${skipped} déjà présents.`,
  );
}

main().catch((e) => {
  console.error("Échec de la migration :", e);
  process.exit(1);
});
