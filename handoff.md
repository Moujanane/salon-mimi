# Handoff — Salon Mimi

## 1. Objectif du projet

Refaire entièrement le site du Salon Mimi (coiffure afro, Marrakech) avec un design Bold & Culture premium, optimisé SEO local, sécurisé, et déployé sur Railway.

---

## 2. État actuel du code

### Ce qui marche

- Homepage : hero split 50/50, 3 colonnes photo animées, titre "Tresses africaines & Rasta / Marrakech", badge "Place Jamaa El Fna" en ocre
- Page Services : 10 services en français, pills cliquables, panneau photo dynamique, tient sur une page
- Page Réservation : formulaire complet (nom, téléphone, service, date, heure, nombre de personnes, message), insertion Supabase validée, bouton WhatsApp affiché après soumission
- Header : nav fixe, hamburger mobile, bouton RDV ocre
- Footer, LocationSection, CTAFinal : OK
- SEO : JSON-LD HairSalon, hreflang fr/en/es, og:image
- Sécurité : headers HTTP (X-Frame-Options, HSTS, etc.), rate limiting API dans les routes, validation serveur
- Middleware i18n : /admin exclu correctement
- Images : 14 photos réelles du salon dans /public/images/
- Dashboard admin : affiche les réservations (RLS Supabase corrigée)
- Page admin /settings : WhatsApp et prix paramétrables, sauvegarde en Supabase

### Ce qui reste fragile

- Page /admin/settings : les champs prix s'affichent vides visuellement (problème de couleur CSS réglé pour WhatsApp mais pas encore confirmé pour les prix)
- Le titre hero sur desktop déborde légèrement selon la résolution — ajuster `clamp` si nécessaire

### Ce qui ne marche pas

- Rien de bloquant connu au moment du handoff

---

## 3. Fichiers touchés (session mai 2026)

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

## 6. Délégation — protocole agent

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
