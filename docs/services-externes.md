# Services externes — Salon Mimi

Mis à jour le 26 mai 2026.

---

## Hébergement & déploiement

| Service | Fonctionnalité                                                                         | URL                             |
| ------- | -------------------------------------------------------------------------------------- | ------------------------------- |
| Railway | Hébergement du site Next.js + Umami. Déploiement automatique à chaque push sur `main`. | railway.app                     |
| GitHub  | Dépôt source du site. Repo : `Moujanane/salon-mimi`                                    | github.com/Moujanane/salon-mimi |

---

## Base de données

| Service  | Fonctionnalité                                                                          | URL          |
| -------- | --------------------------------------------------------------------------------------- | ------------ |
| Supabase | PostgreSQL hébergé. Stocke les réservations, contacts et paramètres admin. RLS activée. | supabase.com |

---

## Emails

| Service                 | Fonctionnalité                                                                                                                                                                                                                                       | URL              |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Resend                  | Envoi des emails transactionnels via API HTTP (pas SMTP). Utilisé pour les notifications de réservation et le formulaire contact. Sender : `onboarding@resend.dev`. Destinataire : `moujanane@free.fr`. Clé API : variable Railway `RESEND_API_KEY`. | resend.com       |
| Namecheap Private Email | Boîte mail `contact@mimi-coiffure.com`. Plan Starter (€12.83/an). Catch-All activé, 5 GB. Webmail : `mail.privateemail.com`.                                                                                                                         | privateemail.com |

---

## DNS & CDN

| Service    | Fonctionnalité                                                                                                                       | URL                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------- |
| Cloudflare | DNS + CDN. Nameservers : `meiling.ns.cloudflare.com` + `thomas.ns.cloudflare.com`. Cache Rule à configurer pour améliorer PageSpeed. | dash.cloudflare.com |
| Gandi      | Registrar du domaine `mimi-coiffure.com`.                                                                                            | gandi.net           |

---

## Analytics

| Service | Fonctionnalité                                                                                                                                                                | URL                                  |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Umami   | Analytics sans cookie, conforme RGPD. Hébergé sur Railway dans le même projet. Website ID : `a779a13d-9789-46fc-95c2-958ead141b9d`. Login : `admin` (mot de passe à changer). | umami-production-2141.up.railway.app |

---

## SEO & visibilité

| Service                 | Fonctionnalité                                                                                            | URL                              |
| ----------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Google Search Console   | Suivi indexation, erreurs de crawl, soumission sitemap. Sitemap soumis : `mimi-coiffure.com/sitemap.xml`. | search.google.com/search-console |
| TripAdvisor             | Fiche établissement — en attente de validation depuis le 18 mai 2026.                                     | tripadvisor.com                  |
| Google Business Profile | Fiche GMB — à créer (essentiel pour le SEO local Marrakech).                                              | business.google.com              |

---

## Communication client

| Service     | Fonctionnalité                                                                                                                                  | URL                            |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| WhatsApp    | Canal de confirmation des réservations. Numéro configurable dans `/admin/settings`. Lien généré automatiquement après soumission du formulaire. | wa.me                          |
| Google Maps | Iframe carte intégrée sur la page `/fr/contact`.                                                                                                | Embed statique, pas de clé API |

---

## Tests

| Service    | Fonctionnalité                                                                                                                                                                             | URL            |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| Playwright | Tests de non-régression E2E. 11 tests couvrant accueil, navigation, réservation, SEO, responsive. Cible : `https://mimi-coiffure.com`. Commande : `npx playwright test --project=desktop`. | playwright.dev |
