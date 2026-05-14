# Salon Mimi — Plan 2 : Site public

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Prérequis :** Plan 1 terminé et validé (projet scaffoldé, Supabase configuré, Railway déployé).

**Goal:** Construire toutes les pages publiques du site — Accueil, Services, Galerie, À propos, Contact, Réservation — en FR/EN/ES avec design afro-luxe.

**Architecture:** Pages Next.js App Router sous `app/[locale]/`. Chaque page est un Server Component qui importe des sections réutilisables depuis `components/sections/`. Les données de services sont dans un fichier de données statique `lib/services-data.ts`. Le formulaire de réservation est un Client Component qui appelle `POST /api/reservations` puis redirige vers WhatsApp.

**Tech Stack:** Next.js 14 App Router, Tailwind CSS, next-intl, TypeScript

---

## Structure des fichiers créés dans ce plan

```
components/
├── sections/
│   ├── Hero.tsx              # Section hero plein écran
│   ├── TrustBadge.tsx        # Bandeau confiance 3 éléments
│   ├── ServicesGrid.tsx      # Grille de cartes services
│   ├── PackageSignature.tsx  # Carte package Boho Experience
│   ├── GalleryGrid.tsx       # Grille photos
│   └── CTAFinal.tsx          # Bloc CTA fond ocre
├── ui/
│   ├── ServiceCard.tsx       # Carte service (réutilisable)
│   ├── Badge.tsx             # Badge statut/catégorie
│   └── WhatsAppButton.tsx    # Bouton WhatsApp flottant
lib/
└── services-data.ts          # Données services (prix, durées)
app/[locale]/
├── page.tsx                  # Accueil (assemblage sections)
├── services/page.tsx         # Menu complet
├── galerie/page.tsx          # Galerie photos/vidéos
├── reservation/page.tsx      # Formulaire réservation
├── a-propos/page.tsx         # Histoire Mimi
└── contact/page.tsx          # Adresse, carte, horaires
```

---

### Task 1 : Données statiques des services

**Files:**

- Create: `lib/services-data.ts`

- [ ] **Step 1 : Créer lib/services-data.ts**

```typescript
// lib/services-data.ts

export interface Service {
  id: string;
  category: "tresses" | "locks" | "soins";
  nameFr: string;
  nameEn: string;
  nameEs: string;
  durationFr: string;
  durationEn: string;
  durationEs: string;
  priceMad: number;
  priceEur: number;
  featured?: boolean;
}

export const services: Service[] = [
  // TRESSES
  {
    id: "box-braids-medium",
    category: "tresses",
    nameFr: "Box Braids medium",
    nameEn: "Box Braids medium",
    nameEs: "Box Braids medianas",
    durationFr: "3–4h",
    durationEn: "3–4h",
    durationEs: "3–4h",
    priceMad: 550,
    priceEur: 52,
    featured: true,
  },
  {
    id: "box-braids-xl",
    category: "tresses",
    nameFr: "Box Braids XL / épaisse",
    nameEn: "Box Braids XL / thick",
    nameEs: "Box Braids XL / gruesas",
    durationFr: "2–3h",
    durationEn: "2–3h",
    durationEs: "2–3h",
    priceMad: 450,
    priceEur: 42,
  },
  {
    id: "knotless-braids",
    category: "tresses",
    nameFr: "Knotless Braids",
    nameEn: "Knotless Braids",
    nameEs: "Knotless Braids",
    durationFr: "4–5h",
    durationEn: "4–5h",
    durationEs: "4–5h",
    priceMad: 700,
    priceEur: 66,
    featured: true,
  },
  {
    id: "boho-braids",
    category: "tresses",
    nameFr: "Boho / Goddess Braids",
    nameEn: "Boho / Goddess Braids",
    nameEs: "Boho / Goddess Braids",
    durationFr: "3–4h",
    durationEn: "3–4h",
    durationEs: "3–4h",
    priceMad: 650,
    priceEur: 61,
    featured: true,
  },
  {
    id: "fulani-braids",
    category: "tresses",
    nameFr: "Fulani Braids + perles cauris",
    nameEn: "Fulani Braids + cowrie shells",
    nameEs: "Fulani Braids + perlas cauri",
    durationFr: "2–3h",
    durationEn: "2–3h",
    durationEs: "2–3h",
    priceMad: 500,
    priceEur: 47,
  },
  {
    id: "cornrows",
    category: "tresses",
    nameFr: "Cornrows full head",
    nameEn: "Cornrows full head",
    nameEs: "Cornrows cabeza completa",
    durationFr: "1–2h",
    durationEn: "1–2h",
    durationEs: "1–2h",
    priceMad: 300,
    priceEur: 28,
    featured: true,
  },
  {
    id: "mini-braids-enfant",
    category: "tresses",
    nameFr: "Mini braids enfant",
    nameEn: "Mini braids children",
    nameEs: "Mini trenzas niñas",
    durationFr: "1–2h",
    durationEn: "1–2h",
    durationEs: "1–2h",
    priceMad: 200,
    priceEur: 19,
  },
  // LOCKS & TWISTS
  {
    id: "depart-locks",
    category: "locks",
    nameFr: "Départ de locks (twist)",
    nameEn: "Starter locs (twist)",
    nameEs: "Inicio de rastas (twist)",
    durationFr: "4–6h",
    durationEn: "4–6h",
    durationEs: "4–6h",
    priceMad: 900,
    priceEur: 85,
  },
  {
    id: "retouche-locks",
    category: "locks",
    nameFr: "Retouche locks",
    nameEn: "Locs retouch",
    nameEs: "Retoque rastas",
    durationFr: "2–3h",
    durationEn: "2–3h",
    durationEs: "2–3h",
    priceMad: 450,
    priceEur: 42,
  },
  {
    id: "faux-locks",
    category: "locks",
    nameFr: "Faux Locks / Bohemian Locks",
    nameEn: "Faux Locs / Bohemian Locs",
    nameEs: "Faux Locks / Bohemian Locks",
    durationFr: "3–5h",
    durationEn: "3–5h",
    durationEs: "3–5h",
    priceMad: 750,
    priceEur: 71,
  },
  {
    id: "marley-twists",
    category: "locks",
    nameFr: "Marley Twists",
    nameEn: "Marley Twists",
    nameEs: "Marley Twists",
    durationFr: "3–4h",
    durationEn: "3–4h",
    durationEs: "3–4h",
    priceMad: 600,
    priceEur: 57,
  },
  {
    id: "crochet-braids",
    category: "locks",
    nameFr: "Crochet Braids",
    nameEn: "Crochet Braids",
    nameEs: "Crochet Braids",
    durationFr: "2–3h",
    durationEn: "2–3h",
    durationEs: "2–3h",
    priceMad: 500,
    priceEur: 47,
  },
  // SOINS
  {
    id: "brushing-argan",
    category: "soins",
    nameFr: "Brushing naturel argan",
    nameEn: "Natural argan blowout",
    nameEs: "Brushing natural argán",
    durationFr: "—",
    durationEn: "—",
    durationEs: "—",
    priceMad: 200,
    priceEur: 19,
  },
  {
    id: "soin-argan",
    category: "soins",
    nameFr: "Soin argan seul",
    nameEn: "Argan treatment only",
    nameEs: "Tratamiento argán solo",
    durationFr: "1h",
    durationEn: "1h",
    durationEs: "1h",
    priceMad: 150,
    priceEur: 14,
  },
];

export const packages = [
  {
    id: "boho-experience",
    nameFr: "Boho Experience",
    nameEn: "Boho Experience",
    nameEs: "Boho Experience",
    descFr:
      "Boho Braids + soin argan + photobooth instagrammable + thé à la menthe offert",
    descEn:
      "Boho Braids + argan treatment + instagrammable photobooth + mint tea included",
    descEs:
      "Boho Braids + tratamiento argán + photobooth instagrammable + té de menta incluido",
    durationFr: "4h",
    durationEn: "4h",
    durationEs: "4h",
    priceMad: 850,
    priceEur: 80,
  },
  {
    id: "faux-locks-perles",
    nameFr: "Faux Locks + bijoux perles",
    nameEn: "Faux Locs + pearl jewelry",
    nameEs: "Faux Locks + bisutería perlas",
    descFr:
      "Faux Locks + bijoux perles cauris + soin hydratant + thé à la menthe offert",
    descEn:
      "Faux Locs + cowrie pearl jewelry + hydrating treatment + mint tea included",
    descEs:
      "Faux Locks + bisutería cauri + tratamiento hidratante + té de menta incluido",
    durationFr: "5h",
    durationEn: "5h",
    durationEs: "5h",
    priceMad: 950,
    priceEur: 89,
  },
];

export function getServiceName(service: Service, locale: string): string {
  if (locale === "en") return service.nameEn;
  if (locale === "es") return service.nameEs;
  return service.nameFr;
}

export function getServiceDuration(service: Service, locale: string): string {
  if (locale === "en") return service.durationEn;
  if (locale === "es") return service.durationEs;
  return service.durationFr;
}
```

- [ ] **Step 2 : Commit**

```bash
git add lib/services-data.ts
git commit -m "feat: données statiques services et packages Salon Mimi"
```

---

### Task 2 : Composants UI de base

**Files:**

- Create: `components/ui/ServiceCard.tsx`
- Create: `components/ui/Badge.tsx`
- Create: `components/ui/WhatsAppButton.tsx`

- [ ] **Step 1 : Créer components/ui/Badge.tsx**

```typescript
// components/ui/Badge.tsx
interface BadgeProps {
  children: React.ReactNode;
  variant?: "vert" | "ocre" | "or";
}

export default function Badge({ children, variant = "vert" }: BadgeProps) {
  const styles = {
    vert: "bg-vert/10 text-vert border border-vert/20",
    ocre: "bg-ocre/10 text-ocre border border-ocre/20",
    or: "bg-or/10 text-brun border border-or/30",
  };
  return (
    <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${styles[variant]}`}>
      {children}
    </span>
  );
}
```

- [ ] **Step 2 : Créer components/ui/ServiceCard.tsx**

```typescript
// components/ui/ServiceCard.tsx
import Link from "next/link";

interface ServiceCardProps {
  name: string;
  duration: string;
  priceMad: number;
  priceEur: number;
  serviceId: string;
  locale: string;
  bookLabel: string;
}

export default function ServiceCard({
  name,
  duration,
  priceMad,
  priceEur,
  serviceId,
  locale,
  bookLabel,
}: ServiceCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-or/20 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="font-playfair text-lg text-brun mb-2">{name}</h3>
      {duration !== "—" && (
        <p className="text-sm text-gray-500 mb-4">{duration}</p>
      )}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-2xl font-bold text-vert">{priceMad} MAD</span>
        <span className="text-sm text-gray-400">~{priceEur}€</span>
      </div>
      <Link
        href={`/${locale}/reservation?service=${encodeURIComponent(serviceId)}`}
        className="block text-center bg-ocre text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-or transition-colors"
      >
        {bookLabel}
      </Link>
    </div>
  );
}
```

- [ ] **Step 3 : Créer components/ui/WhatsAppButton.tsx**

```typescript
// components/ui/WhatsAppButton.tsx
"use client";

interface WhatsAppButtonProps {
  number: string;
  label?: string;
}

export default function WhatsAppButton({
  number,
  label = "WhatsApp",
}: WhatsAppButtonProps) {
  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-[#128C7E] transition-colors font-medium"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.558 4.116 1.535 5.845L.057 23.5l5.784-1.517A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.651-.51-5.168-1.402l-.371-.22-3.834 1.006 1.023-3.742-.242-.385A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
      </svg>
      {label}
    </a>
  );
}
```

- [ ] **Step 4 : Commit**

```bash
git add components/ui/
git commit -m "feat: composants UI Badge, ServiceCard, WhatsAppButton"
```

---

### Task 3 : Page Accueil

**Files:**

- Create: `components/sections/Hero.tsx`
- Create: `components/sections/TrustBadge.tsx`
- Create: `components/sections/PackageSignature.tsx`
- Create: `components/sections/CTAFinal.tsx`
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1 : Créer components/sections/Hero.tsx**

```typescript
// components/sections/Hero.tsx
import Link from "next/link";

interface HeroProps {
  locale: string;
  title: string;
  subtitle: string;
  location: string;
  ctaBook: string;
  ctaServices: string;
}

export default function Hero({
  locale,
  title,
  subtitle,
  location,
  ctaBook,
  ctaServices,
}: HeroProps) {
  return (
    <section className="relative bg-nuit min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url('/images/hero-salon.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-nuit/60 via-nuit/40 to-nuit/80" />
      <div className="relative z-10 text-center text-white px-4 max-w-3xl mx-auto">
        <p className="text-or text-sm tracking-widest uppercase mb-4">{location}</p>
        <h1 className="font-playfair text-5xl md:text-7xl font-bold text-or mb-4">
          {title}
        </h1>
        <p className="font-playfair text-2xl md:text-3xl italic text-white/80 mb-10">
          {subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/${locale}/reservation`}
            className="bg-ocre text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-or transition-colors"
          >
            {ctaBook}
          </Link>
          <Link
            href={`/${locale}/services`}
            className="border-2 border-white/40 text-white px-8 py-4 rounded-full font-medium text-lg hover:border-or hover:text-or transition-colors"
          >
            {ctaServices}
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2 : Créer components/sections/TrustBadge.tsx**

```typescript
// components/sections/TrustBadge.tsx
interface TrustBadgeProps {
  locale: string;
}

const items = {
  fr: [
    { icon: "⭐", text: "5/5 sur Google" },
    { icon: "📍", text: "Médina de Marrakech" },
    { icon: "🌿", text: "Produits locaux 100% naturels" },
  ],
  en: [
    { icon: "⭐", text: "5/5 on Google" },
    { icon: "📍", text: "Marrakech Medina" },
    { icon: "🌿", text: "100% natural local products" },
  ],
  es: [
    { icon: "⭐", text: "5/5 en Google" },
    { icon: "📍", text: "Medina de Marrakech" },
    { icon: "🌿", text: "Productos locales 100% naturales" },
  ],
};

export default function TrustBadge({ locale }: TrustBadgeProps) {
  const data = items[locale as keyof typeof items] ?? items.fr;
  return (
    <section className="bg-nuit py-6">
      <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-8">
        {data.map((item) => (
          <div key={item.text} className="flex items-center gap-3 text-white">
            <span className="text-2xl">{item.icon}</span>
            <span className="text-sm font-medium">{item.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3 : Créer components/sections/PackageSignature.tsx**

```typescript
// components/sections/PackageSignature.tsx
import Link from "next/link";
import { packages } from "@/lib/services-data";

interface PackageSignatureProps {
  locale: string;
  bookLabel: string;
}

export default function PackageSignature({ locale, bookLabel }: PackageSignatureProps) {
  const pkg = packages[0];
  const name = locale === "en" ? pkg.nameEn : locale === "es" ? pkg.nameEs : pkg.nameFr;
  const desc = locale === "en" ? pkg.descEn : locale === "es" ? pkg.descEs : pkg.descFr;

  return (
    <section className="py-16 px-4 bg-fond">
      <div className="max-w-3xl mx-auto">
        <div className="bg-nuit rounded-3xl p-10 text-white relative overflow-hidden">
          <div className="absolute top-4 right-6 text-6xl opacity-10 font-playfair">✦</div>
          <span className="text-xs uppercase tracking-widest text-or">Package signature</span>
          <h2 className="font-playfair text-3xl text-or mt-2 mb-4">{name}</h2>
          <p className="text-white/70 mb-6">{desc}</p>
          <div className="flex items-baseline gap-3 mb-8">
            <span className="text-4xl font-bold text-or">{pkg.priceMad} MAD</span>
            <span className="text-white/50">~{pkg.priceEur}€</span>
            <span className="text-white/40 text-sm">· {pkg.durationFr}</span>
          </div>
          <Link
            href={`/${locale}/reservation?service=${pkg.id}`}
            className="inline-block bg-ocre text-white px-8 py-3 rounded-full font-medium hover:bg-or transition-colors"
          >
            {bookLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4 : Créer components/sections/CTAFinal.tsx**

```typescript
// components/sections/CTAFinal.tsx
import Link from "next/link";

interface CTAFinalProps {
  locale: string;
  title: string;
  ctaBook: string;
  whatsappNumber: string;
}

export default function CTAFinal({ locale, title, ctaBook, whatsappNumber }: CTAFinalProps) {
  return (
    <section className="bg-ocre py-20 px-4 text-center">
      <h2 className="font-playfair text-4xl text-white mb-8">{title}</h2>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href={`/${locale}/reservation`}
          className="bg-white text-ocre px-8 py-4 rounded-full font-medium text-lg hover:bg-fond transition-colors"
        >
          {ctaBook}
        </Link>
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="border-2 border-white text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-white hover:text-ocre transition-colors"
        >
          WhatsApp
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 5 : Mettre à jour app/[locale]/page.tsx**

```typescript
// app/[locale]/page.tsx
import { getTranslations } from "next-intl/server";
import Hero from "@/components/sections/Hero";
import TrustBadge from "@/components/sections/TrustBadge";
import ServicesGrid from "@/components/sections/ServicesGrid";
import PackageSignature from "@/components/sections/PackageSignature";
import CTAFinal from "@/components/sections/CTAFinal";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { services } from "@/lib/services-data";

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "hero" });
  const tBooking = await getTranslations({ locale, namespace: "booking" });
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER!;

  const featuredServices = services.filter((s) => s.featured);

  return (
    <>
      <Hero
        locale={locale}
        title={t("title")}
        subtitle={t("subtitle")}
        location={t("location")}
        ctaBook={t("cta_book")}
        ctaServices={t("cta_services")}
      />
      <TrustBadge locale={locale} />
      <ServicesGrid
        services={featuredServices}
        locale={locale}
        bookLabel={tBooking("submit")}
        showAll={false}
      />
      <PackageSignature locale={locale} bookLabel={t("cta_book")} />
      <CTAFinal
        locale={locale}
        title={locale === "en" ? "Ready for your transformation?" : locale === "es" ? "¿Lista para tu transformación?" : "Prête pour votre transformation ?"}
        ctaBook={t("cta_book")}
        whatsappNumber={whatsappNumber}
      />
      <WhatsAppButton number={whatsappNumber} label="WhatsApp" />
    </>
  );
}
```

- [ ] **Step 6 : Créer components/sections/ServicesGrid.tsx**

```typescript
// components/sections/ServicesGrid.tsx
import ServiceCard from "@/components/ui/ServiceCard";
import { Service, getServiceName, getServiceDuration } from "@/lib/services-data";

interface ServicesGridProps {
  services: Service[];
  locale: string;
  bookLabel: string;
  showAll?: boolean;
}

export default function ServicesGrid({ services, locale, bookLabel, showAll = true }: ServicesGridProps) {
  const title = {
    fr: showAll ? "Tous nos services" : "Services vedettes",
    en: showAll ? "All services" : "Featured services",
    es: showAll ? "Todos los servicios" : "Servicios destacados",
  }[locale] ?? "Services";

  return (
    <section className="py-16 px-4 bg-fond">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-playfair text-3xl text-brun text-center mb-12">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              name={getServiceName(service, locale)}
              duration={getServiceDuration(service, locale)}
              priceMad={service.priceMad}
              priceEur={service.priceEur}
              serviceId={service.id}
              locale={locale}
              bookLabel={bookLabel}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 7 : Tester la page d'accueil**

```bash
npm run dev
```

Ouvrir `http://localhost:3000/fr` — vérifier :

- Hero plein écran avec titre en or
- Bandeau de confiance fond nuit
- Grille des 4 services vedettes
- Package signature fond nuit
- CTA fond ocre avec bouton WhatsApp
- Bouton WhatsApp flottant en bas à droite

- [ ] **Step 8 : Commit**

```bash
git add components/ app/\[locale\]/page.tsx
git commit -m "feat: page accueil avec Hero, TrustBadge, Services, Package, CTA"
```

---

### Task 4 : Page Services

**Files:**

- Create: `app/[locale]/services/page.tsx`

- [ ] **Step 1 : Créer app/[locale]/services/page.tsx**

```typescript
// app/[locale]/services/page.tsx
import { getTranslations } from "next-intl/server";
import { services, packages, getServiceName, getServiceDuration } from "@/lib/services-data";
import ServiceCard from "@/components/ui/ServiceCard";
import Link from "next/link";

const categoryLabels: Record<string, Record<string, string>> = {
  fr: { tresses: "Tresses", locks: "Locks & Twists", soins: "Soins & Packages" },
  en: { tresses: "Braids", locks: "Locks & Twists", soins: "Treatments & Packages" },
  es: { tresses: "Trenzas", locks: "Locks & Twists", soins: "Tratamientos y Paquetes" },
};

export default async function ServicesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const tBooking = await getTranslations({ locale, namespace: "booking" });
  const labels = categoryLabels[locale] ?? categoryLabels.fr;
  const categories = ["tresses", "locks", "soins"] as const;

  return (
    <div className="bg-fond min-h-screen">
      <div className="bg-nuit py-16 text-center">
        <h1 className="font-playfair text-5xl text-or">
          {locale === "en" ? "Services & Prices" : locale === "es" ? "Servicios & Precios" : "Services & Tarifs"}
        </h1>
        <p className="text-white/60 mt-3">
          {locale === "en" ? "All prices include products and accessories" : locale === "es" ? "Todos los precios incluyen productos y accesorios" : "Tous les prix incluent les produits et accessoires"}
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {categories.map((cat) => {
          const catServices = services.filter((s) => s.category === cat);
          if (cat === "soins") {
            return (
              <div key={cat} className="mb-16">
                <h2 className="font-playfair text-3xl text-brun mb-8 pb-3 border-b-2 border-or/30">
                  {labels[cat]}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  {catServices.map((service) => (
                    <ServiceCard
                      key={service.id}
                      name={getServiceName(service, locale)}
                      duration={getServiceDuration(service, locale)}
                      priceMad={service.priceMad}
                      priceEur={service.priceEur}
                      serviceId={service.id}
                      locale={locale}
                      bookLabel={tBooking("submit")}
                    />
                  ))}
                </div>
                <h3 className="font-playfair text-2xl text-brun mb-6">Packages</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {packages.map((pkg) => {
                    const name = locale === "en" ? pkg.nameEn : locale === "es" ? pkg.nameEs : pkg.nameFr;
                    const desc = locale === "en" ? pkg.descEn : locale === "es" ? pkg.descEs : pkg.descFr;
                    return (
                      <div key={pkg.id} className="bg-nuit rounded-2xl p-8 text-white">
                        <h4 className="font-playfair text-xl text-or mb-3">{name}</h4>
                        <p className="text-white/70 text-sm mb-4">{desc}</p>
                        <div className="flex items-baseline gap-2 mb-6">
                          <span className="text-3xl font-bold text-or">{pkg.priceMad} MAD</span>
                          <span className="text-white/50">~{pkg.priceEur}€</span>
                          <span className="text-white/40 text-sm">· {pkg.durationFr}</span>
                        </div>
                        <Link
                          href={`/${locale}/reservation?service=${pkg.id}`}
                          className="inline-block bg-ocre text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-or transition-colors"
                        >
                          {tBooking("submit")}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }
          return (
            <div key={cat} className="mb-16">
              <h2 className="font-playfair text-3xl text-brun mb-8 pb-3 border-b-2 border-or/30">
                {labels[cat]}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {catServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    name={getServiceName(service, locale)}
                    duration={getServiceDuration(service, locale)}
                    priceMad={service.priceMad}
                    priceEur={service.priceEur}
                    serviceId={service.id}
                    locale={locale}
                    bookLabel={tBooking("submit")}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2 : Tester la page services**

```bash
npm run dev
```

Ouvrir `http://localhost:3000/fr/services` — vérifier :

- Toutes les catégories s'affichent (Tresses, Locks, Soins & Packages)
- Prix MAD et € visibles
- Bouton "Réserver" sur chaque carte

- [ ] **Step 3 : Commit**

```bash
git add app/\[locale\]/services/
git commit -m "feat: page Services & Tarifs avec toutes les catégories"
```

---

### Task 5 : Page Réservation

**Files:**

- Create: `app/[locale]/reservation/page.tsx`
- Create: `components/sections/ReservationForm.tsx`

- [ ] **Step 1 : Créer components/sections/ReservationForm.tsx**

```typescript
// components/sections/ReservationForm.tsx
"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { services, packages, getServiceName } from "@/lib/services-data";
import { generateWhatsAppLink } from "@/lib/whatsapp";

interface ReservationFormProps {
  locale: string;
  labels: {
    title: string;
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

const allServiceOptions = [
  ...services,
  ...packages.map((p) => ({
    id: p.id,
    nameFr: p.nameFr,
    nameEn: p.nameEn,
    nameEs: p.nameEs,
  })),
];

export default function ReservationForm({ locale, labels }: ReservationFormProps) {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [form, setForm] = useState({
    nom: "",
    telephone: "",
    service: searchParams.get("service") ?? "",
    date_souhaitee: "",
    message: "",
  });

  useEffect(() => {
    const serviceParam = searchParams.get("service");
    if (serviceParam) setForm((f) => ({ ...f, service: serviceParam }));
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      setStatus("error");
      return;
    }

    setStatus("success");

    const selectedService = allServiceOptions.find((s) => s.id === form.service);
    const serviceName = selectedService
      ? getServiceName(selectedService as any, locale)
      : form.service;

    const waLink = generateWhatsAppLink({
      nom: form.nom,
      telephone: form.telephone,
      service: serviceName,
      dateSouhaitee: form.date_souhaitee,
      message: form.message,
    });

    setTimeout(() => window.open(waLink, "_blank"), 1000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-brun mb-2">{labels.name} *</label>
        <input
          type="text"
          required
          value={form.nom}
          onChange={(e) => setForm({ ...form, nom: e.target.value })}
          className="w-full border border-or/30 rounded-xl px-4 py-3 focus:outline-none focus:border-ocre bg-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-brun mb-2">{labels.phone} *</label>
        <input
          type="tel"
          required
          value={form.telephone}
          onChange={(e) => setForm({ ...form, telephone: e.target.value })}
          className="w-full border border-or/30 rounded-xl px-4 py-3 focus:outline-none focus:border-ocre bg-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-brun mb-2">{labels.service} *</label>
        <select
          required
          value={form.service}
          onChange={(e) => setForm({ ...form, service: e.target.value })}
          className="w-full border border-or/30 rounded-xl px-4 py-3 focus:outline-none focus:border-ocre bg-white"
        >
          <option value="">—</option>
          {allServiceOptions.map((s) => (
            <option key={s.id} value={s.id}>
              {getServiceName(s as any, locale)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-brun mb-2">{labels.date}</label>
        <input
          type="date"
          value={form.date_souhaitee}
          onChange={(e) => setForm({ ...form, date_souhaitee: e.target.value })}
          className="w-full border border-or/30 rounded-xl px-4 py-3 focus:outline-none focus:border-ocre bg-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-brun mb-2">{labels.message}</label>
        <textarea
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full border border-or/30 rounded-xl px-4 py-3 focus:outline-none focus:border-ocre bg-white resize-none"
        />
      </div>

      {status === "success" && (
        <p className="text-vert font-medium text-center">{labels.success}</p>
      )}
      {status === "error" && (
        <p className="text-red-600 font-medium text-center">{labels.error}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-ocre text-white py-4 rounded-full font-medium text-lg hover:bg-or transition-colors disabled:opacity-50"
      >
        {status === "loading" ? "..." : labels.submit}
      </button>
    </form>
  );
}
```

- [ ] **Step 2 : Créer app/[locale]/reservation/page.tsx**

```typescript
// app/[locale]/reservation/page.tsx
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import ReservationForm from "@/components/sections/ReservationForm";

export default async function ReservationPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "booking" });

  const labels = {
    title: t("title"),
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
    <div className="bg-fond min-h-screen">
      <div className="bg-nuit py-16 text-center">
        <h1 className="font-playfair text-5xl text-or">{labels.title}</h1>
      </div>
      <div className="max-w-xl mx-auto px-4 py-16">
        <Suspense>
          <ReservationForm locale={locale} labels={labels} />
        </Suspense>
      </div>
    </div>
  );
}
```

- [ ] **Step 3 : Tester la page réservation**

```bash
npm run dev
```

Ouvrir `http://localhost:3000/fr/reservation` — vérifier :

- Formulaire complet s'affiche
- Remplir les champs, soumettre → success message
- WhatsApp s'ouvre avec le message pré-rempli
- Vérifier dans Supabase Table Editor qu'une ligne a été créée

- [ ] **Step 4 : Commit**

```bash
git add app/\[locale\]/reservation/ components/sections/ReservationForm.tsx
git commit -m "feat: page Réservation formulaire Supabase + redirect WhatsApp"
```

---

### Task 6 : Pages Galerie, À propos, Contact

**Files:**

- Create: `app/[locale]/galerie/page.tsx`
- Create: `app/[locale]/a-propos/page.tsx`
- Create: `app/[locale]/contact/page.tsx`

- [ ] **Step 1 : Créer app/[locale]/galerie/page.tsx**

```typescript
// app/[locale]/galerie/page.tsx
import Image from "next/image";

const images = [
  { src: "/images/coiffure-1.jpg", alt: "Box Braids Salon Mimi Marrakech" },
  { src: "/images/coiffure-2.jpg", alt: "Knotless Braids Marrakech" },
  { src: "/images/coiffure-3.jpg", alt: "Boho Braids Médina Marrakech" },
  { src: "/images/salon-interieur.jpg", alt: "Intérieur Salon Mimi" },
];

const titles: Record<string, string> = {
  fr: "Galerie",
  en: "Gallery",
  es: "Galería",
};

export default function GaleriePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <div className="bg-fond min-h-screen">
      <div className="bg-nuit py-16 text-center">
        <h1 className="font-playfair text-5xl text-or">{titles[locale] ?? "Galerie"}</h1>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img) => (
            <div key={img.src} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-200">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2 : Créer app/[locale]/a-propos/page.tsx**

```typescript
// app/[locale]/a-propos/page.tsx
const content: Record<string, { title: string; body: string[] }> = {
  fr: {
    title: "À propos de Salon Mimi",
    body: [
      "Salon Mimi est né d'une passion pour les coiffures africaines et d'une vision : offrir à chaque cliente une transformation authentique au cœur de la médina de Marrakech.",
      "Mimi, coiffeuse ivoirienne installée à Marrakech, marie les techniques traditionnelles africaines avec une touche contemporaine. Chaque tresse raconte une histoire, chaque soin respecte les cheveux naturels.",
      "Tous nos produits sont locaux et naturels : huile d'argan du Souss, karité du Mali, eau de rose de la vallée du Dadès, henné du sud marocain. Vos cheveux méritent le meilleur du terroir africain et marocain.",
    ],
  },
  en: {
    title: "About Salon Mimi",
    body: [
      "Salon Mimi was born from a passion for African hairstyles and a vision: to offer every client an authentic transformation in the heart of Marrakech's medina.",
      "Mimi, an Ivorian hairstylist based in Marrakech, blends traditional African techniques with a contemporary touch. Every braid tells a story, every treatment respects natural hair.",
      "All our products are local and natural: argan oil from the Souss region, shea butter from Mali, rose water from the Dadès valley, henna from southern Morocco. Your hair deserves the best of African and Moroccan terroir.",
    ],
  },
  es: {
    title: "Sobre el Salon Mimi",
    body: [
      "El Salon Mimi nació de una pasión por los peinados africanos y una visión: ofrecer a cada clienta una transformación auténtica en el corazón de la medina de Marrakech.",
      "Mimi, peluquera marfileña establecida en Marrakech, combina las técnicas africanas tradicionales con un toque contemporáneo. Cada trenza cuenta una historia, cada tratamiento respeta el cabello natural.",
      "Todos nuestros productos son locales y naturales: aceite de argán del Souss, manteca de karité de Mali, agua de rosas del valle del Dadès, henna del sur de Marruecos.",
    ],
  },
};

export default function AProposPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const data = content[locale] ?? content.fr;

  return (
    <div className="bg-fond min-h-screen">
      <div className="bg-nuit py-16 text-center">
        <h1 className="font-playfair text-5xl text-or">{data.title}</h1>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
        {data.body.map((para, i) => (
          <p key={i} className="text-brun text-lg leading-relaxed">
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3 : Créer app/[locale]/contact/page.tsx**

```typescript
// app/[locale]/contact/page.tsx
const content: Record<string, { title: string; address: string; hours: string; hoursDetail: string }> = {
  fr: {
    title: "Contact & Accès",
    address: "Médina de Marrakech, Maroc",
    hours: "Horaires",
    hoursDetail: "Lundi – Samedi : 9h – 19h",
  },
  en: {
    title: "Contact & Location",
    address: "Medina of Marrakech, Morocco",
    hours: "Opening hours",
    hoursDetail: "Monday – Saturday: 9am – 7pm",
  },
  es: {
    title: "Contacto y Ubicación",
    address: "Medina de Marrakech, Marruecos",
    hours: "Horario",
    hoursDetail: "Lunes – Sábado: 9h – 19h",
  },
};

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

export default function ContactPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const data = content[locale] ?? content.fr;

  return (
    <div className="bg-fond min-h-screen">
      <div className="bg-nuit py-16 text-center">
        <h1 className="font-playfair text-5xl text-or">{data.title}</h1>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">
        <div className="bg-white rounded-2xl p-8 border border-or/20">
          <p className="text-xl font-playfair text-brun mb-2">📍 {data.address}</p>
          <p className="text-brun mt-4 font-medium">{data.hours}</p>
          <p className="text-gray-600">{data.hoursDetail}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-[#25D366] text-white text-center py-4 rounded-full font-medium hover:bg-[#128C7E] transition-colors"
          >
            WhatsApp
          </a>
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-4 rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            Instagram
          </a>
        </div>
        <div className="rounded-2xl overflow-hidden h-64 bg-gray-200">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3397.3!2d-7.989!3d31.628!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDM3JzQxLjAiTiA3wrA1OSczNi4xIlc!5e0!3m2!1sfr!2sma!4v1"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4 : Tester les 3 pages**

```bash
npm run dev
```

- `http://localhost:3000/fr/galerie` → grille photos
- `http://localhost:3000/fr/a-propos` → texte histoire Mimi
- `http://localhost:3000/fr/contact` → adresse + WhatsApp + carte

- [ ] **Step 5 : Copier les images du salon**

```bash
mkdir -p /Users/Mouj/Desktop/salon-mimi/public/images
cp ~/Downloads/Salon\ Coiffure/Coiffure\ 1.jpg /Users/Mouj/Desktop/salon-mimi/public/images/coiffure-1.jpg
cp ~/Downloads/Salon\ Coiffure/Coiffure\ 1_files/2025-11-20.jpg /Users/Mouj/Desktop/salon-mimi/public/images/hero-salon.jpg
```

- [ ] **Step 6 : Commit**

```bash
git add app/\[locale\]/ public/images/
git commit -m "feat: pages Galerie, À propos, Contact + images salon"
```

---

### Task 7 : SEO — métadonnées et JSON-LD

**Files:**

- Modify: `app/[locale]/layout.tsx`
- Create: `app/sitemap.ts`

- [ ] **Step 1 : Ajouter JSON-LD LocalBusiness dans layout.tsx**

Ajouter dans `app/[locale]/layout.tsx`, dans le `<head>` via `generateMetadata` :

```typescript
// app/[locale]/layout.tsx — ajouter avant la fonction LocaleLayout

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const descriptions: Record<string, string> = {
    fr: "Coiffures africaines authentiques au cœur de la médina de Marrakech. Box braids, knotless, locks, soins argan. Réservez en ligne.",
    en: "Authentic African hairstyles in the heart of Marrakech Medina. Box braids, knotless, locks, argan treatments. Book online.",
    es: "Peinados africanos auténticos en el corazón de la medina de Marrakech. Box braids, knotless, locks, tratamientos argán. Reserva en línea.",
  };

  return {
    title: "Salon Mimi — African Hair Braiding Marrakech",
    description: descriptions[locale] ?? descriptions.fr,
    alternates: {
      canonical: `https://salonmimi-marrakech.com/${locale}`,
      languages: {
        fr: "https://salonmimi-marrakech.com/fr",
        en: "https://salonmimi-marrakech.com/en",
        es: "https://salonmimi-marrakech.com/es",
      },
    },
    openGraph: {
      title: "Salon Mimi — African Hair Braiding Marrakech",
      description: descriptions[locale] ?? descriptions.fr,
      locale: locale,
      type: "website",
    },
  };
}
```

- [ ] **Step 2 : Ajouter le script JSON-LD dans le layout**

Dans le `<head>` du layout, ajouter après `<NextIntlClientProvider>` fermant :

```typescript
// Dans le return du LocaleLayout, dans <html> avant <body> :
// Ajouter dans <head> :
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "HairSalon",
      name: "Salon Mimi — African Hair Braiding",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Marrakech",
        addressCountry: "MA",
        addressRegion: "Médina",
      },
      telephone: `+${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`,
      openingHours: "Mo-Sa 09:00-19:00",
      priceRange: "200-950 MAD",
      sameAs: ["https://www.google.com/maps/place/SALON+MIMI"],
    }),
  }}
/>
```

- [ ] **Step 3 : Créer app/sitemap.ts**

```typescript
// app/sitemap.ts
import { MetadataRoute } from "next";

const baseUrl = "https://salonmimi-marrakech.com";
const locales = ["fr", "en", "es"];
const pages = [
  "",
  "/services",
  "/galerie",
  "/reservation",
  "/a-propos",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) =>
    pages.map((page) => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: page === "" ? 1.0 : 0.8,
    })),
  );
}
```

- [ ] **Step 4 : Commit**

```bash
git add app/\[locale\]/layout.tsx app/sitemap.ts
git commit -m "feat: SEO métadonnées hreflang + JSON-LD LocalBusiness + sitemap"
```

---

## Checklist fin de Plan 2

- [ ] Page accueil `/fr` complète avec toutes les sections
- [ ] Page services `/fr/services` avec les 3 catégories et prix
- [ ] Formulaire `/fr/reservation` crée une entrée Supabase
- [ ] Lien WhatsApp s'ouvre après soumission avec le bon message
- [ ] Pages galerie, à-propos, contact accessibles
- [ ] Les 3 langues fonctionnent sur toutes les pages
- [ ] `/sitemap.xml` retourne 18 URLs (6 pages × 3 locales)
- [ ] `git push` et vérification sur Railway
