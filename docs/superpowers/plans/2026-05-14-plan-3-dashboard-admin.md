# Salon Mimi — Plan 3 : Dashboard Admin

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Prérequis :** Plans 1 et 2 terminés et validés.

**Goal:** Construire le dashboard admin protégé par Supabase Auth — login, liste des réservations, changement de statut, accès WhatsApp direct.

**Architecture:** Pages Next.js sous `app/admin/` hors du routing i18n. Auth via Supabase Auth (email/mot de passe). Le dashboard lit les réservations avec le client `authenticated` (soumis aux RLS). L'API de mise à jour du statut utilise `supabaseAdmin` côté serveur.

**Tech Stack:** Next.js 14 App Router, Supabase Auth, Supabase JS v2, Tailwind CSS

---

## Structure des fichiers créés dans ce plan

```
app/
├── admin/
│   ├── layout.tsx              # Layout admin sans Header/Footer public
│   ├── login/
│   │   └── page.tsx            # Formulaire login Supabase Auth
│   └── dashboard/
│       └── page.tsx            # Tableau réservations
components/
└── admin/
    ├── LoginForm.tsx            # Formulaire email/mot de passe
    ├── ReservationsTable.tsx    # Tableau avec filtres et actions
    └── StatusBadge.tsx          # Badge statut coloré
app/
└── api/
    └── reservations/
        └── [id]/
            └── route.ts         # PATCH — mise à jour statut
```

---

### Task 1 : Layout admin

**Files:**

- Create: `app/admin/layout.tsx`

- [ ] **Step 1 : Créer app/admin/layout.tsx**

```typescript
// app/admin/layout.tsx
import "@/app/globals.css";

export const metadata = {
  title: "Admin — Salon Mimi",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-fond min-h-screen">
        <header className="bg-nuit text-white px-6 py-4 flex items-center justify-between">
          <span className="font-playfair text-or text-lg">Salon Mimi — Admin</span>
          <a
            href="/fr"
            className="text-xs text-white/50 hover:text-white transition-colors"
          >
            ← Retour au site
          </a>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-10">{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 2 : Vérifier que la route admin est exclue du middleware i18n**

Ouvrir `middleware.ts` et vérifier que le matcher exclut `/admin` :

```typescript
export const config = {
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
```

Le mot `admin` doit être présent dans le pattern. Si ce n'est pas le cas, l'ajouter.

- [ ] **Step 3 : Commit**

```bash
git add app/admin/layout.tsx
git commit -m "feat: layout admin Salon Mimi"
```

---

### Task 2 : Page de login

**Files:**

- Create: `app/admin/login/page.tsx`
- Create: `components/admin/LoginForm.tsx`

- [ ] **Step 1 : Créer components/admin/LoginForm.tsx**

```typescript
// components/admin/LoginForm.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-sm mx-auto">
      <div>
        <label className="block text-sm font-medium text-brun mb-2">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-or/30 rounded-xl px-4 py-3 focus:outline-none focus:border-ocre bg-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-brun mb-2">Mot de passe</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-or/30 rounded-xl px-4 py-3 focus:outline-none focus:border-ocre bg-white"
        />
      </div>
      {error && <p className="text-red-600 text-sm text-center">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-ocre text-white py-3 rounded-full font-medium hover:bg-or transition-colors disabled:opacity-50"
      >
        {loading ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2 : Créer app/admin/login/page.tsx**

```typescript
// app/admin/login/page.tsx
import LoginForm from "@/components/admin/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <h1 className="font-playfair text-3xl text-brun mb-10 text-center">
        Connexion Admin
      </h1>
      <LoginForm />
    </div>
  );
}
```

- [ ] **Step 3 : Créer le compte admin dans Supabase**

Aller dans Supabase Dashboard → Authentication → Users → Add User.
Créer un compte avec l'email et le mot de passe de Mimi.

- [ ] **Step 4 : Tester le login**

```bash
npm run dev
```

Ouvrir `http://localhost:3000/admin/login` :

- Saisir email/mot de passe erroné → message d'erreur s'affiche
- Saisir les bonnes credentials → redirection vers `/admin/dashboard`

- [ ] **Step 5 : Commit**

```bash
git add app/admin/login/ components/admin/LoginForm.tsx
git commit -m "feat: page login admin Supabase Auth"
```

---

### Task 3 : API PATCH statut réservation

**Files:**

- Create: `app/api/reservations/[id]/route.ts`

- [ ] **Step 1 : Créer app/api/reservations/[id]/route.ts**

```typescript
// app/api/reservations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const VALID_STATUTS = ["en_attente", "confirmee", "annulee"] as const;
type Statut = (typeof VALID_STATUTS)[number];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await request.json();
  const { statut } = body as { statut: Statut };

  if (!VALID_STATUTS.includes(statut)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("reservations")
    .update({ statut })
    .eq("id", params.id);

  if (error) {
    console.error("Erreur mise à jour statut:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2 : Commit**

```bash
git add app/api/reservations/
git commit -m "feat: API PATCH /api/reservations/[id] mise à jour statut"
```

---

### Task 4 : Dashboard — tableau des réservations

**Files:**

- Create: `components/admin/StatusBadge.tsx`
- Create: `components/admin/ReservationsTable.tsx`
- Create: `app/admin/dashboard/page.tsx`

- [ ] **Step 1 : Créer components/admin/StatusBadge.tsx**

```typescript
// components/admin/StatusBadge.tsx
interface StatusBadgeProps {
  statut: "en_attente" | "confirmee" | "annulee";
}

const config = {
  en_attente: { label: "En attente", className: "bg-orange-100 text-orange-700 border border-orange-200" },
  confirmee: { label: "Confirmée", className: "bg-green-100 text-green-700 border border-green-200" },
  annulee: { label: "Annulée", className: "bg-red-100 text-red-700 border border-red-200" },
};

export default function StatusBadge({ statut }: StatusBadgeProps) {
  const { label, className } = config[statut];
  return (
    <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${className}`}>
      {label}
    </span>
  );
}
```

- [ ] **Step 2 : Créer components/admin/ReservationsTable.tsx**

```typescript
// components/admin/ReservationsTable.tsx
"use client";
import { useState } from "react";
import StatusBadge from "./StatusBadge";

interface Reservation {
  id: string;
  nom: string;
  telephone: string;
  service: string;
  date_souhaitee: string | null;
  message: string | null;
  statut: "en_attente" | "confirmee" | "annulee";
  created_at: string;
}

interface ReservationsTableProps {
  reservations: Reservation[];
}

const STATUTS = ["en_attente", "confirmee", "annulee"] as const;
const STATUT_LABELS = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  annulee: "Annulée",
};

export default function ReservationsTable({ reservations: initial }: ReservationsTableProps) {
  const [reservations, setReservations] = useState(initial);
  const [filterStatut, setFilterStatut] = useState<string>("tous");
  const [updating, setUpdating] = useState<string | null>(null);

  const filtered = filterStatut === "tous"
    ? reservations
    : reservations.filter((r) => r.statut === filterStatut);

  async function updateStatut(id: string, statut: string) {
    setUpdating(id);
    const res = await fetch(`/api/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut }),
    });

    if (res.ok) {
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, statut: statut as Reservation["statut"] } : r))
      );
    }
    setUpdating(null);
  }

  function whatsappLink(telephone: string) {
    const number = telephone.replace(/[^0-9]/g, "");
    return `https://wa.me/${number}`;
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("fr-FR");
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <span className="text-sm text-gray-600 font-medium">Filtrer :</span>
        <button
          onClick={() => setFilterStatut("tous")}
          className={`px-4 py-1.5 rounded-full text-sm ${filterStatut === "tous" ? "bg-nuit text-white" : "border border-gray-300 text-gray-600 hover:border-ocre"}`}
        >
          Tous ({reservations.length})
        </button>
        {STATUTS.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatut(s)}
            className={`px-4 py-1.5 rounded-full text-sm ${filterStatut === s ? "bg-nuit text-white" : "border border-gray-300 text-gray-600 hover:border-ocre"}`}
          >
            {STATUT_LABELS[s]} ({reservations.filter((r) => r.statut === s).length})
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-or/20 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-nuit text-white">
              <th className="text-left px-4 py-3 font-medium">Date souhaitée</th>
              <th className="text-left px-4 py-3 font-medium">Reçue le</th>
              <th className="text-left px-4 py-3 font-medium">Cliente</th>
              <th className="text-left px-4 py-3 font-medium">Service</th>
              <th className="text-left px-4 py-3 font-medium">Statut</th>
              <th className="text-left px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-gray-400 py-10">
                  Aucune réservation
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-gray-100 hover:bg-fond/50 transition-colors">
                <td className="px-4 py-3">{formatDate(r.date_souhaitee)}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(r.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-brun">{r.nom}</div>
                  <div className="text-gray-500 text-xs">{r.telephone}</div>
                </td>
                <td className="px-4 py-3 text-brun">{r.service}</td>
                <td className="px-4 py-3">
                  <StatusBadge statut={r.statut} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <select
                      disabled={updating === r.id}
                      value={r.statut}
                      onChange={(e) => updateStatut(r.id, e.target.value)}
                      className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-ocre disabled:opacity-50"
                    >
                      {STATUTS.map((s) => (
                        <option key={s} value={s}>{STATUT_LABELS[s]}</option>
                      ))}
                    </select>
                    <a
                      href={whatsappLink(r.telephone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#25D366] text-white text-xs px-3 py-1 rounded-lg hover:bg-[#128C7E] transition-colors"
                    >
                      WA
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 3 : Créer app/admin/dashboard/page.tsx**

```typescript
// app/admin/dashboard/page.tsx
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import ReservationsTable from "@/components/admin/ReservationsTable";

async function getSession() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
  const { data: { session } } = await supabase.auth.getSession();
  return { supabase, session };
}

export default async function DashboardPage() {
  const { supabase, session } = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const { data: reservations, error } = await supabase
    .from("reservations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="text-red-600 text-center py-10">
        Erreur de chargement : {error.message}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-playfair text-3xl text-brun">Réservations</h1>
        <span className="text-sm text-gray-500">{reservations?.length ?? 0} au total</span>
      </div>
      <ReservationsTable reservations={reservations ?? []} />
    </div>
  );
}
```

- [ ] **Step 4 : Tester le dashboard complet**

```bash
npm run dev
```

1. Aller sur `http://localhost:3000/admin/dashboard` sans être connecté → redirige vers `/admin/login`
2. Se connecter avec les credentials Supabase → redirige vers `/admin/dashboard`
3. Les réservations créées via le formulaire public apparaissent dans le tableau
4. Changer un statut via le select → le badge change immédiatement
5. Cliquer "WA" → WhatsApp s'ouvre avec le numéro de la cliente

- [ ] **Step 5 : Commit**

```bash
git add app/admin/dashboard/ components/admin/ app/api/reservations/
git commit -m "feat: dashboard admin réservations + statuts + WhatsApp"
```

---

### Task 5 : Déploiement final et vérifications

- [ ] **Step 1 : Build de production**

```bash
npm run build
```

Expected : build réussi sans erreurs TypeScript ni erreurs Next.js.
Si des erreurs apparaissent, les corriger avant de continuer.

- [ ] **Step 2 : Pousser sur GitHub**

```bash
git push origin main
```

- [ ] **Step 3 : Vérifier Railway**

Attendre le déploiement Railway (2-3 min) puis vérifier chaque point de la checklist finale.

---

## Checklist finale complète (Plans 1+2+3)

Vérifier manuellement dans le navigateur sur le site Railway en production :

- [ ] `https://[URL-RAILWAY]/fr` — page accueil s'affiche avec Header/Footer
- [ ] `https://[URL-RAILWAY]/en` — même page en anglais
- [ ] `https://[URL-RAILWAY]/es` — même page en espagnol
- [ ] Sélecteur de langue fonctionnel dans le header
- [ ] `https://[URL-RAILWAY]/fr/services` — toutes les catégories et prix visibles
- [ ] `https://[URL-RAILWAY]/fr/reservation` — formulaire complet, soumettre crée une entrée Supabase
- [ ] Après soumission, WhatsApp s'ouvre avec le bon message pré-rempli
- [ ] `https://[URL-RAILWAY]/fr/galerie` — photos s'affichent
- [ ] `https://[URL-RAILWAY]/fr/contact` — adresse, WhatsApp, carte visibles
- [ ] `https://[URL-RAILWAY]/admin/dashboard` sans login → redirige vers `/admin/login`
- [ ] Login admin → dashboard visible avec les réservations
- [ ] Changer un statut dans le dashboard → badge mis à jour
- [ ] `https://[URL-RAILWAY]/sitemap.xml` → 18 URLs listées
