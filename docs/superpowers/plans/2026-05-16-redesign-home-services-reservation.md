# Redesign Home + Services + Réservation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refaire le design des pages Home, Services et Réservation avec le style Bold & Culture (fond brun foncé #1a0d05, palette ocre/or, typographie Georgia serif + Inter, micro-animations sobres) en conservant toute la logique métier existante (Supabase, Stripe, i18n).

**Architecture:** Réécriture des composants sections existants + création de 2 nouveaux composants (`LocationSection`, `ServicesPageClient`). Le Header global est mis à jour. Les pages Next.js restent des Server Components — seuls les composants interactifs deviennent `"use client"`. Le passage du service sélectionné de `/services` vers `/reservation` se fait via query param `?service=<id>`.

**Tech Stack:** Next.js 14 App Router · Tailwind CSS · TypeScript · next-intl · Framer Motion (déjà installé ou via CSS animations natives) · Google Maps iframe

---

## Fichiers créés ou modifiés

| Fichier                                      | Action     | Responsabilité                                |
| -------------------------------------------- | ---------- | --------------------------------------------- |
| `tailwind.config.ts`                         | Modifier   | Ajouter couleur `panneau: #3d1a06`            |
| `app/globals.css`                            | Modifier   | Variables CSS globales, font Georgia          |
| `components/layout/Header.tsx`               | Réécriture | Nav fixe blur, logo centré, bouton RDV ocre   |
| `components/sections/HeroHome.tsx`           | Réécriture | Hero split 50/50, grille photos scroll infini |
| `components/sections/LocationSection.tsx`    | Créer      | Section Jamaa El Fna, Maps iframe, JSON-LD    |
| `components/sections/CTAFinal.tsx`           | Modifier   | Mise à jour couleurs fond/texte               |
| `app/[locale]/page.tsx`                      | Modifier   | Ajout LocationSection entre hero et CTA       |
| `components/sections/ServicesPageClient.tsx` | Créer      | Split pills + carousel tourne-page (client)   |
| `app/[locale]/services/page.tsx`             | Modifier   | Utilise ServicesPageClient                    |
| `components/sections/ReservationLayout.tsx`  | Créer      | Split formulaire + photo service (client)     |
| `app/[locale]/reservation/page.tsx`          | Modifier   | Utilise ReservationLayout, passe searchParams |

---

## Task 1 : Tailwind + CSS globals

**Files:**

- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

- [ ] **Step 1 : Ajouter la couleur `panneau` dans Tailwind**

Remplacer le bloc `colors` dans `tailwind.config.ts` :

```ts
colors: {
  ocre: "#C17B3F",
  vert: "#1F7A4E",
  or: "#D4A843",
  fond: "#F6EFE3",
  nuit: "#1A0D05",       // fond principal (était #1A1A1A)
  brun: "#2C1508",
  panneau: "#3D1A06",    // nouveau — panneaux left/right
},
fontFamily: {
  playfair: ["Playfair Display", "serif"],
  inter: ["Inter", "sans-serif"],
  georgia: ["Georgia", "serif"],  // nouveau — titres hero
},
```

- [ ] **Step 2 : Mettre à jour globals.css**

Remplacer le contenu de `app/globals.css` :

```css
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap");

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-nuit text-white font-inter;
  }

  /* Scroll infini — animation partagée */
  @keyframes scrollUp {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(-50%);
    }
  }
  @keyframes scrollDown {
    from {
      transform: translateY(-50%);
    }
    to {
      transform: translateY(0);
    }
  }
  @keyframes scrollUp3 {
    from {
      transform: translateY(-15%);
    }
    to {
      transform: translateY(-65%);
    }
  }
  @keyframes scrollDown2 {
    from {
      transform: translateY(-10%);
    }
    to {
      transform: translateY(40%);
    }
  }

  .animate-scroll-up {
    animation: scrollUp 22s linear infinite;
  }
  .animate-scroll-down2 {
    animation: scrollDown2 28s linear infinite;
  }
  .animate-scroll-up3 {
    animation: scrollUp3 19s linear infinite;
  }
}
```

- [ ] **Step 3 : Vérifier que le build compile sans erreur**

```bash
cd /Users/Mouj/Desktop/salon-mimi && npm run build 2>&1 | tail -20
```

Résultat attendu : `✓ Compiled successfully` (ou avertissements seulement, pas d'erreurs).

- [ ] **Step 4 : Commit**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "style: palette Bold & Culture — nuit #1a0d05, panneau #3d1a06, animations scroll"
```

---

## Task 2 : Header global redesign

**Files:**

- Modify: `components/layout/Header.tsx`

- [ ] **Step 1 : Réécrire Header.tsx**

```tsx
"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname === `/${locale}${path}` || pathname === `/${locale}${path}/`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-nuit/92 backdrop-blur-md border-b border-ocre/10">
      <div className="flex items-center justify-between px-12 py-4">
        {/* Liens gauche */}
        <nav className="flex items-center gap-8">
          <Link
            href={`/${locale}`}
            className={`text-[10px] tracking-[3px] uppercase transition-colors ${
              isActive("") ? "text-ocre" : "text-white/70 hover:text-white"
            }`}
          >
            {t("home")}
          </Link>
          <Link
            href={`/${locale}/services`}
            className={`text-[10px] tracking-[3px] uppercase transition-colors ${
              isActive("/services")
                ? "text-ocre"
                : "text-white/70 hover:text-white"
            }`}
          >
            {t("services")}
          </Link>
          <Link
            href={`/${locale}/a-propos`}
            className={`text-[10px] tracking-[3px] uppercase transition-colors ${
              isActive("/a-propos")
                ? "text-ocre"
                : "text-white/70 hover:text-white"
            }`}
          >
            {t("about")}
          </Link>
          <Link
            href={`/${locale}/contact`}
            className={`text-[10px] tracking-[3px] uppercase transition-colors ${
              isActive("/contact")
                ? "text-ocre"
                : "text-white/70 hover:text-white"
            }`}
          >
            {t("contact")}
          </Link>
        </nav>

        {/* Logo centré */}
        <Link
          href={`/${locale}`}
          className="absolute left-1/2 -translate-x-1/2 text-[11px] tracking-[6px] uppercase text-white font-inter"
        >
          Salon Mimi
        </Link>

        {/* CTA droite */}
        <Link
          href={`/${locale}/reservation`}
          className="flex items-center gap-2 bg-ocre hover:bg-or text-white text-[10px] tracking-[2px] uppercase px-5 py-2.5 rounded-full transition-colors"
        >
          <span>→</span>
          <span>{t("book")}</span>
        </Link>
      </div>
    </header>
  );
}
```

- [ ] **Step 2 : S'assurer que la clé `book` existe dans les messages i18n**

```bash
grep -r '"book"' /Users/Mouj/Desktop/salon-mimi/messages/
```

Si absent, ajouter dans chaque fichier `messages/fr.json`, `messages/en.json`, `messages/es.json` :

```json
"nav": {
  "book": "Prendre RDV"
}
```

(en / es : `"Book appointment"` / `"Reservar cita"`)

- [ ] **Step 3 : Vérifier visuellement**

```bash
npm run dev
```

Ouvrir `http://localhost:3000/fr` — la nav doit être fixe, avec fond sombre + blur, logo centré, bouton ocre arrondi.

- [ ] **Step 4 : Commit**

```bash
git add components/layout/Header.tsx messages/
git commit -m "feat(header): nav fixe blur, logo centré, bouton RDV ocre"
```

---

## Task 3 : HeroHome — grille photos scroll infini

**Files:**

- Modify: `components/sections/HeroHome.tsx`

- [ ] **Step 1 : Réécrire HeroHome.tsx**

```tsx
import Link from "next/link";
import Image from "next/image";

interface HeroHomeProps {
  locale: string;
  title: string;
  subtitle: string;
  location: string;
  ctaBook: string;
  ctaServices: string;
}

const col1 = [
  {
    src: "/images/s-tresse-fille1.png",
    alt: "Tresses africaines salon Mimi Marrakech",
  },
  { src: "/images/s-knotless.jpg", alt: "Knotless braids Marrakech" },
  { src: "/images/s-fulani.jpg", alt: "Fulani braids salon afro Marrakech" },
  { src: "/images/s-boho.jpg", alt: "Boho braids Marrakech" },
];
const col2 = [
  {
    src: "/images/s-tresse-fille2.png",
    alt: "Tresses africaines fille Marrakech",
  },
  { src: "/images/coiffure-1.jpg", alt: "Coiffure afro Marrakech" },
  { src: "/images/s-cornrows.jpg", alt: "Cornrows salon Mimi" },
  { src: "/images/s-mini-braids.jpg", alt: "Mini braids salon Mimi" },
];
const col3 = [
  { src: "/images/s-tresse-garcon.png", alt: "Tresses garçon salon Mimi" },
  { src: "/images/s-depart-locks.jpg", alt: "Locks Marrakech" },
  { src: "/images/s-box-braids-xl.jpg", alt: "Box braids XL Marrakech" },
  { src: "/images/s-tresse-fille1.png", alt: "Tresses africaines Marrakech" },
];

function PhotoColumn({
  photos,
  animClass,
}: {
  photos: { src: string; alt: string }[];
  animClass: string;
}) {
  // Dupliquer pour scroll infini sans saut
  const doubled = [...photos, ...photos];
  return (
    <div className={`flex flex-col gap-2 ${animClass}`}>
      {doubled.map((p, i) => (
        <div
          key={i}
          className="relative rounded-xl overflow-hidden flex-shrink-0"
          style={{ aspectRatio: "0.68" }}
        >
          <Image
            src={p.src}
            alt={p.alt}
            fill
            className="object-cover"
            sizes="15vw"
          />
        </div>
      ))}
    </div>
  );
}

export default function HeroHome({
  locale,
  ctaBook,
  ctaServices,
}: HeroHomeProps) {
  return (
    <section className="relative h-screen flex overflow-hidden bg-nuit">
      {/* Halo ocre arrière-plan */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 25% 50%, rgba(193,123,63,0.10) 0%, transparent 55%)",
        }}
      />

      {/* ── Colonne gauche ── */}
      <div className="w-1/2 flex flex-col justify-center px-14 pt-10 relative z-10">
        {/* Badge localisation */}
        <div className="flex items-center gap-3 mb-7">
          <div className="w-7 h-px bg-ocre flex-shrink-0" />
          <span className="text-ocre text-[9px] tracking-[4px] uppercase font-inter">
            Salon afro · Marrakech
          </span>
        </div>

        {/* Titre H1 */}
        <h1 className="font-georgia text-[clamp(52px,6vw,88px)] font-bold uppercase leading-[0.9] text-white mb-7">
          Salon
          <em className="block not-italic text-ocre italic">Mimi</em>
        </h1>

        {/* Accroche */}
        <p className="font-georgia text-[18px] font-bold text-white leading-snug mb-4 max-w-sm">
          Tes cheveux méritent
          <br />
          <em className="text-ocre">mieux qu&apos;une coiffure ordinaire.</em>
        </p>

        {/* Texte SEO */}
        <p className="text-white/55 text-[14px] leading-relaxed max-w-[360px] mb-10 font-inter">
          À Marrakech, <strong className="text-white">Salon Mimi</strong> est le
          spécialiste des{" "}
          <strong className="text-ocre">tresses africaines</strong>, knotless,
          locks et styles naturels. Chaque cliente repart avec une coiffure qui
          lui ressemble —{" "}
          <strong className="text-white">
            réalisée par des mains expertes
          </strong>
          .
        </p>

        {/* CTAs */}
        <div className="flex flex-col gap-3 max-w-[260px]">
          <Link
            href={`/${locale}/reservation`}
            className="flex items-center justify-center gap-2 bg-ocre hover:bg-or text-white text-[10px] tracking-[3px] uppercase px-7 py-4 rounded-full transition-all hover:-translate-y-0.5 font-inter"
          >
            → Prendre rendez-vous
          </Link>
          <Link
            href={`/${locale}/services`}
            className="flex items-center justify-center text-white border border-white/20 hover:border-ocre hover:text-ocre text-[10px] tracking-[3px] uppercase px-7 py-4 rounded-full transition-colors font-inter"
          >
            Découvrir les services
          </Link>
        </div>
      </div>

      {/* ── Colonne droite — grille scroll ── */}
      <div className="flex-1 grid grid-cols-3 gap-2 p-4 overflow-hidden relative">
        {/* Fades haut et bas */}
        <div
          className="absolute top-0 inset-x-0 h-24 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, #1a0d05 20%, transparent)",
          }}
        />
        <div
          className="absolute bottom-0 inset-x-0 h-24 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to top, #1a0d05 20%, transparent)",
          }}
        />

        <PhotoColumn photos={col1} animClass="animate-scroll-up" />
        <PhotoColumn photos={col2} animClass="animate-scroll-down2" />
        <PhotoColumn photos={col3} animClass="animate-scroll-up3" />
      </div>
    </section>
  );
}
```

- [ ] **Step 2 : Vérifier que les images existent**

```bash
ls /Users/Mouj/Desktop/salon-mimi/public/images/ | grep -E "s-cornrows|s-mini-braids|s-depart-locks|s-box-braids"
```

Si une image manque, remplacer dans `col2`/`col3` par une image existante (`s-fulani.jpg`, `s-boho.jpg`, etc.).

- [ ] **Step 3 : Tester visuellement**

```bash
npm run dev
```

Ouvrir `http://localhost:3000/fr` — le hero doit afficher le split gauche/droite avec les 3 colonnes qui scrollent à vitesses différentes. Les fades haut/bas masquent les bords.

- [ ] **Step 4 : Commit**

```bash
git add components/sections/HeroHome.tsx
git commit -m "feat(home): hero split — titre affirmé + grille photos scroll infini 3 colonnes"
```

---

## Task 4 : LocationSection — Jamaa El Fna (SEO local)

**Files:**

- Create: `components/sections/LocationSection.tsx`
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1 : Créer LocationSection.tsx**

```tsx
export default function LocationSection({ locale }: { locale: string }) {
  const content = {
    fr: {
      badge: "Où nous trouver",
      title: "Au cœur de la Médina",
      titleAccent: "Place Jamaa El Fna",
      text: "Salon Mimi est situé en plein centre historique de Marrakech, à deux pas de la célèbre place Jamaa El Fna. Que tu sois habitante de la Médina ou touriste de passage, nous sommes faciles d'accès depuis toute la ville.",
      address: "Médina de Marrakech, près de la Place Jamaa El Fna",
      hours: "Lun–Sam : 9h–20h · Dim : 10h–18h",
      cta: "Obtenir l'itinéraire",
    },
    en: {
      badge: "Find us",
      title: "In the heart of the Medina",
      titleAccent: "Jamaa El Fna Square",
      text: "Salon Mimi is located in the historic centre of Marrakech, steps away from the famous Jamaa El Fna square. Whether you live in the Medina or are visiting, we are easy to reach from anywhere in the city.",
      address: "Medina of Marrakech, near Jamaa El Fna Square",
      hours: "Mon–Sat: 9am–8pm · Sun: 10am–6pm",
      cta: "Get directions",
    },
    es: {
      badge: "Encuéntranos",
      title: "En el corazón de la Medina",
      titleAccent: "Plaza Jamaa El Fna",
      text: "Salon Mimi está ubicado en el centro histórico de Marrakech, a pasos de la famosa plaza Jamaa El Fna. Tanto si vives en la Medina como si estás de visita, somos fácilmente accesibles desde toda la ciudad.",
      address: "Medina de Marrakech, cerca de la Plaza Jamaa El Fna",
      hours: "Lun–Sáb: 9h–20h · Dom: 10h–18h",
      cta: "Obtener indicaciones",
    },
  };

  const c = content[locale as keyof typeof content] ?? content.fr;

  // JSON-LD LocalBusiness pour Google
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: "Salon Mimi",
    description:
      "Salon de coiffure afro spécialisé en tresses africaines, knotless braids, locks et styles naturels. Situé près de la Place Jamaa El Fna, Médina de Marrakech.",
    url: "https://salon-mimi.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Médina, près de la Place Jamaa El Fna",
      addressLocality: "Marrakech",
      addressCountry: "MA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 31.6258,
      longitude: -7.9892,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "09:00",
        closes: "20:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday"],
        opens: "10:00",
        closes: "18:00",
      },
    ],
    telephone: "+212710388204",
    priceRange: "150–500 MAD",
  };

  return (
    <section className="bg-nuit border-t border-ocre/15 py-20 px-6 md:px-16">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Badge */}
      <div className="flex items-center gap-3 mb-6 justify-center">
        <div className="w-8 h-px bg-ocre" />
        <span className="text-ocre text-[9px] tracking-[4px] uppercase font-inter">
          {c.badge}
        </span>
        <div className="w-8 h-px bg-ocre" />
      </div>

      {/* Titre */}
      <h2 className="font-georgia text-[clamp(26px,3.5vw,44px)] font-bold text-white text-center leading-tight mb-12">
        {c.title} · <em className="text-ocre italic">{c.titleAccent}</em>
      </h2>

      {/* Split Maps + Infos */}
      <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto">
        {/* Carte Google Maps */}
        <div
          className="flex-1 rounded-2xl overflow-hidden border border-ocre/20"
          style={{ minHeight: "300px" }}
        >
          <iframe
            title="Salon Mimi — Place Jamaa El Fna, Marrakech"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3396.5!2d-7.9892!3d31.6258!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDM3JzMyLjkiTiA3wrA1OSczMi4xIlc!5e0!3m2!1sfr!2sma!4v1"
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: "300px" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Informations pratiques */}
        <div className="lg:w-80 flex flex-col justify-center gap-6 bg-panneau rounded-2xl border border-ocre/20 p-8">
          <div>
            <div className="text-[9px] tracking-[3px] uppercase text-ocre font-inter mb-2">
              Adresse
            </div>
            <p className="text-white text-[14px] leading-relaxed">
              {c.address}
            </p>
          </div>
          <div className="h-px bg-ocre/15" />
          <div>
            <div className="text-[9px] tracking-[3px] uppercase text-ocre font-inter mb-2">
              Horaires
            </div>
            <p className="text-white/70 text-[13px] leading-relaxed">
              {c.hours}
            </p>
          </div>
          <div className="h-px bg-ocre/15" />
          <div>
            <div className="text-[9px] tracking-[3px] uppercase text-ocre font-inter mb-2">
              WhatsApp
            </div>
            <a
              href="https://wa.me/212710388204"
              className="text-white hover:text-ocre text-[14px] transition-colors"
            >
              +212 710 388 204
            </a>
          </div>
          <a
            href="https://maps.google.com/?q=Jamaa+El+Fna+Marrakech"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-ocre hover:bg-or text-white text-[10px] tracking-[2px] uppercase px-6 py-3 rounded-full transition-colors font-inter"
          >
            → {c.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2 : Insérer LocationSection dans la Home**

Dans `app/[locale]/page.tsx`, ajouter l'import et insérer le composant entre `HeroHome` et `CTAFinal` :

```tsx
import LocationSection from "@/components/sections/LocationSection";

// Dans le JSX, après </HeroHome> :
<LocationSection locale={locale} />;
```

- [ ] **Step 3 : Vérifier le rendu et le JSON-LD**

```bash
npm run dev
```

Ouvrir `http://localhost:3000/fr` — scroller sous le hero, la section localisation doit apparaître avec la carte et les infos. Inspecter le source HTML et vérifier la présence du bloc `application/ld+json`.

- [ ] **Step 4 : Commit**

```bash
git add components/sections/LocationSection.tsx app/\[locale\]/page.tsx
git commit -m "feat(seo): section localisation Jamaa El Fna — Maps + JSON-LD LocalBusiness"
```

---

## Task 5 : CTAFinal — mise à jour couleurs

**Files:**

- Modify: `components/sections/CTAFinal.tsx`

- [ ] **Step 1 : Lire le fichier actuel**

```bash
cat /Users/Mouj/Desktop/salon-mimi/components/sections/CTAFinal.tsx
```

- [ ] **Step 2 : Remplacer les classes fond/texte**

Remplacer toutes les occurrences de :

- `bg-fond` → `bg-nuit`
- `bg-brun` → `bg-panneau`
- `text-brun` → `text-white`
- Garder `text-ocre`, `bg-ocre` tels quels

Le titre doit être : `"Prends soin de ta couronne"` (fr), police Georgia, taille `clamp(26px,3.5vw,44px)`.

- [ ] **Step 3 : Vérifier**

```bash
npm run dev
```

Le CTA bas de home doit avoir un fond sombre avec la bordure ocre subtile en haut.

- [ ] **Step 4 : Commit**

```bash
git add components/sections/CTAFinal.tsx
git commit -m "style(cta): mise à jour couleurs Bold & Culture"
```

---

## Task 6 : Page Services — ServicesPageClient

**Files:**

- Create: `components/sections/ServicesPageClient.tsx`
- Modify: `app/[locale]/services/page.tsx`

- [ ] **Step 1 : Créer ServicesPageClient.tsx**

```tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface ServiceData {
  id: string;
  label: string;
  icon: string;
  subServices: string;
  price: string;
  image: string;
  imageAlt: string;
}

const SERVICES: ServiceData[] = [
  {
    id: "tresses-africaines",
    label: "Tresses africaines",
    icon: "✦",
    subServices:
      "Box braids · Cornrows · Tribal braids · Tresse frontale · Micro braids",
    price: "dès 150 MAD",
    image: "/images/s-tresse-fille1.png",
    imageAlt: "Tresses africaines salon Mimi Marrakech",
  },
  {
    id: "knotless-braids",
    label: "Knotless braids",
    icon: "◈",
    subServices: "Knotless classiques · Jumbo · Avec couleur · Fini perles",
    price: "dès 200 MAD",
    image: "/images/s-knotless.jpg",
    imageAlt: "Knotless braids salon Mimi Marrakech",
  },
  {
    id: "fulani-braids",
    label: "Fulani braids",
    icon: "❋",
    subServices: "Classiques · Avec perles · Fils de couleur · Tribal",
    price: "dès 180 MAD",
    image: "/images/s-fulani.jpg",
    imageAlt: "Fulani braids salon afro Marrakech",
  },
  {
    id: "boho-braids",
    label: "Boho braids",
    icon: "◉",
    subServices: "Boho knotless · Avec frisures · Jumbo · Colorées",
    price: "dès 220 MAD",
    image: "/images/s-boho.jpg",
    imageAlt: "Boho braids salon Mimi Marrakech",
  },
  {
    id: "locks-dreads",
    label: "Locks & dreads",
    icon: "⟁",
    subServices: "Pose · Sisterlocks · Entretien · Retouche racines",
    price: "dès 250 MAD",
    image: "/images/s-depart-locks.jpg",
    imageAlt: "Locks dreads salon afro Marrakech",
  },
];

export default function ServicesPageClient({ locale }: { locale: string }) {
  const [active, setActive] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);

  // Auto-avance
  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % SERVICES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  function goTo(index: number) {
    if (index === active) return;
    setLeaving(active);
    setTimeout(() => setLeaving(null), 700);
    setActive(index);
  }

  const svc = SERVICES[active];

  return (
    <div className="h-screen flex flex-col bg-nuit overflow-hidden">
      {/* Espace nav fixe */}
      <div className="h-[57px] flex-shrink-0" />

      {/* Hero compact */}
      <div className="flex-shrink-0 text-center px-12 py-4 border-b border-ocre/10">
        <span className="text-ocre text-[9px] tracking-[5px] uppercase font-inter block mb-1">
          Ce qu&apos;on fait · ce qu&apos;on maîtrise
        </span>
        <h1 className="font-georgia text-[clamp(20px,2.5vw,30px)] font-bold text-white">
          Des services pensés pour{" "}
          <em className="text-ocre italic">chaque texture</em>
        </h1>
        <p className="text-white/45 text-[12px] max-w-lg mx-auto mt-1 leading-relaxed font-inter">
          Que tu veuilles des{" "}
          <strong className="text-ocre">tresses africaines</strong>, des{" "}
          <strong className="text-white">knotless braids</strong>, des locks ou
          un soin naturel — on a ce qu&apos;il te faut.{" "}
          <strong className="text-white">Réserve en ligne</strong>, on
          s&apos;occupe du reste.
        </p>
        <div className="flex justify-center gap-3 mt-3">
          <Link
            href={`/${locale}/reservation`}
            className="flex items-center gap-2 bg-ocre hover:bg-or text-white text-[9px] tracking-[3px] uppercase px-5 py-2.5 rounded-full transition-colors font-inter"
          >
            → Réserver maintenant
          </Link>
        </div>
      </div>

      {/* Split carousel */}
      <div className="flex flex-1 min-h-0 gap-4 p-4 pt-3">
        {/* Panneau gauche — pills */}
        <div className="w-[36%] bg-panneau rounded-2xl border border-ocre/20 p-6 flex flex-col justify-center gap-3 flex-shrink-0">
          <div className="text-[9px] tracking-[4px] uppercase text-white/35 font-inter mb-1">
            Choisir un service
          </div>
          {SERVICES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-full border text-[11px] tracking-[2px] uppercase font-inter text-left transition-all ${
                i === active
                  ? "bg-ocre border-ocre text-white"
                  : "border-white/15 text-white/65 hover:border-ocre/50 hover:text-white"
              }`}
            >
              <span className="text-base">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Panneau droit — photo + overlay */}
        <div className="flex-1 bg-panneau rounded-2xl border border-ocre/20 overflow-hidden relative">
          {SERVICES.map((s, i) => (
            <div
              key={s.id}
              className={`absolute inset-0 transition-all duration-700 ${
                i === active
                  ? "opacity-100"
                  : i === leaving
                    ? "opacity-0"
                    : "opacity-0"
              }`}
              style={{
                transform:
                  i === active
                    ? "perspective(1400px) rotateY(0deg)"
                    : i === leaving
                      ? "perspective(1400px) rotateY(-12deg)"
                      : "perspective(1400px) rotateY(8deg)",
                transformOrigin: "left center",
              }}
            >
              {/* Photo */}
              <Image
                src={s.image}
                alt={s.imageAlt}
                fill
                className="object-cover"
                sizes="55vw"
                priority={i === 0}
              />

              {/* Overlay gradient */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(10,4,0,0.15) 0%, rgba(10,4,0,0.5) 45%, rgba(10,4,0,0.95) 100%)",
                }}
              />

              {/* Contenu overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-7 z-10">
                <span className="inline-block bg-white/12 backdrop-blur-sm border border-white/20 text-white text-[9px] tracking-[3px] uppercase px-3 py-1.5 rounded-full mb-3">
                  {s.label}
                </span>
                <p className="font-georgia text-[15px] text-white leading-relaxed mb-2">
                  {s.subServices}
                </p>
                <p className="text-[10px] tracking-[3px] uppercase text-white/55 font-inter mb-4">
                  À partir de{" "}
                  <span className="text-ocre font-bold">
                    {s.price.replace("dès ", "")}
                  </span>
                </p>
                <Link
                  href={`/${locale}/reservation?service=${s.id}`}
                  className="inline-flex items-center gap-2 bg-white hover:bg-ocre text-nuit hover:text-white text-[10px] tracking-[3px] uppercase px-6 py-3 rounded-full font-bold transition-colors font-inter"
                >
                  → Réserver ce service
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2 : Mettre à jour app/[locale]/services/page.tsx**

```tsx
import ServicesPageClient from "@/components/sections/ServicesPageClient";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ServicesPageClient locale={locale} />;
}
```

- [ ] **Step 3 : Tester**

```bash
npm run dev
```

Ouvrir `http://localhost:3000/fr/services` — vérifier que :

- Tout tient en une vue sans scroll
- Cliquer sur une pill change la photo avec l'effet tourne-page
- Le bouton "Réserver ce service" redirige vers `/fr/reservation?service=knotless-braids`

- [ ] **Step 4 : Commit**

```bash
git add components/sections/ServicesPageClient.tsx app/\[locale\]/services/page.tsx
git commit -m "feat(services): redesign split pills + carousel tourne-page + overlay texte SEO"
```

---

## Task 7 : Page Réservation — ReservationLayout

**Files:**

- Create: `components/sections/ReservationLayout.tsx`
- Modify: `app/[locale]/reservation/page.tsx`

- [ ] **Step 1 : Créer ReservationLayout.tsx**

```tsx
"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

const SERVICES = [
  {
    id: "tresses-africaines",
    label: "Tresses africaines",
    subServices: "Box braids · Cornrows · Tribal braids · Tresse frontale",
    price: "150 MAD",
    image: "/images/s-tresse-fille1.png",
    imageAlt: "Tresses africaines salon Mimi Marrakech",
  },
  {
    id: "knotless-braids",
    label: "Knotless braids",
    subServices: "Knotless classiques · Jumbo · Avec couleur · Fini perles",
    price: "200 MAD",
    image: "/images/s-knotless.jpg",
    imageAlt: "Knotless braids Marrakech",
  },
  {
    id: "fulani-braids",
    label: "Fulani braids",
    subServices: "Classiques · Avec perles · Fils de couleur · Tribal",
    price: "180 MAD",
    image: "/images/s-fulani.jpg",
    imageAlt: "Fulani braids salon afro Marrakech",
  },
  {
    id: "boho-braids",
    label: "Boho braids",
    subServices: "Boho knotless · Avec frisures · Jumbo · Colorées",
    price: "220 MAD",
    image: "/images/s-boho.jpg",
    imageAlt: "Boho braids salon Mimi",
  },
  {
    id: "locks-dreads",
    label: "Locks & dreads",
    subServices: "Pose · Sisterlocks · Entretien · Retouche racines",
    price: "250 MAD",
    image: "/images/s-depart-locks.jpg",
    imageAlt: "Locks dreads Marrakech",
  },
];

interface Props {
  locale: string;
  labels: {
    name: string;
    phone: string;
    service: string;
    date: string;
    message: string;
    submit: string;
    success: string;
    error: string;
  };
}

export default function ReservationLayout({ locale, labels }: Props) {
  const searchParams = useSearchParams();
  const serviceParam = searchParams.get("service") ?? "tresses-africaines";

  const initialIndex = SERVICES.findIndex((s) => s.id === serviceParam);
  const [activeIndex, setActiveIndex] = useState(
    initialIndex >= 0 ? initialIndex : 0,
  );
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const activeSvc = SERVICES[activeIndex];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      service: activeSvc.label,
      date: (form.elements.namedItem("date") as HTMLInputElement).value,
      time: (form.elements.namedItem("time") as HTMLInputElement).value,
      persons: (form.elements.namedItem("persons") as HTMLSelectElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement)
        .value,
      locale,
    };
    try {
      const res = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError(labels.error);
    }
  }

  if (submitted) {
    return (
      <div className="h-screen flex items-center justify-center bg-nuit">
        <div className="text-center">
          <div className="text-ocre text-4xl mb-4">✦</div>
          <h2 className="font-georgia text-2xl text-white mb-3">
            {labels.success}
          </h2>
          <p className="text-white/50 text-sm font-inter">
            Confirmation par WhatsApp sous 24h.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-nuit overflow-hidden">
      {/* Espace nav fixe */}
      <div className="h-[57px] flex-shrink-0" />

      {/* Header compact */}
      <div className="flex-shrink-0 px-12 py-3 border-b border-ocre/10">
        <span className="text-ocre text-[9px] tracking-[4px] uppercase font-inter block mb-0.5">
          Réservation en ligne · Marrakech
        </span>
        <h1 className="font-georgia text-[clamp(18px,2vw,26px)] font-bold text-white">
          Réserve ton <em className="text-ocre italic">rendez-vous</em>
        </h1>
      </div>

      {/* Split */}
      <div className="flex flex-1 min-h-0 gap-4 p-4 pt-3">
        {/* Panneau gauche — formulaire */}
        <div className="w-[44%] bg-panneau rounded-2xl border border-ocre/20 p-6 flex-shrink-0 overflow-y-auto">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <div className="font-georgia text-[15px] font-bold text-white mb-0.5">
                Tes informations
              </div>
              <div className="text-[10px] text-white/35 font-inter tracking-wide">
                Tous les champs * sont obligatoires
              </div>
            </div>

            {/* Service — pré-rempli, modifiable */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] tracking-[2px] uppercase text-white/50 font-inter">
                Service <span className="text-ocre">*</span>
              </label>
              <select
                name="service"
                value={activeIndex}
                onChange={(e) => setActiveIndex(Number(e.target.value))}
                required
                className="bg-white/6 border border-white/12 focus:border-ocre rounded-xl text-white text-[13px] px-4 py-2.5 outline-none transition-colors font-inter appearance-none cursor-pointer"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                {SERVICES.map((s, i) => (
                  <option
                    key={s.id}
                    value={i}
                    style={{ background: "#2d1005" }}
                  >
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-px bg-ocre/15" />

            {/* Nom + Téléphone */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] tracking-[2px] uppercase text-white/50 font-inter">
                  Nom complet <span className="text-ocre">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  placeholder="Fatima Zahra..."
                  required
                  className="bg-white/6 border border-white/12 focus:border-ocre rounded-xl text-white text-[13px] px-4 py-2.5 outline-none transition-colors font-inter placeholder:text-white/25"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] tracking-[2px] uppercase text-white/50 font-inter">
                  Téléphone / WhatsApp <span className="text-ocre">*</span>
                </label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+212 6..."
                  required
                  className="bg-white/6 border border-white/12 focus:border-ocre rounded-xl text-white text-[13px] px-4 py-2.5 outline-none transition-colors font-inter placeholder:text-white/25"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
              </div>
            </div>

            <div className="h-px bg-ocre/15" />

            {/* Date + Heure */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] tracking-[2px] uppercase text-white/50 font-inter">
                  Date souhaitée <span className="text-ocre">*</span>
                </label>
                <input
                  name="date"
                  type="date"
                  required
                  className="bg-white/6 border border-white/12 focus:border-ocre rounded-xl text-white text-[13px] px-4 py-2.5 outline-none transition-colors font-inter"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] tracking-[2px] uppercase text-white/50 font-inter">
                  Heure souhaitée <span className="text-ocre">*</span>
                </label>
                <input
                  name="time"
                  type="time"
                  required
                  className="bg-white/6 border border-white/12 focus:border-ocre rounded-xl text-white text-[13px] px-4 py-2.5 outline-none transition-colors font-inter"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
              </div>
            </div>

            {/* Nombre de personnes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] tracking-[2px] uppercase text-white/50 font-inter">
                Nombre de personnes
              </label>
              <select
                name="persons"
                className="bg-white/6 border border-white/12 focus:border-ocre rounded-xl text-white text-[13px] px-4 py-2.5 outline-none transition-colors font-inter appearance-none"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <option style={{ background: "#2d1005" }}>1 personne</option>
                <option style={{ background: "#2d1005" }}>2 personnes</option>
                <option style={{ background: "#2d1005" }}>3 personnes</option>
                <option style={{ background: "#2d1005" }}>
                  4 personnes et +
                </option>
              </select>
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] tracking-[2px] uppercase text-white/50 font-inter">
                Message (optionnel)
              </label>
              <textarea
                name="message"
                rows={3}
                placeholder="Précisions sur le style, longueur souhaitée..."
                className="bg-white/6 border border-white/12 focus:border-ocre rounded-xl text-white text-[13px] px-4 py-2.5 outline-none transition-colors font-inter placeholder:text-white/25 resize-none"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
            </div>

            {error && (
              <p className="text-red-400 text-[12px] font-inter">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-ocre hover:bg-or text-white text-[11px] tracking-[3px] uppercase py-3.5 rounded-full transition-colors font-inter font-medium"
            >
              → Confirmer la réservation
            </button>

            <p className="text-center text-white/30 text-[10px] font-inter leading-relaxed">
              Confirmation par WhatsApp sous 24h · Aucun paiement requis
              maintenant
            </p>
          </form>
        </div>

        {/* Panneau droit — photo du service */}
        <div className="flex-1 bg-panneau rounded-2xl border border-ocre/20 overflow-hidden relative">
          {SERVICES.map((s, i) => (
            <div
              key={s.id}
              className="absolute inset-0 transition-opacity duration-500"
              style={{ opacity: i === activeIndex ? 1 : 0 }}
            >
              <Image
                src={s.image}
                alt={s.imageAlt}
                fill
                className="object-cover"
                sizes="50vw"
                priority={i === 0}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(10,4,0,0.92) 0%, rgba(10,4,0,0.5) 45%, rgba(10,4,0,0.12) 100%)",
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-7 z-10">
                <span className="inline-block bg-ocre/25 border border-ocre/40 text-ocre text-[9px] tracking-[3px] uppercase px-3 py-1.5 rounded-full mb-3">
                  {s.label}
                </span>
                <p className="font-georgia text-[15px] text-white leading-relaxed mb-2">
                  {s.subServices}
                </p>
                <p className="text-[10px] tracking-[3px] uppercase text-white/50 font-inter">
                  À partir de{" "}
                  <span className="text-ocre font-bold">{s.price}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2 : Mettre à jour app/[locale]/reservation/page.tsx**

```tsx
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import ReservationLayout from "@/components/sections/ReservationLayout";

export default async function ReservationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "booking" });

  const labels = {
    name: t("name"),
    phone: t("phone"),
    service: t("service"),
    date: t("date"),
    message: t("message"),
    submit: t("submit"),
    success: t("success"),
    error: t("error"),
  };

  return (
    <Suspense fallback={<div className="h-screen bg-nuit" />}>
      <ReservationLayout locale={locale} labels={labels} />
    </Suspense>
  );
}
```

Note : `useSearchParams()` exige que le composant soit enveloppé dans `<Suspense>` côté serveur.

- [ ] **Step 3 : Tester le passage de paramètre**

```bash
npm run dev
```

1. Aller sur `http://localhost:3000/fr/services`
2. Cliquer sur "Knotless braids" puis "→ Réserver ce service"
3. Vérifier que `/fr/reservation?service=knotless-braids` s'ouvre avec "Knotless braids" pré-sélectionné dans le select ET la photo correspondante à droite

- [ ] **Step 4 : Commit**

```bash
git add components/sections/ReservationLayout.tsx app/\[locale\]/reservation/page.tsx
git commit -m "feat(reservation): split formulaire/photo — service pré-rempli via query param"
```

---

## Task 8 : Build final + vérifications

- [ ] **Step 1 : Build de production**

```bash
cd /Users/Mouj/Desktop/salon-mimi && npm run build 2>&1 | tail -30
```

Résultat attendu : `✓ Compiled successfully`. Si erreurs TypeScript → corriger avant de continuer.

- [ ] **Step 2 : Checklist visuelle obligatoire**

Démarrer le serveur dev et vérifier chaque point :

```bash
npm run dev
```

| Page                                        | Vérification                                                                                          |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `/fr`                                       | Hero split visible, 3 colonnes scrollent, section localisation Jamaa El Fna présente, CTA fond sombre |
| `/fr/services`                              | Tout tient en 1 vue, pills fonctionnent, photo change avec effet tourne-page, overlay texte lisible   |
| `/fr/services` → clic "Réserver ce service" | Redirige vers `/fr/reservation?service=<id>`                                                          |
| `/fr/reservation`                           | Service pré-rempli, photo à droite correspond, changer le select change la photo                      |
| Nav                                         | Fixe avec blur, logo centré, bouton RDV ocre visible sur toutes les pages                             |

- [ ] **Step 3 : Vérifier le JSON-LD**

Ouvrir `http://localhost:3000/fr`, clic droit → Afficher le source, chercher `application/ld+json`. Le bloc doit contenir `"@type": "HairSalon"` avec l'adresse Jamaa El Fna.

- [ ] **Step 4 : Vérifier les balises alt**

```bash
grep -r 'imageAlt\|alt=' /Users/Mouj/Desktop/salon-mimi/components/sections/HeroHome.tsx \
  /Users/Mouj/Desktop/salon-mimi/components/sections/ServicesPageClient.tsx \
  /Users/Mouj/Desktop/salon-mimi/components/sections/ReservationLayout.tsx
```

Toutes les images doivent avoir un alt descriptif contenant "Marrakech" ou le type de coiffure.

- [ ] **Step 5 : Commit final**

```bash
git add -A
git commit -m "feat: redesign complet Home + Services + Réservation — Bold & Culture, SEO Jamaa El Fna"
```

---

## Self-Review — Couverture de la spec

| Exigence spec                               | Tâche                 |
| ------------------------------------------- | --------------------- |
| Palette #1a0d05 / #3d1a06 / ocre / or       | Task 1                |
| Typographie Georgia + Inter                 | Task 1                |
| Animations scroll infini 3 colonnes         | Task 1 (CSS) + Task 3 |
| Nav fixe blur, logo centré, bouton RDV      | Task 2                |
| Hero split 50/50, accroche, 2 CTA           | Task 3                |
| Grille photos scroll infini                 | Task 3                |
| Section localisation Jamaa El Fna           | Task 4                |
| JSON-LD LocalBusiness                       | Task 4                |
| CTA bas de home fond sombre                 | Task 5                |
| Page Services hero compact                  | Task 6                |
| Page Services pills + carousel tourne-page  | Task 6                |
| Overlay texte sous-services + prix + bouton | Task 6                |
| Auto-avance 4.5s                            | Task 6                |
| Page Réservation split formulaire/photo     | Task 7                |
| Service pré-rempli via query param          | Task 7                |
| Suspense pour useSearchParams               | Task 7                |
| Balises alt SEO sur toutes les images       | Tasks 3, 6, 7         |
| Build sans erreur                           | Task 8                |
| Checklist visuelle manuelle                 | Task 8                |
