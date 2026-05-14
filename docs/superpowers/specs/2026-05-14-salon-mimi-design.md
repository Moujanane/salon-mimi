# Salon Mimi — Spec technique 2026-05-14

## Contexte

Site web pour **Salon Mimi — African Hair Braiding**, salon de coiffure africaine situé dans la médina de Marrakech. Propriétaire : copine de Mouj, prénom Mimi.

Objectif : attirer les touristes (FR/EN/ES) et la clientèle locale cherchant des coiffures africaines à Marrakech. La fiche Google Business existe déjà.

---

## Stack technique

| Composant          | Choix                                |
| ------------------ | ------------------------------------ |
| Framework          | Next.js 14 App Router                |
| Styles             | Tailwind CSS                         |
| Base de données    | Supabase (réservations + auth admin) |
| i18n               | next-intl (FR / EN / ES)             |
| Déploiement        | Railway                              |
| Domaine recommandé | `salonmimi-marrakech.com`            |

---

## Identité visuelle

### Palette

| Variable | Valeur    | Usage                        |
| -------- | --------- | ---------------------------- |
| `--ocre` | `#C17B3F` | Titres, boutons CTA, accents |
| `--vert` | `#1F7A4E` | Badges, prix, confiance      |
| `--or`   | `#D4A843` | Bordures, icônes premium     |
| `--fond` | `#F6EFE3` | Fond général ivoire          |
| `--nuit` | `#1A1A1A` | Sections sombres, hero       |
| `--brun` | `#2C1508` | Corps de texte               |

### Typographie

- Titres : `Playfair Display` (Google Fonts)
- Corps : `Inter` (Google Fonts)

### Ambiance

- Sections alternées fond ivoire / fond nuit
- Motifs wax africains en SVG subtils en arrière-plan
- Thé à la menthe comme signature visuelle récurrente
- Mise en avant photobooth instagrammable

---

## Architecture des pages

| Page              | Route                   | Description                                |
| ----------------- | ----------------------- | ------------------------------------------ |
| Accueil           | `/[locale]`             | Hero, services vedettes, galerie mini, CTA |
| Services & Tarifs | `/[locale]/services`    | Menu complet MAD + € + durées              |
| Galerie           | `/[locale]/galerie`     | Photos et vidéos du salon                  |
| Réservation       | `/[locale]/reservation` | Formulaire → Supabase + WhatsApp           |
| À propos          | `/[locale]/a-propos`    | Histoire Mimi, produits locaux             |
| Contact           | `/[locale]/contact`     | Adresse médina, carte, horaires, Instagram |
| Admin login       | `/admin/login`          | Auth Supabase, hors i18n                   |
| Admin dashboard   | `/admin/dashboard`      | Gestion réservations, hors i18n            |

---

## Détail des pages

### Accueil `/`

1. **Hero** — plein écran fond nuit, photo principale, titre "Salon Mimi — African Hair Braiding" (Playfair Display, couleur or), sous-titre trilingue, boutons "Réserver" + "Voir nos services"
2. **Bandeau confiance** — 3 éléments : note Google ⭐ 5/5, "Médina de Marrakech", "Coiffures africaines authentiques"
3. **Services vedettes** — 4 cartes : Box Braids (550 MAD / 52€), Knotless Braids (700 MAD / 66€), Boho Braids (650 MAD / 61€), Cornrows (300 MAD / 28€)
4. **Package signature** — carte mise en avant "Boho Experience 850 MAD / ~80€" : boho braids + soin argan + photobooth + thé à la menthe
5. **Galerie mini** — 3 photos du salon
6. **Section Instagram** — grille 6 photos (lien vers compte)
7. **CTA final** — fond ocre, "Prête pour votre transformation ?" + bouton WhatsApp

### Services `/services`

3 catégories :

**Tresses**
| Service | Durée | MAD | € |
|---------|-------|-----|---|
| Box Braids medium | 3–4h | 550 | 52 |
| Box Braids XL | 2–3h | 450 | 42 |
| Knotless Braids | 4–5h | 700 | 66 |
| Boho / Goddess Braids | 3–4h | 650 | 61 |
| Fulani Braids + perles | 2–3h | 500 | 47 |
| Cornrows full head | 1–2h | 300 | 28 |
| Mini braids enfant | 1–2h | 200 | 19 |

**Locks & Twists**
| Service | Durée | MAD | € |
|---------|-------|-----|---|
| Départ de locks | 4–6h | 900 | 85 |
| Retouche locks | 2–3h | 450 | 42 |
| Faux Locks / Bohemian | 3–5h | 750 | 71 |
| Marley Twists | 3–4h | 600 | 57 |
| Crochet Braids | 2–3h | 500 | 47 |

**Soins & Packages**
| Service | Durée | MAD | € |
|---------|-------|-----|---|
| Brushing naturel argan | — | 200 | 19 |
| Boho Experience (package) | 4h | 850 | 80 |
| Faux Locks + perles (package) | 5h | 950 | 89 |
| Soin argan seul | 1h | 150 | 14 |

Chaque service a un bouton "Réserver ce service" qui pré-remplit le champ service dans le formulaire de réservation.

### Réservation `/reservation`

Champs du formulaire :

- Nom complet (requis)
- Téléphone / WhatsApp (requis)
- Service souhaité (liste déroulante, pré-remplie si arrivée depuis `/services`)
- Date souhaitée (date picker)
- Message libre (optionnel)

À la soumission :

1. Insertion en base Supabase (table `reservations`, statut `en_attente`)
2. Redirection vers `https://wa.me/[NUMERO]?text=...` avec message pré-rempli résumant la demande

### Admin dashboard `/admin/dashboard`

- Auth : Supabase Auth (email + mot de passe, 1 seul compte pour Mimi)
- Tableau des réservations avec colonnes : Date souhaitée, Créée le, Nom, Service, Téléphone, Statut
- Statuts : `En attente` (badge orange) / `Confirmée` (badge vert) / `Annulée` (badge rouge)
- Actions par ligne : changer le statut, bouton "WhatsApp" (ouvre conversation directe)
- Filtres : par statut, par date
- Tri par date de création (plus récentes en premier)

---

## Base de données Supabase

### Table `reservations`

```sql
create table reservations (
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
```

### Politiques RLS

- `anon` → INSERT sur `reservations` (formulaire public)
- `authenticated` → SELECT, UPDATE sur `reservations` (dashboard admin)
- `service_role` → ALL (API routes serveur)

---

## Internationalisation (next-intl)

3 locales : `fr` (défaut), `en`, `es`

Fichiers de traduction : `messages/fr.json`, `messages/en.json`, `messages/es.json`

Toutes les chaînes UI, titres, descriptions de services, et métadonnées SEO sont traduits.

---

## SEO

- `sitemap.xml` automatique (toutes les pages × 3 locales)
- Balises Open Graph par page (titre, description, image)
- JSON-LD `LocalBusiness` sur la page d'accueil :
  - name: "Salon Mimi — African Hair Braiding Marrakech"
  - address: Médina de Marrakech
  - telephone: numéro WhatsApp
  - openingHours, geo, sameAs (Google Business, Instagram)
- `hreflang` fr / en / es sur toutes les pages
- Balises `alt` sur toutes les images

---

## Variables d'environnement Railway

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_WHATSAPP_NUMBER    # Format international sans +, ex: 212600000000
```

---

## Structure des fichiers

```
salon-mimi/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Accueil
│   │   ├── services/page.tsx
│   │   ├── galerie/page.tsx
│   │   ├── reservation/page.tsx
│   │   ├── a-propos/page.tsx
│   │   └── contact/page.tsx
│   ├── admin/
│   │   ├── login/page.tsx
│   │   └── dashboard/page.tsx
│   └── api/
│       └── reservations/route.ts     # POST — insertion Supabase
├── components/
│   ├── ui/                           # Button, Card, Badge, Input
│   ├── sections/                     # Hero, Services, Galerie, CTA...
│   └── layout/                       # Header, Footer, Nav, LocaleSwitcher
├── lib/
│   ├── supabase.ts                   # createBrowserClient
│   ├── supabaseAdmin.ts              # createClient service_role
│   └── whatsapp.ts                   # generateWhatsAppLink()
├── messages/
│   ├── fr.json
│   ├── en.json
│   └── es.json
├── public/
│   └── images/                       # Photos salon depuis ~/Downloads/Salon Coiffure/
├── middleware.ts                     # Routing i18n next-intl
└── i18n.ts                           # Config next-intl
```

---

## Checklist avant déploiement (même règle qu'atlas-swincar)

1. `/reservation` — le formulaire soumet et crée une entrée Supabase
2. `/admin/dashboard` — les réservations apparaissent après login
3. Changer un statut depuis le dashboard
4. Le lien WhatsApp s'ouvre avec le bon message pré-rempli
5. Les 3 langues s'affichent correctement
6. Le sitemap est accessible à `/sitemap.xml`
