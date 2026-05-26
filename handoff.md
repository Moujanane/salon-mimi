# Handoff — Salon Mimi

## 1. Objectif du projet

Refaire entièrement le site du Salon Mimi (coiffure afro, Marrakech) avec un design Bold & Culture premium, optimisé SEO local, sécurisé, et déployé sur Railway.

---

## 2. État actuel du code — mis à jour le 25 mai 2026 (fin de session)

### Ce qui marche

- Homepage : hero split 50/50, 3 colonnes photo animées, titre "Tresses africaines & Rasta / Marrakech", badge "Place Jamaa El Fna" en ocre
- Page Services : 10 services en français, pills cliquables, panneau photo dynamique, responsive corrigé (useEffect + window.innerWidth)
- Page Réservation : formulaire complet (nom, téléphone, service, date, heure, nombre de personnes, message), insertion Supabase validée, bouton WhatsApp affiché après soumission
- Page Contact : formulaire de demande (prénom, nom, téléphone, email, demande) — email envoyé à contact@mimi-coiffure.com via Resend, trilingue FR/EN/ES, rate limiting, XSS protégé
- Header : nav fixe, hamburger mobile, bouton RDV ocre
- Footer : liens Mentions légales + Politique de confidentialité en fr/en/es
- SEO minimum complet : title unique, meta description, alt images, sitemap (8 pages), Search Console connectée, canonical toutes pages avec slash final
- SEO : JSON-LD HairSalon + FAQ schema, hreflang fr/en/es, og:image
- Sécurité : headers HTTP (CSP, X-Frame-Options, HSTS), rate limiting API, validation serveur, XSS emails corrigé, email admin masqué dans l'API publique
- Middleware i18n : /admin exclu correctement, redirections 307→308, www→non-www
- Images : 14 photos réelles du salon dans /public/images/
- Dashboard admin : affiche les réservations (RLS Supabase corrigée)
- Page admin /settings : WhatsApp, email de notification et prix paramétrables — champs visibles (bg-white + text-gray-900 corrigés)
- PWA mobile `/mimi.html` avec PIN pour planning Mimi
- Notifications email Resend à chaque réservation — adresse from configurable via `RESEND_FROM_EMAIL`
- Pages légales RGPD conformes : `/mentions-legales` et `/politique-de-confidentialite` en fr/en/es, indexables, avec responsable de publication (Moujahid ANANE)
- Bandeau cookies conforme RGPD (cookie technique NEXT_LOCALE, pas de consentement obligatoire)
- Email `contact@mimi-coiffure.com` opérationnel via Private Email (Namecheap), DNS Cloudflare configuré
- Analytics Umami : installé sur Railway, script intégré dans le layout, CSP corrigé — dashboard sur `umami-production-2141.up.railway.app`

### Ce qui reste fragile

- Le titre hero sur desktop peut déborder légèrement selon la résolution — ajuster `clamp` si nécessaire
- Email formulaire contact : fonctionne via Resend API, emails reçus sur `moujanane@free.fr`

### Ce qui ne marche pas

- Rien de bloquant connu

### Ce qui reste à faire

- **Cloudflare Cache Rule** (priorité haute) : configurer la règle de cache dans Cloudflare pour bypasser le `no-store` Railway et faire passer PageSpeed de 74 à 85+. Voir section 7 pour les instructions exactes.
- **Vérification indexation Google** : attendre 2-4 semaines et vérifier dans Search Console que les erreurs canoniques ont disparu. Cliquer "Valider la correction" sur les 2 lignes d'erreur.
- **Traductions EN et ES** : le contenu des pages services, galerie, homepage est en français uniquement dans les composants — les balises SEO sont traduites mais pas le contenu visible
- **Fiche Google Business Profile** : créer ou réclamer la fiche GMB du salon (essentiel pour le SEO local Marrakech)
- **Fiche TripAdvisor** : en attente de validation depuis session 18 mai
- **Mot de passe Umami** : changer le mot de passe admin par défaut (`umami`) dans le dashboard Umami

---

## 3. Nouveautés — session 18 mai 2026

### PWA mobile pour Mimi (planning réservations)

- Fichier : `public/mimi.html` — page HTML vanilla complète, hors React/Next.js
- API : `app/api/mimi/route.ts` — vérifie le PIN (`MIMI_PIN` env var) et retourne les réservations
- PIN actuel : `1993` (variable Railway `MIMI_PIN`)
- URL d'accès : `https://mimi-coiffure.com/mimi.html`
- Installation Android : Chrome > 3 points > "Ajouter à l'écran d'accueil"
- Le middleware exclut `/mimi*` de l'i18n (ligne `if (pathname.startsWith("/mimi"))`)
- **Leçon critique** : ne jamais mettre cette page dans `app/mimi/page.tsx` — le root layout Next.js injecte `<html><body>` et cause l'erreur React #418 (hydration mismatch) irrésoluble. La solution est `public/mimi.html` servi directement.

### Notifications email à chaque réservation

- Lib : `lib/sendNotificationEmail.ts` — utilise Resend
- Appelé dans `app/api/reservations/route.ts` après INSERT réussi
- Expéditeur : lit `process.env.RESEND_FROM_EMAIL` avec fallback `onboarding@resend.dev`
- Destinataire : configurable dans `/admin/settings` > champ "Email de notification" → mettre `contact@mimi-coiffure.com`
- Variables Railway requises : `RESEND_API_KEY` + `RESEND_FROM_EMAIL` (optionnel)
- La valeur est stockée dans Supabase table `settings`, clé `notification_email`

### Settings admin — champ notification_email

- Ajouté dans `lib/settings.ts` (type Settings + DEFAULTS)
- Ajouté dans `components/admin/SettingsForm.tsx` (section Notifications)
- Ajouté dans `app/api/settings/route.ts` (allowedKeys)
- **Leçon** : l'API settings utilisait `update` pur — si la clé n'existe pas en base, rien ne s'enregistre. Corrigé en `upsert` avec `onConflict: "key"`. Ne jamais inclure `updated_at` dans l'upsert — cette colonne n'existe pas dans la table settings.

### SEO — optimisations ciblées

- Keyword cible : "salon de coiffure Rasta et Africaine Marrakech"
- Title FR : "Salon Mimi — Tresses Rasta & Africaines Marrakech | Jamaa El Fna"
- Description FR : contient "Rasta", "Africaine", "Marrakech", "Place Jamaa El Fna — la place la plus touristique de la ville"
- FAQ schema ajouté (4 Q&R) pour les featured snippets Google
- URL JSON-LD corrigée : `salonmimi-marrakech.com` → `mimi-coiffure.com`
- Google Search Console configuré + sitemap soumis
- Fiche TripAdvisor créée (en attente validation)

### Performances — score PageSpeed mobile

- Avant : 81/100
- Après : 99/100
- Cause du problème : `@import url("https://fonts.googleapis.com/...")` dans `globals.css` — requête externe bloquante (+2050ms)
- Fix : suppression du `@import`, remplacement par `next/font/google` (`Playfair_Display` + `Inter`) dans le layout, variables CSS `--font-playfair` et `--font-inter` dans Tailwind
- **Règle** : ne jamais utiliser `@import` Google Fonts dans un fichier CSS Next.js. Toujours utiliser `next/font/google`.

### Tests de non-régression Playwright

- Dossier : `e2e/site.spec.ts`
- Config : `playwright.config.ts` (desktop + mobile Pixel 5)
- Cible : `https://mimi-coiffure.com`
- 11 tests couvrant : accueil, navigation, réservation, SEO, responsive
- Commande : `npx playwright test --project=desktop`
- **Règle** : toujours lancer les tests avant et après une modification de performance ou de layout

---

## 4. Fichiers touchés (session mai 2026 — première partie)

```
components/sections/HeroHome.tsx          — titre, pt navbar, taille clamp
components/sections/ReservationLayout.tsx — bouton WhatsApp explicite post-soumission
components/admin/SettingsForm.tsx         — useEffect fetch + text-gray-900 sur inputs
components/admin/ReservationsTable.tsx    — dashboard admin
app/admin/settings/page.tsx              — force-dynamic, key prop, getSettings()
app/admin/dashboard/page.tsx             — RLS fix
app/api/reservations/route.ts            — champs heure/personnes + WhatsApp link
app/api/settings/route.ts                — GET public, PATCH auth protégé
lib/settings.ts                          — merge DEFAULTS + Supabase, debug log
lib/whatsapp.ts                          — generateWhatsAppLink()
supabase-schema.sql                      — table settings + colonnes réservation
```

---

## 4. Bugs résolus cette session

### Réservations non enregistrées

- Cause : le formulaire postait sur `/api/reservation` (sans 's') au lieu de `/api/reservations`
- Fix : correction de l'URL dans ReservationLayout.tsx

### Champs `heure` et `personnes` jamais sauvegardés

- Cause : champs présents dans le formulaire mais absents du `data` object envoyé à l'API, et absents de l'INSERT Supabase
- Fix : ajout de `heure_souhaitee` et `nombre_personnes` dans le data object, la route API et la table Supabase

### Dashboard admin montrait 0 réservations

- Cause : politique RLS Supabase supprimée par erreur lors d'un audit sécurité — la politique SELECT pour le rôle `authenticated` avait été retirée
- Fix : recréation de la politique dans le dashboard Supabase

### Rate limiting inopérant

- Cause : le rate limiting était dans le middleware Next.js mais le matcher excluait `/api/*`
- Fix : déplacé directement dans `app/api/reservations/route.ts`

### WhatsApp ne s'ouvrait pas

- Cause : `window.open()` appelé après un `await fetch()` asynchrone — les navigateurs bloquent les popups non déclenchées par un clic direct
- Fix : suppression du `window.open` automatique, remplacement par un bouton vert "Envoyer sur WhatsApp" affiché dans l'écran de confirmation

### Champs /admin/settings invisibles

- Cause : couleur du texte identique au fond (pas de `text-gray-900` sur les inputs)
- Fix : ajout de `text-gray-900` sur tous les inputs du formulaire

### Titre hero masqué sous la navbar

- Cause : la section `h-screen` commençait à y=0, la navbar fixe (57px) recouvrait le début du contenu
- Fix : `pt-[57px]` sur la `<section>` hero

---

## 5. Pièges à ne pas reproduire

### RLS Supabase

Le fichier `supabase-schema.sql` est de la documentation morte. Les politiques réelles vivent dans le dashboard Supabase. Ne jamais supprimer une politique sans tester immédiatement `/admin/dashboard`.

Politiques critiques à ne jamais supprimer :

- `authenticated` → SELECT sur `reservations` et `contacts` (dashboard)
- `anon` → INSERT sur `reservations` (formulaire)
- `service_role` → ALL sur toutes les tables (API routes)

### Variables Railway

`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` est baked au BUILD. Si absente au moment du build, elle est vide en prod même si ajoutée après. Toujours vérifier le champ carte sur `/reservation` après chaque déploiement.

### `window.open()` après fetch

Les navigateurs bloquent les popups ouvertes de façon asynchrone. Toujours utiliser un lien `<a href>` ou un bouton cliqué par l'utilisateur pour ouvrir WhatsApp ou toute URL externe.

### Couleur des inputs sur fond clair

Les inputs sans `text-gray-900` explicite héritent d'une couleur qui peut se confondre avec le fond. Toujours ajouter `text-gray-900` sur les champs de formulaire admin.

### `useState(initial)` et hydration React

Si le serveur rend des données A et que le client reçoit des données B via fetch, React peut freezer l'affichage. Utiliser un `useEffect` avec `setValues(data)` après le montage pour forcer la mise à jour côté client.

### `window.open` bloqué par navigateur

Ne pas appeler `window.open()` dans un bloc `async/await` après une requête réseau. Le navigateur considère que ce n'est pas un geste utilisateur direct et bloque la popup.

---

## 7. Session 23-24 mai 2026 — Cloudflare + SEO + Sécurité + Responsive

### Problème d'indexation Google résolu

- Redirections 307 → 308 (permanent) dans le middleware pour le SEO
- Redirection www → non-www corrigée (le port interne Railway :8080 s'ajoutait dans l'URL)
- Sitemap corrigé : ajout de la racine `/` manquante, revalidate 86400
- Sitemap soumis à Google Search Console (était en erreur 18/18)
- `revalidate = 3600` ajouté sur toutes les pages publiques

### Audit sécurité — 3 failles corrigées

- `notification_email` exposée dans l'API GET publique `/api/settings` → masquée via whitelist `PUBLIC_KEYS`
- Brute-force PIN sur `/api/mimi` → rate limiting ajouté (5 tentatives / 15 min par IP)
- XSS dans les emails de notification → fonction `esc()` pour sanitiser tous les champs HTML

### Responsive — bug critique page Services résolu

- `md:hidden` / `hidden md:flex` ne fonctionnait pas : Next.js SSR rendait `isMobile=false` au premier rendu, les deux blocs coexistaient
- Fix : `useEffect + window.innerWidth` côté client uniquement dans `ServicesPageClient.tsx`
- Layout mobile : pills horizontales scrollables + photo 420px (inline styles)
- Layout desktop : 2 colonnes original préservé (Tailwind)

### Performance — score PageSpeed 74/100 (objectif 80+)

- Cause racine : TTFB 1,880ms (Railway cold start) + `cache-control: no-store` forcé par next-intl via cookie `NEXT_LOCALE`
- Next.js force automatiquement `no-store` dès qu'une réponse contient `Set-Cookie`
- Tentative `localeCookie: false` abandonnée : TBT 450ms → 3,120ms, score 74 → 39. **Ne jamais retenter.**
- Fixes déployés : `unstable_cache` sur settings, `.browserslistrc` (élimine 11 KiB polyfills), `revalidate` pages

### Cloudflare — configuration en cours (propagation en attente)

**Objectif :** bypasser le `no-store` de Railway via cache CDN edge → TTFB ~100ms → score 85-90/100

**État au 24 mai 2026 :**

- Domaine ajouté sur Cloudflare (plan Free)
- DNS importés et configurés :
  - `A` : `mimi-coiffure.com` → `66.33.22.222` (Proxied)
  - `CNAME` : `www` → `7v3u8tks.up.railway.app` (Proxied)
  - `CNAME` : `webmail` → `webmail.gandi.net` (**DNS only** — important, ne pas proxier)
- Nameservers changés chez Gandi :
  - `meiling.ns.cloudflare.com`
  - `thomas.ns.cloudflare.com`
- Propagation DNS en cours (15 min à 24h)

**Étape restante obligatoire — Cache Rule Cloudflare :**

Sans cette règle, Cloudflare respecte le `no-store` de Railway et ne cache rien.

Dans Cloudflare > Rules > Cache Rules > + Create rule :

Nom : `Cache HTML public pages`

Conditions (toutes en AND) :

- Hostname equals `mimi-coiffure.com`
- URI Path does not start with `/mimi`
- URI Path does not start with `/api`
- URI Path does not start with `/admin`

Actions :

- Eligible for cache : ON
- Edge TTL : Override origin → 2 hours (7200s)
- Browser TTL : Override → 30 minutes

**Comment vérifier que Cloudflare est actif :**

```bash
curl -I https://mimi-coiffure.com | grep -i "cf-ray\|server"
```

Si tu vois `cf-ray:` dans les headers → Cloudflare est actif. Alors configurer la Cache Rule.

### Leçon critique — `localeCookie: false` à ne jamais retenter

Supprimer le cookie `NEXT_LOCALE` pour obtenir `cache-control: public` est une fausse bonne idée. next-intl recalcule la locale côté client sans cookie → TBT explose × 7. La seule solution viable est Cloudflare CDN qui cache malgré le `no-store`.

---

## 9. Session 25 mai 2026 (soir) — Analytics + Formulaire contact

### Analytics Umami

- Template Umami déployé sur Railway dans le même projet (3 services : umami + Postgres-MqJ4 + Valkey)
- URL dashboard : `umami-production-2141.up.railway.app` — login : `admin` / mot de passe à changer
- Website ID `mimi-coiffure.com` : `a779a13d-9789-46fc-95c2-958ead141b9d`
- Script intégré dans `app/[locale]/layout.tsx` (balise `<script defer>` dans `<head>`)
- CSP corrigé dans `next.config.mjs` : `umami-production-2141.up.railway.app` ajouté dans `script-src` et `connect-src` — le script était bloqué par le Content Security Policy
- Sans cookie, conforme RGPD, pas de mise à jour du bandeau cookies requise
- **À faire** : changer le mot de passe admin Umami (actuellement `umami` par défaut)

### Formulaire de contact

- Route API : `app/api/contact/route.ts` — POST, validation tous champs, rate limiting 3 req/min/IP, XSS sanitisé
- Composant : `components/sections/ContactForm.tsx` — client component, trilingue FR/EN/ES
- Champs : prénom, nom, téléphone, email, demande
- Email envoyé à `contact@mimi-coiffure.com` via Resend
- Intégré dans `app/[locale]/contact/page.tsx` sous la carte Google Maps
- **Dépendance** : `RESEND_API_KEY` doit être présente dans Railway

### Fichiers touchés (session 25 mai soir)

```
app/[locale]/layout.tsx              — script Umami dans <head>
next.config.mjs                      — CSP : ajout Umami dans script-src + connect-src
app/api/contact/route.ts             — nouvelle route API contact (créé)
components/sections/ContactForm.tsx  — nouveau composant formulaire (créé)
app/[locale]/contact/page.tsx        — import + intégration ContactForm
```

---

## 8. Session 25 mai 2026 — Email + Légal + SEO canonicals

### Email `contact@mimi-coiffure.com`

- Abonnement Private Email Starter acheté sur Namecheap pour `mimi-coiffure.com` (€12.83/an)
- Boîte `contact@mimi-coiffure.com` créée, Catch-All activé, 5 GB
- DNS Cloudflare configuré :
  - MX `mx1.privateemail.com` priorité 10
  - MX `mx2.privateemail.com` priorité 10
  - TXT `v=spf1 include:privateemail.com ~all`
  - Anciens enregistrements Gandi supprimés (spool, fb, SRV imap/pop3/submission, SPF Gandi)
- Webmail : `mail.privateemail.com` avec `contact@mimi-coiffure.com`
- **À faire** : aller dans `/admin/settings` et mettre `contact@mimi-coiffure.com` comme email de notification

### Mentions légales + RGPD conformes

- Responsable de publication ajouté : **Moujahid ANANE** (FR/EN/ES) dans `/mentions-legales`
- `robots: index: false` retiré des deux pages légales — elles sont maintenant indexables
- Meta description ajoutée sur les deux pages
- `/mentions-legales` et `/politique-de-confidentialite` ajoutées au sitemap (3 locales chacune)
- Bandeau cookies confirmé opérationnel dans le layout

### Fix inputs /admin/settings invisibles

- Cause : `globals.css` applique `text-white` sur le `body`, les inputs héritaient cette couleur
- Fix : `bg-white` + `ring-offset-white` ajoutés sur les 3 inputs (WhatsApp, email, prix) dans `SettingsForm.tsx`

### SEO — canonicals avec slash final

- Problème : Google signalait `mimi-coiffure.com/fr` comme doublon car le canonical déclarait `/fr` sans slash mais Next.js sert `/fr/` avec slash
- Fix : slash final ajouté sur tous les canonicals de toutes les pages publiques (8 fichiers)
- Fix appliqué aussi sur les hreflang dans `app/[locale]/layout.tsx`
- **Action Search Console** : cliquer "Valider la correction" sur les 2 lignes d'erreur (redirection + doublon canonique)

### Fichiers touchés (session 25 mai)

```
components/admin/SettingsForm.tsx                        — bg-white + ring-offset-white sur inputs
lib/sendNotificationEmail.ts                             — from dynamique via RESEND_FROM_EMAIL
app/[locale]/mentions-legales/page.tsx                   — Moujahid ANANE + indexable + meta desc
app/[locale]/politique-de-confidentialite/page.tsx       — indexable + meta description
app/[locale]/layout.tsx                                  — canonical + hreflang avec slash final
app/[locale]/page.tsx                                    — canonical avec slash final
app/[locale]/contact/page.tsx                            — canonical avec slash final
app/[locale]/galerie/page.tsx                            — canonical avec slash final
app/[locale]/reservation/page.tsx                        — canonical avec slash final
app/[locale]/a-propos/page.tsx                           — canonical avec slash final
app/[locale]/services/page.tsx                           — canonical avec slash final
app/sitemap.ts                                           — ajout mentions-legales + politique
```

---

## 6. Outils et services utilisés dans le projet

| Outil / Service             | Rôle                                                              | URL / Accès                                          |
| --------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------- |
| **Railway**                 | Hébergement du site + Umami. Déploiement auto sur push `main`     | railway.app                                          |
| **GitHub**                  | Repo source du site                                               | github.com/Moujanane/salon-mimi                      |
| **Supabase**                | Base de données PostgreSQL — stockage réservations + settings     | supabase.com                                         |
| **Resend**                  | Envoi des emails (notifications réservation + formulaire contact) | resend.com — clé `RESEND_API_KEY` dans Railway       |
| **Cloudflare**              | DNS + CDN. Nameservers : `meiling` + `thomas.ns.cloudflare.com`   | dash.cloudflare.com                                  |
| **Gandi**                   | Registrar du domaine `mimi-coiffure.com`                          | gandi.net                                            |
| **Namecheap Private Email** | Boîte mail `contact@mimi-coiffure.com` — plan Starter, €12.83/an  | privateemail.com — webmail : mail.privateemail.com   |
| **Umami**                   | Analytics sans cookie (alternative GA4). Hébergé sur Railway      | umami-production-2141.up.railway.app — login : admin |
| **Google Search Console**   | Indexation SEO, suivi des erreurs de crawl                        | search.google.com/search-console                     |
| **Google Maps**             | Iframe carte sur la page contact                                  | Embed dans `/fr/contact`                             |
| **WhatsApp**                | Canal de confirmation des réservations                            | Numéro configurable dans `/admin/settings`           |
| **TripAdvisor**             | Fiche établissement (en attente validation)                       | tripadvisor.com                                      |
| **Playwright**              | Tests de non-régression (11 tests E2E)                            | `npx playwright test`                                |

### Variables d'environnement Railway (site salon-mimi)

| Variable                        | Rôle                                                    |
| ------------------------------- | ------------------------------------------------------- |
| `RESEND_API_KEY`                | Envoi emails via Resend API (clé commence par `re_`)    |
| `MIMI_PIN`                      | PIN d'accès à la PWA `/mimi.html` (actuellement `1993`) |
| `SUPABASE_URL`                  | URL du projet Supabase                                  |
| `SUPABASE_SERVICE_ROLE_KEY`     | Clé service Supabase (accès total)                      |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL Supabase côté client                                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon Supabase côté client                           |

---

## 10. Session 26 mai 2026 — Emails formulaire contact

### Problème résolu : emails formulaire contact n'arrivaient pas

Diagnostic par étapes :

1. `RESEND_API_KEY` absente de Railway → erreur 500
2. Clé ajoutée mais invalide (sans préfixe `re_`) → Resend retournait `{"ok":true}` mais n'envoyait rien silencieusement
3. Nouvelle clé créée sur resend.com (commence par `re_`) → emails arrivés sur `moujanane@free.fr`

### Leçons critiques

- Railway bloque les ports SMTP 465 et 587 — ne jamais utiliser Nodemailer/SMTP depuis Railway. Toujours passer par une API HTTP (Resend, etc.)
- Resend ne retourne pas d'erreur si la clé API est invalide — toujours vérifier dans le dashboard Resend > Emails que les envois apparaissent bien
- Les clés Resend commencent obligatoirement par `re_`
- Instancier Resend dans le handler (pas au niveau module) pour s'assurer que la variable est lue au moment de l'appel

### Destination des emails (état actuel)

- Formulaire contact : `moujanane@free.fr` (sender : `onboarding@resend.dev`)
- Notifications réservations : adresse configurée dans `/admin/settings`

### Fichiers touchés

```
app/api/contact/route.ts        — Resend instancié dans le handler
lib/sendNotificationEmail.ts    — Resend (Nodemailer supprimé)
```

---

## 6b. Délégation — protocole agent

Pour tout diagnostic ou correction, déléguer à un agent avec le prompt suivant :

```
Tu es un développeur senior qui intervient sur le projet Salon Mimi.
Repo local : /Users/Mouj/Desktop/salon-mimi
Hébergement : Railway (déploiement auto sur push main)
Stack : Next.js 14 App Router, Supabase, TypeScript, Tailwind

Contexte complet dans : /Users/Mouj/Desktop/salon-mimi/handoff.md

Ta mission :
1. Lire handoff.md en entier avant toute action
2. Diagnostiquer le problème décrit ci-dessous
3. Identifier la cause racine (pas les symptômes)
4. Corriger dans les fichiers source
5. Vérifier qu'il n'y a pas d'erreur TypeScript (npx tsc --noEmit)
6. Committer avec un message clair
7. Pusher sur main (git push origin main)
8. Rapporter ce qui a été fait et ce qui reste à vérifier manuellement

Ne pas :
- Supprimer ou modifier les politiques RLS Supabase sans instruction explicite
- Utiliser window.open() après un fetch async
- Laisser des inputs sans text-gray-900 sur fond clair
- Marquer une tâche terminée sans avoir vérifié les logs d'erreur

Problème à résoudre :
[DÉCRIRE LE PROBLÈME ICI]
```

L'agent a accès complet : lecture, écriture, exécution de commandes, commit et push.
