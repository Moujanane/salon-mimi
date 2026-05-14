# Salon Mimi — Plan 1 : Fondations

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffolder le projet Next.js 14 complet avec Tailwind, next-intl (FR/EN/ES), Supabase, et le déployer sur Railway.

**Architecture:** Next.js 14 App Router avec routing i18n via next-intl et middleware. Supabase pour la base de données et l'auth admin. Tailwind avec variables CSS custom pour la palette Salon Mimi. Tout le contenu est statique sauf l'API de réservation.

**Tech Stack:** Next.js 14, Tailwind CSS 3, next-intl 3, Supabase JS v2, TypeScript, Railway

---

## Structure des fichiers créés dans ce plan

```
salon-mimi/
├── app/
│   ├── [locale]/
│   │   └── layout.tsx          # Layout principal avec Header/Footer
│   │   └── page.tsx            # Page d'accueil (placeholder)
│   ├── admin/
│   │   └── layout.tsx          # Layout admin (hors i18n)
│   └── api/
│       └── reservations/
│           └── route.ts        # POST — insertion Supabase
├── components/
│   └── layout/
│       ├── Header.tsx          # Nav + sélecteur de langue
│       └── Footer.tsx          # Footer avec liens
├── lib/
│   ├── supabase.ts             # Client browser (anon key)
│   ├── supabaseAdmin.ts        # Client serveur (service_role)
│   └── whatsapp.ts             # generateWhatsAppLink()
├── messages/
│   ├── fr.json                 # Toutes les chaînes FR
│   ├── en.json                 # Toutes les chaînes EN
│   └── es.json                 # Toutes les chaînes ES
├── middleware.ts               # Routing i18n next-intl
├── i18n.ts                     # Config next-intl
├── tailwind.config.ts          # Palette Salon Mimi
├── .env.local                  # Variables d'environnement locales
└── supabase-schema.sql         # Schéma base de données
```

---

### Task 1 : Initialiser le projet Next.js

**Files:**

- Create: `salon-mimi/` (projet entier)
- Create: `package.json`, `tsconfig.json`, `next.config.js`

- [ ] **Step 1 : Créer le projet Next.js**

```bash
cd /Users/Mouj/Desktop
npx create-next-app@14 salon-mimi \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"
cd salon-mimi
```

Expected : dossier `salon-mimi/` créé avec `app/`, `package.json`, `tailwind.config.ts`

- [ ] **Step 2 : Installer les dépendances**

```bash
npm install next-intl @supabase/supabase-js @supabase/ssr
```

Expected : `node_modules/` mis à jour, pas d'erreurs

- [ ] **Step 3 : Vérifier que le projet démarre**

```bash
npm run dev
```

Ouvrir `http://localhost:3000` — la page Next.js par défaut s'affiche.
Couper avec Ctrl+C.

- [ ] **Step 4 : Commit**

```bash
git add -A
git commit -m "feat: init projet Next.js 14 + Tailwind + next-intl + Supabase"
```

---

### Task 2 : Configurer la palette Tailwind

**Files:**

- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`

- [ ] **Step 1 : Mettre à jour tailwind.config.ts**

Remplacer le contenu de `tailwind.config.ts` par :

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ocre: "#C17B3F",
        vert: "#1F7A4E",
        or: "#D4A843",
        fond: "#F6EFE3",
        nuit: "#1A1A1A",
        brun: "#2C1508",
      },
      fontFamily: {
        playfair: ["Playfair Display", "serif"],
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 2 : Mettre à jour app/globals.css**

Remplacer le contenu de `app/globals.css` par :

```css
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600&display=swap");

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-fond text-brun font-inter;
  }
}
```

- [ ] **Step 3 : Commit**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "feat: palette Tailwind Salon Mimi + typographie Playfair/Inter"
```

---

### Task 3 : Configurer next-intl (i18n FR/EN/ES)

**Files:**

- Create: `i18n.ts`
- Create: `middleware.ts`
- Create: `messages/fr.json`
- Create: `messages/en.json`
- Create: `messages/es.json`
- Modify: `next.config.js`

- [ ] **Step 1 : Créer i18n.ts**

```typescript
// i18n.ts
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
}));
```

- [ ] **Step 2 : Créer middleware.ts**

```typescript
// middleware.ts
import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["fr", "en", "es"],
  defaultLocale: "fr",
});

export const config = {
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
```

- [ ] **Step 3 : Créer messages/fr.json**

```json
{
  "nav": {
    "home": "Accueil",
    "services": "Services & Tarifs",
    "gallery": "Galerie",
    "booking": "Réservation",
    "about": "À propos",
    "contact": "Contact"
  },
  "hero": {
    "title": "Salon Mimi",
    "subtitle": "African Hair Braiding",
    "location": "Médina de Marrakech",
    "cta_book": "Réserver",
    "cta_services": "Nos services"
  },
  "booking": {
    "title": "Réserver votre séance",
    "name": "Nom complet",
    "phone": "Téléphone / WhatsApp",
    "service": "Service souhaité",
    "date": "Date souhaitée",
    "message": "Message (optionnel)",
    "submit": "Envoyer ma demande",
    "success": "Demande envoyée ! Mimi vous contacte sur WhatsApp.",
    "error": "Une erreur est survenue. Veuillez réessayer."
  },
  "footer": {
    "rights": "Tous droits réservés",
    "address": "Médina, Marrakech, Maroc"
  }
}
```

- [ ] **Step 4 : Créer messages/en.json**

```json
{
  "nav": {
    "home": "Home",
    "services": "Services & Prices",
    "gallery": "Gallery",
    "booking": "Book Now",
    "about": "About",
    "contact": "Contact"
  },
  "hero": {
    "title": "Salon Mimi",
    "subtitle": "African Hair Braiding",
    "location": "Marrakech Medina",
    "cta_book": "Book Now",
    "cta_services": "Our Services"
  },
  "booking": {
    "title": "Book your appointment",
    "name": "Full name",
    "phone": "Phone / WhatsApp",
    "service": "Desired service",
    "date": "Preferred date",
    "message": "Message (optional)",
    "submit": "Send request",
    "success": "Request sent! Mimi will contact you on WhatsApp.",
    "error": "An error occurred. Please try again."
  },
  "footer": {
    "rights": "All rights reserved",
    "address": "Medina, Marrakech, Morocco"
  }
}
```

- [ ] **Step 5 : Créer messages/es.json**

```json
{
  "nav": {
    "home": "Inicio",
    "services": "Servicios & Precios",
    "gallery": "Galería",
    "booking": "Reservar",
    "about": "Sobre nosotras",
    "contact": "Contacto"
  },
  "hero": {
    "title": "Salon Mimi",
    "subtitle": "African Hair Braiding",
    "location": "Medina de Marrakech",
    "cta_book": "Reservar",
    "cta_services": "Nuestros servicios"
  },
  "booking": {
    "title": "Reserva tu cita",
    "name": "Nombre completo",
    "phone": "Teléfono / WhatsApp",
    "service": "Servicio deseado",
    "date": "Fecha preferida",
    "message": "Mensaje (opcional)",
    "submit": "Enviar solicitud",
    "success": "¡Solicitud enviada! Mimi te contactará por WhatsApp.",
    "error": "Ha ocurrido un error. Por favor, inténtalo de nuevo."
  },
  "footer": {
    "rights": "Todos los derechos reservados",
    "address": "Medina, Marrakech, Marruecos"
  }
}
```

- [ ] **Step 6 : Mettre à jour next.config.js**

```javascript
// next.config.js
const withNextIntl = require("next-intl/plugin")("./i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = withNextIntl(nextConfig);
```

- [ ] **Step 7 : Restructurer app/ pour le routing i18n**

```bash
# Créer le dossier [locale]
mkdir -p app/\[locale\]

# Déplacer layout.tsx et page.tsx dedans
mv app/layout.tsx app/\[locale\]/layout.tsx
mv app/page.tsx app/\[locale\]/page.tsx
```

- [ ] **Step 8 : Mettre à jour app/[locale]/layout.tsx**

```typescript
// app/[locale]/layout.tsx
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "./globals.css";

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 9 : Mettre à jour app/[locale]/page.tsx (placeholder)**

```typescript
// app/[locale]/page.tsx
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("hero");
  return (
    <main className="p-8">
      <h1 className="font-playfair text-4xl text-ocre">{t("title")}</h1>
      <p className="text-brun">{t("subtitle")} — {t("location")}</p>
    </main>
  );
}
```

- [ ] **Step 10 : Tester le routing i18n**

```bash
npm run dev
```

- Ouvrir `http://localhost:3000` → redirige vers `/fr` → titre "Salon Mimi" en ocre
- Ouvrir `http://localhost:3000/en` → même page en anglais
- Ouvrir `http://localhost:3000/es` → même page en espagnol
- Couper avec Ctrl+C

- [ ] **Step 11 : Commit**

```bash
git add -A
git commit -m "feat: i18n next-intl FR/EN/ES + routing middleware"
```

---

### Task 4 : Configurer Supabase

**Files:**

- Create: `.env.local`
- Create: `lib/supabase.ts`
- Create: `lib/supabaseAdmin.ts`
- Create: `supabase-schema.sql`

- [ ] **Step 1 : Créer .env.local**

```bash
# .env.local — NE PAS COMMITTER CE FICHIER
touch .env.local
```

Remplir avec les vraies valeurs depuis le dashboard Supabase :

```
NEXT_PUBLIC_SUPABASE_URL=https://XXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_WHATSAPP_NUMBER=212600000000
```

- [ ] **Step 2 : Vérifier que .env.local est dans .gitignore**

```bash
grep ".env.local" .gitignore
```

Expected : `.env.local` apparaît dans la liste. Sinon l'ajouter :

```bash
echo ".env.local" >> .gitignore
```

- [ ] **Step 3 : Créer lib/supabase.ts**

```typescript
// lib/supabase.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 4 : Créer lib/supabaseAdmin.ts**

```typescript
// lib/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
```

- [ ] **Step 5 : Créer supabase-schema.sql**

```sql
-- supabase-schema.sql
-- Exécuter dans le SQL Editor du dashboard Supabase

create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  telephone text not null,
  service text not null,
  date_souhaitee date,
  message text,
  statut text not null default 'en_attente'
    check (statut in ('en_attente', 'confirmee', 'annulee')),
  created_at timestamptz default now()
);

-- Activer RLS
alter table reservations enable row level security;

-- anon peut insérer (formulaire public)
create policy "anon_insert_reservations"
  on reservations for insert
  to anon
  with check (true);

-- authenticated peut lire et modifier (dashboard admin)
create policy "authenticated_select_reservations"
  on reservations for select
  to authenticated
  using (true);

create policy "authenticated_update_reservations"
  on reservations for update
  to authenticated
  using (true);

-- service_role a tous les droits (API routes)
-- Note: service_role bypass RLS par défaut, pas besoin de politique explicite
```

- [ ] **Step 6 : Exécuter le schéma dans Supabase**

Aller sur `https://supabase.com/dashboard` → projet → SQL Editor → coller le contenu de `supabase-schema.sql` → Run.

Vérifier que la table `reservations` apparaît dans Table Editor.

- [ ] **Step 7 : Commit**

```bash
git add lib/supabase.ts lib/supabaseAdmin.ts supabase-schema.sql .gitignore
git commit -m "feat: clients Supabase browser/admin + schéma RLS"
```

---

### Task 5 : Créer l'utilitaire WhatsApp

**Files:**

- Create: `lib/whatsapp.ts`

- [ ] **Step 1 : Créer lib/whatsapp.ts**

```typescript
// lib/whatsapp.ts

export interface ReservationData {
  nom: string;
  telephone: string;
  service: string;
  dateSouhaitee?: string;
  message?: string;
}

export function generateWhatsAppLink(data: ReservationData): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const text = [
    `Bonjour Mimi, je souhaite réserver une prestation.`,
    `Nom : ${data.nom}`,
    `Service : ${data.service}`,
    data.dateSouhaitee ? `Date souhaitée : ${data.dateSouhaitee}` : null,
    data.message ? `Message : ${data.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
```

- [ ] **Step 2 : Commit**

```bash
git add lib/whatsapp.ts
git commit -m "feat: utilitaire generateWhatsAppLink"
```

---

### Task 6 : Créer l'API route de réservation

**Files:**

- Create: `app/api/reservations/route.ts`

- [ ] **Step 1 : Créer app/api/reservations/route.ts**

```typescript
// app/api/reservations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { nom, telephone, service, date_souhaitee, message } = body;

  if (!nom || !telephone || !service) {
    return NextResponse.json(
      { error: "Champs requis manquants" },
      { status: 400 },
    );
  }

  const { error } = await supabaseAdmin.from("reservations").insert({
    nom,
    telephone,
    service,
    date_souhaitee: date_souhaitee || null,
    message: message || null,
    statut: "en_attente",
  });

  if (error) {
    console.error("Erreur insertion réservation:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
```

- [ ] **Step 2 : Tester l'API manuellement**

```bash
npm run dev
```

Dans un autre terminal :

```bash
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{"nom":"Test Client","telephone":"0600000000","service":"Box Braids","date_souhaitee":"2026-06-01","message":"Test"}'
```

Expected : `{"success":true}`

Vérifier dans Supabase Table Editor que la ligne apparaît avec `statut = en_attente`.

- [ ] **Step 3 : Commit**

```bash
git add app/api/reservations/route.ts
git commit -m "feat: API POST /api/reservations + insertion Supabase"
```

---

### Task 7 : Créer le Header et le Footer

**Files:**

- Create: `components/layout/Header.tsx`
- Create: `components/layout/Footer.tsx`
- Modify: `app/[locale]/layout.tsx`

- [ ] **Step 1 : Créer components/layout/Header.tsx**

```typescript
// components/layout/Header.tsx
"use client";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

const locales = ["fr", "en", "es"] as const;

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(newLocale: string) {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  }

  return (
    <header className="bg-nuit text-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href={`/${locale}`} className="font-playfair text-xl text-or">
          Salon Mimi
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href={`/${locale}`} className="hover:text-or transition-colors">{t("home")}</Link>
          <Link href={`/${locale}/services`} className="hover:text-or transition-colors">{t("services")}</Link>
          <Link href={`/${locale}/galerie`} className="hover:text-or transition-colors">{t("gallery")}</Link>
          <Link href={`/${locale}/a-propos`} className="hover:text-or transition-colors">{t("about")}</Link>
          <Link href={`/${locale}/contact`} className="hover:text-or transition-colors">{t("contact")}</Link>
          <Link href={`/${locale}/reservation`} className="bg-ocre text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-or transition-colors">
            {t("booking")}
          </Link>
        </nav>
        <div className="flex gap-2 text-xs">
          {locales.map((l) => (
            <button
              key={l}
              onClick={() => switchLocale(l)}
              className={`uppercase px-2 py-1 rounded ${
                locale === l ? "bg-or text-nuit font-bold" : "text-white hover:text-or"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2 : Créer components/layout/Footer.tsx**

```typescript
// components/layout/Footer.tsx
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");
  return (
    <footer className="bg-nuit text-white py-10 mt-20">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <p className="font-playfair text-or text-xl mb-2">Salon Mimi</p>
        <p className="text-sm text-gray-400">{t("address")}</p>
        <p className="text-xs text-gray-600 mt-4">
          © {new Date().getFullYear()} Salon Mimi — {t("rights")}
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3 : Mettre à jour app/[locale]/layout.tsx**

```typescript
// app/[locale]/layout.tsx
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "../globals.css";

export const metadata = {
  title: "Salon Mimi — African Hair Braiding Marrakech",
  description:
    "Coiffures africaines authentiques au cœur de la médina de Marrakech. Box braids, knotless, locks, soins argan.",
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4 : Tester visuellement**

```bash
npm run dev
```

Ouvrir `http://localhost:3000/fr` — vérifier :

- Header fond nuit avec logo "Salon Mimi" en or
- Navigation avec liens et bouton "Réservation"
- Sélecteur FR/EN/ES fonctionnel (cliquer EN → URL change en `/en`)
- Footer visible en bas

- [ ] **Step 5 : Commit**

```bash
git add components/ app/\[locale\]/layout.tsx
git commit -m "feat: Header nav trilingue + Footer + layout [locale]"
```

---

### Task 8 : Déploiement initial sur Railway

**Files:**

- Create: `railway.json`

- [ ] **Step 1 : Créer railway.json**

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start",
    "healthcheckPath": "/",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

- [ ] **Step 2 : Pousser sur GitHub**

```bash
# Créer un repo GitHub "salon-mimi" depuis github.com, puis :
git remote add origin git@github.com:TON_USERNAME/salon-mimi.git
git push -u origin main
```

- [ ] **Step 3 : Connecter Railway**

1. Aller sur `railway.app` → New Project → Deploy from GitHub repo → `salon-mimi`
2. Ajouter les variables d'environnement dans Railway (même contenu que `.env.local`)
3. Attendre le build (2-3 min)
4. Cliquer sur le lien Railway généré → vérifier que le site s'affiche

- [ ] **Step 4 : Commit final**

```bash
git add railway.json
git commit -m "feat: config Railway déploiement"
git push
```

---

## Checklist fin de Plan 1

Avant de passer au Plan 2, vérifier manuellement :

- [ ] `http://localhost:3000/fr` — page s'affiche avec Header/Footer
- [ ] `http://localhost:3000/en` — même page en anglais
- [ ] `http://localhost:3000/es` — même page en espagnol
- [ ] Sélecteur de langue fonctionnel
- [ ] API `POST /api/reservations` insère dans Supabase
- [ ] Table `reservations` visible dans le dashboard Supabase
- [ ] Déploiement Railway accessible en ligne
