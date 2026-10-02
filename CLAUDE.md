# CLAUDE.md — Salon Mimi

@MEMOIRE-GLOBALE.md

Ce fichier contient le contexte **spécifique à ce projet**. Les bonnes
pratiques génériques sont dans `MEMOIRE-GLOBALE.md` (importé ci-dessus).
Le journal de session détaillé est dans `handoff.md`.

## Objectif du projet

Site vitrine + réservation en ligne pour le Salon Mimi, spécialiste des
tresses africaines, knotless, locks et styles naturels à Marrakech (Place
Jamaa El Fna). Convertit les visiteuses en clientes via un formulaire de
réservation et une présentation premium du savoir-faire. Détail
positionnement/cible/ton : voir `PRODUCT.md`.

## Stack

- Next.js **15.5.25** (App Router), React 18
- Base de données / auth : Supabase (`@supabase/ssr`)
- i18n : `next-intl`, FR/EN/ES
- Email : Resend (API HTTP, pas SMTP — PaaS bloque souvent les ports
  SMTP sortants)
- Rate limiting : Upstash (`@upstash/ratelimit`)
- Notifications push : `web-push`
- Images : `sharp`
- Déploiement : Railway (branche `main`)

## Architecture

- Réservation → formulaire → confirmation + lien WhatsApp
- Admin : dashboard réservations + settings (WhatsApp, prix, notif email)
- SEO : rapport quotidien Search Console automatisé (cron Railway
  `seo-cron`, voir `handoff.md` §37-38 pour la procédure complète)

## Repos liés

- `Moujanane/salon-mimi-media` — médias
- `Moujanane/atlas-swincar` — autre projet actif, partage historiquement
  le même client OAuth Google (rapport SEO) ; **aucun lien de code ou de
  dépendance** entre les deux sites eux-mêmes

## Pour le détail des sessions passées

Voir `handoff.md` (numéroté par section, §1 à §39+) — historique complet,
commits, pièges rencontrés, état actuel du code, priorités restantes.
