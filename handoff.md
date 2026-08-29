# Handoff — Salon Mimi

## 1. Objectif du projet

Refaire entièrement le site du Salon Mimi (coiffure afro, Marrakech) avec un design Bold & Culture premium, optimisé SEO local, sécurisé, et déployé sur Railway.

---

## 25. Session 30 août 2026 — Pivot stratégique « rasta » + suite optimisation GBP / réseaux

Fait suite à la §24. **Nouvelles stats Google Maps (juillet→août 2026)** :
75 recherches ont affiché la fiche (**+275 %** vs juillet 2025). Top requêtes :

1. `rasta` — **35** (47 %) → **passé n°1**, quasi aucune concurrence à Marrakech
2. `beauty salons` — 24
3. `tresse africaine marrakech` — 16
4. `africa beauty marrakech` — < 15
5. `african salon marrakech` — < 15

**Analyse** : les requêtes deviennent précises et locales (« marrakech » + métier).
Intention d'achat forte. **Décision : arrêter de courir après « beauty salons »
(générique/concurrentiel), tout miser sur « rasta » + « tresse africaine
Marrakech ».** « rasta » devient le fil conducteur de tout : description, posts,
photos, hashtags, future page site.

### Fait cette session (par Mouj, dans les dashboards)

| #   | Action                           | Détail                                                                                                                                                                                                                                                                                                                                |
| --- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Description GBP ré-optimisée** | « tresses rasta » remonté en 1er mot, « Vanilles, locks » en tête de liste des prestations, phrase EN « African salon in Marrakech — rasta & African braids, locks, weaves ». **Google tronque plus court que 750 car.** : version finale ~640 car. (retiré « twists », raccourci « Français, anglais, arabe »)                       |
| 2   | **Post GBP n°1 publié**          | Type « Actualité », thème **Tresses rasta / vanilles**, photo `public/images/tresses-mimi-2.jpeg`, bouton Réserver → `/fr/reservation`                                                                                                                                                                                                |
| 3   | **Bios Instagram + TikTok**      | IG : nom « Salon Mimi · Tresses rasta & africaines », bio « rasta » en 1er + Vanilles/Locks. **Lien IG modifiable UNIQUEMENT dans l'app mobile** → mis sur `https://mimi-coiffure.com/reservation`. TikTok : nom « Salon Mimi · Tresses Marrakech », bio idem, lien `/reservation`. Doublon vidéo TikTok supprimé (gardé la plus vue) |
| 4   | **Attributs GBP**                | Paiements = « Argent liquide seulement » (déjà ok). Parking + équipements complétés                                                                                                                                                                                                                                                   |
| —   | **Réponses aux avis**            | Les 10 réponses (§24) **postées**                                                                                                                                                                                                                                                                                                     |

### Pourquoi `/reservation` sans `/fr/` dans les bios réseaux

Testé : `https://mimi-coiffure.com/reservation` fait un 308 vers `/fr/`, `/en/`
ou `/es/reservation` **selon la langue du navigateur du visiteur**. Comme 72 %
des chercheurs sont anglophones, le lien sans locale les envoie sur la page EN
automatiquement. **Bios réseaux = `/reservation` sans locale.** Le bouton
« Prendre RDV » de la fiche GBP garde `/fr/reservation` (vu surtout depuis
Marrakech, libellés Google en FR).

### Reste à faire — priorités (par impact)

1. **Shooting photos** (`docs/checklist-shooting-photos-salon-mimi.html`) —
   blocage n°1. Débloque galerie GBP + posts Locks/Tissage + page site « rasta »
2. **1 post GBP/semaine** : Box braids (`tresses-mimi-6.jpeg`) → Cornrows/Fulani
   (`tresses-mimi-3.jpeg`) → Locks (après shooting) → Enfants (`s-tresse-fille1.png`)
   → Knotless (`tresses-mimi-1.jpeg`) → Homme (`s-tresse-garcon.png`) → 2e post rasta
3. **Page site `/fr/tresses-rasta-marrakech` + `/en/rasta-braids-marrakech`** —
   chantier dev. Cible : `tresses rasta marrakech`, `rasta braids marrakech`,
   `tresse africaine marrakech`, `african salon marrakech`, `africa beauty marrakech`.
   Structure : H1 rasta+lieu, section « qu'est-ce que les tresses rasta/vanilles/
   locks », prestations+prix, durée/entretien, galerie 6-8 photos rasta (shooting
   requis), FAQ 5-6 Q, « comment venir », CTA, JSON-LD Service+FAQPage+BreadcrumbList,
   lien menu+footer, sitemap, hreflang. **À faire après le shooting + validation
   du plan avec Mouj** (règle projet)
4. **Hashtags rasta** sur chaque post réseau : `#tressesrasta #rastabraids
#rastamarrakech #vanilles #locksmarrakech` + bloc africain/local + bloc Marrakech
5. **Réponses aux avis** : glisser « tresses rasta » / « tresses africaines »
   quand c'est naturel (les réponses sont indexées)
6. TripAdvisor (en attente depuis mai 2026), annuaires Maroc

### Note — pas de changement de code cette session

Tout dans les dashboards GBP / Instagram / TikTok. `git` inchangé côté prod
(dernier commit `901cf5e`). Livrables `docs/` déjà en place (carte QR §23,
checklist shooting §24).

---

## 23. Session 28 août 2026 (soir) — Audit indexation Google Search Console + GEO (EN PROD)

Google Search Console remontait 5 motifs de pages non indexées : 24 « Page avec
redirection », 16 « Autre page avec balise canonique correcte », 9 « Bloquée 403 »,
4 « Introuvable 404 », 3 « Explorée, non indexée ». Diagnostic complet + corrections.

Commit `main` : `263dd8d` (déployé Railway).
Détail et règles : mémoire `salon-mimi-seo-indexation.md`.

### Cause racine des 24 + 16 : trailing slash

Le serveur Next.js (`trailingSlash: false`) redirige `/.../` → `/...` en 308.
Or `app/sitemap.ts`, tous les `canonical` et tous les `hreflang` pointaient vers
des URLs AVEC slash final → Google classait le sitemap en « redirection » et les
pages en « canonique vers une autre URL ».

**Fix `263dd8d`** : slash final retiré de `app/sitemap.ts` (+ suppression de
l'entrée apex nue) et des `canonical` / `hreflang` / `openGraph.url` / JSON-LD
`url` des 8 pages + `app/[locale]/layout.tsx`. Nouveau test
`e2e/seo-canonical.spec.ts` (29 cas) verrouille la non-régression.
Vérifié : `next lint` OK, `tsc --noEmit` OK, `next build` OK (15/15),
Playwright **88 passed / 2 skipped** contre build local, puis prod : sitemap
24 URLs toutes 200, canonicals auto-référents sans slash.

**RÈGLE** : canonical / hreflang / sitemap ne finissent JAMAIS par `/` sur ce
projet. Ne pas réintroduire de slash final sans passer `trailingSlash: true`
dans `next.config.mjs` ET tout aligner d'un coup.

### GEO : robots.txt managé Cloudflare bloquait les IA

Cloudflare → **AI Crawl Control → Overview → « Managed robots.txt »** était activé
et injectait un bloc `# BEGIN Cloudflare Managed content` avec `Disallow: /` sur
ClaudeBot, GPTBot, Google-Extended, etc., AVANT le bloc de `app/robots.ts`.
ChatGPT / Claude / Gemini ne pouvaient pas indexer le site.

**Fix** : Mouj a désactivé le toggle « Managed robots.txt » dans Cloudflare.
Vérifié : `robots.txt` prod ne contient plus que le bloc `app/robots.ts`
(tout `Allow: /`). **RÈGLE** : ne jamais réactiver cette option.

### 9 « Bloquée 403 » + 4 « Introuvable 404 » : fausses alertes

Les 13 URLs (exports GSC du 28/08) ont été explorées les 20-22 août 2026, PENDANT
l'incident apex Railway 403/404 (§16, résolu le 22 août 00h08). Elles répondent
toutes 200 aujourd'hui (vérifié en tant que Googlebot). Rien à coder.

### 3 « Explorée, non indexée »

Variantes `/xx/reservation?service=...`. Normal (canonical pointe vers
`/xx/reservation` sans le paramètre). Rien à faire.

### Suites côté Mouj (GSC) — fait le 28 août 2026

Renvoi du sitemap + « Valider la correction » sur les 4 motifs + demande
d'indexation sur `/fr` `/en` `/es`. Recrawl Google attendu sur 1 à 4 semaines —
**à re-vérifier dans GSC courant septembre 2026** (motifs doivent passer à
« Réussite »).

### Fix lien avis Google + centralisation (commit `7b3ca10`, déployé)

Le dashboard Google Business fournit désormais
`g.page/r/CXqJtbaOg9FUEAE/review` (`source=merchant-review-solicitation`).
Le code utilisait `…FUEBM` (ancien, toujours valide, même établissement
`placeid ChIJedvCcgDvrw0Reom1to6D0VQ` — les deux liens ouvrent la même page).

- `lib/social.ts` : `GBP_URL` + `GOOGLE_REVIEW_URL` → `…FUEAE`
- `app/[locale]/contact/page.tsx` : bouton « avis Google » importe
  `GOOGLE_REVIEW_URL` (plus de lien en dur)
- `lib/sendNotificationEmail.ts` : bouton avis de l'email de notif idem
- `app/[locale]/layout.tsx` : JSON-LD `sameAs` + `hasMap` importent les
  constantes de `lib/social` (`INSTAGRAM_URL`, `TIKTOK_URL`, `MAPS_URL`,
  `GBP_URL`)

Plus aucune occurrence de `CXqJtbaOg9FUEBM` dans le code. Vérifié en prod :
`/fr/contact` → bouton vers `…FUEAE/review`, JSON-LD `sameAs` → `…FUEAE`.

**Fast-follow non bloquant** : les liens Maps (`maps.app.goo.gl/2VHUxKWpLpYFE8836`,
`share.google/t4j91V4ZgAESOoNwp`) restent en dur dans `GoogleReviews.tsx`,
`LocationSection.tsx` et `contact/page.tsx` — pourraient aussi passer par
`lib/social`.

### Carte avis QR à imprimer (livrée, hors git — dans `docs/`)

`docs/carte-avis-qr-salon-mimi.html` — carte format **A6**, fond brun + doré de
la marque, logo Mimi, QR code (généré en JS, lib `qrcode-generator` MIT inline)
pointant vers `g.page/r/CXqJtbaOg9FUEAE/review`, titres **FR/EN/ES**, « Scannez
avec votre téléphone ».

**Obtenir le PDF** : ouvrir le fichier dans Chrome → `Cmd+P` → « Enregistrer au
format PDF » → format **A6**, marges **Aucune**. (Pas de générateur PDF installé
sur ce Mac ; le HTML est éditable si besoin d'ajuster le texte.)

Usage : autocollant plastifié à la caisse / chevalet table de coiffage / carte
remise en fin de prestation. À tester en scannant avec un vrai téléphone avant
impression.

### Test global de non-régression (fin de session 28 août 2026)

Après les 2 déploiements du jour (`263dd8d` + `7b3ca10`) :

- `npx tsc --noEmit` ✓
- Playwright contre la prod `https://mimi-coiffure.com` : **desktop 44 passed /
  1 skip**, **mobile 44 passed / 1 skip**, 0 échec, 0 flaky
- Vérif navigateur prod : home `/fr`, `/fr/reservation?service=box-braids`
  (présélection + prix OK, pas de bug `useSearchParams`), `/fr/contact`
  (bouton avis → `…FUEAE/review`) — tout OK
- Seule erreur console : `400` sur le script Umami — **préexistant** (§20),
  sans impact fonctionnel

**Conclusion : zéro régression.**

### 2 anomalies repérées (NON liées aux changements de la session, non bloquantes)

1. **Hero home affiche « 5/5 sur Google »** alors que la fiche est à **4,2 / 13
   avis**. Le composant `GoogleReviews.tsx` lit l'API Google Places en direct —
   soit l'API renvoie une note partielle, soit un fallback. À investiguer une
   prochaine session.
2. **Erreur console `400` sur le script Umami** sur toutes les pages. Présente
   depuis longtemps, aucun impact fonctionnel, mais casse probablement le
   tracking analytics. À corriger un jour (vérifier Website ID / URL du script
   dans `app/[locale]/layout.tsx`).

### Audit sécurité — pas fait, pas nécessaire pour cette session

Les changements de la session (chaînes d'URL statiques dans `<link>` / JSON-LD /
templates email) n'ont **aucune surface de sécurité** : zéro input utilisateur,
zéro requête serveur, zéro dépendance ajoutée. Un audit sécu complet n'était pas
justifié ici.

**En revanche, un audit sécurité en chantier dédié serait légitime** (jamais
fait formellement) : politiques RLS Supabase réelles (rappel §leçon 1 :
`supabase-schema.sql` est de la doc morte), `npm audit` sur les dépendances,
fuzzing des API routes (`/api/reservations`, `/api/contact`, `/api/push`).
Skill à utiliser : `security-review`. À planifier avec Mouj.

### Note branches

Le travail V2 de la home (branche `feat/home-v2`) était en cours au début de la
session : mis de côté dans `stash@{0}` sur `feat/home-v2`. Récupérer avec
`git checkout feat/home-v2 && git stash pop`. Les fix de la session ont été faits
sur `main`, sans toucher à la V2.

### Commits de la session (sur `main`, tous déployés)

- `263dd8d` fix(seo): retire le slash final des canonical, hreflang et sitemap
- `a34b6fa` docs: handoff — audit indexation GSC + GEO (section 23)
- `7b3ca10` fix(avis): aligne le lien avis Google sur celui du dashboard + centralise

---

## 24. Session 29 août 2026 — Optimisation Google Business Profile + stats + shooting photos

Objectif : améliorer la visibilité du salon sur Google. Analyse des stats GBP,
optimisation complète de la fiche, ménage des photos, livraison d'une checklist
de shooting. **Aucun changement de code** — tout se passe dans le dashboard
Google Business (fait par Mouj) + 2 livrables `docs/` (hors git).

### Ce que disent les stats GBP (30 jours)

- **3 492 vues de fiche.** Répartition : **56 % Google Maps mobile**, 36 %
  Recherche Google mobile, 4 % Maps desktop, 4 % Recherche desktop.
  → **92 % de l'audience est sur mobile, 60 % via Maps.** Ce sont des gens
  physiquement à Marrakech qui cherchent un salon maintenant : très forte
  intention.
- **Seulement 496 vues (14 %) viennent d'une recherche par mots-clés.** Les 86 %
  restants trouvent la fiche en naviguant sur Maps ou via lien direct.
  → **La position sur Maps compte plus que le référencement par mots-clés.**
  Ce qui fait remonter sur Maps : avis, photos, activité (posts), complétude.
- Top requêtes : `beauty salons` 256 (52 %), `hair salon` 98 (20 %),
  `rasta` 35 (7 %), `pedicure` 25 (5 %), `coiffure` 17 (3 %).
  → 72 % des recherches sont en anglais. « rasta » = angle différenciant, peu
  concurrentiel, le salon ressort déjà dessus.

### Fiche GBP — modifications faites (dans le dashboard, par Mouj)

| Champ                                                                                                      | Avant                               | Après                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Nom**                                                                                                    | `SALON MIMI - COIFFURES AFRICAINES` | `Salon Mimi` — violation Google (keyword stuffing) corrigée, risque de suspension éliminé, cohérence NAP avec le site                                                                                                                                                                                                                                  |
| **Catégorie principale**                                                                                   | Salon de coiffure                   | Salon de coiffure (inchangé)                                                                                                                                                                                                                                                                                                                           |
| **Catégories secondaires**                                                                                 | doublon « Salon de coiffure »       | **Institut de beauté** + **Salon de manucure** (doublon retiré). La liste GBP Maroc est réduite : « Salon de beauté », « Coiffeur afro », « Salon de tresses » n'existent pas. « Institut de beauté » capte `beauty salons` (52 % des recherches), « Salon de manucure » capte `pedicure`                                                              |
| **Description**                                                                                            | ok mais générique                   | Réécrite : « tresses rasta » dans la 1re phrase + « Place Jamaa El Fna, au cœur de la Médina » + « Nous parlons français, anglais et arabe » + 1 phrase EN en fin. **Google refuse toute URL dans la description** (même sans `https://`) — remplacé « mimi-coiffure.com » par « Réservation en ligne ou par WhatsApp ». Limite réelle ~750 caractères |
| **Site Web**                                                                                               | `https://www.mimi-coiffure.com/`    | `https://mimi-coiffure.com/` — `www` retiré. Google **rajoute** le `/` final automatiquement (normalisation domaine racine) : c'est normal, `/` fait 1 redirection 308 vers `/fr` (comportement voulu, pas le bug §23)                                                                                                                                 |
| **Lien menu/services**                                                                                     | vide                                | `https://mimi-coiffure.com/fr/services`                                                                                                                                                                                                                                                                                                                |
| **Réseaux sociaux**                                                                                        | Instagram seul                      | + TikTok `https://www.tiktok.com/@mimicoiffure700`                                                                                                                                                                                                                                                                                                     |
| **Lien de réservation** (section « Liens vers vos outils de réservation en ligne », séparée des attributs) | vide                                | `https://mimi-coiffure.com/fr/reservation` — crée le **bouton « Prendre rendez-vous »** en haut de la fiche. `https://` obligatoire ici (contrairement à la description)                                                                                                                                                                               |
| **Attribut Planning**                                                                                      | vide                                | « Sur rendez-vous ». L'attribut « réservation en ligne » n'existe pas au Maroc (géré par le lien de réservation ci-dessus)                                                                                                                                                                                                                             |

### Ménage des photos de la fiche

Point de départ : ~40 éléments, dont beaucoup de **visuels marketing générés par
IA / Canva** (« The Power of Pure Argan », « Authentic Heritage In Every Braid »,
« EXPERT IVORIAN CRAFTSMANSHIP », « BEAUTY ROOTED IN COMMUNITY », montage
« INSPIRATIONS TRESSES »), des **photos stock** (blonde fond végétal, pull rose),
des **vidéos avec texte incrusté** (« Réservez sur… »), et des photos de
**présentoirs de mèches en désordre** + devanture sombre.

Tout ça a été **supprimé** (via « Gérer vos photos »). Restent **~11 vrais
éléments** : photo de couverture (portrait box braids + perles), logo MIMI, et
~9 vraies réalisations (cornrows vue de dessus, tresse latérale profil, fille
tresses roses/violettes, box braids longues de dos, mains en train de tresser,
etc.).

**RÈGLE** : ne plus jamais mettre sur la fiche GBP des visuels avec texte
superposé, des montages, ou des images stock. Google Business ≠ Instagram.

### Livrable 1 — Réponses aux 10 avis Google (rédigées, à poster par Mouj)

Réponses personnalisées rédigées dans la conversation pour les 10 avis existants
(dont 1 négatif « ongles permanent mauvais travail » → réponse type SAV :
s'excuser sans reconnaître de faute, basculer en privé WhatsApp/email). **Aucun
avis n'a de réponse aujourd'hui** — c'est le quick win le plus rentable
(facteur n°1 du classement Maps). Objectif 30+ avis (13 au 28/08).

### Livrable 2 — `docs/carte-avis-qr-salon-mimi.html` (déjà livré §23)

Carte QR A6 vers `…FUEAE/review`. Pour la caisse / table de coiffage.

### Livrable 3 — `docs/checklist-shooting-photos-salon-mimi.html` (NOUVEAU, hors git)

Checklist A4 imprimable (2 pages) : 15 plans à photographier avec cadrage précis
(façade/302, intérieur rangé, poste de coiffage, 5 techniques box braids /
knotless / cornrows-fulani / locks / tissage en face+dos, rasta, enfants, homme,
Mimi au travail, avant/après), réglages téléphone, règles par photo, nommage SEO
des fichiers, rythme de publication (3-4/semaine sur 6 semaines).
**PDF à générer via Chrome → Cmd+P → A4.**

**Le shooting est la priorité n°1** : 56 % du trafic est sur Maps où les photos
décident du clic ; le salon a ~11 photos vs 40-60 chez les concurrents de la
Médina. Le repo `public/images/` n'a **aucune** photo utilisable d'intérieur
propre, de façade, de Mimi (visage), ni de locks / tissage / mariage.

### Posts GBP — 8 posts rédigés (dans la conversation)

1 post/semaine minimum. **6 des 8 posts** sont faisables tout de suite avec les
images `public/images/` existantes :

| Post              | Image `public/images/`                                     |
| ----------------- | ---------------------------------------------------------- |
| Box braids        | `tresses-mimi-6.jpeg` (la seule vraie photo propre du lot) |
| Knotless          | `tresses-mimi-1.jpeg`                                      |
| Cornrows / Fulani | `tresses-mimi-3.jpeg`                                      |
| Enfants           | `s-tresse-fille1.png` ou `s-tresse-fille2.png`             |
| Rasta / vanilles  | `tresses-mimi-2.jpeg`                                      |
| Homme             | `s-tresse-garcon.png`                                      |
| **Locks**         | ❌ aucune photo — bloqué, attendre le shooting             |
| **Tissage**       | ❌ aucune photo — bloqué, attendre le shooting             |

Images `public/images/` **à NE PAS utiliser** (photos stock ou présentoirs de
mèches malgré le nom de fichier) : `s-box-braids-longues.jpg`,
`s-tressage-mains.jpg`, `s-tressage-action.jpg`, `s-cornrows.jpg`,
`s-depart-locks.jpg`, `s-knotless.jpg`, `s-fulani.jpg`, `s-boho.jpg`,
`salon-mimi-1/2/3.jpeg`, `s-box-braids-xl.jpg` (devanture « 302 »),
`pomelli-image-*` (IA).

### Reste à faire — priorités visibilité Google (par impact réel)

1. **Shooting photos** (checklist livrée) → débloquer galerie GBP + posts Locks/Tissage
2. **Répondre aux 10 avis** (rédigés) + récolter des avis (carte QR + SMS 2h après RDV)
3. **1 post GBP/semaine** (6 prêts, 2 en attente de photos)
4. Onglet GBP « Plus » : Paiements (au moins « Espèces »), Wi-Fi / Clim / Toilettes si applicable
5. **Pages site en anglais** ciblant `hair salon Marrakech`, `beauty salon Marrakech Medina`, `rasta braids Marrakech` (PAS « box braids Marrakech » — personne ne le cherche assez). Cible générique + anglais, pas les termes techniques
6. Bios Instagram + TikTok : ajouter `https://mimi-coiffure.com/reservation` (toujours pas fait)
7. Citations locales : TripAdvisor (en attente depuis mai 2026), annuaires Maroc

### Anomalie à corriger (repérée en vérifiant la home en prod)

**Le hero de la home affiche « 5/5 sur Google »** alors que la fiche est à
**4,2 / 13 avis**. `components/sections/GoogleReviews.tsx` lit l'API Google
Places en direct — l'API renvoie une note partielle ou un fallback. Déjà noté
§23, confirmé cette session. À corriger.

---

## 2. État actuel du code — mis à jour le 7 juin 2026 (fin de session, soir)

### Ce qui marche

- Homepage : hero split 50/50, 3 colonnes photo animées, titre "Tresses africaines & Rasta / Marrakech", badge "Place Jamaa El Fna" en ocre
- **Services vedettes** : 4 cards avec titre EN + descriptif FR, prix éditables dans le dashboard
- **Galerie** : onglets Photos (34 photos) / Vidéos (5 vidéos : 3 Pomelli + 2 marketing), texte indexable trilingue
- **Page Services** : section vidéos Pomelli en bas + JSON-LD `ItemList` avec prix des 10 services
- **Menu nav** : Georgia 16px, fond brun `#2C1508`, grille 3 colonnes (logo centré sans chevauchement), soulignement ocre au hover, hamburger jusqu'à `lg`
- **Header** : logo graphique Mimi (`/images/logo-mimi.webp`, 34px) + texte "Salon Mimi / Marrakech" resserré à gauche, fond brun chaud distinct du body (voir §21)
- **Page Réservation** : nouveau design (session 28 août 2026, §21) — fond sombre `bg-nuit` continu, carte formulaire crème flottante bordure dorée, hero avec logo, 2 cartes d'envoi WhatsApp/email, badges de réassurance. Textes traduits fr/en/es. Colonne unique centrée (plus de panneau photo latéral)
- **Page Contact** : bouton "Ouvrir dans Maps" → fiche salon `maps.app.goo.gl/2VHUxKWpLpYFE8836`, formulaire avec scroll vers confirmation
- **Traductions** : phrase "on s'occupe du reste." traduite EN/ES dans ServicesPageClient
- SEO : JSON-LD HairSalon complet, FAQ schema, hreflang, sitemap 24 URLs, `metadataBase` corrigé (og:image ne pointe plus vers localhost), crawlers IA débloqués (GPTBot, ClaudeBot, Google-Extended, PerplexityBot)
- **Score SEO : 81/100** — audit complet effectué le 4 juin 2026
- Sécurité : headers HTTP, rate limiting, validation email, `/admin` protégé par middleware, `unsafe-eval` retiré du CSP en prod, stack d'erreur Resend supprimée
- Dashboard admin : prix éditables, email notification, WhatsApp
- **PWA `/mimi.html` — version 2** : navigation par onglets (Réservations / Paramètres), changement de statut, modification prix + WhatsApp depuis le téléphone, notifications push Web Push
- Service Worker `public/mimi-sw.js` : notifications push même appli fermée
- API `/api/push` : enregistrement abonnements VAPID, envoi push à chaque réservation
- **Notifications push opérationnelles** : Mimi (Android) + Mouj (Android + iPhone via Safari PWA) reçoivent les alertes à chaque réservation — clés VAPID configurées dans Railway le 7 juin 2026
- API `/api/mimi-settings` : lecture/écriture settings protégée par PIN (sans session Supabase)
- Table Supabase `push_subscriptions` créée avec RLS
- Skills globaux : 91 skills déplacés dans `~/.claude/skills/` — disponibles sur tous les projets
- Pages légales RGPD conformes, bandeau cookies opérationnel
- Analytics Umami — Website ID : `8e60d1e4-e51e-4ac9-896f-f641486a32eb`
- PageSpeed mobile : 92/100 (mesuré 1er juin 2026)

### Ce qui reste fragile

- Samsung A54 (412px) : légère zone vide sous les CTA du hero — acceptable, pas bloquant
- Notifications push iOS : uniquement sur Safari iOS 16.4+ avec l'app installée en PWA

### Ce qui ne marche pas

- Rien de bloquant connu

### Ce qui reste à faire (par priorité)

- ~~Refonte du design de `/reservation` + logo header~~ **FAIT** — nouveau design
  en prod sur `/reservation`, logo Mimi dans le header sur tout le site (voir §21).
- **Avis Google** : 13 avis / 4,2 étoiles au 28 août 2026 (était 6 le 1er juin). Objectif 30+ : QR code plastifié à la caisse (`docs/carte-avis-qr-salon-mimi.html`, §23) + SMS/WhatsApp automatique 2 h après le RDV avec `https://g.page/r/CXqJtbaOg9FUEAE/review` (nouveau lien, cf. §23/§24). Répondre à TOUS les avis existants (10 réponses rédigées §24, pas encore postées).
- **Bios réseaux** : ajouter le lien `https://mimi-coiffure.com/reservation` dans les bios Instagram (`salonmimi.marrakech`) et TikTok (`@mimicoiffure700`).
- **Cloudflare Cache Rule** : éliminerait les redirections multiples (610ms), PageSpeed 92 → 95+. Instructions en section 7
- **Fiche TripAdvisor** : en attente de validation depuis mai 2026

---

## 21. Session 28 août 2026 — Nouveau design de `/reservation` + logo dans le header (EN PROD)

Refonte visuelle complète de la page de réservation, inspirée d'un template
premium fourni. Développée d'abord sur `/reservation-v2` (preview noindex),
validée par Mouj sur mobile, puis **basculée en prod sur `/reservation`**. Le
logo graphique Mimi a aussi été ajouté au header, sur tout le site.

**En prod sur `mimi-coiffure.com`** (déployé Railway) :

- `/reservation` (fr/en/es) : nouveau design — voir ci-dessous
- Header : logo Mimi (~34px) à gauche de « SALON MIMI / MARRAKECH », toutes pages
- `/reservation-v2` : **supprimée** (404) — c'était la preview, son contenu est
  devenu `/reservation`

Commits `main` : `06948b1..cf6bcf1` (design v2 + logo header) puis
`cf6bcf1..42baf60` (bascule v2 → `/reservation`).
Spec : `docs/superpowers/specs/2026-08-28-reservation-v2-design-template-design.md`
Plan : `docs/superpowers/plans/2026-08-28-reservation-v2-design-template.md`

### Le nouveau design de `/reservation`

- **Fond sombre continu** (`bg-nuit`) sur toute la page — plus de rupture
  hero/formulaire. La carte formulaire crème (`bg-fond`) **flotte** dessus :
  bordure dorée `border-or/30`, `rounded-2xl`, ombre portée.
- Hero compact : logo Mimi (~88px) + kicker + `<h1>` Georgia « Réservez votre
  _rendez-vous_ » (mot final doré, traduit `appointment` / `cita`).
- Colonne unique centrée `max-w-[560px]`. **Le panneau photo latéral de l'ancien
  design a été supprimé.**
- Formulaire compacté pour tenir (form + 2 boutons d'envoi) dans un écran mobile
  sans scroller : `select[name=service]` + ligne de prix dynamique (texte
  « tarif indicatif, confirmé au salon » conservé), Nom + Téléphone, Date +
  Heure, repli « + Ajouter des précisions » (Personnes, Email, Message).
- **2 cartes d'envoi** côte à côte, style template (icône dans un rond, kicker
  « ENVOYER PAR », libellé, sous-titre) :
  - verte — `<button type="button" onClick={handleWhatsApp}>` — libellé
    **« Réserver par WhatsApp »**, `aria-label` idem
  - ocre, icône enveloppe — `<button type="submit">` — libellé **« Confirmer ma
    réservation »**, sous-titre « Mimi vous répond par email », `aria-label` idem
- 3 badges de réassurance (Réponse rapide / Données sécurisées / Service
  personnalisé) sur le fond sombre, séparateur ornemental ◈.
- Section « Vous ne trouvez pas le salon ? » conservée, restylée fond sombre.
- Écran de confirmation : logo + ✦ + message + bouton WhatsApp de secours.

### Fichiers

- **Modifié** `components/sections/ReservationLayout.tsx` — contenu entièrement
  remplacé par le nouveau design (l'ancien `ReservationLayoutV2.tsx` renommé).
  Logique JS (states, `handleSubmit`, `handleWhatsApp`, lecture `?service=` via
  `useEffect` + `window.location.search`) **inchangée** vs l'ancienne v1.
  **NE JAMAIS y introduire `useSearchParams()`** (piège §19bis).
- **Modifié** `components/layout/Header.tsx` — `import Image from "next/image"`,
  bloc marque (col 2) : logo `/images/logo-mimi.webp` 34px + texte resserré
  aligné à gauche.
- **Créé** `public/images/logo-mimi.webp` (89 KB) + `logo-mimi.png` (322 KB) —
  logo 512px, fond transparent. Source : `~/Downloads/Logo Mimi-coiffure.png`.
- **Supprimé** `components/sections/ReservationLayoutV2.tsx` et
  `app/[locale]/reservation-v2/`.
- `app/[locale]/reservation/page.tsx` — **inchangée** (mêmes props, `metadata`
  complet conservé : title/description + canonical + hreflang fr/en/es).

### Vérifié

- `npx tsc --noEmit` ✓ · `npm run build` ✓ (`/[locale]/reservation` 7.18 kB,
  plus de route `/reservation-v2`)
- `npx playwright test` (desktop + mobile) contre le build local :
  **32 passed / 2 skipped** — 0 régression. Les 8 tests CRO ciblent
  `/reservation` et passent sur le nouveau design (sélecteurs `select[name=
service]`, `input[name=name/phone/email]`, libellés boutons, « + Ajouter des
  précisions », texte de la ligne de prix : tous conservés).
- Checks headless : form + 2 boutons d'envoi tiennent dans un viewport 390×844 ✓ ·
  toggle révèle email/persons/message ✓ · pas de scroll horizontal 375/1280 ✓ ·
  `?service=locks-dreads` présélectionne ✓ · bouton WhatsApp exige nom+tél ✓
- Prod `mimi-coiffure.com/fr/reservation` : nouveau HTML servi (`Réservez votre`,
  `bg-nuit`, `logo-mimi`), `/reservation-v2` → 404, header avec logo sur `/fr`.

### Incident résolu pendant la session — `.next` corrompu

Lancer `npm run build` pendant qu'un `next dev` tourne sur le même dossier
corrompt `.next/` et le dev server sert du HTML **sans CSS** (une image `<Image
fill object-contain>` s'étale alors sur toute la page — c'est ce qui a produit
une « photo Argana géante » sur `/reservation`). **Ce n'était pas un bug de
code.** Fix : `trash .next` + relancer. **Règle** : sur ce Mac, ne jamais faire
tourner `build` et `dev` en parallèle ; tester sur `npx next start` (build de
prod stable) plutôt que sur le dev server instable. Le `preview_start` du Browser
pane fonctionne en mode `{url}` (pas en mode `{name}` — cf. handoff Salon Mimi
plus bas).

### Fast-follow non bloquant

- `logo-mimi.webp` fait 89 KB (q82, l'alpha lossless gonfle le poids). Acceptable.
  Si besoin d'alléger : régénérer en `-q 70` ou détourer le halo rouge/vert du
  contour de la source.
- Le `persons` `<select>` n'a pas d'option vide → `getVal("persons")` renvoie
  toujours « 1 personne » même si le repli n'a pas été ouvert (bug hérité de
  l'ancienne v1, non régressif). À corriger un jour : ajouter une option vide.
- Les libellés des 2 boutons d'envoi passent sur 2 lignes centrées à 375px
  (« Réserver par / WhatsApp ») — lisible mais perfectible.

---

## 20. Session 30 août 2026 — Tunnel de réservation v3 : formulaire commun + 2 boutons d'envoi + layout Date/Heure (ÉTAT ACTUEL EN PROD)

Fait suite à la v2 (§19). **Retour terrain sur la v2 :** les 2 boutons en haut
(« Réserver par WhatsApp » / « Réserver par formulaire ») étaient confus.
« Réserver par formulaire » dépliait le formulaire, « Réserver par WhatsApp »
n'ouvrait que WhatsApp — la logique des 2 modes n'était pas comprise.

Commits `888cb1a` (feat) + `7747da7` (tests) sur `main`. Déployé.
Spec : `docs/superpowers/specs/2026-08-30-tunnel-reservation-v3-formulaire-commun-design.md`
Plan : `docs/superpowers/plans/2026-08-30-tunnel-reservation-v3-formulaire-commun.md`

### Ce qui a changé vs v2

1. **Formulaire toujours affiché** au chargement (comme la v1). Suppression du
   state `showForm` et du bloc « 2 boutons de choix » du haut.
2. **Deux boutons d'envoi EN BAS du formulaire** (`flex flex-col sm:flex-row`) :
   - **« Confirmer ma réservation »** (ocre, `<button type="submit">`) —
     comportement de soumission inchangé : POST `/api/reservations` → base +
     notif push Mimi + accusé de réception client si email → redirection
     WhatsApp (message détaillé serveur). Champs `required` HTML natifs.
   - **« Réserver par WhatsApp »** (vert, `<button type="button">`,
     `onClick={handleWhatsApp}`) — **aucun appel API**. Exige **Nom + Téléphone**
     (sinon message d'erreur `whatsappError` + `focus()` sur le champ manquant).
     Sinon construit un message WhatsApp pré-rempli (coiffure + date + nom + tél
     - heure/personnes/message si renseignés) via `generateWhatsAppLink()` et
       `window.location.href`.
3. **Panneau photo droite** : toujours affiché (comme v1).
4. **i18n** : `formBtn` supprimé ; `whatsappMissing` ajouté (fr/en/es) :
   fr « Merci d'indiquer au moins votre nom et votre téléphone. ».
5. `useSearchParams` **toujours absent** (hotfix §19bis conservé — `?service=`
   lu via `useEffect` + `window.location.search`).
6. **`StickyBooking` inchangé** — pointe toujours vers `/{locale}/reservation`.

### Vérifié en prod (mimi-coiffure.com) après déploiement

- `npx tsc --noEmit` ✓ · `npm run build` ✓ (Compiled successfully)
- Playwright contre la prod : **32 passed / 2 skipped** (desktop + mobile)
- Fiber tree en prod : `ReservationLayout` **pas sous un `OffscreenComponent`**
  (le bug §19bis ne se reproduit pas)
- **Vrai clic** « Réserver par WhatsApp » sans champs → message d'erreur +
  focus Nom, pas de navigation ✓
- **Vrai clic** avec Nom + Téléphone → navigation vers `api.whatsapp.com` avec
  message pré-rempli ✓
- 3 langues : formulaire rendu au SSR, 2 boutons traduits, « Réserver par
  formulaire » absent ✓
- `?service=locks-dreads` → `<select>` présélectionné + prix correct ✓
- Console : seule erreur = 400 sur le script Umami (pré-existant, hors sujet)

### Ajustement layout (commit `6fbf723`, déployé)

- **Date et Heure sur une même ligne** (grille `grid-cols-1 sm:grid-cols-2`,
  comme Nom + Téléphone) : sur desktop côte à côte, sur mobile empilés.
- **Heure sortie du repli** « + Ajouter des précisions » — visible d'emblée,
  **optionnelle** (pas de `required`).
- Le repli ne contient plus que : Nombre de personnes, Email, Message.
- L'heure remonte dans le message WhatsApp du bouton vert (ligne
  « Message : Heure : HH:MM » — améliorable : lui donner sa propre ligne dans
  `generateWhatsAppLink`, non bloquant).

### État du fichier `components/sections/ReservationLayout.tsx`

- States : `activeIndex` (+ `useEffect` `?service=`), `submitted`,
  `whatsappLink`, `error`, `showDetails`, **`whatsappError`**, **`formRef`**
  (`useRef<HTMLFormElement>`).
- `handleSubmit` (bouton ocre) et `handleWhatsApp` (bouton vert) — deux
  fonctions distinctes. `handleWhatsApp` lit les champs via `formRef.current`.
- `import { generateWhatsAppLink } from "@/lib/whatsapp";` (plus de
  `genericWhatsAppLink` — supprimé avec le bloc de choix v2).
- Champs visibles du formulaire : Service (+ ligne de prix dynamique),
  Nom, Téléphone, Date, Heure. Repli : Personnes, Email, Message.
  2 boutons en bas : « Confirmer ma réservation » (ocre, submit) +
  « Réserver par WhatsApp » (vert, `type="button"`).

### Note outillage — serveurs de dev fantômes sur le port 3100

Plusieurs fois cette session, un `next-server` / `next dev` d'une session
précédente est resté vivant sur le port 3100 et a bloqué le démarrage d'un
nouveau serveur (`EADDRINUSE`), en servant du code périmé — ce qui donne
l'illusion qu'un changement « ne marche pas ». Claude n'a **pas** la permission
de `kill` ces process. Réflexe pour la prochaine session : avant de tester en
local, `lsof -ti:3100` puis demander à Mouj de faire `kill -9 <pid>` si un
`next-server` traîne. `preview_start` (Browser pane) échoue aussi par
intermittence (`EPERM uv_cwd`) sur ce Mac.

### Fast-follow non bloquants (toujours valables)

- `Props.labels` de `ReservationLayout` quasi mort (seuls `labels.error` /
  `labels.success` lus)
- `components/ui/WhatsAppButton.tsx` a son propre glyphe WhatsApp (2 glyphes
  dans le repo) — pourrait passer par `WhatsAppIcon`

---

## 19. Session 28-30 août 2026 — Tunnel de réservation v2 : choix explicite WhatsApp / formulaire (remplacée par la v3, §20)

Fait suite à la v1 (section 18, déployée). **Problème constaté sur la v1 en prod :**
sur mobile, le gros bouton WhatsApp vert remplissait l'écran, le lien vers le
formulaire était en petit gris → les visiteurs croyaient que la page ne
proposait QUE WhatsApp.

Branche : `feat/tunnel-reservation-v2` (5 commits `c2ea6b6` → `bf71e06`), mergée
sur `main` et déployée. **Puis hotfix `a843b57` sur `main`** (voir §19bis).
Spec : `docs/superpowers/specs/2026-08-30-tunnel-reservation-v2-choix-explicite-design.md`
Plan : `docs/superpowers/plans/2026-08-30-tunnel-reservation-v2-choix-explicite.md`

### Ce qui a changé vs v1

1. **Deux boutons de choix de même taille** au chargement de `/reservation` :
   « Réserver par WhatsApp » (vert plein, ouvre `wa.me` direct, aucune API) et
   « Réserver par formulaire » (contour ocre). Fini l'effet « une seule option ».
2. **Le formulaire est masqué au chargement** (`showForm = false`). Clic sur
   « Réserver par formulaire » → il se déplie en dessous, les 2 boutons restent
   visibles, le bouton formulaire passe en fond ocre plein (état actif).
3. **Le panneau photo (desktop)** n'apparaît que quand le formulaire est déplié.
4. **Bouton de soumission du formulaire** repassé en **ocre** (`bg-ocre`),
   libellé « Confirmer ma réservation » (plus de vert, plus d'icône WhatsApp —
   pour ne pas le confondre avec le bouton WhatsApp du haut).
5. **`StickyWhatsApp` renommé `StickyBooking`** (`git mv`). Il pointe désormais
   vers `/{locale}/reservation` (au lieu d'ouvrir `wa.me` direct) — pour que les
   visiteurs **sans WhatsApp** aient accès au formulaire. Libellé
   « Réserver un rendez-vous » / « Book an appointment » / « Reservar una cita ».
   Utilise `next/link`. Fond vert conservé. `pb-sticky-wa` sur `<main>` inchangé.
6. **i18n** : clés `whatsappPrimaryHint` et `orFillForm` supprimées ; `formBtn` et
   `submitBtn` ajoutées ; `whatsappPrimaryBtn` re-libellé « Réserver **par**
   WhatsApp » (EN « Book via WhatsApp »).
7. **Tests** : les 5 tests CRO adaptés + 1 nouveau (« formulaire masqué au
   chargement, visible après clic ») = 6. Les 2 tests du bloc « Formulaire de
   réservation » corrigés (ils cliquent « Réserver par formulaire » d'abord).

### Vérifs faites (local)

- `npx tsc --noEmit` ✓ · `npm run build` ✓ (Compiled successfully, 15/15 pages)
- Playwright local : desktop **16 pass / 1 skip**, mobile **16 pass / 1 skip**, 0 régression
- 3 langues `/fr` `/en` `/es` /reservation : HTTP 200, 2 boutons présents, `select` absent du SSR (formulaire masqué), anciens textes v1 absents
- Sticky sur `/fr`, `/fr/galerie`, `/fr/contact`, `/en`, `/es` : `<a href="/{locale}/reservation">` avec `aria-label` traduit, plus de `wa.me`
- Golden path navigateur (desktop) : 2 boutons au chargement → clic « formulaire » → dépli du formulaire + panneau photo, bouton formulaire en ocre plein, bouton submit ocre « Confirmer ma réservation », section « Vous ne trouvez pas le salon ? » intacte. 0 erreur console/logs.

### Reste à faire avant de considérer la tâche 100 % terminée

- [ ] Merger `feat/tunnel-reservation-v2` sur `main` (déploiement Railway auto)
- [ ] Après déploiement : `npx playwright test` (desktop + mobile) contre `https://mimi-coiffure.com` — 100 % vert
- [ ] Sur un vrai mobile : ouvrir `/fr/reservation`, vérifier que les 2 boutons sont bien visibles côte à côte / empilés sans ambiguïté, que le dépli du formulaire est fluide, que le sticky ne gêne pas
- [ ] Test réel : une réservation avec email via le formulaire depuis la prod → dashboard `/admin/dashboard` + notif push Mimi + accusé de réception client

### Fast-follow non bloquants (hérités de la v1, toujours valables)

- `Props.labels` de `ReservationLayout` quasi mort (seuls `labels.error` / `labels.success` lus)
- `components/ui/WhatsAppButton.tsx` a encore son propre glyphe (2 glyphes WhatsApp dans le repo) — pourrait passer par `WhatsAppIcon`

---

## 19bis. Session 30 août 2026 — HOTFIX : le bouton « Réserver par formulaire » ne faisait rien en prod

### Symptôme

Après déploiement de la v2, cliquer « Réserver par formulaire » sur
`mimi-coiffure.com/fr/reservation` **n'affichait pas le formulaire**. Le bouton
restait en contour ocre (état fermé), rien ne se dépliait.

**Reproductible uniquement en prod.** En local (`npm run dev` ET
`npm run build && npm start`), le clic fonctionnait normalement. Les 32 tests
Playwright passaient (ils testent contre la prod mais via `page.click()` de
Playwright, qui contourne le bug — voir plus bas).

### Diagnostic (systematic-debugging)

Via inspection du fiber tree React dans la console de la prod :
`ReservationLayout` était monté dans un **sous-arbre `OffscreenComponent` sous
un `<Suspense>`** (React 18 : "CSR bailout"). Le DOM SSR était visible, les hooks
hydratés, `props.onClick` existait et fonctionnait si appelé **directement en
JS** — mais **les événements de clic du navigateur n'étaient pas délégués vers ce
sous-arbre Offscreen**.

**Cause racine** : `ReservationLayout` appelait `useSearchParams()` (pour lire
`?service=` et présélectionner la coiffure). Sur `/reservation`
(`export const revalidate = 3600` → page pré-rendue statiquement),
`useSearchParams()` force tout le composant en CSR bailout / Offscreen sous le
`<Suspense>` de `page.tsx`.

En **v1**, le `<form>` était toujours rendu et le `<select value={activeIndex}>`
(où `activeIndex` dérive de `searchParams`) forçait la consommation de la valeur
→ React réveillait le sous-arbre → hydratation complète, clics OK.

En **v2**, `showForm = false` → le rendu initial est minimal (2 boutons) et ne
consomme jamais `searchParams` dans le DOM. Rien ne réveille le sous-arbre
Offscreen côté client **dans les conditions de timing de la prod** (chunks JS
servis avec latence Railway + Cloudflare). En local, tout est en cache disque →
hydratation immédiate → le bug ne se manifeste pas.

Pourquoi Playwright ne le voyait pas : `page.getByRole("button").click()` de
Playwright déclenche le handler via l'API DOM d'une façon que React capte même
en Offscreen (comme `element.click()` ou `props.onClick()` en console). Seul un
**vrai clic OS** (souris utilisateur) est filtré par l'Offscreen.

### Fix (commit `a843b57` sur `main`)

- `components/sections/ReservationLayout.tsx` : suppression de
  `useSearchParams()`. Le paramètre `?service=` est maintenant lu dans un
  `useEffect` via `new URLSearchParams(window.location.search).get("service")` —
  **ne suspend pas**. `activeIndex` démarre à `0` (SSR-safe), ajusté après le
  montage si `?service=` présent. Pré-remplissage imperceptible.
- `app/[locale]/reservation/page.tsx` : `<Suspense>` retiré (devenu inutile,
  plus rien ne suspend).

### Vérifié en prod après déploiement du hotfix

- Clic « Réserver par formulaire » → formulaire s'affiche ✓ (vrai clic navigateur)
- Fiber tree : plus d'`OffscreenComponent`/`Suspense` au-dessus de `ReservationLayout`
- Toggle dans les deux sens ✓
- `?service=box-braids` → `<select>` présélectionné sur « Box braids » + prix correct ✓
- `npx playwright test` contre la prod : 32 passed / 2 skipped

### Règle à retenir

**Ne jamais utiliser `useSearchParams()` dans un composant client dont le rendu
initial est conditionnel/minimal, sur une page pré-rendue** (`revalidate` ou
statique). Ça met le composant en Offscreen et les vrais clics utilisateur sont
perdus. Lire les query params via `useEffect` + `window.location.search` à la
place, ou isoler la lecture dans un enfant minuscule avec son propre `<Suspense>`
qui, lui, rend quelque chose au SSR.

---

## 18. Session 28-29 août 2026 — Refonte du tunnel de réservation (CRO) — v1 (remplacée par la v2, section 19)

Branche : `feat/tunnel-reservation-cro` (8 commits `c4fbe8e` → `e0d8d8a`). **Déployée sur `main`.**

Spec : `docs/superpowers/specs/2026-08-29-refonte-tunnel-reservation-cro-design.md`
Plan : `docs/superpowers/plans/2026-08-29-refonte-tunnel-reservation-cro.md`

### Ce qui a été livré

1. **CTA WhatsApp principal sur `/reservation`** — gros bouton vert pleine largeur au-dessus du formulaire, hint « Le plus rapide — écris directement à Mimi », ligne de réassurance « Réponse rapide par WhatsApp · Annulation gratuite · Paiement sur place », puis séparateur « ou remplis ce formulaire rapide ». Ouvre `wa.me` avec message générique traduit FR/EN/ES. Aucun appel API.
2. **Bandeau WhatsApp sticky mobile** — `components/layout/StickyWhatsApp.tsx`, monté dans le layout `[locale]`, visible `< lg` sur **toutes les pages publiques** (absent de `/admin`, `/mimi.html`). `<main>` a `pb-sticky-wa lg:pb-0` pour ne pas masquer le footer.
3. **Formulaire court** — 4 champs visibles seulement : Service, Nom, Téléphone, Date. Heure / Nombre de personnes / Email / Message repliés sous « + Ajouter des précisions ». Email redevenu **optionnel** (l'accusé de réception client `4b6c44b` se déclenche toujours s'il est rempli).
4. **Ligne de prix dynamique** sous le `<select>` : « {coiffure} — À partir de {prix} MAD · tarif indicatif, confirmé au salon », branchée sur les prix `/admin/settings`, se met à jour au changement de coiffure.
5. **`handleSubmit` sécurisé** — helper `getVal()` : lit les champs via `form.elements.namedItem()` avec `?? ""`, ne peut plus lever `TypeError` quand le repli est fermé (les champs n'existent pas dans le DOM). Le reste (`fetch` → `window.location.href` → `setSubmitted`) inchangé.
6. **Bouton de soumission** passé de ocre à vert WhatsApp, libellé « Réserver sur WhatsApp ».
7. **Refactor** — `components/ui/WhatsAppIcon.tsx` (glyphe partagé, était inliné 3×), token Tailwind `spacing["sticky-wa"] = "52px"`, purge des clés i18n mortes `confirm` / `footer` dans `TEXTS`.
8. **Tests** — `e2e/site.spec.ts` : 5 tests CRO (CTA href, prix dynamique, repli, sticky visible mobile / caché desktop). `playwright.config.ts` : `baseURL` surchargeable via `PLAYWRIGHT_BASE_URL` (les tests tournent contre la prod par défaut).

### Vérifs faites (local)

- `npx tsc --noEmit` ✓ · `npm run build` ✓ (Compiled successfully, 15/15 pages)
- Playwright local (`PLAYWRIGHT_BASE_URL=http://localhost:3100`) : desktop 15 pass / 1 skip, mobile 15 pass / 1 skip, 0 régression
- 3 langues `/fr` `/en` `/es` /reservation : HTTP 200, i18n complet, liens `wa.me` corrects
- Golden path navigateur : CTA vert OK, repli OK, prix « Locks & dreads → 250 MAD » OK, panneau photo intact, 0 erreur console/logs

### Reste à faire avant de considérer la tâche 100 % terminée

- [ ] Merger `feat/tunnel-reservation-cro` sur `main` (déclenche le déploiement Railway)
- [ ] Après déploiement : rejouer `npx playwright test` (desktop + mobile) contre `https://mimi-coiffure.com` — doit être 100 % vert
- [ ] Revue visuelle mobile réelle sur `/fr/reservation` : la page a maintenant 3 CTA WhatsApp (CTA principal + bouton submit + sticka). La spec l'assume, mais vérifier que le sticky ne gêne pas trop la lecture du formulaire. Candidat éventuel : masquer le sticky sur `/reservation` (il fait doublon avec le CTA principal).
- [ ] Test réel : une réservation avec email depuis `/reservation` prod → vérifier dashboard `/admin/dashboard` + notif push Mimi + accusé de réception client

### Fast-follow non bloquants (notés en code review)

- `Props.labels` de `ReservationLayout` est maintenant quasi mort (seuls `labels.error` / `labels.success` sont lus) — nettoyage possible, non urgent.
- Refactor optionnel : faire passer `components/ui/WhatsAppButton.tsx` par le nouveau `WhatsAppIcon` (2 glyphes différents cohabitent dans le repo).

---

## 17. Session 28 août 2026 — SEO avis, audience réseaux, accusé de réception client

### Contexte

Le site a du trafic (fiche Google Business ~456 vues/mois) mais peu de réservations.
Analyse marketing faite : le point de fuite le plus probable est la **conversion**
(le visiteur arrive mais ne réserve pas), pas l'audience. D'où la priorisation de
la refonte du tunnel de réservation pour la prochaine session (voir « Ce qui reste
à faire », priorité 1).

### 1. SEO — note Google corrigée (commit `e75abc0`)

- La fiche Google affiche **4,2 étoiles / 13 avis** (vérifié sur capture d'écran de la fiche).
- Le JSON-LD `aggregateRating` de `app/[locale]/layout.tsx` annonçait encore `4.5` / `6`
  (figé depuis le 1er juin). Corrigé en `4.2` / `13`.
- Le composant `GoogleReviews.tsx` (section homepage) est déjà dynamique via l'API
  Google Places — pas touché. À réajuster manuellement dans le JSON-LD quand le
  compteur d'avis bougera nettement (ou le rendre dynamique un jour).

### 2. Galerie → catalogue par type de coiffure (commits `caa5270`, `e342790`)

- L'onglet **Photos** de `/galerie` passe d'une grille unique de 37 images en vrac à
  **9 sections thématiques trilingues** : Le salon, Box Braids, Knotless Braids,
  Cornrows & Fulani, Boho & Goddess, Locks, Enfants, Tresses rasta & afro, En cabine.
  Chaque section a un titre + une phrase FR/EN/ES.
- **30 images réelles.** Les 6 visuels `pomelli-image-*.png` (générés par IA) ont été
  **retirés de la galerie** — fichiers conservés dans `public/images/` car utilisés
  comme posters vidéo dans le tableau `VIDEOS`.
- Onglet Vidéos, URL, métadonnées SEO : inchangés.
- Fichier : `components/sections/GalerieClient.tsx` (tableau `PHOTOS` plat → `SECTIONS`).
- Spec : `docs/superpowers/specs/2026-08-28-galerie-catalogue-par-style-design.md`.
- **Photos écartées** : les dossiers `salon-mimi-media/Catalogue mimi/` et
  `salon-mimi-media/Photo Site/` contiennent des images tierces récupérées sur
  Pinterest/Instagram (watermarks visibles, captures d'écran avec flèche « retour »).
  Non utilisables sur un site commercial (droit d'auteur + risque SEO contenu dupliqué).
  Pour un vrai catalogue, il faut des photos prises par Mimi au salon, en bonne
  résolution, avec accord des clientes.

### 3. Sélecteur de langue en pastilles (commit `830d322`)

- Avant : petit texte gris opacité 45 % + menu déroulant (desktop) ; langues cachées
  au fond du menu hamburger (mobile). Invisible pour un visiteur pressé.
- Après : **3 pastilles `FR EN ES` toujours affichées**, desktop ET mobile, changement
  en un clic. Langue active en fond ocre, les autres en contour.
- Nouveau composant `LangPills` dans `Header.tsx`. Suppression du `useState langOpen`
  et de tout le dropdown (89 lignes en moins).

### 4. Liens réseaux + SEO social (commit `978d5f8`)

- **`lib/social.ts` créé** : source unique pour les URLs
  Instagram (`salonmimi.marrakech`), TikTok (`@mimicoiffure700`), Maps, GBP.
- **Footer** : bloc « Suivez-nous » trilingue avec icônes Instagram / TikTok / Google Maps.
- **Header** : icônes Instagram + TikTok, visibles desktop (barre) et mobile (menu).
- **`app/[locale]/layout.tsx`** :
  - `openGraph.siteName: "Salon Mimi"`
  - bloc `twitter` (`summary_large_image` + title/description/image) pour les aperçus
    de partage sur X, Facebook, WhatsApp
  - `sameAs` du JSON-LD complété : ajout de TikTok et de la fiche Google Business
    canonique (`https://g.page/r/CXqJtbaOg9FUEBM`)

### 5. Accusé de réception automatique au client (commit `4b6c44b`)

- À chaque réservation **où le client a laissé un email**, il reçoit tout de suite un
  accusé dans **sa langue** (FR/EN/ES) : remerciement, récap (prestation + date),
  bloc « Vous ne trouvez pas le salon ? / restaurant Argana / appelez Mimi », bouton
  WhatsApp vert (`wa.me/212710388204` avec message pré-rempli).
- **`lib/sendClientConfirmationEmail.ts` créé** :
  `from: "Salon Mimi <noreply@atlas-swincar.com>"` (domaine vérifié Resend),
  `to` = client, **`bcc` = `contact@mimi-coiffure.com` + `mouj.business@gmail.com`**
  (invisibles pour le client), `reply_to` = `contact@mimi-coiffure.com`.
- `lib/sendNotificationEmail.ts` : `esc()` exporté et réutilisé (DRY).
- `app/api/reservations/route.ts` : lit `locale` du body (défaut `fr`), déclenche
  l'envoi client **uniquement si un email est fourni**, en `.catch()` non bloquant.
  Un échec d'envoi ne bloque ni l'enregistrement ni la notif Mimi.
- `components/sections/ReservationLayout.tsx` : ajoute `locale` aux données envoyées.
- **À valider en prod** : faire une vraie réservation de test avec un email → vérifier
  la réception des 2 copies (client + Bcc). Si rien n'arrive, vérifier
  `RESEND_API_KEY` dans Railway (historique de clés invalides, cf. sections 10 et 12)
  et le dashboard Resend > Emails.

### Note outillage — lanceur de preview cassé sur ce Mac

`preview_start` (Browser pane, mode `{name}`) échoue au démarrage avec
`Error: EPERM: operation not permitted, uv_cwd`. C'est un problème d'environnement
de la sandbox du preview server sur cette machine, **sans rapport avec le code**.

Contournement utilisé cette session : lancer le dev server via un terminal sur un
port libre puis piloter le navigateur dessus —
`nohup node node_modules/.bin/next dev -p 3100 &`, puis `navigate` vers
`http://localhost:3100`. Le navigateur intégré devient aussi instable après
quelques minutes (timeouts, « pane hidden ») — vérifier vite, ou via `curl` sur le
HTML rendu.

---

## 16. Incident résolu — 21-22 août 2026 : `mimi-coiffure.com` (apex) inaccessible — 403/404 Forbidden

### Symptôme

`mimi-coiffure.com` (sans www) retournait `403 Forbidden` puis `404` avec le header `x-railway-fallback: true`. `www.mimi-coiffure.com` fonctionnait normalement. Découvert par hasard le 21 août — durée réelle de l'incident inconnue, aucun déploiement n'a eu lieu entre le 7 juin et le 21 août donc ce n'est pas un déploiement qui a cassé l'apex. **Résolu le 22 août 2026 à 00h08.**

### Cause racine — deux problèmes distincts et cumulatifs

**1. A record obsolète sur l'apex.** Sur Cloudflare, l'enregistrement DNS de l'apex `mimi-coiffure.com` était un **A record pointant vers `66.33.22.222`** — une IP qui n'a aucun rapport avec Railway (les IPs edge attendues sont `104.21.x.x` / `172.67.x.x`). Reliquat de la config DNS d'avant la migration vers Cloudflare (session 23-24 mai 2026, nameservers changés chez Gandi), jamais nettoyé après la bascule. Le CNAME `www` avait lui été correctement configuré vers Railway, donc seul l'apex était cassé.

**2. TXT de vérification tronqué (cause principale du blocage prolongé).** Railway exige un TXT `_railway-verify` pour valider chaque domaine custom. En copiant la valeur depuis la fenêtre Railway "Configure DNS Records", la valeur collée dans Cloudflare était **tronquée avec des points de suspension** (`railway-verify=83c2f91c0ea197bb85448eb97a...` au lieu du hash complet de 64 caractères `railway-verify=83c2f91c0ea197bb85448eb97ac97f73244c49efd102e6255cb68b9bbab83fbf`). Résultat : même après correction du CNAME et suppression/recréation du domaine dans Railway, la vérification échouait en boucle sans message d'erreur explicite côté Railway — juste `x-railway-fallback: true` qui persistait indéfiniment.

### Fix appliqué

Dans Cloudflare DNS (dash.cloudflare.com → mimi-coiffure.com → DNS → Records) :

1. Suppression du A record `mimi-coiffure.com` → `66.33.22.222`
2. Ajout/mise à jour du CNAME `mimi-coiffure.com` (`@`) → cible Railway (`*.up.railway.app`), Proxy status **Proxied**
3. Correction du TXT `_railway-verify` avec la **valeur complète** (pas tronquée) fournie par Railway

### Règles à appliquer désormais

- Après toute migration de registrar, de nameservers, ou de CDN : **tester explicitement l'apex ET le www séparément** (`curl -I https://domaine.com` et `curl -I https://www.domaine.com`). Un test sur un seul des deux peut masquer un enregistrement DNS cassé pendant des mois sans que personne ne le remarque.
- **Ne jamais copier une valeur DNS affichée tronquée dans une UI** (avec `...`). Toujours cliquer/copier via le mécanisme de copie fourni par l'interface, ou agrandir le champ pour voir la valeur en entier avant de la coller ailleurs. Une valeur TXT tronquée ne génère aucune erreur explicite côté Railway — juste un blocage silencieux qui ressemble à un problème de propagation DNS normal, ce qui fait perdre beaucoup de temps à tort.
- Pour dater précisément une future coupure similaire : consulter Google Search Console > Couverture, qui historise les erreurs d'exploration Googlebot par URL.

---

## 15. Session 7 juin 2026 (soir) — Notifications push + Gestion emails

### Notifications push — correction VAPID

- Problème : `VAPID_PUBLIC_KEY` et `VAPID_PRIVATE_KEY` étaient vides dans Railway → `/api/push` retournait `{"publicKey":""}` → `pushManager.subscribe()` plantait avec "Impossible d'activer les notifications"
- Fix : génération d'une nouvelle paire de clés via `npx web-push generate-vapid-keys`, ajoutées dans Railway
- **Attention Railway** : lors du déploiement, Railway proposait aussi de supprimer `Postgres-MqJ4` (base Umami). Cliquer "Keep Service" pour annuler cette suppression avant de déployer
- Résultat : notifications push opérationnelles sur Android (Mouj + Mimi) et iPhone (Safari PWA uniquement, iOS 16.4+)
- **Règle iOS** : sur iPhone, les notifications push PWA ne fonctionnent que depuis l'app installée via Safari > "Sur l'écran d'accueil". Chrome iOS ne supporte pas les notifications push PWA

### Gestion email client — réservation Grace Eleanor

- Réservation reçue : Grace Eleanor (Espagnole, +34), tresses africaines + extensions full head, dimanche 7 juin 16h30
- Répondu via draft Gmail (MCP Gmail connecté à `mouj.business@gmail.com`) en espagnol
- Workflow confirmé : les notifications email de réservation arrivent sur `mouj.business@gmail.com`, on répond via draft Claude + validation manuelle avant envoi

---

## 14. Session 7 juin 2026 — Vidéos marketing + Galerie

### Vidéos marketing créées

- `Salon-Mimi.mp4` — vidéo marketing réalisée dans CapCut (5 photos, fondu sombre, textes ocre Montserrat, musique "Chill Afro Vibe", format 9:16, 21 sec, 7.7 MB)
- `POLLO-AI.mp4` — vidéo générée sur Pollo.ai (3 MB)
- Les deux vidéos publiées sur TikTok via CapCut (compte `mimicoiffure700`)

### Galerie vidéo — 2 nouvelles vidéos ajoutées

- Fichiers uploadés sur `github.com/Moujanane/salon-mimi-media` (repo média public)
- URLs jsDelivr ajoutées dans `GalerieClient.tsx` :
  - `https://cdn.jsdelivr.net/gh/Moujanane/salon-mimi-media/Salon-Mimi.mp4`
  - `https://cdn.jsdelivr.net/gh/Moujanane/salon-mimi-media/POLLO-AI.mp4`
- Miniatures : `s-tressage-mains.jpg` et `s-box-braids-longues.jpg`
- La galerie affiche maintenant **5 vidéos** au lieu de 3

### Fix affichage vidéos dans la galerie

- Problème : vidéos verticales (9:16) affichées zoomées dans le lecteur du site
- Fix : `object-cover` → `object-contain bg-black` dans `GalerieClient.tsx` ligne 230
- Les vidéos s'affichent maintenant en entier avec fond noir sur les côtés

### Règle — toute nouvelle vidéo marketing

1. Uploader dans `Moujanane/salon-mimi-media` sur GitHub
2. Ajouter l'entrée dans le tableau `VIDEOS` de `GalerieClient.tsx` avec l'URL jsDelivr
3. Ne jamais utiliser `object-cover` pour des vidéos verticales dans une galerie horizontale — utiliser `object-contain bg-black`

### Fichiers touchés (session 7 juin)

```
components/sections/GalerieClient.tsx   — 2 nouvelles vidéos + object-contain
```

---

## 13. Session 3 juin 2026 — UX, i18n, SEO, Umami

### Page réservation — fond clair

- Fond `bg-nuit` → `bg-fond` (beige crème) sur toute la page
- Panel formulaire `bg-panneau` → `bg-white` avec ombre légère
- Tous les textes passés de `text-white` → `text-nuit`
- Inputs/selects : fond `bg-fond`, bordure `border-nuit/15`

### Header — fond opaque

- `bg-nuit/92 backdrop-blur-md` → `bg-nuit` (opaque)
- Corrige les textes invisibles sur les pages à fond clair

### Sélecteur de langue FR/EN/ES

- Fichier : `components/layout/Header.tsx`
- Desktop : dropdown avec les 2 autres langues, reste sur la même page
- Mobile : 3 liens en bas du menu hamburger, langue active en ocre
- Logique : `pathname.replace(/${locale}, "")` pour conserver l'URL courante

### Traductions EN/ES complètes

- `components/sections/ReservationLayout.tsx` — objet `TEXTS` avec 20+ clés FR/EN/ES
- `components/sections/ServicesPageClient.tsx` — ajout `startingFrom` et `bookService`
- `components/sections/LocationSection.tsx` — ajout `labelAddress`, `labelHours`, `labelWhatsapp`
- `components/sections/GoogleReviews.tsx` — ajout `badge` et `reviewsCount`
- `app/[locale]/reservation/page.tsx` — passage de `locale` en prop

### Lien avis Google

- Page Contact : bouton "Laisser un avis Google ⭐" traduit FR/EN/ES
- Mail de notification réservation : bouton ocre dans le HTML email
- Lien : `https://g.page/r/CXqJtbaOg9FUEBM/review`

### Suppression avertissement browsersListForSwc

- Option obsolète supprimée de `next.config.mjs`

### Umami — reset complet

- Ancien Postgres-MqJ4 supprimé (hash corrompu impossible à résoudre)
- Nouveau Postgres créé + Umami redéployé
- Nouveau Website ID : `8e60d1e4-e51e-4ac9-896f-f641486a32eb`
- Mot de passe admin changé depuis l'interface
- Script dans `app/[locale]/layout.tsx` mis à jour

### Google Business Profile

- 5 produits ajoutés (en attente validation Google) : Départ de locks 200 MAD, Cornrows full head 370 MAD, Boho/Goddess Braids 420 MAD, Knotless Braids 360 MAD, Box Braids medium 550 MAD
- Actualité postée : photo cornrows + texte FR
- Horaires spéciaux configurés

### Indexation Google Search Console

- 12 URLs EN/ES soumises manuellement le 3 juin 2026

### Traductions services EN/ES

- Labels et sous-services des 10 services traduits EN/ES dans `ServicesPageClient.tsx`
- Fonctions helper `getLabel()` et `getSubServices()` ajoutées
- Fix chevauchement menu header en espagnol (tracking réduit + whitespace-nowrap)

### Vidéos galerie — jsDelivr

- Vidéos exclues du repo par `.gitignore` — migrées vers jsDelivr
- Repo créé : `github.com/Moujanane/salon-mimi-media` (Public)
- 4 vidéos : `pomelli-video-1.mp4`, `pomelli-video-2.mp4`, `pomelli-video-3.mp4`, `Tresses-2mp4.mp4`
- URLs : `https://cdn.jsdelivr.net/gh/Moujanane/salon-mimi-media/[nom-fichier]`
- CSP `next.config.mjs` : `media-src 'self' https://cdn.jsdelivr.net` ajouté
- **Règle** : toute nouvelle vidéo → uploader dans `Moujanane/salon-mimi-media` sur GitHub, puis URL jsDelivr dans le code

### Fichiers touchés

```
components/layout/Header.tsx                    — sélecteur de langue + fond opaque + fix chevauchement ES
components/sections/ReservationLayout.tsx       — fond clair + traductions EN/ES
components/sections/ServicesPageClient.tsx      — startingFrom + bookService + labels/subServices EN/ES
components/sections/LocationSection.tsx         — labels traduits
components/sections/GoogleReviews.tsx           — badge + reviewsCount traduits
components/sections/GalerieClient.tsx           — URLs jsDelivr + 4ème vidéo
app/[locale]/contact/page.tsx                   — bouton avis Google
app/[locale]/reservation/page.tsx               — prop locale
app/[locale]/layout.tsx                         — nouveau Website ID Umami
lib/sendNotificationEmail.ts                    — bouton avis Google dans email
next.config.mjs                                 — media-src jsDelivr dans CSP
```

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

## 12. Session 2 juin 2026 — Emails, Gmail, Formulaire réservation

### Infrastructure email complète

- `mouj.business@gmail.com` créé — boîte Gmail dédiée aux deux projets (Salon Mimi + Atlas Swincar)
- `contact@mimi-coiffure.com` (Namecheap Private Email) : transfert automatique → `mouj.business@gmail.com`
- `contact@atlas-swincar.com` (Namecheap Private Email) : transfert automatique → `mouj.business@gmail.com`
- Gmail configuré pour répondre en tant que `contact@mimi-coiffure.com` et `contact@atlas-swincar.com`
- MCP Gmail Claude connecté à `mouj.business@gmail.com` (et non au Gmail perso)

### Emails site Salon Mimi

- **Problème résolu** : Resend plan gratuit n'autorise l'envoi qu'à l'adresse d'inscription (`moujanane@free.fr`). Solution : utiliser le domaine `atlas-swincar.com` déjà vérifié dans Resend comme expéditeur (`noreply@atlas-swincar.com`), ce qui permet d'envoyer vers n'importe quelle adresse.
- Formulaire contact → `noreply@atlas-swincar.com` → `mouj.business@gmail.com`
- Notifications réservations → `noreply@atlas-swincar.com` → adresse configurée dans `/admin/settings` (mettre `mouj.business@gmail.com`)

### Leçon critique — Resend plan gratuit

- `onboarding@resend.dev` ne peut envoyer qu'à l'adresse email d'inscription au compte Resend
- Avec un domaine vérifié dans Resend, le `to` peut être n'importe quelle adresse
- Ne jamais ajouter un 2ème domaine dans Resend sans passer au plan Pro ($20/mois)
- Solution retenue : utiliser `atlas-swincar.com` (déjà vérifié) comme domaine expéditeur pour les deux sites

### Formulaire de réservation — champ email ajouté

- Champ `email` ajouté dans `ReservationLayout.tsx` (obligatoire)
- Route API `app/api/reservations/route.ts` : email extrait et inséré en base
- `lib/sendNotificationEmail.ts` : email client ajouté dans le corps du mail de notification
- Table Supabase `reservations` : colonne `email text` ajoutée (`ALTER TABLE reservations ADD COLUMN IF NOT EXISTS email text`)

### Lien avis Google

- URL : `https://g.page/r/CXqJtbaOg9FUEBM/review`
- À ajouter sur la page Contact et dans le message de confirmation de réservation (pas encore fait)

### Gestion emails entrants avec Claude

- MCP Gmail connecté à `mouj.business@gmail.com`
- Workflow : Claude lit les emails, crée des drafts de réponse, Mouj valide et envoie
- 2 drafts créés pour les vraies demandes clientes du jour
- Numéro WhatsApp salon : `+212710388204`
- Lien Maps : `https://maps.app.goo.gl/siZDajFcmc85HF519`
- Lien avis Google : `https://g.page/r/CXqJtbaOg9FUEBM/review`

### Fichiers touchés (session 2 juin)

```
components/sections/ReservationLayout.tsx   — champ email ajouté
app/[locale]/reservation/page.tsx           — label email ajouté
app/api/reservations/route.ts               — email extrait + inséré Supabase + passé à sendNotificationEmail
lib/sendNotificationEmail.ts                — email client dans corps du mail
app/api/contact/route.ts                    — from: noreply@atlas-swincar.com, to: mouj.business@gmail.com
```

---

## 11. Session 1er juin 2026 — Galerie, SEO, Responsive, GBP

### Galerie photos + vidéos

- 34 photos ajoutées dans `/public/images/` (renommées sans espaces : `salon-mimi-1.jpeg`, `pomelli-image-1.png`, etc.)
- 3 vidéos Pomelli dans `/public/videos/` (renommées : `pomelli-video-1.mp4`, `pomelli-video-2.mp4`, `pomelli-video-3.mp4`)
- `GalerieClient.tsx` créé — onglets Photos/Vidéos trilingues, `figure/figcaption` pour les vidéos
- Texte descriptif trilingue indexable ajouté dans `galerie/page.tsx` (Server Component)
- Vidéos Pomelli aussi ajoutées dans `ServicesPageClient.tsx` (section "Le salon en vidéo" en bas)
- **Leçon** : noms de fichiers avec espaces/parenthèses cassent Next.js Image — toujours renommer en kebab-case

### Menu et navigation

- "Galerie" ajouté dans le menu header
- Breakpoint hamburger passé de `md` (768px) à `lg` (1024px) — corrige le chevauchement sur iPad
- Logo centré seulement sur desktop (`lg:absolute`)

### Page Services vedettes (homepage)

- Descriptif français sous le titre anglais dans chaque card (`descFr` dans `services-data.ts`)
- Durée supprimée des cards
- Bloc "Package Signature" supprimé de la homepage
- Prix des 4 services vedettes éditables dans `/admin/settings` (clés `price_featured_*`)

### Page Contact

- Boîte adresse/horaires : fond blanc (`bg-white`), texte lisible
- Formulaire : fond blanc, inputs `bg-fond` beige
- Bouton Instagram : fond `bg-nuit`
- Adresse cliquable → Google Maps `https://maps.app.goo.gl/siZDajFcmc85HF519`

### SEO — Schema JSON-LD

- `image` ajoutée : `https://mimi-coiffure.com/images/hero-salon.jpg`
- `hasMap` : `https://maps.app.goo.gl/siZDajFcmc85HF519`
- `sameAs` : Google Maps + fiche GBP + Instagram
- `aggregateRating` corrigé : 4.5/6 (données réelles GBP)
- Hreflang + sitemap : trailing slash ajouté sur toutes les URLs (cohérence canonicals)
- Ouverture corrigée : Lun–Sam 09:00–19:00 (suppression du dimanche erroné)

### Google Business Profile (GBP)

- Fiche existante et active — 456 vues/mois, 6 avis, 4.5 étoiles
- Site web GBP : `https://www.mimi-coiffure.com/` ✅ (était `mimihair.fr` en affichage — c'était un autre établissement)
- Instagram GBP : `https://www.instagram.com/salonmimi.marrakech`
- Description optimisée SEO ajoutée dans GBP
- Fiche complétée (photos, horaires, produits à ajouter)
- URL partage GBP : `https://share.google/t4j91V4ZgAESOoNwp`

### Responsive — audit 5 tailles d'écran

Pages testées : home, services, galerie, contact, réservation
Appareils : iPhone SE (375px), iPhone 15 (393px), Samsung S21 (360px), Samsung A54 (412px), iPad (768px)

Bugs corrigés :

- iPad (768px) : nav liens chevauchés → hamburger jusqu'à `lg`
- Samsung S21 (360px) : pills services coupées → `paddingRight: 16` + `scrollbarWidth: none`
- Samsung A54 (412px) : espace vide hero → `min-h-screen` mobile + `md:h-screen` desktop

### PageSpeed mobile — 1er juin 2026

Score : **92/100**

- FCP : 2.5s 🟡
- LCP : 2.5s 🟡 (cible <2.5s)
- TBT : 110ms 🟢
- CLS : 0.002 🟢
- TTFB : 450ms 🟢

Opportunités restantes :

1. **Redirections multiples — 610ms** → réglé par la Cache Rule Cloudflare (section 7)
2. **Ressources bloquantes — 871ms** → middleware next-intl, difficile à éliminer
3. **JS legacy — 11KB** → `.browserslistrc` partiellement efficace

### Fichiers touchés (session 1er juin)

```
components/sections/GalerieClient.tsx          — créé (galerie avec onglets)
components/sections/ServicesPageClient.tsx     — section vidéos Pomelli + pills fix
components/sections/HeroHome.tsx               — min-h-screen mobile
components/layout/Header.tsx                   — lg breakpoint hamburger + Galerie dans nav
components/ui/ServiceCard.tsx                  — descFr, suppression duration
components/sections/ServicesGrid.tsx           — passage descFr, suppression duration
components/admin/SettingsForm.tsx              — section Services vedettes prix
app/[locale]/galerie/page.tsx                  — GalerieClient + texte indexable
app/[locale]/contact/page.tsx                  — fond blanc + adresse cliquable Maps
app/[locale]/layout.tsx                        — schema image/sameAs/hasMap/aggregateRating
app/[locale]/services/page.tsx                 — hreflang trailing slash
app/[locale]/reservation/page.tsx              — hreflang trailing slash
app/[locale]/a-propos/page.tsx                 — hreflang trailing slash
app/[locale]/page.tsx                          — featuredPrices, suppression PackageSignature
app/sitemap.ts                                 — trailing slash toutes URLs
app/api/settings/route.ts                      — clés price_featured_*
lib/settings.ts                                — type + defaults price_featured_*
lib/services-data.ts                           — champ descFr sur 4 services featured
lib/sendNotificationEmail.ts                   — Resend instancié dans handler (fix build)
public/images/                                 — 34 photos renommées kebab-case
public/videos/                                 — 3 vidéos Pomelli renommées kebab-case
components/sections/ContactForm.tsx            — fond blanc inputs
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
