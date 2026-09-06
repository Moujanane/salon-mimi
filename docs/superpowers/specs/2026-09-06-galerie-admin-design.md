# Spec 2 — Admin galerie (ajout / suppression / réordonnancement)

Date : 2026-09-06
Statut : validé, prêt pour le plan d'implémentation
Dépend de : Spec 1 (`2026-09-06-galerie-dynamique-design.md`) — table `gallery_items`,
bucket `gallery`, `lib/gallery.ts` (tag cache `gallery-items`), déployée en prod.

## Contexte

La galerie publique lit désormais ses médias depuis la table Supabase
`gallery_items` (Spec 1, en prod avec `NEXT_PUBLIC_GALLERY_DYNAMIC=true`). Mais
il n'y a aucune interface pour gérer ces médias : Mouj doit passer par le
dashboard Supabase (Table Editor + Storage) ou le script `gallery:sheet`, ce
qui est laborieux et sans aperçu visuel des photos.

Cette spec ajoute une page `/admin/galerie` : grille de vignettes avec une
icône poubelle sur chacune, un formulaire d'ajout, et le réordonnancement par
glisser-déposer.

## Objectifs

- Page `/admin/galerie`, 3e onglet de la nav admin, même auth que le reste
  (`supabase.auth.getUser()` → redirect `/admin/login`).
- **Ajouter** une photo ou une vidéo depuis un formulaire, avec description
  (`alt`) obligatoire. Photos compressées automatiquement côté serveur.
- **Supprimer** un média en un clic (icône poubelle + confirmation) : ligne DB
  - fichier(s) Storage supprimés.
- **Réordonner** par glisser-déposer, sauvegarde automatique.
- Chaque modification invalide le cache de la galerie publique
  (`revalidateTag("gallery-items")`) → mise à jour immédiate du site.
- Toutes les écritures passent par des API routes protégées par l'auth admin,
  utilisant `supabaseAdmin` (service_role).

## Non-objectifs

- Transcodage vidéo côté serveur (pas de ffmpeg sur Railway). Les vidéos sont
  stockées telles quelles, avec une limite de taille.
- Corbeille / restauration : la suppression est définitive.
- Édition en masse, filtres, recherche, pagination : ~40 médias, une grille
  simple suffit.
- Gestion des catégories / sections : la galerie publique est une grille brute
  (décidé en Spec 1). Pas de colonne `category`.
- Multi-upload (plusieurs fichiers d'un coup) : un fichier à la fois.

## Architecture

### Nouvelle page — `app/admin/galerie/page.tsx`

Server Component. Pattern identique à `app/admin/settings/page.tsx` :

```tsx
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function GalerieAdminPage() {
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

  const { data: items } = await supabase
    .from("gallery_items")
    .select("id, type, url, poster_url, alt, sort_order, width, height")
    .order("sort_order", { ascending: true });

  return <GalleryAdmin initialItems={items ?? []} />;
}
```

Note : lecture directe via le client `authenticated` (pas `getGalleryItems()`
qui est caché) — l'admin doit voir l'état frais après chaque modification.

### Nav — `app/admin/layout.tsx`

Ajouter un 3e `<Link href="/admin/galerie">Galerie</Link>` après « Paramètres »,
même style que les deux existants.

### Composant client — `components/admin/GalleryAdmin.tsx`

`"use client"`. Reçoit `initialItems: GalleryItem[]` (type importé de
`@/lib/gallery`). État local `items` initialisé dessus, mis à jour après chaque
opération pour un rendu optimiste.

Structure :

1. **`<AddMediaForm onAdded={item => setItems([...items, item])} />`** — en haut
2. **`<SortableGrid items={items} onReorder={...} onDelete={...} />`** — la grille

Sous-composants dans le même fichier ou fichiers dédiés (le plan tranchera) :

- **`AddMediaForm`** :
  - `<input type="file" accept="image/*,video/mp4">`
  - `<input type="text">` description — requis, `minLength={10}`
  - Pour une **vidéo** : à la sélection du fichier, extraire côté navigateur
    - les dimensions via un `<video>` masqué (`videoWidth`/`videoHeight` après
      `loadedmetadata`)
    - une frame de poster via `<canvas>` (à ~1s de lecture), export JPEG
  - Refuse une vidéo > 8 Mo (message : « Vidéo trop lourde, compressez-la avant
    l'envoi — 8 Mo maximum. »).
  - `POST /api/gallery` en `FormData` : `file`, `alt`, et pour les vidéos
    `poster` (Blob), `width`, `height`.
  - État : idle / uploading (spinner + « Envoi en cours… ») / error (message
    rouge). Succès → `onAdded(nouvelItem)` + reset du formulaire.

- **`SortableGrid`** — grille responsive (`grid-cols-2 sm:grid-cols-3
md:grid-cols-4`), chaque cellule = `SortableTile`. Utilise `@dnd-kit/core` +
  `@dnd-kit/sortable` + `@dnd-kit/modifiers`.
  - `DndContext` + `SortableContext` (stratégie `rectSortingStrategy`).
  - `onDragEnd` : `arrayMove` local (rendu instantané), puis
    `PATCH /api/gallery/order` avec `[{ id, sort_order }]` recalculé (index
    dans le nouveau tableau). Échec → recharge depuis `GET /api/gallery` et
    affiche une erreur.

- **`SortableTile`** :
  - `useSortable({ id })` — la vignette entière est la poignée de drag.
  - Image : `<img>` simple (`poster_url` pour les vidéos, `url` pour les
    photos), `object-cover`, `aspect-square`, `loading="lazy"`.
  - Badge « ▶ » sur les vidéos.
  - **Icône poubelle** en `absolute top-2 right-2`, visible au survol
    (`group-hover:opacity-100`), `onClick` → ouvre une confirmation.
  - Confirmation : petite modale ou `window.confirm` (le plan tranchera —
    préférence pour une modale cohérente avec le design, mais `window.confirm`
    acceptable pour V1). Sur confirmation → `DELETE /api/gallery/[id]` →
    `onDelete(id)` retire la tuile de l'état local.
  - Le clic sur la poubelle ne doit PAS déclencher un drag
    (`onPointerDown` stopPropagation sur le bouton).

### API routes

Toutes protégées par un helper `getAuthUser()` identique à celui de
`app/api/settings/route.ts` (copié ou extrait dans `lib/adminAuth.ts` — le plan
tranchera ; extraire est plus propre puisqu'il y aura 3+ routes admin).
`401` si non authentifié. Écritures via `supabaseAdmin`.

Après toute mutation réussie : `revalidateTag("gallery-items")` (import de
`next/cache`).

#### `POST /api/gallery` — ajouter un média

`FormData` : `file` (File), `alt` (string), et si vidéo `poster` (Blob),
`width` (string), `height` (string).

1. Auth → 401 sinon.
2. `alt` : trim, longueur ≥ 10 → 400 sinon (« Description trop courte »).
3. Détermine le type depuis `file.type` (`image/*` → photo, `video/mp4` →
   vidéo, autre → 400 « Format non supporté »).
4. **Photo** :
   - `sharp(buffer).rotate()` (respecte l'orientation EXIF) `.resize({ width:
1400, withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer()`
   - `sharp(...).metadata()` pour `width`/`height` finaux
   - nom : `slugify(basename)` + `-` + `Date.now()` + `.jpg`
   - `supabaseAdmin.storage.from("gallery").upload("photos/<nom>", buf, {
contentType: "image/jpeg", upsert: false })`
   - URL publique : `${SUPABASE_URL}/storage/v1/object/public/gallery/photos/<nom>`
5. **Vidéo** :
   - Taille > 8 Mo → 400.
   - nom vidéo : `slugify(basename)` + `-` + `Date.now()` + `.mp4`
   - upload tel quel, `contentType: "video/mp4"`
   - poster (Blob reçu) : upload dans `posters/<slug>-<ts>.jpg`,
     `contentType: "image/jpeg"`. Si pas de poster fourni → `poster_url = null`.
   - `width`/`height` : parse les valeurs reçues (entiers > 0, sinon null).
6. `sort_order` : `select sort_order from gallery_items order by sort_order desc
limit 1` → `(max ?? -1) + 1`.
7. `supabaseAdmin.from("gallery_items").insert({ type, url, poster_url, alt,
sort_order, width, height }).select().single()`.
8. `revalidateTag("gallery-items")`.
9. Réponse : `201` avec la ligne créée (le client l'ajoute à son état).

Limite de taille de body : Next 15 route handlers acceptent les gros bodies par
défaut (pas la limite 1 Mo des anciennes API routes `pages/`). Confirmer, et si
besoin `export const maxDuration = 30`.

#### `DELETE /api/gallery/[id]` — supprimer un média

1. Auth → 401.
2. `select url, poster_url, type from gallery_items where id = <id>` → 404 si
   absent.
3. Déduire les chemins Storage depuis les URLs (`.../gallery/<path>` → `<path>`).
4. `supabaseAdmin.storage.from("gallery").remove([photoOuVideoPath, ...(poster ? [posterPath] : [])])`.
   Si erreur Storage → log, on continue (fichier orphelin acceptable).
5. `supabaseAdmin.from("gallery_items").delete().eq("id", id)` → 500 si erreur.
6. `revalidateTag("gallery-items")`.
7. Réponse `200 { success: true }`.

#### `PATCH /api/gallery/order` — réordonner

1. Auth → 401.
2. Body : `{ order: { id: string; sort_order: number }[] }`. Valider que c'est
   un tableau non vide d'objets `{id, sort_order}` bien typés → 400 sinon.
3. Pour chaque entrée : `supabaseAdmin.from("gallery_items").update({
sort_order }).eq("id", id)`. (Boucle simple ; ~40 lignes, acceptable. Une
   RPC batch serait mieux mais YAGNI.)
4. `revalidateTag("gallery-items")`.
5. Réponse `200 { success: true }`.

#### `GET /api/gallery` — relecture (pour le fallback d'erreur du réordonnancement)

1. Auth → 401.
2. `supabaseAdmin.from("gallery_items").select("id, type, url, poster_url,
alt, sort_order, width, height").order("sort_order")`.
3. Réponse `200` avec le tableau.

### Utilitaires

- **`lib/adminAuth.ts`** (nouveau, extrait de `app/api/settings/route.ts`) :
  `getAuthUser()` — le helper cookies + `getUser()`. Refactor léger : mettre à
  jour `app/api/settings/route.ts` pour l'importer aussi (une seule définition).
- **`slugify(name: string): string`** — retire l'extension, translittère les
  accents (`.normalize("NFD").replace(/[̀-ͯ]/g, "")`), remplace tout
  ce qui n'est pas `[a-z0-9]` par `-`, compacte les `-`, lowercase, tronque à
  ~60 car. Placé dans `lib/gallery.ts` ou un `lib/slug.ts` (plan tranchera).
- **`storagePathFromUrl(url: string): string`** — extrait `<path>` d'une URL
  `.../storage/v1/object/public/gallery/<path>`. Utilisé par le DELETE.

### Dépendances à ajouter

```
npm i @dnd-kit/core @dnd-kit/sortable @dnd-kit/modifiers
```

(~15 Ko gzip total, standard React, accessible clavier.)
`sharp` est déjà en devDependencies (ajouté en Spec 1) — le passer en
**dependencies** puisque `POST /api/gallery` l'utilise au runtime en prod.

## Sécurité

- Toutes les mutations exigent une session admin valide (`getUser()`), pas
  seulement le cookie — cohérent avec `app/api/settings/route.ts`.
- `supabaseAdmin` (service_role) uniquement côté serveur, jamais exposé au
  client.
- Upload : whitelist stricte des types (`image/jpeg`, `image/png`,
  `image/webp`, `video/mp4`). Rejeter tout le reste en 400.
- `slugify` empêche tout `../` ou caractère de chemin dans le nom de fichier
  Storage.
- Le `POST` ne fait pas confiance au `file.name` pour le type : il lit
  `file.type` ET, pour les images, `sharp` échouera de toute façon sur un
  non-image.
- Taille : photos plafonnées implicitement par `sharp` (resize 1400px) ;
  vidéos plafonnées à 8 Mo avant tout traitement. Ajouter un garde-fou global
  (rejeter tout `file.size > 20 Mo` en 413 avant même de distinguer le type).
- RLS : la table a déjà `service_role → ALL` et pas d'`INSERT/UPDATE/DELETE`
  pour `anon`/`authenticated` (Spec 1). Les API routes sont le seul chemin
  d'écriture. Rien à changer côté RLS. `supabase-schema.sql` est déjà à jour.

## Rollback

- La page `/admin/galerie` et ses routes sont **additives** : ne pas les
  déployer, ou retirer le lien de nav, suffit à « désactiver » la fonction. La
  galerie publique (Spec 1) est indépendante.
- Pas de flag nécessaire — c'est une page admin, invisible du public, et son
  absence ne casse rien.
- `git revert` du commit de merge restaure l'état sans l'admin galerie. La
  table `gallery_items` et son contenu restent (gérés par Spec 1).

## Vérifications (règles du projet)

- `npx tsc --noEmit`
- `npm run build` (pages générées, `/admin/galerie` en dynamique)
- `npx playwright test` — suite complète verte.
- Nouveau `e2e/galerie-admin.spec.ts` :
  - `/admin/galerie` sans session → redirige vers `/admin/login`
  - `POST /api/gallery` sans session → 401
  - `DELETE /api/gallery/<id>` sans session → 401
  - `PATCH /api/gallery/order` sans session → 401
  - (test authentifié complet impossible sans login admin dans l'infra
    Playwright — même limite que `e2e/api-reservations-id.spec.ts`, connue.
    Contrat 401 seulement + test manuel obligatoire.)
- **Test manuel obligatoire** (checklist du plan) :
  1. Se connecter à `/admin`, onglet Galerie → la grille affiche les 40 médias
  2. Ajouter une photo (avec description) → apparaît dans la grille ET sur
     `/fr/galerie` après refresh
  3. Ajouter une vidéo < 8 Mo → poster généré, apparaît des deux côtés
  4. Tenter une vidéo > 8 Mo → message d'erreur, rien ajouté
  5. Glisser une vignette → l'ordre change, persiste après reload, se reflète
     sur `/fr/galerie`
  6. Supprimer une photo → confirmation → disparaît des deux côtés, fichier
     absent du bucket
  7. Vérifier `/admin/dashboard` et `/fr/reservation` toujours OK (non-régression)

## Fichiers touchés

| Fichier                             | Nature                                              |
| ----------------------------------- | --------------------------------------------------- |
| `app/admin/galerie/page.tsx`        | **créé** — page server, auth + fetch                |
| `app/admin/layout.tsx`              | + lien de nav « Galerie »                           |
| `components/admin/GalleryAdmin.tsx` | **créé** — orchestrateur client                     |
| `components/admin/AddMediaForm.tsx` | **créé** (ou inline dans GalleryAdmin)              |
| `components/admin/SortableGrid.tsx` | **créé** (ou inline) — dnd-kit                      |
| `app/api/gallery/route.ts`          | **créé** — `POST` (ajout) + `GET` (relecture)       |
| `app/api/gallery/[id]/route.ts`     | **créé** — `DELETE`                                 |
| `app/api/gallery/order/route.ts`    | **créé** — `PATCH` (réordonnancement)               |
| `lib/adminAuth.ts`                  | **créé** — `getAuthUser()` extrait                  |
| `app/api/settings/route.ts`         | refactor : importe `getAuthUser` de `lib/adminAuth` |
| `lib/slug.ts`                       | **créé** — `slugify()` + `storagePathFromUrl()`     |
| `e2e/galerie-admin.spec.ts`         | **créé** — contrats 401 + redirect                  |
| `package.json`                      | + `@dnd-kit/*`, `sharp` en dependencies             |
| `supabase-schema.sql`               | inchangé (RLS déjà correcte)                        |

## Risques

| Risque                                                                 | Mitigation                                                                                                                       |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Body trop gros rejeté par Next/Railway sur `POST /api/gallery`         | Next 15 route handlers n'ont pas la limite 1 Mo ; vidéos plafonnées 8 Mo ; garde-fou 20 Mo. Tester avec une vraie vidéo de 7 Mo. |
| `sharp` absent au runtime prod (était devDep)                          | Le passer en `dependencies` — étape explicite du plan.                                                                           |
| Extraction de dimensions vidéo côté navigateur échoue (codec exotique) | `width`/`height` tombent à `null` → rendu avec ratio 4/5 par défaut (déjà géré Spec 1). Non bloquant.                            |
| Poster vidéo généré au navigateur : frame noire si extraite à t=0      | Extraire à `min(1, duration/2)` et attendre l'event `seeked` avant le `canvas.drawImage`.                                        |
| dnd-kit + rendu optimiste : ordre incohérent si le PATCH échoue        | Sur échec, `GET /api/gallery` et on remplace l'état — l'ordre serveur fait foi.                                                  |
| Clic poubelle interprété comme début de drag                           | `stopPropagation` sur le `onPointerDown` du bouton poubelle.                                                                     |
| Suppression Storage échoue mais ligne DB supprimée → fichier orphelin  | Acceptable (log). Un nettoyage manuel du bucket reste possible. Le média disparaît bien de la galerie, c'est l'essentiel.        |
| Deux admins modifient en même temps                                    | Très improbable (une seule utilisatrice). Dernière écriture gagne. Pas de verrou.                                                |

## Détails d'implémentation notables (pour le plan)

- **Poster vidéo côté client** : `URL.createObjectURL(file)` → `<video>` masqué
  → `loadedmetadata` (dims) → `currentTime = Math.min(1, duration/2)` →
  `seeked` → `<canvas>` `drawImage` → `canvas.toBlob(cb, "image/jpeg", 0.8)`.
  Révoquer l'object URL ensuite.
- **`sort_order` au réordonnancement** : après `arrayMove`, réindexer TOUT le
  tableau (`items.map((it, i) => ({ id: it.id, sort_order: i }))`) et envoyer
  le lot complet — évite les collisions et garde des valeurs propres 0..N.
- **Confirmation de suppression** : V1 peut utiliser `window.confirm("Supprimer
définitivement cette photo ?")`. Une modale stylée est un plus, pas un
  bloquant — le plan peut la mettre en option de fin.
- **Retour visuel upload** : désactiver le bouton + spinner pendant la requête,
  pour éviter le double envoi.
