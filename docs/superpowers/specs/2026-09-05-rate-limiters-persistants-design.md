# Design — Rate limiters persistants via Upstash Redis

## Contexte

Audit SEO/sécurité du 30 août 2026 (§26 du handoff) : les rate limiters de
3 endpoints critiques sont implémentés en mémoire process (`Map` locale) :

- `app/api/reservations/route.ts` — 5 requêtes / 10 min par IP
- `app/api/contact/route.ts` — 3 requêtes / 1 min par IP
- `lib/mimiAuth.ts` (PIN de la PWA planning Mimi) — 3 échecs / 30 min par IP

Un `Map` en mémoire process est remis à zéro à chaque redéploiement Railway et
n'est pas partagé si l'app scale sur plusieurs instances. Un attaquant qui
connaît (ou observe) le rythme de déploiement peut contourner la protection à
volonté. Ce chantier remplace ce stockage par Upstash Redis, sans changer
aucun seuil ni comportement fonctionnel observable côté utilisateur légitime.

## Décisions validées avec Mouj

- **Store** : Upstash Redis (compte à créer/vérifier par Mouj, hors scope code
  — voir section Prérequis).
- **Seuils** : strictement inchangés (5/10min, 3/min, 3 échecs/30min).
- **Fallback si Upstash indisponible** : fail-open. Si Redis ne répond pas
  (panne, timeout, credentials absents/invalides), la requête est autorisée
  comme si le rate limit n'existait pas, plutôt que de bloquer des
  utilisateurs légitimes. Une panne Upstash dégrade la protection anti-spam,
  jamais la disponibilité du site.

## Portée

Fichiers touchés :

- Créer : `lib/rateLimit.ts` — wrapper partagé.
- Modifier : `app/api/reservations/route.ts`
- Modifier : `app/api/contact/route.ts`
- Modifier : `lib/mimiAuth.ts`

Aucun autre fichier. Aucun changement de seuil, de message d'erreur utilisateur
(le texte des 429 reste identique), ni de logique métier des 3 routes en
dehors du rate limiting lui-même.

## Architecture

### Deux formes de rate limit, une seule bibliothèque cliente

1. **Compteur par fenêtre** (`reservations`, `contact`) : "au plus N requêtes
   dans les X dernières minutes". Implémenté avec `@upstash/ratelimit`
   (`Ratelimit.slidingWindow` ou `fixedWindow` — voir Task de plan pour le
   choix exact), qui gère la fenêtre glissante nativement.

2. **Compteur d'échecs réinitialisable** (`mimiAuth`) : "au plus N échecs
   consécutifs dans une fenêtre de 30 min, remis à zéro dès qu'un essai
   réussit". Ce n'est pas un rate limit classique par requête — c'est un
   verrou anti-bruteforce. `@upstash/ratelimit` ne modélise pas nativement
   "reset sur succès", donc ce cas utilise le client bas niveau
   `@upstash/redis` directement avec des commandes `INCR`/`EXPIRE`/`DEL` :
   - Échec : `INCR` sur la clé `mimi-auth:<ip>`, `EXPIRE` à 30 min si c'est le
     premier échec de la fenêtre, refuse si le compteur dépasse 3.
   - Succès : `DEL` sur la clé (réinitialise immédiatement, comme le
     comportement actuel `attempts.delete(ip)`).

### `lib/rateLimit.ts` — interface

Un seul module exporte :

- Un client Redis Upstash partagé (une seule instance, réutilisée par les
  deux formes de limiteur — évite d'ouvrir une connexion par requête).
- `checkWindowLimit(key: string, max: number, windowSeconds: number): Promise<boolean>`
  — pour le cas 1 (fenêtre simple). Retourne `true` si la requête est
  autorisée.
- `checkAndRecordFailure(key: string, max: number, windowSeconds: number): Promise<boolean>`
  et `clearFailures(key: string): Promise<void>` — pour le cas 2
  (compteur d'échecs réinitialisable), utilisés uniquement par `mimiAuth.ts`.

Chaque fonction est enveloppée dans un `try/catch` : toute erreur (réseau,
credentials manquants, timeout) est loguée via `console.error` et la fonction
retourne l'équivalent de "autorisé" (`true` pour les checks, no-op pour
`clearFailures`) — jamais une exception qui remonterait et casserait la route
appelante.

### Détection de credentials absents

Si `UPSTASH_REDIS_REST_URL` ou `UPSTASH_REDIS_REST_TOKEN` sont absentes de
l'environnement (ex. dev local sans Upstash configuré), le module logue un
`console.warn` une seule fois au chargement (pas à chaque requête) et toutes
les fonctions de rate limit retournent directement "autorisé" sans tenter
d'appel réseau — évite un `try/catch` qui timeout inutilement à chaque requête
en dev.

## Variables d'environnement (nouvelles)

À ajouter dans Railway (production) et `.env.local` (dev, optionnel) :

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Ces deux valeurs viennent du dashboard Upstash (créées par Mouj, hors scope
code — voir Prérequis).

## Prérequis avant l'implémentation (action de Mouj, pas de code)

1. Vérifier si un compte Upstash existe déjà, sinon en créer un (gratuit).
2. Créer une base Redis (région proche de Railway — Europe si Railway y est
   déployé, pour minimiser la latence).
3. Récupérer `UPSTASH_REDIS_REST_URL` et `UPSTASH_REDIS_REST_TOKEN` depuis le
   dashboard Upstash (onglet REST API de la base créée).
4. Fournir ces deux valeurs pour les ajouter à `.env.local` (dev) — l'ajout
   à Railway (prod) se fera au moment du déploiement, avec la même prudence
   que pour toute variable d'environnement de production (cf. leçon Stripe
   NEXT_PUBLIC : les secrets serveur n'ont pas cette contrainde de build-time,
   contrairement aux clés `NEXT_PUBLIC_*`, donc peuvent être ajoutées avant ou
   après le déploiement sans casser le build).

Le plan d'implémentation ne débloque son exécution qu'une fois ces credentials
disponibles pour test réel (pas seulement simulé).

## Validation

- `npx tsc --noEmit`, `npm run build`
- Test manuel avec Upstash réellement branché : déclencher volontairement le
  rate limit sur les 3 endpoints (dépasser le seuil) et vérifier le 429 sur
  chacun, avec les mêmes messages d'erreur qu'avant la migration.
- Test manuel du fail-open : simuler une panne (credentials invalides ou
  absentes temporairement) et vérifier que les 3 routes continuent de
  répondre normalement (pas de 500, pas de blocage).
- **Vérification différée, hors de cette session** : confirmer qu'un
  redéploiement Railway ne réinitialise plus le compteur. Ce test ne peut se
  faire qu'en observant un vrai cycle de déploiement en prod après la mise en
  ligne — à noter dans le handoff comme point de suivi, pas bloquant pour
  merger.
- Playwright existant (`e2e/`) ne teste pas ces 3 routes directement
  (confirmé par grep avant de commencer le plan) — aucune régression
  attendue sur la suite existante, mais à revérifier explicitement au moment
  du plan avant de conclure "zéro régression".

## Hors scope

- Changement de seuils ou de fenêtres temporelles.
- Rate limiting sur d'autres routes que les 3 citées (`/api/mimi`,
  `/api/mimi-settings`, `/api/push`, `/api/settings` ne sont pas concernées
  par ce chantier — elles sont protégées par le PIN, pas par un rate limit
  séparé, sauf `mimiAuth.ts` qui EST le rate limit du PIN lui-même).
- Migration d'autres états en mémoire non liés au rate limiting.
- Le reste des chantiers de l'audit du 30 août (P6 pages rasta/EN, reste de
  `npm audit`/migration Next 15).
