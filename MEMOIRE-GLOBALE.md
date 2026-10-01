# MEMOIRE-GLOBALE.md

Bonnes pratiques génériques, valables pour **tous** les projets Claude Code
de ce compte (actuellement : atlas-swincar, salon-mimi, Distrib-Eau).
Ce fichier est dupliqué à l'identique dans chaque repo — en cas de mise à
jour, répercuter le changement dans les autres.

Ne pas y mettre de contenu spécifique à un projet (ça va dans le `CLAUDE.md`
du projet). Ne pas y mettre le journal de session (ça va dans `handoff.md`).

---

## Secrets & credentials

- Un secret (clé API, ID/secret OAuth, token) collé en clair dans un chat
  Claude Code est une fuite réelle, même « juste en local » — à traiter
  comme telle (rotation), pas comme un détail sans suite.
- En cas de fuite, **recréer entièrement** le client/credential, pas
  seulement régénérer le token qui en dérive.
- Lors d'un copier-coller de secret vers une UI web (Railway, etc.),
  vérifier qu'aucune ligne suivante n'a été collée par erreur (un `\n`
  concaténé n'est jamais signalé par l'UI).
- Pour diagnostiquer un échec d'auth avec un secret « qui semble correct »,
  comparer longueur / début / fin de la chaîne — jamais la valeur complète
  affichée ou logguée.
- Supprimer les fichiers temporaires contenant un secret avec `trash`
  plutôt que `rm`.
- Garder un script réutilisable de génération/rotation de token dans le
  repo (protégé par `.gitignore` sur ce qu'il consomme/produit), pour ne
  pas redécouvrir la procédure à la prochaine rotation.
- Ne jamais embarquer un token dans une URL de clone Git
  (`https://x-access-token:TOKEN@...`) — il serait écrit en clair dans
  `.git/config` et exposé dans les logs CI en cas d'échec d'auth. Utiliser
  `-c http.extraHeader` sur `clone`/`fetch`/`push`, jamais persisté.
- Un PAT fine-grained pour un usage CI doit cocher explicitement
  **Contents → Read and write** dès sa création, sinon le push échoue en
  `403 Write access not granted`.

## Rotation OAuth

- OAuth Playground est incompatible avec un client « Desktop app »
  (`redirect_uri_mismatch`) — utiliser le flow loopback RFC 8252
  (`http://localhost:<port>/callback`).
- Dans Google Auth Platform, les utilisateurs test de l'écran de
  consentement se gèrent sous **Audience** (renommé).
- Après rotation de credentials partagés entre plusieurs projets, tester
  en `--dry-run` sur chaque projet avant de toucher la prod, puis mettre à
  jour les variables sur tous les services concernés.

## Git / GitHub

- Toujours vérifier `git rev-parse --show-toplevel` avant une opération
  sur des chemins (ex. `git rm --cached`) — un shell mal positionné
  produit des chemins dupliqués/faux.
- Isoler les artefacts générés automatiquement (rapports, logs de cron)
  sur une branche dédiée, distincte de `main`.
- Un worktree abandonné peut laisser un serveur dev orphelin tourner sur
  un port, ou polluer `git status` — l'ajouter au `.gitignore` et
  vérifier les process avant de lancer des tests.
- Le `cwd` d'une session d'agent se réinitialise entre commandes —
  toujours enchaîner `cd <dossier> && commande` en une seule commande.
- Un seul merge / déploiement par lot cohérent — éviter d'empiler des
  pushs correctifs en rafale (risque de build incohérent côté
  plateforme).
- Avant un changement risqué (bump de dépendance majeure, migration),
  poser un tag de sauvegarde (ex. `backup-pre-X`) pour un rollback rapide.

## Déploiement Railway

- Pour un service cron, forcer explicitement la **Build Command**
  (ex. `npm ci`) — sinon le builder détecte le framework et lance le
  build complet de l'application au lieu du script voulu.
- Railpack/Nixpacks n'installe pas `git` par défaut dans l'image de
  déploiement — l'ajouter via `RAILPACK_DEPLOY_APT_PACKAGES=git` si un
  script en a besoin au runtime.
- Pour tester un cron sans attendre l'horaire : « Run now » dans Cron
  Runs, puis lire les **logs du déploiement** (pas seulement le statut).
- Une variable `NEXT_PUBLIC_*` (ou équivalent build-time) est figée au
  build — la modifier ne prend effet qu'après redéploiement.
- Avant de supprimer un service cloud, vérifier qu'aucune variable
  critique d'un autre service n'en dépend encore.
- Toujours lire les popups de confirmation d'une plateforme de
  déploiement avant de valider (ex. suppression d'un service lié).
- Plusieurs déploiements rapprochés le même jour peuvent servir un build
  incohérent. Avant de chercher un bug dans le code : reproduire en local
  (`build && start`) ; si ça marche en local → redeploy avec cache de
  build vidé.

## Tests

- Garder une checklist de vérification manuelle obligatoire après chaque
  déploiement sensible (parcours critique de bout en bout), en complément
  des tests automatisés.
- Un test E2E qui référence un host absolu en dur (au lieu d'un chemin
  relatif) continue de taper la vraie prod même en local.
- Préférer `domcontentloaded` ou un élément précis à l'événement `load`
  pour éviter des échecs dus à des ressources lourdes (vidéos, médias)
  alors que le vrai contenu répond vite.
- Vérifier qu'aucun serveur dev orphelin ne tourne sur le port cible
  avant de lancer une suite de tests (`lsof -nP -iTCP:<port> -sTCP:LISTEN`).
- Isoler un flaky préexistant dans une tâche de suivi séparée plutôt que
  de le laisser polluer le diagnostic du chantier en cours.
- Avant un bump de version, relancer la suite isolée
  (`--workers=1 --retries=0`) pour distinguer une vraie régression d'une
  instabilité d'infra.
- Ne pas supposer un seuil strict « exactement N puis blocage immédiat »
  pour un rate limiter à fenêtre glissante — le comptage peut être réparti
  sur plusieurs clés à poids différents.

## Sécurité

- Un secret transmis en query string (`?pin=...`) est loggé par les
  proxys/CDN/historique navigateur — le faire transiter par un header
  dédié.
- Comparer un secret/PIN en temps constant (`crypto.timingSafeEqual`),
  jamais avec une comparaison de chaîne classique.
- Ne jamais prévoir de valeur de fallback par défaut pour un secret
  d'auth — en l'absence de la variable d'environnement, refuser
  explicitement (503) plutôt qu'autoriser avec une valeur connue.
- Un rate limiter en mémoire process (`Map`) est remis à zéro à chaque
  redéploiement et n'est pas partagé entre instances — migrer vers un
  store partagé si la protection doit être réelle. Concevoir tout rate
  limiter en **fail-open** (une panne d'infra autorise, ne bloque pas).
- Derrière un CDN/proxy, `x-forwarded-for` peut varier à chaque requête
  (edge différent) — utiliser le header spécifique au CDN, stable, avec
  `x-forwarded-for` en simple fallback. Prendre le `at(0)` pas `at(-1)`
  pour éviter le spoofing.
- Un honeypot anti-bot simple (champ caché) peut filtrer des soumissions
  automatisées ; faire échouer silencieusement pour ne pas révéler au bot
  qu'il a été détecté.
- Lors d'une migration touchant à l'auth, vérifier explicitement en revue
  que la garde d'authentification reste exécutée avant toute lecture de
  donnée sensible.
- Documenter les règles d'accès critiques (ex. policies RLS) dans la doc
  du projet plutôt que de se fier à un fichier SQL versionné qui devient
  vite désynchronisé de l'état réel en base.
- Prévoir un audit sécurité périodique dédié (dépendances, policies
  d'accès base de données, fuzzing des routes API) plutôt qu'« à
  l'occasion ».
- Suivre `npm audit` / CVE des dépendances ; avant un bump de sécurité,
  valider `tsc --noEmit`, build, tests unitaires et e2e, puis vérifier
  manuellement en prod les parcours critiques impactés.

## Process / méthodologie

- Chantier non trivial : brainstorming → spec écrite → plan écrit →
  exécution → revue de conformité à la spec → revue qualité de code →
  merge → tests.
- Pour les décisions UX à plusieurs issues plausibles, les poser
  explicitement à l'utilisateur avec 2-3 options concrètes et leurs
  compromis, plutôt que de trancher seul.
- Vérifier l'environnement de test (clés réelles vs placeholders) avant
  de démarrer un chantier qui en dépend.
- Avant un merge, exécuter réellement les parcours utilisateur dans un
  navigateur — une revue de code seule ne suffit pas à détecter les
  régressions d'UX.
- Maintenir une section « pièges à ne pas reproduire » dans la doc de
  handoff, et la consulter en revue de tout nouveau composant du même
  type.
- Un symptôme qui se répète après un correctif superficiel (ex. redeploy
  répété) signale qu'il faut chercher la cause racine, pas recontourner.
- Demander les logs/la console avant de formuler des hypothèses de
  diagnostic.
- Documenter les chantiers « bloqués pour une raison structurelle » avec
  le diagnostic déjà fait, pour ne pas le refaire à la session suivante.
- Faire relire par un reviewer dédié tout changement risquant une
  régression silencieuse à grande échelle (ex. un `await` manquant sur
  une fonction appelée par plusieurs sites d'appel).
- Pour tout outil tiers qui affiche un état en retard/caché (crawl Google,
  cache CDN...) : valider d'abord avec un outil qui lit l'état **live**
  avant de « corriger » du code déjà correct. Interdiction de dire
  « c'est un délai » ET corriger en même temps — contradictoire.

## Outils MCP / environnement local

- Un lanceur de preview intégré peut être cassé sur une machine donnée
  sans rapport avec le code — contourner en lançant le serveur dev
  soi-même sur un port libre, ou vérifier via `curl` sur le HTML rendu.
- Ne jamais faire tourner un build de production et un serveur de dev en
  parallèle sur le même dossier — risque de corrompre le répertoire de
  build.
- Une installation de dépendances peut échouer sur un simple timeout
  réseau (pas un conflit de versions) — retenter avec un timeout de
  fetch augmenté avant de creuser plus loin.

## Pièges techniques transférables

- Un service d'emailing tiers peut restreindre l'envoi à l'adresse
  d'inscription du compte, ou échouer silencieusement avec une clé mal
  formée — toujours vérifier dans le dashboard du service que les envois
  apparaissent réellement.
- Un hébergeur PaaS peut bloquer les ports SMTP sortants — préférer un
  envoi d'email via API HTTP.
- Instancier un client SDK tiers à l'intérieur du handler plutôt qu'au
  niveau module, pour garantir que les variables d'environnement sont
  lues au bon moment.
- Après une migration de registrar/nameservers/CDN, tester explicitement
  l'apex **et** le sous-domaine `www` séparément.
- Ne jamais copier une valeur affichée tronquée dans une UI pour la
  recoller ailleurs (ex. token de vérification DNS) — utiliser le
  mécanisme de copie fourni.
- Modifier un header de réponse dans un middleware ne garantit pas qu'il
  s'applique à la réponse finale si le framework la réécrit plus tard
  dans le pipeline.
- Une dépendance montée en version majeure peut imposer des changements
  collatéraux non anticipés — vérifier réellement le build après la
  montée de version, pas seulement se fier au guide de migration.

## Documentation / handoff

- Chaque projet a 3 fichiers à la racine : `MEMOIRE-GLOBALE.md` (ce
  fichier, identique partout), `CLAUDE.md` (contexte spécifique au
  projet : objectif, stack, architecture), `handoff.md` (journal de
  session, numéroté par section).
- Dans `handoff.md`, chaque session documente : ce qui a été fait, les
  commits, les vérifications effectuées, l'état en prod, ce qui reste à
  faire, les pièges rencontrés.
- Distinguer clairement « fait et vérifié en prod » de « fait mais pas
  encore mergé/déployé ».
- Capturer une « règle » en une ligne dès qu'un bug non trivial est
  corrigé, au même endroit, pour qu'une recherche future la retrouve
  facilement.
- Corriger immédiatement une doc obsolète détectée en cours de route
  (ex. un `CLAUDE.md` qui mentionne une ancienne version de framework)
  plutôt que de la laisser traîner.

---

## Historique de ce fichier

- 2026-10-01 : création, consolidation des bonnes pratiques issues des
  handoffs `atlas-swincar` et `salon-mimi`. Dupliqué dans les 3 projets
  actifs (atlas-swincar, salon-mimi, Distrib-Eau).
