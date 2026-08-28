# Tunnel de réservation v3 — formulaire commun + 2 boutons d'envoi — Design

Date : 2026-08-30
Projet : Salon Mimi (mimi-coiffure.com)
Suite de : v2 (`2026-08-30-tunnel-reservation-v2-choix-explicite-design.md`, déployée + hotfix `a843b57`)

## 1. Problème avec la v2

La v2 met deux boutons en haut : « Réserver par WhatsApp » et « Réserver par
formulaire ». Le formulaire est masqué et se déplie au clic sur le 2e bouton.
Retour terrain : ce n'est pas clair. « Réserver par formulaire » déplie bien le
formulaire, mais « Réserver par WhatsApp » n'ouvre que WhatsApp — l'utilisateur
ne comprend pas la logique des deux modes. De plus, le bug d'hydratation
(section 19bis) venait de cette structure à rendu initial minimal.

## 2. Décision (brainstorm 2026-08-30)

Revenir à un **formulaire commun toujours affiché** (comme la v1), avec **deux
boutons d'envoi en bas du formulaire** au lieu d'un seul :

| Sujet                          | Décision                                                                                                                                                                                                                                                    |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Formulaire                     | **Toujours affiché** au chargement. Suppression du state `showForm` et du bloc « 2 boutons de choix » du haut.                                                                                                                                              |
| Boutons d'action               | **Deux, en bas du formulaire** : « Confirmer ma réservation » (ocre) et « Réserver par WhatsApp » (vert).                                                                                                                                                   |
| « Confirmer ma réservation »   | `<button type="submit">`, ocre. Comportement de soumission **inchangé** : POST `/api/reservations` → base + notif push Mimi + accusé de réception client si email → redirection WhatsApp (message détaillé, généré serveur). Champs `required` HTML natifs. |
| « Réserver par WhatsApp »      | `<button type="button">`, vert, icône WhatsApp. Lit les champs saisis, **exige Nom + Téléphone**, construit un message pré-rempli, ouvre `wa.me`. **Aucun appel API.**                                                                                      |
| Validation du bouton WhatsApp  | Si Nom **ou** Téléphone vide → ne rien ouvrir, afficher un message d'erreur dédié sous les boutons + `focus()` sur le premier champ manquant.                                                                                                               |
| Message WhatsApp pré-rempli    | Coiffure + Date + Nom + Téléphone + (Heure / Personnes / Message si renseignés).                                                                                                                                                                            |
| Panneau photo droite (desktop) | **Toujours affiché** (comme v1).                                                                                                                                                                                                                            |
| `?service=`                    | Inchangé : lecture via `useEffect` + `window.location.search` (hotfix `a843b57` conservé — ne PAS réintroduire `useSearchParams`).                                                                                                                          |

## 3. Structure de `/reservation` (de haut en bas)

1. **En-tête** — inchangé (`h-[57px]` spacer, sous-titre, `<h1>`).
2. **Grille form + photo** — `<div className="flex flex-col md:flex-row flex-1 min-h-0 gap-4 p-4 pt-3">`, **toujours rendue** (plus de `{showForm && ...}`) :
   - **Panneau formulaire** `<div className="w-full md:w-[44%] bg-white ...">` avec `<form onSubmit={handleSubmit} className="flex flex-col gap-4">` :
     - Titre « Tes informations » + note champs requis
     - Service `<select name="service" value={activeIndex} onChange={...}>` (10 options)
     - `<p>` ligne de prix dynamique (`{activeSvc.label} — {tx.startingFrom} {prix} MAD · {tx.priceIndicative}`)
     - séparateur
     - grille Nom (`name="name"` required) + Téléphone (`name="phone"` required)
     - séparateur
     - Date (`name="date"` type date required)
     - bouton « + Ajouter des précisions » (`setShowDetails`) → `{showDetails && (...)}` : Heure (`name="time"`), Personnes (`name="persons"`), Email (`name="email"`), Message (`name="message"`) — inchangé
     - `{error && <p className="text-red-500 ...">{error}</p>}` (erreur de soumission)
     - `{whatsappError && <p className="text-red-500 ...">{whatsappError}</p>}` (erreur du bouton WhatsApp)
     - **Bloc 2 boutons** `<div className="flex flex-col sm:flex-row gap-3">` :
       - `<button type="submit" className="flex-1 bg-ocre hover:bg-or text-white text-[13px] font-inter font-semibold py-3.5 rounded-full transition-colors">{tx.submitBtn}</button>`
       - `<button type="button" onClick={handleWhatsApp} className="flex-1 flex items-center justify-center gap-2 bg-whatsapp hover:bg-whatsapp-hover text-white text-[13px] font-inter font-semibold py-3.5 rounded-full transition-colors"><WhatsAppIcon className="w-4 h-4" />{tx.whatsappPrimaryBtn}</button>`
     - `<p className="text-center text-nuit/40 text-[10px] font-inter leading-relaxed">{tx.reassurance} · {tx.noOnlinePayment}</p>`
   - **Panneau photo** `<div className="hidden md:block flex-1 bg-nuit ...">` — inchangé (map SERVICES, opacity selon `activeIndex`).
3. **Section « Vous ne trouvez pas le salon ? »** — inchangée.
4. **Écran `if (submitted)`** — inchangé.

## 4. `handleWhatsApp` (nouveau)

```tsx
function handleWhatsApp() {
  const form = document.querySelector<HTMLFormElement>("form");
  if (!form) return;
  const getVal = (name: string) => {
    const el = form.elements.namedItem(name) as
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
    return el?.value?.trim() ?? "";
  };
  const nom = getVal("name");
  const telephone = getVal("phone");
  if (!nom || !telephone) {
    setWhatsappError(tx.whatsappMissing);
    const missing = !nom ? "name" : "phone";
    (form.elements.namedItem(missing) as HTMLElement | null)?.focus();
    return;
  }
  setWhatsappError("");
  const url = generateWhatsAppLink({
    nom,
    telephone,
    service: activeSvc.label,
    dateSouhaitee: getVal("date") || undefined,
    message:
      [
        getVal("time") ? `Heure : ${getVal("time")}` : null,
        getVal("persons") ? `Personnes : ${getVal("persons")}` : null,
        getVal("message") || null,
      ]
        .filter(Boolean)
        .join(" — ") || undefined,
  });
  window.location.href = url;
}
```

- `generateWhatsAppLink` : déjà exporté par `lib/whatsapp.ts`, signature
  `(data: ReservationData, whatsappNumber?: string) => string` avec
  `ReservationData = { nom, telephone, service, dateSouhaitee?, message? }`.
  Importé côté client (c'est une fonction pure, pas de dépendance serveur).
- Pas de `window.open()` — `window.location.href` synchrone (pas de `fetch`
  avant), conforme au piège documenté du handoff.
- Le `handleSubmit` existant n'est **pas** modifié.

## 5. State

- **Retirer** `const [showForm, setShowForm] = useState(false);`
- **Ajouter** `const [whatsappError, setWhatsappError] = useState("");`
- Garder `activeIndex` + le `useEffect` de lecture `?service=` (hotfix).
- Garder `submitted`, `whatsappLink`, `error`, `showDetails`.

## 6. i18n — objet `TEXTS`

- **Retirer** `formBtn` (interface + fr/en/es) — plus de bouton « Réserver par formulaire ».
- **Ajouter** `whatsappMissing` (interface + fr/en/es) :
  - fr : « Merci d'indiquer au moins votre nom et votre téléphone. »
  - en : « Please enter at least your name and phone number. »
  - es : « Indica al menos tu nombre y tu teléfono. »
- Garder `whatsappPrimaryBtn` (« Réserver par WhatsApp » / « Book via WhatsApp » / « Reservar por WhatsApp »), `submitBtn` (« Confirmer ma réservation » / « Confirm my booking » / « Confirmar mi reserva »), `reassurance`, `priceIndicative`, `addDetails`, `noOnlinePayment`, `startingFrom`.

## 7. Composant sticky

**Inchangé** : `StickyBooking` pointe déjà vers `/{locale}/reservation`. Il mène
maintenant vers une page qui affiche directement le formulaire + les 2 boutons.
Aucune modification.

## 8. Tests Playwright — `e2e/site.spec.ts`

Bloc `test.describe("Tunnel de réservation (CRO)")` :

1. **« le formulaire est visible au chargement »** (remplace « masqué au
   chargement et visible après clic ») : `page.goto("/fr/reservation")`,
   `expect(page.locator("select[name='service']")).toBeVisible()`.
2. **« la ligne de prix change quand on change de coiffure »** : retirer le clic
   préalable sur « Réserver par formulaire ». `selectOption({ index: 5 })`
   directement, vérifier que le texte de la ligne de prix change.
3. **« les champs optionnels sont masqués puis dépliables »** : retirer le clic
   préalable. `input[name='email']` count 0 au chargement, clic
   « + Ajouter des précisions », `input[name='email']` visible.
4. **« le bouton Réserver par WhatsApp exige nom + téléphone »** (nouveau,
   remplace le test `href` `wa.me`) : `page.goto`, cliquer le `<button>`
   « Réserver par WhatsApp » sans rien remplir, `expect` le message
   `whatsappMissing` visible. Puis remplir `name` + `phone`, re-cliquer, et
   vérifier que la navigation part vers `wa.me` — via
   `page.waitForURL(/wa\.me/)` ou en écoutant `page.on("framenavigated")`. Si
   l'interception est fragile, se limiter à : après remplissage + clic, le
   message d'erreur disparaît (`whatsappMissing` absent).
5. **« le bandeau sticky visible en mobile / pointe vers /reservation »** —
   inchangé.
6. **« le bandeau sticky absent en desktop »** — inchangé.

Les 2 tests du bloc « Formulaire de réservation » (`la page réservation
s'affiche`, `les champs obligatoires sont présents`) : **retirer** le
`getByRole("button", { name: /réserver par formulaire/i }).click()` ajouté en
v2 (commit `bf71e06`) — le formulaire est de nouveau visible d'emblée.

Gate : `npx tsc --noEmit`, `npm run build`, Playwright local
(`PLAYWRIGHT_BASE_URL=http://localhost:3100`) desktop + mobile 100 % vert, puis
Playwright contre la prod après déploiement.

## 9. Fichiers touchés

```
components/sections/ReservationLayout.tsx  — retrait showForm + bloc choix ; formulaire + photo toujours rendus ; handleWhatsApp ; state whatsappError ; bloc 2 boutons en bas ; import generateWhatsAppLink ; i18n (retrait formBtn, ajout whatsappMissing)
e2e/site.spec.ts                           — tests CRO adaptés + retrait des clics "Réserver par formulaire" dans le bloc "Formulaire de réservation"
```

Pas de changement : `app/[locale]/reservation/page.tsx` (déjà nettoyé au
hotfix), `lib/whatsapp.ts`, `lib/social.ts`, `components/layout/StickyBooking.tsx`,
`app/api/reservations/route.ts`, `tailwind.config.ts`,
`components/ui/WhatsAppIcon.tsx`.

## 10. Risques

| Risque                                                                                | Mitigation                                                                                                                                  |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Réintroduire par erreur `useSearchParams` en revenant à une structure proche de la v1 | Le hotfix `a843b57` est explicite : la lecture `?service=` reste dans le `useEffect`. Ne PAS toucher à ce bloc.                             |
| `handleWhatsApp` lit `document.querySelector("form")` — fragile si plusieurs `<form>` | Il n'y a qu'un `<form>` sur la page. Acceptable. Alternative : `useRef` sur le form si on veut être strict — à faire si le lint le réclame. |
| Le bouton WhatsApp n'a pas de validation HTML native (`type="button"`)                | Validation JS explicite dans `handleWhatsApp` (Nom + Téléphone), message d'erreur dédié.                                                    |
| Deux boutons côte à côte peuvent être serrés sur petit mobile                         | `flex-col sm:flex-row` : empilés sous 640px, côte à côte au-delà.                                                                           |
| Test Playwright de navigation `wa.me` fragile                                         | Fallback documenté (§8.4) : se contenter de vérifier la disparition du message d'erreur après remplissage.                                  |
