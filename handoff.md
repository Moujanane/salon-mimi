# Handoff — Salon Mimi

## 1. Objectif du projet

Refaire entièrement le site du Salon Mimi (coiffure afro, Marrakech) avec un design Bold & Culture premium, optimisé SEO local, sécurisé, et déployé sur Railway.

---

## 2. État actuel du code

### Ce qui marche

- Homepage : hero split 50/50, 3 colonnes photo animées, badge "Place Jamaa El Fna" en ocre
- Page Services : 10 services en français, pills cliquables (bug CSP corrigé), panneau photo qui change, tient sur une page
- Page Réservation : formulaire complet, panneau photo dynamique, tient sur une page
- Header : nav fixe, hamburger mobile, bouton RDV ocre
- Footer, LocationSection, CTAFinal : OK
- SEO : JSON-LD HairSalon, hreflang fr/en/es, og:image
- Sécurité : headers HTTP (X-Frame-Options, HSTS, etc.), rate limiting API, validation serveur
- Middleware i18n : /admin exclu correctement
- Images : 14 photos réelles du salon dans /public/images/

### Ce qui ne marche pas / non validé

- Login admin : "Email ou mot de passe incorrect" — l'email utilisé (moujanane@free.fr) ne correspond peut-être pas au compte Supabase
- Dashboard admin : non validé (bloqué par le login)
- Page Services mobile : non testée après le fix CSP

---

## 3. Fichiers touchés

```
components/sections/HeroHome.tsx
components/sections/ServicesPageClient.tsx
components/sections/ReservationLayout.tsx
components/sections/LocationSection.tsx
components/sections/CTAFinal.tsx
components/layout/Header.tsx
components/layout/Footer.tsx
components/admin/LoginForm.tsx
app/[locale]/layout.tsx
app/[locale]/page.tsx
app/[locale]/services/page.tsx
app/[locale]/reservation/page.tsx
app/admin/dashboard/page.tsx
app/admin/login/page.tsx
app/admin/layout.tsx
app/api/reservations/route.ts
app/globals.css
next.config.mjs
middleware.ts
tailwind.config.ts
public/og-image.jpg
public/images/s-ongles.jpg
public/images/s-tresses-2.jpg
public/images/s-tresses-3.jpg
public/images/s-tresses-4.jpg
public/images/s-tresses-5.jpg
public/images/s-box-braids-profil.jpg
public/images/s-tressage-action.jpg
public/images/s-tressage-mains.jpg
public/images/s-box-braids-longues.jpg
```

---

## 4. Tentatives échouées

- **CSP (Content-Security-Policy)** : ajouté dans next.config.mjs avec `script-src 'self' 'unsafe-inline'` — bloquait `eval()` requis par Next.js, rendant toute interactivité React impossible (pills, formulaires, hamburger). Supprimé.
- **`hidden md:grid` sur le panneau photo hero** : Tailwind génère `display:none` puis `display:grid` — fonctionnait mais l'inner grid ne recevait pas la hauteur correcte. Résolu en mettant `display:grid` directement sur le conteneur.
- **Timer auto-avance Services** : tentative de réinitialisation avec `useRef` + `clearInterval` au clic — n'avait aucun effet car le vrai bug était le CSP qui bloquait React entièrement.
- **`pointer-events:none` sur slides inactifs** : piste explorée pour expliquer les clics non fonctionnels — n'était pas la cause racine (c'était le CSP).
- **Garde `if (index === active) return`** dans `goTo` — suspectée de bloquer les clics, supprimée, mais là non plus ce n'était pas la cause.

---

## 5. Prochaine étape

Débloquer le login admin :

1. Aller sur Supabase Dashboard → Authentication → Users
2. Vérifier l'email exact du compte admin (probablement différent de moujanane@free.fr)
3. Si aucun compte : créer un utilisateur via "Invite user" avec l'email souhaité
4. Tester le login sur localhost:3000/admin/login
5. Valider le dashboard (affichage des réservations)
6. Déployer sur Railway une fois le dashboard validé
