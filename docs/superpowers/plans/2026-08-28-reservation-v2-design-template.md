# Refonte design page réservation v2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer une page `/reservation-v2` (preview `noindex`) au design premium inspiré d'un template fourni — hero sombre + logo doré centré, carte formulaire crème, 2 cartes d'envoi WhatsApp/email, badges de réassurance — sans toucher à la page `/reservation` en production.

**Architecture :** Nouveau composant client `ReservationLayoutV2.tsx` (colonne unique centrée), qui **reprend telle quelle** la logique JS de `ReservationLayout.tsx` (states, `handleSubmit`, `handleWhatsApp`, lecture `?service=` via `useEffect` + `window.location.search` — jamais `useSearchParams`). Nouvelle route Server Component `app/[locale]/reservation-v2/page.tsx`, copie de la v1 avec `robots: noindex` et sans `alternates`. La v1 (`ReservationLayout.tsx` + `app/[locale]/reservation/page.tsx`) n'est pas modifiée.

**Tech Stack :** Next.js 14.2.35 (App Router), next-intl 4, Tailwind (thème custom : `ocre #C17B3F`, `nuit #1A0D05`, `fond #F6EFE3`, `or #D4A843`, `whatsapp #25D366`, font `georgia`), `next/image`, Playwright (dossier `e2e/`, tourne contre `https://mimi-coiffure.com` par défaut, override `PLAYWRIGHT_BASE_URL`).

**Rappels environnement :**

- Pas de Vitest sur ce projet. Seul `npx playwright test` existe (pas de script npm `test`/`test:e2e`).
- `preview_start` (Browser pane) échoue sur ce Mac (`EPERM uv_cwd`). Lancer le dev server via terminal : `PORT=3100 npx next dev -p 3100` puis naviguer sur `http://localhost:3100`. Avant de lancer : `lsof -ti:3100` — si un `next-server` fantôme traîne, demander à Mouj de le `kill` (Claude n'a pas la permission).
- Tailwind : classes arbitraires OK (`bg-[...]`, `max-w-[640px]`). Le thème expose `font-georgia`, `font-inter`.

---

## File Structure

| Fichier                                                               | Création / Modif    | Responsabilité                                                                                                                                       |
| --------------------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/images/logo-mimi.webp`                                        | Create (binaire)    | Logo Salon Mimi optimisé, 512×512, fond transparent — affiché dans le hero et l'écran de confirmation                                                |
| `public/images/logo-mimi.png`                                         | Create (binaire)    | Fallback PNG du logo (pour `<picture>`)                                                                                                              |
| `components/sections/ReservationLayoutV2.tsx`                         | Create              | Composant client : layout v2 (hero + carte formulaire + badges + section « salon » + écran confirmation). Logique JS reprise à l'identique de la v1. |
| `app/[locale]/reservation-v2/page.tsx`                                | Create              | Server Component : `revalidate`, `getSettings()`, `getTranslations`, `metadata` avec `robots: noindex`, rend `<ReservationLayoutV2>`                 |
| `docs/superpowers/plans/2026-08-28-reservation-v2-design-template.md` | Create (ce fichier) | Le plan                                                                                                                                              |

Fichiers **non touchés** : `ReservationLayout.tsx`, `app/[locale]/reservation/page.tsx`, `middleware.ts` (le matcher `/((?!api|mimi|_next|_vercel|.*\\..*).*)` couvre déjà `/fr/reservation-v2`), `lib/whatsapp.ts`, `app/api/reservations/route.ts`, `e2e/site.spec.ts`, `components/layout/StickyBooking*`.

---

## Task 1 : Préparer les assets logo

**Files:**

- Create: `public/images/logo-mimi.webp`
- Create: `public/images/logo-mimi.png`
- Source: `/Users/Mouj/Downloads/Logo Mimi-coiffure.png` (1254×1254 RGBA transparent)

- [ ] **Step 1 : Générer le PNG 512×512**

Run:

```bash
cd /Users/Mouj/Desktop/salon-mimi
sips -Z 512 "/Users/Mouj/Downloads/Logo Mimi-coiffure.png" --out public/images/logo-mimi.png
```

Expected: `public/images/logo-mimi.png` créé. `sips -g pixelWidth -g pixelHeight public/images/logo-mimi.png` → 512 × 512.

- [ ] **Step 2 : Générer le WebP 512×512**

Run:

```bash
cd /Users/Mouj/Desktop/salon-mimi
cwebp -q 82 -resize 512 512 "/Users/Mouj/Downloads/Logo Mimi-coiffure.png" -o public/images/logo-mimi.webp
```

Expected: `public/images/logo-mimi.webp` créé.

- [ ] **Step 3 : Vérifier les tailles**

Run: `ls -la public/images/logo-mimi.*`
Expected: `logo-mimi.webp` < 45 KB idéalement (accepter jusqu'à ~80 KB si la compression rend mal en dessous). `logo-mimi.png` peut être plus lourd (fallback rare). Si le `.webp` dépasse 100 KB, relancer avec `-q 70`.

- [ ] **Step 4 : Commit**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add public/images/logo-mimi.webp public/images/logo-mimi.png
git commit -m "assets(reservation-v2): logo Mimi optimisé (webp + png 512px)"
```

---

## Task 2 : Créer le composant `ReservationLayoutV2.tsx`

**Files:**

- Create: `components/sections/ReservationLayoutV2.tsx`
- Référence (lecture seule, à ne PAS modifier) : `components/sections/ReservationLayout.tsx`

Ce composant reprend **exactement** les `SERVICES`, l'interface `Props`, tous les states et les deux handlers de `ReservationLayout.tsx`. Seuls le JSX (structure visuelle) et quelques clés `TEXTS` changent.

- [ ] **Step 1 : Créer le fichier avec le contenu complet ci-dessous**

```tsx
"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";

const SERVICES = [
  {
    id: "tresses-africaines",
    label: "Tresses africaines",
    subServices:
      "Box braids · Cornrows · Tresses tribales · Tresse frontale · Micro tresses",
    price: "150 MAD",
    image: "/images/s-tresse-fille1.png",
    imageAlt: "Tresses africaines salon Mimi Marrakech",
  },
  {
    id: "tresses-et-nattes",
    label: "Tresses et nattes",
    subServices:
      "Nattes collées · Nattes libres · Nattes en couronne · Nattes enfant",
    price: "80 MAD",
    image: "/images/s-tresse-fille2.png",
    imageAlt: "Tresses et nattes salon Mimi Marrakech",
  },
  {
    id: "box-braids",
    label: "Box braids",
    subServices:
      "Box braids classiques · Jumbo · Knotless · Avec couleur · Fini perles",
    price: "200 MAD",
    image: "/images/s-knotless.jpg",
    imageAlt: "Box braids salon Mimi Marrakech",
  },
  {
    id: "fulani-braids",
    label: "Tresses Fulani",
    subServices: "Classiques · Avec perles · Fils de couleur · Style tribal",
    price: "180 MAD",
    image: "/images/s-fulani.jpg",
    imageAlt: "Tresses Fulani salon afro Marrakech",
  },
  {
    id: "boho-braids",
    label: "Tresses Boho",
    subServices: "Boho knotless · Avec frisures · Jumbo · Colorées",
    price: "220 MAD",
    image: "/images/s-boho.jpg",
    imageAlt: "Tresses Boho salon Mimi Marrakech",
  },
  {
    id: "locks-dreads",
    label: "Locks & dreads",
    subServices: "Pose de locks · Sisterlocks · Entretien · Retouche racines",
    price: "250 MAD",
    image: "/images/s-depart-locks.jpg",
    imageAlt: "Locks dreads Marrakech",
  },
  {
    id: "cheveux-attaches",
    label: "Cheveux attachés",
    subServices: "Chignon · Queue de cheval · Updo · Bun · Twisted updo",
    price: "60 MAD",
    image: "/images/s-mini-braids.jpg",
    imageAlt: "Cheveux attachés salon Mimi Marrakech",
  },
  {
    id: "perruques-tissage",
    label: "Perruques et tissage",
    subServices: "Pose de perruque · Tissage · Rajouts · Entretien perruque",
    price: "150 MAD",
    image: "/images/s-box-braids-longues.jpg",
    imageAlt: "Perruques et tissage salon Mimi Marrakech",
  },
  {
    id: "colorations",
    label: "Colorations capillaires",
    subServices: "Couleur complète · Mèches · Balayage · Décoloration · Henné",
    price: "100 MAD",
    image: "/images/s-tressage-action.jpg",
    imageAlt: "Coloration capillaire salon Mimi Marrakech",
  },
  {
    id: "ongles-soins-epilation",
    label: "Ongles, soins & épilation",
    subServices:
      "Pose d'ongles · Manucure · Soins du visage · Épilation · Sourcils",
    price: "50 MAD",
    image: "/images/s-ongles.jpg",
    imageAlt: "Ongles soins épilation salon Mimi Marrakech",
  },
];

type TxShape = {
  heading: string;
  finalWord: string;
  heroKicker: string;
  heroSubtitle: string;
  formTitle: string;
  required: string;
  fullName: string;
  namePlaceholder: string;
  phone: string;
  phonePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  date: string;
  time: string;
  persons: string;
  person1: string;
  person2: string;
  person3: string;
  person4: string;
  message: string;
  messagePlaceholder: string;
  confirmSubtitle: string;
  whatsappBtn: string;
  startingFrom: string;
  priceIndicative: string;
  addDetails: string;
  chooseSend: string;
  sendVia: string;
  whatsappPrimaryBtn: string;
  whatsappCardHint: string;
  submitBtn: string;
  emailCardHint: string;
  whatsappMissing: string;
  reassurance: string;
  noOnlinePayment: string;
  badge1Title: string;
  badge1Text: string;
  badge2Title: string;
  badge2Text: string;
  badge3Title: string;
  badge3Text: string;
  lostTitle: string;
  lostText: string;
  lostCallLabel: string;
};

const TEXTS: Record<string, TxShape> = {
  fr: {
    heading: "Réservez votre",
    finalWord: "rendez-vous",
    heroKicker: "Réservation en ligne · Marrakech",
    heroSubtitle:
      "Choisissez votre coiffure et votre date. Mimi vous confirme la disponibilité par WhatsApp ou par email.",
    formTitle: "Votre réservation",
    required: "Tous les champs * sont obligatoires",
    fullName: "Nom complet",
    namePlaceholder: "Fatima Zahra...",
    phone: "Téléphone / WhatsApp",
    phonePlaceholder: "+212 6...",
    email: "Email",
    emailPlaceholder: "votre@email.com",
    date: "Date souhaitée",
    time: "Heure souhaitée",
    persons: "Nombre de personnes",
    person1: "1 personne",
    person2: "2 personnes",
    person3: "3 personnes",
    person4: "4 personnes et +",
    message: "Message (optionnel)",
    messagePlaceholder: "Précisions sur le style, longueur souhaitée...",
    confirmSubtitle: "Mimi vous contacte dès que possible pour confirmer.",
    whatsappBtn: "WhatsApp non ouvert ? Cliquer ici",
    startingFrom: "À partir de",
    priceIndicative: "tarif indicatif, confirmé au salon",
    addDetails: "+ Ajouter des précisions",
    chooseSend: "Choisissez votre moyen d'envoi",
    sendVia: "Envoyer par",
    whatsappPrimaryBtn: "Réserver par WhatsApp",
    whatsappCardHint: "Réponse rapide assurée",
    submitBtn: "Confirmer ma réservation",
    emailCardHint: "Mimi vous répond par email",
    whatsappMissing: "Merci d'indiquer au moins votre nom et votre téléphone.",
    reassurance:
      "Réponse rapide par WhatsApp · Annulation gratuite · Paiement sur place",
    noOnlinePayment: "Aucun paiement en ligne",
    badge1Title: "Réponse rapide",
    badge1Text: "Nous confirmons dans les plus brefs délais",
    badge2Title: "Données sécurisées",
    badge2Text: "Vos informations restent confidentielles",
    badge3Title: "Service personnalisé",
    badge3Text: "Nous prenons soin de vos envies",
    lostTitle: "Vous ne trouvez pas le salon ?",
    lostText:
      "Rendez-vous devant le restaurant Argana, Place Jamaa El Fna. Appelez Mimi — elle viendra vous chercher.",
    lostCallLabel: "Appeler Mimi",
  },
  en: {
    heading: "Book your",
    finalWord: "appointment",
    heroKicker: "Online booking · Marrakech",
    heroSubtitle:
      "Choose your hairstyle and your date. Mimi confirms availability by WhatsApp or email.",
    formTitle: "Your booking",
    required: "All fields marked * are required",
    fullName: "Full name",
    namePlaceholder: "Your name...",
    phone: "Phone / WhatsApp",
    phonePlaceholder: "+212 6...",
    email: "Email",
    emailPlaceholder: "your@email.com",
    date: "Preferred date",
    time: "Preferred time",
    persons: "Number of people",
    person1: "1 person",
    person2: "2 people",
    person3: "3 people",
    person4: "4 people or more",
    message: "Message (optional)",
    messagePlaceholder: "Details about the style, desired length...",
    confirmSubtitle: "Mimi will contact you as soon as possible to confirm.",
    whatsappBtn: "WhatsApp didn't open? Click here",
    startingFrom: "From",
    priceIndicative: "indicative price, confirmed at the salon",
    addDetails: "+ Add details",
    chooseSend: "Choose how to send",
    sendVia: "Send via",
    whatsappPrimaryBtn: "Book via WhatsApp",
    whatsappCardHint: "Quick reply guaranteed",
    submitBtn: "Confirm my booking",
    emailCardHint: "Mimi replies by email",
    whatsappMissing: "Please enter at least your name and phone number.",
    reassurance:
      "Quick reply on WhatsApp · Free cancellation · Pay at the salon",
    noOnlinePayment: "No online payment",
    badge1Title: "Quick reply",
    badge1Text: "We confirm as soon as possible",
    badge2Title: "Secure data",
    badge2Text: "Your details stay confidential",
    badge3Title: "Personal service",
    badge3Text: "We take care of what you want",
    lostTitle: "Can't find the salon?",
    lostText:
      "Head to the Argana restaurant, Jamaa El Fna Square. Call Mimi — she will come and meet you.",
    lostCallLabel: "Call Mimi",
  },
  es: {
    heading: "Reserva tu",
    finalWord: "cita",
    heroKicker: "Reserva online · Marrakech",
    heroSubtitle:
      "Elige tu peinado y tu fecha. Mimi te confirma la disponibilidad por WhatsApp o por email.",
    formTitle: "Tu reserva",
    required: "Todos los campos * son obligatorios",
    fullName: "Nombre completo",
    namePlaceholder: "Tu nombre...",
    phone: "Teléfono / WhatsApp",
    phonePlaceholder: "+212 6...",
    email: "Email",
    emailPlaceholder: "tu@email.com",
    date: "Fecha preferida",
    time: "Hora preferida",
    persons: "Número de personas",
    person1: "1 persona",
    person2: "2 personas",
    person3: "3 personas",
    person4: "4 personas o más",
    message: "Mensaje (opcional)",
    messagePlaceholder: "Detalles sobre el estilo, longitud deseada...",
    confirmSubtitle: "Mimi se pondrá en contacto contigo lo antes posible.",
    whatsappBtn: "¿WhatsApp no se abrió? Haz clic aquí",
    startingFrom: "Desde",
    priceIndicative: "precio orientativo, confirmado en el salón",
    addDetails: "+ Añadir detalles",
    chooseSend: "Elige cómo enviar",
    sendVia: "Enviar por",
    whatsappPrimaryBtn: "Reservar por WhatsApp",
    whatsappCardHint: "Respuesta rápida asegurada",
    submitBtn: "Confirmar mi reserva",
    emailCardHint: "Mimi responde por email",
    whatsappMissing: "Indica al menos tu nombre y tu teléfono.",
    reassurance:
      "Respuesta rápida por WhatsApp · Cancelación gratuita · Pago en el salón",
    noOnlinePayment: "Sin pago online",
    badge1Title: "Respuesta rápida",
    badge1Text: "Confirmamos lo antes posible",
    badge2Title: "Datos seguros",
    badge2Text: "Tus datos son confidenciales",
    badge3Title: "Servicio personalizado",
    badge3Text: "Cuidamos lo que deseas",
    lostTitle: "¿No encuentras el salón?",
    lostText:
      "Ve al restaurante Argana, Plaza Jamaa El Fna. Llama a Mimi — ella vendrá a buscarte.",
    lostCallLabel: "Llamar a Mimi",
  },
};

interface Props {
  labels: {
    name: string;
    phone: string;
    email: string;
    service: string;
    date: string;
    message: string;
    submit: string;
    success: string;
    error: string;
  };
  prices: Record<string, string>;
  locale: string;
}

const FIELD_CLASS =
  "border border-nuit/15 focus:border-ocre rounded-xl text-nuit text-[13px] px-4 py-2.5 focus-visible:outline-none transition-colors font-inter bg-fond";
const LABEL_CLASS =
  "text-[11px] tracking-[1px] uppercase text-nuit/70 font-inter";

export default function ReservationLayoutV2({ labels, prices, locale }: Props) {
  const tx = TEXTS[locale] ?? TEXTS.fr;

  // Coiffure présélectionnée via ?service=… — lue APRÈS le montage.
  // NE JAMAIS utiliser useSearchParams() ici : sur cette page pré-rendue
  // (revalidate) ça met le composant en CSR bailout / Offscreen et les vrais
  // clics utilisateur sont perdus en prod (cf. handoff Salon Mimi §19bis).
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("service");
    if (!param) return;
    const i = SERVICES.findIndex((s) => s.id === param);
    if (i >= 0) setActiveIndex(i);
  }, []);

  const [submitted, setSubmitted] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState("");
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [whatsappError, setWhatsappError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const activeSvc = SERVICES[activeIndex];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const getVal = (name: string) => {
      const el = form.elements.namedItem(name) as
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
      return el?.value ?? "";
    };
    const data = {
      nom: getVal("name"),
      telephone: getVal("phone"),
      email: getVal("email"),
      service: activeSvc.label,
      date_souhaitee: getVal("date"),
      heure_souhaitee: getVal("time"),
      nombre_personnes: getVal("persons"),
      message: getVal("message"),
      locale,
    };
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      if (json.whatsappLink) {
        setWhatsappLink(json.whatsappLink);
        window.location.href = json.whatsappLink;
      }
      setSubmitted(true);
    } catch {
      setError(labels.error);
    }
  }

  function handleWhatsApp() {
    const form = formRef.current;
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
    const details = [
      getVal("time") ? `Heure : ${getVal("time")}` : null,
      getVal("persons") ? `Personnes : ${getVal("persons")}` : null,
      getVal("message") || null,
    ]
      .filter(Boolean)
      .join(" — ");
    const url = generateWhatsAppLink({
      nom,
      telephone,
      service: activeSvc.label,
      dateSouhaitee: getVal("date") || undefined,
      message: details || undefined,
    });
    window.location.href = url;
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fond px-6">
        <div className="text-center max-w-sm">
          <Image
            src="/images/logo-mimi.webp"
            alt="Salon Mimi"
            width={96}
            height={96}
            className="mx-auto mb-4"
          />
          <div className="text-ocre text-3xl mb-3">✦</div>
          <h2 className="font-georgia text-2xl text-nuit mb-3">
            {labels.success}
          </h2>
          <p className="text-nuit/60 text-sm font-inter mb-6">
            {tx.confirmSubtitle}
          </p>
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-whatsapp hover:bg-whatsapp-hover text-white text-sm font-inter font-medium px-8 py-3.5 rounded-full transition-colors"
            >
              {tx.whatsappBtn}
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fond">
      {/* espace navbar fixe */}
      <div className="h-[57px]" />

      {/* HERO */}
      <header className="relative overflow-hidden bg-nuit text-center px-6 pt-12 pb-16">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(193,123,63,0.20), transparent 62%)",
          }}
        />
        <div className="relative mx-auto max-w-[640px]">
          <Image
            src="/images/logo-mimi.webp"
            alt="Salon Mimi — Rasta Africain Coiffure"
            width={160}
            height={160}
            priority
            className="mx-auto mb-4 w-[128px] h-auto sm:w-[160px]"
          />
          <span className="block text-ocre text-[10px] tracking-[3px] uppercase font-inter mb-2">
            {tx.heroKicker}
          </span>
          <h1 className="font-georgia text-[clamp(24px,5vw,32px)] font-bold text-fond leading-tight">
            {tx.heading} <em className="text-or italic">{tx.finalWord}</em>
          </h1>
          <p className="text-fond/60 text-[12px] font-inter mt-3 max-w-[380px] mx-auto leading-relaxed">
            {tx.heroSubtitle}
          </p>
        </div>
      </header>

      {/* CARTE FORMULAIRE */}
      <div className="mx-auto max-w-[640px] px-4 sm:px-6 -mt-8">
        <div className="bg-white rounded-[20px] border border-ocre/25 shadow-[0_8px_30px_rgba(26,13,5,0.08)] p-5 sm:p-7">
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-ocre/12 flex items-center justify-center text-ocre text-lg flex-shrink-0">
                ✦
              </div>
              <div>
                <div className="font-georgia text-[16px] font-bold text-nuit leading-tight">
                  {tx.formTitle}
                </div>
                <div className="text-[10px] text-nuit/50 font-inter tracking-wide">
                  {tx.required}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={LABEL_CLASS}>
                Service <span className="text-ocre">*</span>
              </label>
              <select
                name="service"
                value={activeIndex}
                onChange={(e) => setActiveIndex(Number(e.target.value))}
                required
                className={`${FIELD_CLASS} appearance-none cursor-pointer`}
              >
                {SERVICES.map((s, i) => (
                  <option key={s.id} value={i}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-[12px] text-nuit/70 font-inter -mt-1.5">
              {activeSvc.label} — {tx.startingFrom}{" "}
              <span className="text-ocre font-semibold">
                {prices[activeSvc.id] ?? activeSvc.price} MAD
              </span>{" "}
              · {tx.priceIndicative}
            </p>

            <div className="h-px bg-ocre/15" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className={LABEL_CLASS}>
                  {tx.fullName} <span className="text-ocre">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  placeholder={tx.namePlaceholder}
                  required
                  className={`${FIELD_CLASS} placeholder:text-nuit/30`}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={LABEL_CLASS}>
                  {tx.phone} <span className="text-ocre">*</span>
                </label>
                <input
                  name="phone"
                  type="tel"
                  placeholder={tx.phonePlaceholder}
                  required
                  className={`${FIELD_CLASS} placeholder:text-nuit/30`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className={LABEL_CLASS}>
                  {tx.date} <span className="text-ocre">*</span>
                </label>
                <input
                  name="date"
                  type="date"
                  required
                  className={FIELD_CLASS}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={LABEL_CLASS}>{tx.time}</label>
                <input name="time" type="time" className={FIELD_CLASS} />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDetails((v) => !v)}
              className="text-ocre text-[12px] font-inter font-medium self-start hover:underline"
            >
              {tx.addDetails}
            </button>

            {showDetails && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className={LABEL_CLASS}>{tx.persons}</label>
                  <select
                    name="persons"
                    className={`${FIELD_CLASS} appearance-none`}
                  >
                    <option>{tx.person1}</option>
                    <option>{tx.person2}</option>
                    <option>{tx.person3}</option>
                    <option>{tx.person4}</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={LABEL_CLASS}>{tx.email}</label>
                  <input
                    name="email"
                    type="email"
                    placeholder={tx.emailPlaceholder}
                    className={`${FIELD_CLASS} placeholder:text-nuit/30`}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={LABEL_CLASS}>{tx.message}</label>
                  <textarea
                    name="message"
                    rows={3}
                    placeholder={tx.messagePlaceholder}
                    className={`${FIELD_CLASS} placeholder:text-nuit/30 resize-none`}
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="text-red-500 text-[12px] font-inter">{error}</p>
            )}
            {whatsappError && (
              <p className="text-red-500 text-[12px] font-inter">
                {whatsappError}
              </p>
            )}

            <div className="flex items-center gap-3 my-1">
              <div className="h-px bg-ocre/20 flex-1" />
              <span className="text-[10px] tracking-[2px] uppercase text-nuit/40 font-inter">
                {tx.chooseSend}
              </span>
              <div className="h-px bg-ocre/20 flex-1" />
            </div>

            <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleWhatsApp}
                className="group rounded-2xl border-[1.5px] border-whatsapp bg-whatsapp/[0.06] hover:bg-whatsapp/10 px-4 py-4 text-center transition-colors"
              >
                <span className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-whatsapp text-white">
                  <WhatsAppIcon className="w-4 h-4" />
                </span>
                <span className="block text-[9px] tracking-[2px] uppercase text-nuit/50 font-inter">
                  {tx.sendVia}
                </span>
                <span className="block text-[14px] font-bold text-vert font-inter">
                  {tx.whatsappPrimaryBtn}
                </span>
                <span className="block text-[9px] text-nuit/50 font-inter mt-0.5">
                  {tx.whatsappCardHint}
                </span>
              </button>

              <button
                type="submit"
                className="group rounded-2xl border-[1.5px] border-ocre bg-ocre/[0.06] hover:bg-ocre/10 px-4 py-4 text-center transition-colors"
              >
                <span className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-ocre text-white">
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <span className="block text-[9px] tracking-[2px] uppercase text-nuit/50 font-inter">
                  {tx.sendVia}
                </span>
                <span className="block text-[14px] font-bold text-ocre font-inter">
                  {tx.submitBtn}
                </span>
                <span className="block text-[9px] text-nuit/50 font-inter mt-0.5">
                  {tx.emailCardHint}
                </span>
              </button>
            </div>

            <p className="text-center text-nuit/40 text-[10px] font-inter leading-relaxed">
              {tx.reassurance} · {tx.noOnlinePayment}
            </p>
          </form>
        </div>
      </div>

      {/* BADGES DE RÉASSURANCE */}
      <div className="mx-auto max-w-[640px] px-4 sm:px-6 mt-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            { t: tx.badge1Title, d: tx.badge1Text, icon: "M12 6v6l4 2" },
            {
              t: tx.badge2Title,
              d: tx.badge2Text,
              icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
            },
            {
              t: tx.badge3Title,
              d: tx.badge3Text,
              icon: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z",
            },
          ].map((b) => (
            <div key={b.t} className="text-center">
              <svg
                className="w-5 h-5 mx-auto mb-1.5 text-ocre"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {b.icon === "M12 6v6l4 2" && <circle cx="12" cy="12" r="9" />}
                <path d={b.icon} />
              </svg>
              <div className="text-[10px] font-bold text-nuit font-inter">
                {b.t}
              </div>
              <div className="text-[9px] text-nuit/50 font-inter leading-snug">
                {b.d}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION "VOUS NE TROUVEZ PAS LE SALON ?" */}
      <div className="mx-auto max-w-[640px] px-4 sm:px-6 my-8">
        <div className="bg-nuit rounded-2xl overflow-hidden border border-ocre/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 items-center">
            <div className="relative h-44 sm:h-full sm:min-h-[190px] bg-black">
              <Image
                src="/images/restaurant-argana.jpg"
                alt="Restaurant Argana — Place Jamaa El Fna, Marrakech"
                fill
                className="object-contain"
                sizes="(max-width: 640px) 100vw, 320px"
              />
            </div>
            <div className="p-6 flex flex-col gap-3">
              <h2 className="font-georgia text-xl text-or">{tx.lostTitle}</h2>
              <p className="text-white/80 text-sm leading-relaxed">
                {tx.lostText}
              </p>
              <a
                href="tel:+212710388204"
                className="inline-block bg-ocre text-white text-center py-2.5 px-5 rounded-full text-sm font-medium hover:bg-ocre/80 transition-colors self-start"
              >
                📞 {tx.lostCallLabel}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2 : Vérifier la compilation TypeScript**

Run: `cd /Users/Mouj/Desktop/salon-mimi && npx tsc --noEmit`
Expected: 0 erreur. (Si erreur `Cannot find module '@/lib/whatsapp'` ou `@/components/ui/WhatsAppIcon` → vérifier que les chemins existent, ils sont déjà utilisés par la v1.)

- [ ] **Step 3 : Commit**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add components/sections/ReservationLayoutV2.tsx
git commit -m "feat(reservation-v2): composant ReservationLayoutV2 (design template premium)"
```

---

## Task 3 : Créer la route `app/[locale]/reservation-v2/page.tsx`

**Files:**

- Create: `app/[locale]/reservation-v2/page.tsx`
- Référence (lecture seule) : `app/[locale]/reservation/page.tsx`

- [ ] **Step 1 : Créer le fichier avec le contenu complet ci-dessous**

```tsx
// app/[locale]/reservation-v2/page.tsx
// Page de PREVIEW du nouveau design de réservation. noindex tant qu'elle
// n'a pas remplacé /reservation. Ne pas ajouter d'alternates/canonical ni
// d'entrée sitemap : elle ne doit pas être indexée.
export const revalidate = 3600;

import { getTranslations } from "next-intl/server";
import ReservationLayoutV2 from "@/components/sections/ReservationLayoutV2";
import { getSettings } from "@/lib/settings";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    fr: "Réserver (nouvelle version) — Salon Mimi Marrakech",
    en: "Book (new version) — Salon Mimi Marrakech",
    es: "Reservar (nueva versión) — Salon Mimi Marrakech",
  };

  return {
    title: titles[locale] ?? titles.fr,
    robots: { index: false, follow: false },
  };
}

export default async function ReservationV2Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "booking" });
  const settings = await getSettings();

  const labels = {
    name: t("name"),
    phone: t("phone"),
    email: "Email",
    service: t("service"),
    date: t("date"),
    message: t("message"),
    submit: t("submit"),
    success: t("success"),
    error: t("error"),
  };

  const prices: Record<string, string> = {
    "tresses-africaines": settings.price_tresses_africaines,
    "tresses-et-nattes": settings.price_tresses_et_nattes,
    "box-braids": settings.price_box_braids,
    "fulani-braids": settings.price_tresses_fulani,
    "boho-braids": settings.price_tresses_boho,
    "locks-dreads": settings.price_locks_dreads,
    "cheveux-attaches": settings.price_cheveux_attaches,
    "perruques-tissage": settings.price_perruques_tissage,
    colorations: settings.price_colorations,
    "ongles-soins-epilation": settings.price_ongles_soins_epilation,
  };

  return (
    <ReservationLayoutV2 labels={labels} prices={prices} locale={locale} />
  );
}
```

- [ ] **Step 2 : Vérifier la compilation TypeScript**

Run: `cd /Users/Mouj/Desktop/salon-mimi && npx tsc --noEmit`
Expected: 0 erreur.

- [ ] **Step 3 : Vérifier le build**

Run: `cd /Users/Mouj/Desktop/salon-mimi && npm run build`
Expected: `Compiled successfully`. Dans la liste des routes, voir `/[locale]/reservation-v2` (ou `ƒ /fr/reservation-v2` etc.). Si `getSettings()` échoue au build faute de variables d'env Supabase en local → c'est le même comportement que la v1 ; noter et continuer si la v1 build aussi.

- [ ] **Step 4 : Commit**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add "app/[locale]/reservation-v2/page.tsx"
git commit -m "feat(reservation-v2): route /reservation-v2 (preview noindex)"
```

---

## Task 4 : Vérification navigateur (dev server local)

**Files:** aucun (vérification manuelle assistée).

- [ ] **Step 1 : Vérifier qu'aucun serveur fantôme n'occupe le port**

Run: `lsof -ti:3100`
Expected: aucune sortie. Si un PID s'affiche → demander à Mouj de faire `kill -9 <pid>` (Claude n'a pas la permission de kill).

- [ ] **Step 2 : Lancer le dev server**

Run (en arrière-plan) : `cd /Users/Mouj/Desktop/salon-mimi && PORT=3100 npx next dev -p 3100`
Attendre « Ready ». Si `preview_start` du Browser pane est utilisable, s'en servir ; sinon `navigate` vers `http://localhost:3100`.

- [ ] **Step 3 : Charger les 3 langues**

Naviguer vers :

- `http://localhost:3100/fr/reservation-v2`
- `http://localhost:3100/en/reservation-v2`
- `http://localhost:3100/es/reservation-v2`

Expected pour chacune : HTTP 200, hero sombre visible avec le logo doré centré, titre « Réservez votre rendez-vous » (resp. EN/ES), carte formulaire blanche avec le `<select name="service">`, 2 cartes d'envoi (verte « Réserver par WhatsApp » + ocre « Confirmer ma réservation »), 3 badges, section « Vous ne trouvez pas le salon ? ». Aucune erreur console (le 400 sur le script Umami est pré-existant et hors sujet).

- [ ] **Step 4 : Ligne de prix dynamique**

Sur `/fr/reservation-v2`, changer le `<select>` de « Tresses africaines » à « Locks & dreads ».
Expected : la ligne sous le select passe de « …150 MAD… » à « …250 MAD… » (ou aux prix `/admin/settings` courants), le texte « tarif indicatif, confirmé au salon » est présent.

- [ ] **Step 5 : Repli « + Ajouter des précisions »**

Au chargement : `input[name="email"]` absent du DOM. Cliquer « + Ajouter des précisions ».
Expected : apparition de `select[name="persons"]`, `input[name="email"]`, `textarea[name="message"]`.

- [ ] **Step 6 : Bouton WhatsApp sans champs**

Formulaire vide (Nom + Téléphone vides), cliquer la carte verte « Réserver par WhatsApp ».
Expected : message rouge « Merci d'indiquer au moins votre nom et votre téléphone. », focus sur le champ Nom, PAS de navigation.

- [ ] **Step 7 : Bouton WhatsApp avec Nom + Téléphone**

Remplir Nom = « Test », Téléphone = « +212600000000 », cliquer « Réserver par WhatsApp ».
Expected : navigation vers `api.whatsapp.com` / `wa.me` avec un message pré-rempli (coiffure + nom + téléphone).

- [ ] **Step 8 : Présélection via `?service=`**

Naviguer vers `http://localhost:3100/fr/reservation-v2?service=locks-dreads`.
Expected : le `<select>` affiche « Locks & dreads » sélectionné au chargement, ligne de prix correspondante. (Vérifie le fix anti-`useSearchParams` : le clic « + Ajouter des précisions » doit fonctionner du premier coup.)

- [ ] **Step 9 : Golden path soumission (si Supabase/Resend configurés en local)**

Remplir Nom + Téléphone + Date, cliquer la carte ocre « Confirmer ma réservation ».
Expected : soit l'écran de confirmation (logo + ✦ + message succès + bouton WhatsApp de secours), soit — si l'API renvoie une erreur faute de config locale — le message d'erreur `labels.error` s'affiche proprement SANS exception JS non catchée dans la console. Noter lequel des deux cas s'est produit.

- [ ] **Step 10 : Responsive**

Redimensionner à 375 px puis 1280 px.
Expected : pas de scroll horizontal (`document.body.scrollWidth <= viewport + 5`). À 375 px les 2 cartes d'envoi s'empilent (breakpoint `min-[380px]`). À ≥ 380 px elles sont côte à côte. Logo lisible.

- [ ] **Step 11 : Contrôle non-régression v1**

Naviguer vers `http://localhost:3100/fr/reservation`.
Expected : la page v1 est identique à avant (layout 2 colonnes, panneau photo à droite). Aucune régression visuelle.

- [ ] **Step 12 : Screenshot de preuve**

Prendre une capture de `/fr/reservation-v2` (desktop) et une en 375 px, à joindre à Mouj.

- [ ] **Step 13 : Arrêter le dev server**

Tuer le process `next dev -p 3100` lancé au Step 2.

---

## Task 5 : Suite Playwright (non-régression globale)

**Files:** aucun (`e2e/site.spec.ts` n'est PAS modifié).

- [ ] **Step 1 : Lancer Playwright contre le dev server local**

Relancer le dev server (`PORT=3100 npx next dev -p 3100`) puis :
Run: `cd /Users/Mouj/Desktop/salon-mimi && PLAYWRIGHT_BASE_URL=http://localhost:3100 npx playwright test`
Expected : desktop + mobile verts. Les 8 tests du bloc « Tunnel de réservation (CRO) » (qui ciblent `/reservation`, la v1) passent. Aucun test ne cible `/reservation-v2` — normal, hors périmètre.
Tolérance : 1 retry est configuré (flakiness dev mode). Si un test échoue 2× → investiguer (ne PAS considérer la tâche terminée).

- [ ] **Step 2 : Arrêter le dev server**

Tuer le process `next dev -p 3100`.

- [ ] **Step 3 : Vérification finale TypeScript + build**

Run:

```bash
cd /Users/Mouj/Desktop/salon-mimi
npx tsc --noEmit && npm run build
```

Expected : 0 erreur TS, `Compiled successfully`, route `/[locale]/reservation-v2` présente.

- [ ] **Step 4 : Commit éventuel**

Si aucun fichier n'a changé depuis Task 3, rien à committer. Sinon committer les ajustements avec un message `fix(reservation-v2): …` explicite.

---

## Task 6 : Mise à jour du handoff

**Files:**

- Modify: `handoff.md` (section « Ce qui reste à faire » + nouvelle section datée)

- [ ] **Step 1 : Ajouter une section datée dans `handoff.md`**

Ajouter après la section 20 (ou en tête des sessions), un bloc :

```markdown
## 21. Session 28 août 2026 — Refonte design page réservation : /reservation-v2 (preview)

Nouvelle page **/reservation-v2** (noindex) au design premium inspiré d'un
template fourni : hero sombre + logo doré Mimi centré, carte formulaire crème,
2 cartes d'envoi (verte « Réserver par WhatsApp » / ocre « Confirmer ma
réservation », icône enveloppe), 3 badges de réassurance, section « Vous ne
trouvez pas le salon ? » conservée.

**La v1 /reservation reste intacte et en production.** Bascule v2 → prod NON
faite (en attente de la validation visuelle de Mouj sur mimi-coiffure.com).

Spec : `docs/superpowers/specs/2026-08-28-reservation-v2-design-template-design.md`
Plan : `docs/superpowers/plans/2026-08-28-reservation-v2-design-template.md`

### Fichiers créés

- `public/images/logo-mimi.webp` + `logo-mimi.png` — logo optimisé 512px
- `components/sections/ReservationLayoutV2.tsx` — composant client v2. Logique JS
  (states, handleSubmit, handleWhatsApp, lecture ?service= via useEffect +
  window.location.search) reprise **à l'identique** de ReservationLayout.tsx.
  **Ne PAS y introduire useSearchParams()** (piège §19bis).
- `app/[locale]/reservation-v2/page.tsx` — route preview, metadata robots noindex,
  pas d'alternates, pas d'entrée sitemap.

### Vérifié

- npx tsc --noEmit ✓ · npm run build ✓
- Playwright (local) desktop + mobile ✓ — 0 régression (les 8 tests CRO ciblent
  toujours /reservation v1)
- Navigateur : 3 langues, ligne de prix dynamique, repli précisions, bouton
  WhatsApp (exige nom+tél), ?service=locks-dreads présélectionné, responsive
  375/1280 sans scroll horizontal, v1 inchangée

### Prochaine étape (bascule, à décider avec Mouj)

Quand Mouj valide le design sur mimi-coiffure.com/fr/reservation-v2 :

1. Remplacer le contenu de `ReservationLayout.tsx` par celui de
   `ReservationLayoutV2.tsx` (ou renommer), en réintégrant l'interface Props
   attendue par `app/[locale]/reservation/page.tsx` (identique — RAS).
2. Supprimer `app/[locale]/reservation-v2/` et `ReservationLayoutV2.tsx`.
3. Adapter les 8 tests e2e CRO si des sélecteurs de structure ont bougé
   (les name= et libellés sont déjà conservés → a priori rien à changer).
4. npx tsc --noEmit + npm run build + npx playwright test contre la prod.
```

Mettre aussi à jour la ligne « PROCHAINE SESSION » de la section 2 pour indiquer
que la v2 preview est faite et qu'il reste la validation + bascule.

- [ ] **Step 2 : Commit**

```bash
cd /Users/Mouj/Desktop/salon-mimi
git add handoff.md
git commit -m "docs: handoff session 28 août 2026 — /reservation-v2 preview"
```

---

## Self-Review

**1. Spec coverage :**

- Spec §3 layout formulaire centré 640px → Task 2 (`max-w-[640px]`, colonne unique, panneau photo supprimé) ✓
- Spec §3 hero compact centré sans photo → Task 2 (`<header>` bg-nuit, logo + kicker + h1 + sous-titre, halo radial) ✓
- Spec §3 boutons : look template + libellés honnêtes → Task 2 (2 `<button>` cartes, verte `type="button"` handleWhatsApp libellé `whatsappPrimaryBtn`, ocre `type="submit"` libellé `submitBtn`, icône enveloppe SVG) ✓
- Spec §3.1 ligne de prix dynamique → Task 2 (`<p>` avec `priceIndicative`) + Task 4 Step 4 ✓
- Spec §3.1 repli « + Ajouter des précisions » → Task 2 (`showDetails`, persons/email/message) + Task 4 Step 5 ✓
- Spec §3.1 section « salon » conservée → Task 2 (bloc final) + Task 4 Step 3 ✓
- Spec §3.1 3 badges → Task 2 (grid grid-cols-3) ✓
- Spec §3.1 écran confirmation enrichi → Task 2 (`if (submitted)` avec logo) ✓
- Spec §4.1 assets logo webp+png 512 → Task 1 ✓
- Spec §4.2 composant, logique identique v1, `useEffect` pas `useSearchParams` → Task 2 (commentaire explicite + code) ✓
- Spec §4.3 route noindex, sans alternates, revalidate → Task 3 ✓
- Spec §5 vérif : tsc, build, playwright, navigateur 3 langues, golden path, whatsapp sans champs, ?service=, console, repli, v1 inchangée, responsive → Tasks 4 et 5 (tous les points couverts) ✓
- Spec §6 hors périmètre → aucune task ne fait la bascule, ne touche sticky/header, n'ajoute de test v2 ✓
- Spec §7 risque `next dev` fantôme → Task 4 Step 1 ✓

**2. Placeholder scan :** aucun TBD/TODO. Tout le code du composant et de la route est écrit en entier. Les commandes ont une sortie attendue.

**3. Type consistency :**

- `Props` (name/phone/email/service/date/message/submit/success/error + prices + locale) → identique entre Task 2 (interface) et Task 3 (objet `labels` construit + `prices`) ✓
- `TxShape` : toutes les clés utilisées dans le JSX de Task 2 (`tx.heading`, `tx.finalWord`, `tx.heroKicker`, `tx.heroSubtitle`, `tx.formTitle`, `tx.required`, `tx.fullName`, `tx.namePlaceholder`, `tx.phone`, `tx.phonePlaceholder`, `tx.email`, `tx.emailPlaceholder`, `tx.date`, `tx.time`, `tx.persons`, `tx.person1-4`, `tx.message`, `tx.messagePlaceholder`, `tx.confirmSubtitle`, `tx.whatsappBtn`, `tx.startingFrom`, `tx.priceIndicative`, `tx.addDetails`, `tx.chooseSend`, `tx.sendVia`, `tx.whatsappPrimaryBtn`, `tx.whatsappCardHint`, `tx.submitBtn`, `tx.emailCardHint`, `tx.whatsappMissing`, `tx.reassurance`, `tx.noOnlinePayment`, `tx.badge1-3Title/Text`, `tx.lostTitle`, `tx.lostText`, `tx.lostCallLabel`) sont déclarées dans `TxShape` ET présentes dans les 3 objets `fr`/`en`/`es`. Vérifié un par un. ✓
- `generateWhatsAppLink({ nom, telephone, service, dateSouhaitee, message })` — même signature que dans `ReservationLayout.tsx` v1 ✓
- `WhatsAppIcon({ className })` — prop `className` conforme au composant lu ✓
- Handlers `handleSubmit` / `handleWhatsApp` — copie conforme de la v1, aucun renommage ✓

Plan cohérent, aucun écart détecté.
