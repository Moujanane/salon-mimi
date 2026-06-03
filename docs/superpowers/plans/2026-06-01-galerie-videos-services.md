# Galerie enrichie + Vidéos Pomelli sur Services Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter toutes les nouvelles photos dans la galerie, un onglet "Vidéos" dans la galerie avec les 3 vidéos Pomelli, et une section vidéos Pomelli sur la page Services.

**Architecture:** La galerie devient un client component avec deux onglets (Photos / Vidéos). Les vidéos Pomelli sont servies en `<video>` natif depuis `/public/videos/`. La page Services reçoit une section statique sous la grille existante.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, `<video>` HTML5 natif

---

## Fichiers touchés

| Fichier                                      | Action                                                                    |
| -------------------------------------------- | ------------------------------------------------------------------------- |
| `app/[locale]/galerie/page.tsx`              | Remplacer par Server Component minimal — délègue le rendu à GalerieClient |
| `components/sections/GalerieClient.tsx`      | Créer — Client Component avec onglets Photos/Vidéos                       |
| `components/sections/ServicesPageClient.tsx` | Modifier — ajouter section vidéos Pomelli en bas                          |

---

## Inventaire des médias à intégrer

### Photos nouvelles (à ajouter dans la galerie)

Toutes dans `/public/images/` :

| Fichier                                     | Alt SEO                                                        |
| ------------------------------------------- | -------------------------------------------------------------- |
| `Salon mimi1.jpeg`                          | Salon Mimi Marrakech — intérieur salon coiffure africaine      |
| `Salon mimi2.jpeg`                          | Salon Mimi Marrakech — ambiance salon tresses africaines       |
| `Salon mimi3.jpeg`                          | Salon Mimi Marrakech — coiffeuse au travail Place Jamaa El Fna |
| `Tresses mimi1.jpeg`                        | Tresses africaines Salon Mimi Marrakech — réalisation knotless |
| `Tresses mimi2.jpeg`                        | Box braids Salon Mimi Marrakech — tresses africaines Médina    |
| `Tresses mimi3.jpeg`                        | Tresses rasta Salon Mimi Marrakech — coiffure afro Marrakech   |
| `Tresses mimi4.jpeg`                        | Tresses africaines Salon Mimi — Place Jamaa El Fna Marrakech   |
| `pomelli_creative_image_19_16_0531 (2).png` | Coiffure africaine Marrakech — création artistique Salon Mimi  |
| `pomelli_creative_image_9_16_0531 (1).png`  | Tresses africaines créatives Marrakech — Salon Mimi            |
| `pomelli_creative_image_9_16_0531 (2).png`  | Box braids artistiques Marrakech — Salon Mimi coiffure afro    |
| `pomelli_creative_image_9_16_0531 (3).png`  | Coiffure afro créative Salon Mimi — tresses Marrakech          |
| `pomelli_creative_image_9_16_0531.png`      | Coiffure africaine Salon Mimi Marrakech — tresses et locks     |
| `pomelli_photoshoot_image_9_16_0531.png`    | Photoshoot Salon Mimi Marrakech — coiffure africaine           |
| `s-boho.jpg`                                | Tresses Boho Salon Mimi Marrakech                              |
| `s-box-braids-longues.jpg`                  | Box braids longues Salon Mimi Marrakech                        |
| `s-box-braids-profil.jpg`                   | Box braids profil Salon Mimi Marrakech                         |
| `s-box-braids-xl.jpg`                       | Box braids XL Salon Mimi Marrakech                             |
| `s-cornrows.jpg`                            | Cornrows Salon Mimi Marrakech — tresses collées africaines     |
| `s-depart-locks.jpg`                        | Départ locks Salon Mimi Marrakech — pose de locks              |
| `s-fulani.jpg`                              | Tresses Fulani Salon Mimi Marrakech                            |
| `s-knotless.jpg`                            | Knotless braids Salon Mimi Marrakech                           |
| `s-mini-braids.jpg`                         | Mini braids Salon Mimi Marrakech                               |
| `s-retouche-locks.jpg`                      | Retouche locks Salon Mimi Marrakech — entretien locks          |
| `s-tressage-action.jpg`                     | Tressage en cours Salon Mimi Marrakech                         |
| `s-tressage-mains.jpg`                      | Mains tresseuse Salon Mimi Marrakech — savoir-faire africain   |
| `s-tresse-fille1.png`                       | Tresses fille Salon Mimi Marrakech                             |
| `s-tresse-fille2.png`                       | Tresses petite fille Salon Mimi Marrakech                      |
| `s-tresse-garcon.png`                       | Tresses garçon Salon Mimi Marrakech                            |
| `s-tresses-2.jpg`                           | Tresses africaines Salon Mimi Marrakech                        |
| `s-tresses-3.jpg`                           | Tresses africaines Salon Mimi Marrakech — box braids           |
| `s-tresses-4.jpg`                           | Tresses africaines Salon Mimi Marrakech — knotless             |
| `s-tresses-5.jpg`                           | Tresses africaines Salon Mimi Marrakech — locks                |
| `coiffure-1.jpg`                            | Box braids knotless Salon Mimi Marrakech — Place Jamaa El Fna  |
| `hero-salon.jpg`                            | Salon Mimi Marrakech — coiffeuse africaine Médina              |

### Vidéos Pomelli (galerie onglet Vidéos + section Services)

Dans `/public/videos/` :

| Fichier                                    | Titre affiché      |
| ------------------------------------------ | ------------------ |
| `pomelli_creative_video_9_16_0531.mp4`     | Tresses africaines |
| `pomelli_creative_video_9_16_0531 (1).mp4` | Knotless braids    |
| `pomelli_creative_video_9_16_0531 (2).mp4` | Box braids         |

---

## Task 1 : Créer GalerieClient — onglets Photos + Vidéos

**Files:**

- Create: `components/sections/GalerieClient.tsx`

- [ ] **Étape 1 : Créer le fichier**

```tsx
// components/sections/GalerieClient.tsx
"use client";
import { useState } from "react";
import Image from "next/image";

const PHOTOS = [
  {
    src: "/images/Salon mimi1.jpeg",
    alt: "Salon Mimi Marrakech — intérieur salon coiffure africaine",
  },
  {
    src: "/images/Salon mimi2.jpeg",
    alt: "Salon Mimi Marrakech — ambiance salon tresses africaines",
  },
  {
    src: "/images/Salon mimi3.jpeg",
    alt: "Salon Mimi Marrakech — coiffeuse au travail Place Jamaa El Fna",
  },
  {
    src: "/images/Tresses mimi1.jpeg",
    alt: "Tresses africaines Salon Mimi Marrakech — réalisation knotless",
  },
  {
    src: "/images/Tresses mimi2.jpeg",
    alt: "Box braids Salon Mimi Marrakech — tresses africaines Médina",
  },
  {
    src: "/images/Tresses mimi3.jpeg",
    alt: "Tresses rasta Salon Mimi Marrakech — coiffure afro Marrakech",
  },
  {
    src: "/images/Tresses mimi4.jpeg",
    alt: "Tresses africaines Salon Mimi — Place Jamaa El Fna Marrakech",
  },
  {
    src: "/images/pomelli_creative_image_19_16_0531 (2).png",
    alt: "Coiffure africaine Marrakech — création artistique Salon Mimi",
  },
  {
    src: "/images/pomelli_creative_image_9_16_0531 (1).png",
    alt: "Tresses africaines créatives Marrakech — Salon Mimi",
  },
  {
    src: "/images/pomelli_creative_image_9_16_0531 (2).png",
    alt: "Box braids artistiques Marrakech — Salon Mimi coiffure afro",
  },
  {
    src: "/images/pomelli_creative_image_9_16_0531 (3).png",
    alt: "Coiffure afro créative Salon Mimi — tresses Marrakech",
  },
  {
    src: "/images/pomelli_creative_image_9_16_0531.png",
    alt: "Coiffure africaine Salon Mimi Marrakech — tresses et locks",
  },
  {
    src: "/images/pomelli_photoshoot_image_9_16_0531.png",
    alt: "Photoshoot Salon Mimi Marrakech — coiffure africaine",
  },
  { src: "/images/s-boho.jpg", alt: "Tresses Boho Salon Mimi Marrakech" },
  {
    src: "/images/s-box-braids-longues.jpg",
    alt: "Box braids longues Salon Mimi Marrakech",
  },
  {
    src: "/images/s-box-braids-profil.jpg",
    alt: "Box braids profil Salon Mimi Marrakech",
  },
  {
    src: "/images/s-box-braids-xl.jpg",
    alt: "Box braids XL Salon Mimi Marrakech",
  },
  {
    src: "/images/s-cornrows.jpg",
    alt: "Cornrows Salon Mimi Marrakech — tresses collées africaines",
  },
  {
    src: "/images/s-depart-locks.jpg",
    alt: "Départ locks Salon Mimi Marrakech — pose de locks",
  },
  { src: "/images/s-fulani.jpg", alt: "Tresses Fulani Salon Mimi Marrakech" },
  {
    src: "/images/s-knotless.jpg",
    alt: "Knotless braids Salon Mimi Marrakech",
  },
  { src: "/images/s-mini-braids.jpg", alt: "Mini braids Salon Mimi Marrakech" },
  {
    src: "/images/s-retouche-locks.jpg",
    alt: "Retouche locks Salon Mimi Marrakech — entretien locks",
  },
  {
    src: "/images/s-tressage-action.jpg",
    alt: "Tressage en cours Salon Mimi Marrakech",
  },
  {
    src: "/images/s-tressage-mains.jpg",
    alt: "Mains tresseuse Salon Mimi Marrakech — savoir-faire africain",
  },
  {
    src: "/images/s-tresse-fille1.png",
    alt: "Tresses fille Salon Mimi Marrakech",
  },
  {
    src: "/images/s-tresse-fille2.png",
    alt: "Tresses petite fille Salon Mimi Marrakech",
  },
  {
    src: "/images/s-tresse-garcon.png",
    alt: "Tresses garçon Salon Mimi Marrakech",
  },
  {
    src: "/images/s-tresses-2.jpg",
    alt: "Tresses africaines Salon Mimi Marrakech",
  },
  {
    src: "/images/s-tresses-3.jpg",
    alt: "Tresses africaines Salon Mimi Marrakech — box braids",
  },
  {
    src: "/images/s-tresses-4.jpg",
    alt: "Tresses africaines Salon Mimi Marrakech — knotless",
  },
  {
    src: "/images/s-tresses-5.jpg",
    alt: "Tresses africaines Salon Mimi Marrakech — locks",
  },
  {
    src: "/images/coiffure-1.jpg",
    alt: "Box braids knotless Salon Mimi Marrakech — Place Jamaa El Fna",
  },
  {
    src: "/images/hero-salon.jpg",
    alt: "Salon Mimi Marrakech — coiffeuse africaine Médina",
  },
];

const VIDEOS = [
  {
    src: "/videos/pomelli_creative_video_9_16_0531.mp4",
    title: "Tresses africaines",
    poster: "/images/pomelli_creative_image_9_16_0531.png",
  },
  {
    src: "/videos/pomelli_creative_video_9_16_0531 (1).mp4",
    title: "Knotless braids",
    poster: "/images/pomelli_creative_image_9_16_0531 (1).png",
  },
  {
    src: "/videos/pomelli_creative_video_9_16_0531 (2).mp4",
    title: "Box braids",
    poster: "/images/pomelli_creative_image_9_16_0531 (2).png",
  },
];

const TAB_LABELS: Record<string, { photos: string; videos: string }> = {
  fr: { photos: "Photos", videos: "Vidéos" },
  en: { photos: "Photos", videos: "Videos" },
  es: { photos: "Fotos", videos: "Vídeos" },
};

export default function GalerieClient({ locale }: { locale: string }) {
  const [tab, setTab] = useState<"photos" | "videos">("photos");
  const labels = TAB_LABELS[locale] ?? TAB_LABELS.fr;

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      {/* Onglets */}
      <div className="flex gap-3 mb-10 justify-center">
        {(["photos", "videos"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-2 rounded-full text-sm font-inter tracking-widest uppercase transition-colors ${
              tab === t
                ? "bg-ocre text-nuit font-semibold"
                : "border border-ocre/40 text-ocre/60 hover:border-ocre hover:text-ocre"
            }`}
          >
            {t === "photos" ? labels.photos : labels.videos}
          </button>
        ))}
      </div>

      {/* Grille photos */}
      {tab === "photos" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PHOTOS.map((img) => (
            <div
              key={img.src}
              className="relative aspect-square rounded-2xl overflow-hidden bg-gray-800"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      )}

      {/* Grille vidéos */}
      {tab === "videos" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {VIDEOS.map((v) => (
            <div
              key={v.src}
              className="rounded-2xl overflow-hidden bg-gray-800"
            >
              <video
                src={v.src}
                poster={v.poster}
                autoPlay
                muted
                loop
                playsInline
                className="w-full aspect-[9/16] object-cover"
              />
              <p className="text-center text-ocre text-sm font-inter py-3 tracking-widest uppercase">
                {v.title}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Étape 2 : Vérifier TypeScript**

```bash
cd /Users/Mouj/Desktop/salon-mimi && npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Étape 3 : Commit**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add components/sections/GalerieClient.tsx
git commit -m "feat(galerie): GalerieClient avec onglets Photos/Vidéos"
```

---

## Task 2 : Mettre à jour galerie/page.tsx pour utiliser GalerieClient

**Files:**

- Modify: `app/[locale]/galerie/page.tsx`

- [ ] **Étape 1 : Remplacer le contenu de la page**

Remplacer l'intégralité de `app/[locale]/galerie/page.tsx` par :

```tsx
export const revalidate = 3600;

import type { Metadata } from "next";
import GalerieClient from "@/components/sections/GalerieClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    fr: "Galerie — Tresses africaines & Locks Marrakech | Salon Mimi",
    en: "Gallery — African braids & Locks Marrakech | Salon Mimi",
    es: "Galería — Trenzas africanas y Locks Marrakech | Salon Mimi",
  };

  const descriptions: Record<string, string> = {
    fr: "Découvrez les réalisations du Salon Mimi Marrakech : tresses africaines, knotless braids, box braids, locks, tresses rasta. Photos avant/après — Place Jamaa El Fna.",
    en: "Explore Salon Mimi Marrakech's work: African braids, knotless braids, box braids, locks, rasta braids. Before/after photos — Jamaa El Fna Square.",
    es: "Descubre las creaciones del Salon Mimi Marrakech: trenzas africanas, knotless braids, box braids, locks, trenzas rasta. Fotos antes/después — Plaza Jamaa El Fna.",
  };

  return {
    title: titles[locale] ?? titles.fr,
    description: descriptions[locale] ?? descriptions.fr,
    alternates: {
      canonical: `https://mimi-coiffure.com/${locale}/galerie/`,
      languages: {
        fr: "https://mimi-coiffure.com/fr/galerie",
        en: "https://mimi-coiffure.com/en/galerie",
        es: "https://mimi-coiffure.com/es/galerie",
        "x-default": "https://mimi-coiffure.com/fr/galerie",
      },
    },
  };
}

const titles: Record<string, string> = {
  fr: "Galerie",
  en: "Gallery",
  es: "Galería",
};

const subtitles: Record<string, string> = {
  fr: "Nos réalisations",
  en: "Our work",
  es: "Nuestras creaciones",
};

export default async function GaleriePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const displayLocale = locale || "fr";

  return (
    <div className="bg-fond min-h-screen">
      <div className="bg-nuit py-16 text-center">
        <h1 className="font-playfair text-5xl text-or">
          {titles[displayLocale] ?? titles.fr}
        </h1>
        <p className="text-white/60 mt-3">
          {subtitles[displayLocale] ?? subtitles.fr}
        </p>
      </div>
      <GalerieClient locale={displayLocale} />
    </div>
  );
}
```

- [ ] **Étape 2 : Vérifier TypeScript**

```bash
cd /Users/Mouj/Desktop/salon-mimi && npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Étape 3 : Commit**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add app/[locale]/galerie/page.tsx
git commit -m "feat(galerie): intégration GalerieClient dans la page galerie"
```

---

## Task 3 : Ajouter la section vidéos Pomelli dans la page Services

**Files:**

- Modify: `components/sections/ServicesPageClient.tsx`

- [ ] **Étape 1 : Localiser la fin du JSX dans ServicesPageClient.tsx**

Chercher la dernière balise fermante `</div>` du return principal (avant le dernier `}`).

- [ ] **Étape 2 : Ajouter la section vidéos juste avant la fermeture du div principal**

Dans `ServicesPageClient.tsx`, ajouter après la section existante (pills + panneau photo), avant le `</div>` final du composant :

```tsx
{
  /* Section vidéos Pomelli */
}
<div className="border-t border-ocre/10 mt-8 pt-10 px-6 md:px-12 pb-16">
  <p className="text-ocre text-[9px] tracking-[5px] uppercase font-inter mb-3 text-center">
    Le salon en vidéo
  </p>
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
    {[
      {
        src: "/videos/pomelli_creative_video_9_16_0531.mp4",
        poster: "/images/pomelli_creative_image_9_16_0531.png",
        label: "Tresses africaines",
      },
      {
        src: "/videos/pomelli_creative_video_9_16_0531 (1).mp4",
        poster: "/images/pomelli_creative_image_9_16_0531 (1).png",
        label: "Knotless braids",
      },
      {
        src: "/videos/pomelli_creative_video_9_16_0531 (2).mp4",
        poster: "/images/pomelli_creative_image_9_16_0531 (2).png",
        label: "Box braids",
      },
    ].map((v) => (
      <div key={v.src} className="rounded-2xl overflow-hidden bg-black/30">
        <video
          src={v.src}
          poster={v.poster}
          autoPlay
          muted
          loop
          playsInline
          className="w-full aspect-[9/16] object-cover"
        />
        <p className="text-center text-ocre text-[10px] font-inter py-3 tracking-widest uppercase">
          {v.label}
        </p>
      </div>
    ))}
  </div>
</div>;
```

- [ ] **Étape 3 : Vérifier TypeScript**

```bash
cd /Users/Mouj/Desktop/salon-mimi && npx tsc --noEmit
```

Résultat attendu : aucune erreur.

- [ ] **Étape 4 : Commit**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add components/sections/ServicesPageClient.tsx
git commit -m "feat(services): section vidéos Pomelli en bas de page Services"
```

---

## Task 4 : Vérification finale et déploiement

- [ ] **Étape 1 : Vérifier le build complet**

```bash
cd /Users/Mouj/Desktop/salon-mimi && npm run build
```

Résultat attendu : `✓ Compiled successfully`, aucune erreur. Si erreur de chemin de fichier (espaces dans les noms), corriger l'encodage URL dans les `src` (ex: `%20` au lieu d'espaces).

- [ ] **Étape 2 : Tester en local**

```bash
cd /Users/Mouj/Desktop/salon-mimi && npm run dev
```

Vérifier manuellement :

- `/fr/galerie` → onglet Photos affiche toutes les images, onglet Vidéos affiche 3 vidéos en lecture automatique
- `/fr/services` → section "Le salon en vidéo" visible en bas de page avec 3 vidéos

- [ ] **Étape 3 : Pusher sur Railway**

```bash
cd /Users/Mouj/Desktop/salon-mimi && git push origin main
```

- [ ] **Étape 4 : Vérifier en production**

- Ouvrir `https://mimi-coiffure.com/fr/galerie` — onglets fonctionnels
- Ouvrir `https://mimi-coiffure.com/fr/services` — section vidéos présente

---

## Note sur les noms de fichiers avec espaces

Les fichiers `pomelli_creative_video_9_16_0531 (1).mp4` ont des espaces et parenthèses dans leur nom. Dans les `src` HTML/Next.js, ces caractères sont valides dans les chemins statiques `/public/` — Next.js les sert directement sans encodage requis dans le JSX. Si le build échoue sur ces chemins, renommer les fichiers :

```bash
cd /Users/Mouj/Desktop/salon-mimi/public/videos
mv "pomelli_creative_video_9_16_0531 (1).mp4" "pomelli-video-2.mp4"
mv "pomelli_creative_video_9_16_0531 (2).mp4" "pomelli-video-3.mp4"
mv "pomelli_creative_video_9_16_0531.mp4" "pomelli-video-1.mp4"
```

Et mettre à jour les `src` en conséquence dans GalerieClient.tsx et ServicesPageClient.tsx.
