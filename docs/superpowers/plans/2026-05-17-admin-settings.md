# Admin Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre à l'admin de modifier le numéro WhatsApp et les prix des services depuis une page `/admin/settings`, sans redéploiement.

**Architecture:** Une table `settings` dans Supabase stocke des paires clé/valeur. Un fichier `lib/settings.ts` expose une fonction de lecture. La page `/admin/settings` lit et écrit ces valeurs via une route API dédiée. La page de réservation et la page services lisent les prix depuis Supabase au lieu des constantes codées en dur.

**Tech Stack:** Next.js 14 App Router, Supabase (service_role pour écriture admin, anon pour lecture publique), TypeScript, Tailwind CSS.

---

## Fichiers créés ou modifiés

| Action   | Fichier                                     | Rôle                                        |
| -------- | ------------------------------------------- | ------------------------------------------- |
| Créer    | `lib/settings.ts`                           | Lire les settings depuis Supabase           |
| Créer    | `app/api/settings/route.ts`                 | GET et PATCH des settings (admin seulement) |
| Créer    | `app/admin/settings/page.tsx`               | Page admin avec formulaire                  |
| Créer    | `components/admin/SettingsForm.tsx`         | Formulaire client (WhatsApp + prix)         |
| Modifier | `components/sections/ReservationLayout.tsx` | Lire les prix depuis Supabase               |
| Modifier | `app/[locale]/services/page.tsx`            | Lire les prix depuis Supabase               |
| Modifier | `app/admin/layout.tsx`                      | Ajouter lien "Paramètres" dans la nav       |
| Modifier | `supabase-schema.sql`                       | Documenter la table settings                |

---

## Task 1 : Table Supabase + SQL

**Files:**

- Modify: `supabase-schema.sql`

- [ ] **Step 1 : Exécuter dans Supabase SQL Editor**

```sql
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- lecture publique (prix affichés sur le site)
CREATE POLICY "anon_select_settings"
  ON settings FOR SELECT
  TO anon
  USING (true);

-- lecture + écriture pour l'admin
CREATE POLICY "authenticated_all_settings"
  ON settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- données initiales (adapter les prix si besoin)
INSERT INTO settings (key, value) VALUES
  ('whatsapp_number', '+212600000000'),
  ('price_tresses_africaines', '150'),
  ('price_tresses_et_nattes', '80'),
  ('price_box_braids', '200'),
  ('price_tresses_fulani', '180'),
  ('price_tresses_boho', '220'),
  ('price_locks_dreads', '250'),
  ('price_cheveux_attaches', '60'),
  ('price_perruques_tissage', '150'),
  ('price_colorations', '100'),
  ('price_ongles_soins_epilation', '50')
ON CONFLICT (key) DO NOTHING;
```

- [ ] **Step 2 : Vérifier dans Supabase → Table Editor → settings**

Tu dois voir 11 lignes.

- [ ] **Step 3 : Mettre à jour supabase-schema.sql**

Ajouter à la fin du fichier :

```sql
-- Table settings : paramètres modifiables par l'admin
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_settings"
  ON settings FOR SELECT TO anon USING (true);

CREATE POLICY "authenticated_all_settings"
  ON settings FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
```

---

## Task 2 : lib/settings.ts

**Files:**

- Create: `lib/settings.ts`

- [ ] **Step 1 : Créer le fichier**

```ts
// lib/settings.ts
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type Settings = {
  whatsapp_number: string;
  price_tresses_africaines: string;
  price_tresses_et_nattes: string;
  price_box_braids: string;
  price_tresses_fulani: string;
  price_tresses_boho: string;
  price_locks_dreads: string;
  price_cheveux_attaches: string;
  price_perruques_tissage: string;
  price_colorations: string;
  price_ongles_soins_epilation: string;
};

export async function getSettings(): Promise<Settings> {
  const { data, error } = await supabaseAdmin
    .from("settings")
    .select("key, value");

  if (error || !data) {
    return {
      whatsapp_number: "+212600000000",
      price_tresses_africaines: "150",
      price_tresses_et_nattes: "80",
      price_box_braids: "200",
      price_tresses_fulani: "180",
      price_tresses_boho: "220",
      price_locks_dreads: "250",
      price_cheveux_attaches: "60",
      price_perruques_tissage: "150",
      price_colorations: "100",
      price_ongles_soins_epilation: "50",
    };
  }

  const map = Object.fromEntries(data.map((r) => [r.key, r.value]));
  return map as Settings;
}
```

---

## Task 3 : Route API /api/settings

**Files:**

- Create: `app/api/settings/route.ts`

- [ ] **Step 1 : Créer le fichier**

```ts
// app/api/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

async function getAuthUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } },
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function GET() {
  const user = await getAuthUser();
  if (!user)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("settings")
    .select("key, value");
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  const settings = Object.fromEntries(data.map((r) => [r.key, r.value]));
  return NextResponse.json(settings);
}

export async function PATCH(request: NextRequest) {
  const user = await getAuthUser();
  if (!user)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json();
  const allowedKeys = [
    "whatsapp_number",
    "price_tresses_africaines",
    "price_tresses_et_nattes",
    "price_box_braids",
    "price_tresses_fulani",
    "price_tresses_boho",
    "price_locks_dreads",
    "price_cheveux_attaches",
    "price_perruques_tissage",
    "price_colorations",
    "price_ongles_soins_epilation",
  ];

  const updates = Object.entries(body).filter(([key]) =>
    allowedKeys.includes(key),
  );
  if (updates.length === 0) {
    return NextResponse.json({ error: "Aucune clé valide" }, { status: 400 });
  }

  for (const [key, value] of updates) {
    const { error } = await supabaseAdmin
      .from("settings")
      .update({ value: String(value), updated_at: new Date().toISOString() })
      .eq("key", key);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

---

## Task 4 : SettingsForm (composant client)

**Files:**

- Create: `components/admin/SettingsForm.tsx`

- [ ] **Step 1 : Créer le fichier**

```tsx
// components/admin/SettingsForm.tsx
"use client";
import { useState } from "react";
import type { Settings } from "@/lib/settings";

const SERVICE_LABELS: Record<string, string> = {
  price_tresses_africaines: "Tresses africaines",
  price_tresses_et_nattes: "Tresses et nattes",
  price_box_braids: "Box braids",
  price_tresses_fulani: "Tresses Fulani",
  price_tresses_boho: "Tresses Boho",
  price_locks_dreads: "Locks & dreads",
  price_cheveux_attaches: "Cheveux attachés",
  price_perruques_tissage: "Perruques et tissage",
  price_colorations: "Colorations capillaires",
  price_ongles_soins_epilation: "Ongles, soins & épilation",
};

export default function SettingsForm({ initial }: { initial: Settings }) {
  const [values, setValues] = useState<Settings>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(key: keyof Settings, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSaving(false);
    if (res.ok) {
      setMessage("Paramètres sauvegardés.");
    } else {
      setMessage("Erreur lors de la sauvegarde.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 max-w-xl">
      <div className="flex flex-col gap-3">
        <h2 className="font-playfair text-xl text-brun">WhatsApp</h2>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-500 uppercase tracking-wide">
            Numéro WhatsApp
          </label>
          <input
            type="text"
            value={values.whatsapp_number}
            onChange={(e) => handleChange("whatsapp_number", e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-brun"
            placeholder="+212600000000"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-playfair text-xl text-brun">
          Prix des services (MAD)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(SERVICE_LABELS).map(([key, label]) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500 uppercase tracking-wide">
                {label}
              </label>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-brun">
                <input
                  type="number"
                  min="0"
                  value={values[key as keyof Settings]}
                  onChange={(e) =>
                    handleChange(key as keyof Settings, e.target.value)
                  }
                  className="flex-1 px-4 py-2.5 text-sm outline-none"
                />
                <span className="px-3 text-sm text-gray-400 bg-gray-50 border-l border-gray-200">
                  MAD
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {message && (
        <p
          className={`text-sm ${message.includes("Erreur") ? "text-red-500" : "text-green-600"}`}
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="self-start bg-brun hover:bg-brun/90 text-white text-sm px-6 py-3 rounded-full transition-colors disabled:opacity-50"
      >
        {saving ? "Sauvegarde…" : "Sauvegarder"}
      </button>
    </form>
  );
}
```

---

## Task 5 : Page /admin/settings

**Files:**

- Create: `app/admin/settings/page.tsx`

- [ ] **Step 1 : Créer le fichier**

```tsx
// app/admin/settings/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { getSettings } from "@/lib/settings";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const settings = await getSettings();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-playfair text-3xl text-brun">Paramètres</h1>
        <p className="text-sm text-gray-500 mt-1">
          Numéro WhatsApp et prix des services.
        </p>
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}
```

---

## Task 6 : Navigation admin

**Files:**

- Modify: `app/admin/layout.tsx`

- [ ] **Step 1 : Lire le fichier actuel**

```bash
cat /Users/Mouj/Desktop/salon-mimi/app/admin/layout.tsx
```

- [ ] **Step 2 : Ajouter un lien "Paramètres" dans la nav**

Trouver le lien "Réservations" existant et ajouter après :

```tsx
<Link
  href="/admin/settings"
  className="text-sm text-gray-600 hover:text-brun transition-colors"
>
  Paramètres
</Link>
```

---

## Task 7 : Lire les prix depuis Supabase dans ReservationLayout

**Files:**

- Modify: `components/sections/ReservationLayout.tsx`
- Modify: `app/[locale]/reservation/page.tsx`

- [ ] **Step 1 : Modifier app/[locale]/reservation/page.tsx pour passer les prix**

```tsx
// app/[locale]/reservation/page.tsx
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import ReservationLayout from "@/components/sections/ReservationLayout";
import { getSettings } from "@/lib/settings";

export default async function ReservationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "booking" });
  const settings = await getSettings();

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

  const prices: Record<string, string> = {
    "tresses-africaines": settings.price_tresses_africaines,
    "tresses-et-nattes": settings.price_tresses_et_nattes,
    "box-braids": settings.price_box_braids,
    "fulani-braids": settings.price_tresses_fulani,
    "boho-braids": settings.price_tresses_boho,
    "locks-dreads": settings.price_locks_dreads,
    "cheveux-attaches": settings.price_cheveux_attaches,
    "perruques-tissage": settings.price_perruques_tissage,
    colorations: settings.price_colorations,
    "ongles-soins-epilation": settings.price_ongles_soins_epilation,
  };

  return (
    <Suspense fallback={<div className="h-screen bg-nuit" />}>
      <ReservationLayout labels={labels} prices={prices} />
    </Suspense>
  );
}
```

- [ ] **Step 2 : Modifier ReservationLayout pour accepter et afficher les prix dynamiques**

Dans l'interface `Props`, ajouter :

```tsx
prices: Record<string, string>;
```

Dans la signature du composant :

```tsx
export default function ReservationLayout({ labels, prices }: Props) {
```

Dans le JSX où le prix est affiché (rechercher `s.price`), remplacer par :

```tsx
À partir de <span className="text-ocre font-bold">{prices[s.id] ?? s.price} MAD</span>
```

---

## Task 8 : Lire les prix depuis Supabase dans la page Services

**Files:**

- Modify: `app/[locale]/services/page.tsx`

- [ ] **Step 1 : Lire le fichier actuel**

```bash
cat /Users/Mouj/Desktop/salon-mimi/app/\[locale\]/services/page.tsx
```

- [ ] **Step 2 : Ajouter getSettings() et passer les prix au composant**

Importer `getSettings` et récupérer les prix. Les passer au composant `ServicesPageClient` sous forme de prop `prices: Record<string, string>`.

- [ ] **Step 3 : Modifier ServicesPageClient pour afficher les prix dynamiques**

Ajouter la prop `prices` et remplacer les prix codés en dur par `prices[serviceId] ?? prixParDéfaut`.

---

## Task 9 : Lire le numéro WhatsApp depuis Supabase

**Files:**

- Modify: `lib/whatsapp.ts`

- [ ] **Step 1 : Lire le fichier actuel**

```bash
cat /Users/Mouj/Desktop/salon-mimi/lib/whatsapp.ts
```

- [ ] **Step 2 : Remplacer le numéro codé en dur**

Si le fichier contient un numéro WhatsApp fixe, le remplacer par une lecture depuis les settings. La fonction devra être async si elle ne l'est pas déjà, ou accepter le numéro en paramètre.

---

## Task 10 : Build + commit

- [ ] **Step 1 : Vérifier TypeScript**

```bash
cd /Users/Mouj/Desktop/salon-mimi && npx tsc --noEmit
```

Attendu : 0 erreurs.

- [ ] **Step 2 : Build**

```bash
cd /Users/Mouj/Desktop/salon-mimi && npm run build 2>&1 | tail -20
```

Attendu : build réussi.

- [ ] **Step 3 : Commit et push**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add -A
git commit -m "feat(admin): paramètres WhatsApp et prix depuis Supabase"
git push
```
