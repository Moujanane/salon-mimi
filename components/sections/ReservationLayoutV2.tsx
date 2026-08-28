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
                aria-label={tx.whatsappPrimaryBtn}
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
                aria-label={tx.submitBtn}
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
