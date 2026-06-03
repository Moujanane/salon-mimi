"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface ServiceData {
  id: string;
  label: string;
  labelEn: string;
  labelEs: string;
  icon: string;
  subServices: string;
  subServicesEn: string;
  subServicesEs: string;
  price: string;
  image: string;
  imageAlt: string;
}

const SERVICES: ServiceData[] = [
  {
    id: "tresses-africaines",
    label: "Tresses africaines",
    labelEn: "African braids",
    labelEs: "Trenzas africanas",
    icon: "✦",
    subServices:
      "Box braids · Cornrows · Tresses tribales · Tresse frontale · Micro tresses",
    subServicesEn:
      "Box braids · Cornrows · Tribal braids · Front braid · Micro braids",
    subServicesEs:
      "Box braids · Cornrows · Trenzas tribales · Trenza frontal · Micro trenzas",
    price: "dès 150 MAD",
    image: "/images/s-tresse-fille1.png",
    imageAlt: "Tresses africaines salon Mimi Marrakech",
  },
  {
    id: "tresses-et-nattes",
    label: "Tresses et nattes",
    labelEn: "Braids & plaits",
    labelEs: "Trenzas y rastas",
    icon: "✿",
    subServices:
      "Nattes collées · Nattes libres · Nattes en couronne · Nattes enfant",
    subServicesEn: "Flat twists · Free braids · Crown braids · Kids braids",
    subServicesEs:
      "Trenzas pegadas · Trenzas sueltas · Corona de trenzas · Trenzas niña",
    price: "dès 80 MAD",
    image: "/images/s-tresse-fille2.png",
    imageAlt: "Tresses et nattes salon Mimi Marrakech",
  },
  {
    id: "box-braids",
    label: "Box braids",
    labelEn: "Box braids",
    labelEs: "Box braids",
    icon: "◈",
    subServices:
      "Box braids classiques · Jumbo · Knotless · Avec couleur · Fini perles",
    subServicesEn:
      "Classic box braids · Jumbo · Knotless · Coloured · Pearl finish",
    subServicesEs:
      "Box braids clásicas · Jumbo · Knotless · Con color · Acabado perlas",
    price: "dès 200 MAD",
    image: "/images/s-knotless.jpg",
    imageAlt: "Box braids salon Mimi Marrakech",
  },
  {
    id: "fulani-braids",
    label: "Tresses Fulani",
    labelEn: "Fulani braids",
    labelEs: "Trenzas Fulani",
    icon: "❋",
    subServices: "Classiques · Avec perles · Fils de couleur · Style tribal",
    subServicesEn: "Classic · With beads · Colour threads · Tribal style",
    subServicesEs: "Clásicas · Con cuentas · Hilos de color · Estilo tribal",
    price: "dès 180 MAD",
    image: "/images/s-fulani.jpg",
    imageAlt: "Tresses Fulani salon afro Marrakech",
  },
  {
    id: "boho-braids",
    label: "Tresses Boho",
    labelEn: "Boho braids",
    labelEs: "Trenzas Boho",
    icon: "◉",
    subServices: "Boho knotless · Avec frisures · Jumbo · Colorées",
    subServicesEn: "Boho knotless · With curls · Jumbo · Coloured",
    subServicesEs: "Boho knotless · Con rizos · Jumbo · Coloridas",
    price: "dès 220 MAD",
    image: "/images/s-boho.jpg",
    imageAlt: "Tresses Boho salon Mimi Marrakech",
  },
  {
    id: "locks-dreads",
    label: "Locks & dreads",
    labelEn: "Locks & dreads",
    labelEs: "Locks & dreads",
    icon: "⟁",
    subServices: "Pose de locks · Sisterlocks · Entretien · Retouche racines",
    subServicesEn:
      "Lock installation · Sisterlocks · Maintenance · Root retouch",
    subServicesEs:
      "Instalación de locks · Sisterlocks · Mantenimiento · Retoque raíces",
    price: "dès 250 MAD",
    image: "/images/s-depart-locks.jpg",
    imageAlt: "Locks dreads salon afro Marrakech",
  },
  {
    id: "cheveux-attaches",
    label: "Cheveux attachés",
    labelEn: "Updos",
    labelEs: "Recogidos",
    icon: "◌",
    subServices: "Chignon · Queue de cheval · Updo · Bun · Twisted updo",
    subServicesEn: "Chignon · Ponytail · Updo · Bun · Twisted updo",
    subServicesEs: "Moño · Cola de caballo · Recogido · Bun · Twisted updo",
    price: "dès 60 MAD",
    image: "/images/s-mini-braids.jpg",
    imageAlt: "Cheveux attachés coiffure salon Mimi Marrakech",
  },
  {
    id: "perruques-tissage",
    label: "Perruques et tissage",
    labelEn: "Wigs & weaves",
    labelEs: "Pelucas y extensiones",
    icon: "◎",
    subServices: "Pose de perruque · Tissage · Rajouts · Entretien perruque",
    subServicesEn:
      "Wig installation · Weave · Hair extensions · Wig maintenance",
    subServicesEs:
      "Colocación de peluca · Cosido · Extensiones · Mantenimiento peluca",
    price: "dès 150 MAD",
    image: "/images/s-box-braids-longues.jpg",
    imageAlt: "Perruques et tissage salon Mimi Marrakech",
  },
  {
    id: "colorations",
    label: "Colorations capillaires",
    labelEn: "Hair colouring",
    labelEs: "Coloración capilar",
    icon: "✺",
    subServices: "Couleur complète · Mèches · Balayage · Décoloration · Henné",
    subServicesEn: "Full colour · Highlights · Balayage · Bleaching · Henna",
    subServicesEs: "Color completo · Mechas · Balayage · Decoloración · Henna",
    price: "dès 100 MAD",
    image: "/images/s-tressage-action.jpg",
    imageAlt: "Coloration capillaire salon Mimi Marrakech",
  },
  {
    id: "ongles-soins-epilation",
    label: "Ongles, soins & épilation",
    labelEn: "Nails, care & waxing",
    labelEs: "Uñas, cuidados & depilación",
    icon: "❀",
    subServices:
      "Pose d'ongles · Manucure · Soins du visage · Épilation · Sourcils",
    subServicesEn:
      "Nail extensions · Manicure · Facial care · Waxing · Eyebrows",
    subServicesEs:
      "Extensiones de uñas · Manicura · Cuidado facial · Depilación · Cejas",
    price: "dès 50 MAD",
    image: "/images/s-ongles.jpg",
    imageAlt: "Ongles soins épilation salon Mimi Marrakech",
  },
];

const TEXTS: Record<
  string,
  {
    badge: string;
    h1: string;
    h1em: string;
    body1: string;
    body1strong1: string;
    body1strong2: string;
    body2: string;
    body2strong: string;
    cta: string;
    chooseService: string;
    videoTitle: string;
    videoLabels: [string, string, string];
    startingFrom: string;
    bookService: string;
  }
> = {
  fr: {
    badge: "Ce qu'on fait · ce qu'on maîtrise",
    h1: "Tresses africaines à Marrakech —",
    h1em: "Box braids, Knotless, Locks",
    body1: "Que tu veuilles des",
    body1strong1: "tresses africaines",
    body1strong2: "knotless braids",
    body2: "des locks ou un soin naturel — on a ce qu'il te faut.",
    body2strong: "Réserve en ligne",
    cta: "→ Réserver maintenant",
    chooseService: "Choisir un service",
    videoTitle: "Le salon en vidéo",
    videoLabels: ["Tresses africaines", "Knotless braids", "Box braids"],
    startingFrom: "À partir de",
    bookService: "→ Réserver ce service",
  },
  en: {
    badge: "What we do · what we master",
    h1: "African braids in Marrakech —",
    h1em: "Box braids, Knotless, Locks",
    body1: "Whether you want",
    body1strong1: "African braids",
    body1strong2: "knotless braids",
    body2: "locks or a natural treatment — we have what you need.",
    body2strong: "Book online",
    cta: "→ Book now",
    chooseService: "Choose a service",
    videoTitle: "The salon in video",
    videoLabels: ["African braids", "Knotless braids", "Box braids"],
    startingFrom: "From",
    bookService: "→ Book this service",
  },
  es: {
    badge: "Lo que hacemos · lo que dominamos",
    h1: "Trenzas africanas en Marrakech —",
    h1em: "Box braids, Knotless, Locks",
    body1: "Tanto si quieres",
    body1strong1: "trenzas africanas",
    body1strong2: "knotless braids",
    body2: "locks o un tratamiento natural — tenemos lo que necesitas.",
    body2strong: "Reserva en línea",
    cta: "→ Reservar ahora",
    chooseService: "Elegir un servicio",
    videoTitle: "El salón en vídeo",
    videoLabels: ["Trenzas africanas", "Knotless braids", "Box braids"],
    startingFrom: "Desde",
    bookService: "→ Reservar este servicio",
  },
};

interface ServicesPageClientProps {
  locale: string;
  prices: Record<string, string>;
}

function getLabel(s: ServiceData, locale: string) {
  if (locale === "en") return s.labelEn;
  if (locale === "es") return s.labelEs;
  return s.label;
}

function getSubServices(s: ServiceData, locale: string) {
  if (locale === "en") return s.subServicesEn;
  if (locale === "es") return s.subServicesEs;
  return s.subServices;
}

export default function ServicesPageClient({
  locale,
  prices,
}: ServicesPageClientProps) {
  const tx = TEXTS[locale] ?? TEXTS.fr;
  const [active, setActive] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % SERVICES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  function goTo(index: number) {
    setLeaving(active);
    setActive(index);
    setTimeout(() => setLeaving(null), 700);
  }

  return (
    <div className="min-h-screen flex flex-col bg-nuit">
      <div className="h-[57px] flex-shrink-0" />

      <div className="flex-shrink-0 text-center px-6 md:px-12 py-4 border-b border-ocre/10">
        <span className="text-ocre text-[9px] tracking-[5px] uppercase font-inter block mb-1">
          {tx.badge}
        </span>
        <h1 className="font-georgia text-[clamp(18px,2.5vw,30px)] font-bold text-white">
          {tx.h1} <em className="text-ocre italic">{tx.h1em}</em>
        </h1>
        <p className="text-white/60 text-[12px] max-w-lg mx-auto mt-1 leading-relaxed font-inter">
          {tx.body1} <strong className="text-ocre">{tx.body1strong1}</strong>,
          des <strong className="text-white">{tx.body1strong2}</strong>,{" "}
          {tx.body2} <strong className="text-white">{tx.body2strong}</strong>,
          on s&apos;occupe du reste.
        </p>
        <div className="flex justify-center gap-3 mt-3">
          <Link
            href={`/${locale}/reservation`}
            className="flex items-center gap-2 bg-ocre hover:bg-or text-white text-[9px] tracking-[3px] uppercase px-5 py-2.5 rounded-full transition-colors font-inter"
          >
            {tx.cta}
          </Link>
        </div>
      </div>

      {isMobile ? (
        /* Mobile : pills horizontales scrollables + photo en dessous */
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            padding: 16,
            paddingTop: 12,
          }}
        >
          <div
            style={{
              fontSize: 9,
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
              fontFamily: "var(--font-inter)",
              marginBottom: 4,
            }}
          >
            {tx.chooseService}
          </div>
          <div
            style={
              {
                display: "flex",
                gap: 8,
                overflowX: "auto",
                paddingBottom: 8,
                paddingRight: 16,
                scrollbarWidth: "none",
                WebkitOverflowScrolling: "touch",
              } as React.CSSProperties
            }
          >
            {SERVICES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goTo(i)}
                style={{
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 16px",
                  borderRadius: 9999,
                  border:
                    i === active
                      ? "1px solid #c9a96e"
                      : "1px solid rgba(255,255,255,0.15)",
                  background: i === active ? "#c9a96e" : "transparent",
                  color: i === active ? "white" : "rgba(255,255,255,0.65)",
                  fontSize: 10,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-inter)",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                }}
              >
                <span>{s.icon}</span>
                {getLabel(s, locale)}
              </button>
            ))}
          </div>

          <div
            style={{
              position: "relative",
              borderRadius: 16,
              border: "1px solid rgba(201,169,110,0.2)",
              overflow: "hidden",
              height: 420,
            }}
          >
            {SERVICES.map((s, i) => (
              <div
                key={s.id}
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: i === active ? 1 : 0,
                  pointerEvents: i === active ? "auto" : "none",
                  transition: "opacity 0.5s",
                }}
              >
                <Image
                  src={s.image}
                  alt={s.imageAlt}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority={i === 0}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to bottom, rgba(10,4,0,0.1) 0%, rgba(10,4,0,0.5) 45%, rgba(10,4,0,0.95) 100%)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: 20,
                    zIndex: 10,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "white",
                      fontSize: 9,
                      letterSpacing: "3px",
                      textTransform: "uppercase",
                      padding: "6px 12px",
                      borderRadius: 9999,
                      marginBottom: 12,
                    }}
                  >
                    {getLabel(s, locale)}
                  </span>
                  <p
                    style={{
                      fontFamily: "Georgia, serif",
                      fontSize: 14,
                      color: "white",
                      lineHeight: 1.6,
                      marginBottom: 8,
                    }}
                  >
                    {getSubServices(s, locale)}
                  </p>
                  <p
                    style={{
                      fontSize: 10,
                      letterSpacing: "3px",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.55)",
                      fontFamily: "var(--font-inter)",
                      marginBottom: 16,
                    }}
                  >
                    {tx.startingFrom}{" "}
                    <span style={{ color: "#c9a96e", fontWeight: "bold" }}>
                      {prices[s.id] != null
                        ? `${prices[s.id]} MAD`
                        : s.price.replace("dès ", "")}
                    </span>
                  </p>
                  <Link
                    href={`/${locale}/reservation?service=${s.id}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: "white",
                      color: "#1a0a00",
                      fontSize: 10,
                      letterSpacing: "3px",
                      textTransform: "uppercase",
                      padding: "10px 20px",
                      borderRadius: 9999,
                      fontWeight: "bold",
                      fontFamily: "var(--font-inter)",
                      textDecoration: "none",
                    }}
                  >
                    {tx.bookService}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Desktop : layout 2 colonnes original */
        <div
          className="flex flex-row flex-1 min-h-0 gap-4 p-4 pt-3"
          style={{ height: "calc(100vh - 57px - 120px)" }}
        >
          <div className="w-[36%] bg-panneau rounded-2xl border border-ocre/20 p-6 flex flex-col gap-3 flex-shrink-0 overflow-y-auto">
            <div className="text-[9px] tracking-[4px] uppercase text-white/55 font-inter mb-1">
              {tx.chooseService}
            </div>
            {SERVICES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goTo(i)}
                className={`flex items-center gap-3 px-5 py-3.5 rounded-full border text-[11px] tracking-[2px] uppercase font-inter text-left transition-all ${
                  i === active
                    ? "bg-ocre border-ocre text-white"
                    : "border-white/15 text-white/65 hover:border-ocre/50 hover:text-white"
                }`}
              >
                <span className="text-base">{s.icon}</span>
                {getLabel(s, locale)}
              </button>
            ))}
          </div>

          <div className="flex-1 bg-panneau rounded-2xl border border-ocre/20 overflow-hidden relative">
            {SERVICES.map((s, i) => (
              <div
                key={s.id}
                className="absolute inset-0 transition-all duration-700"
                style={{
                  opacity: i === active ? 1 : 0,
                  pointerEvents: i === active ? "auto" : "none",
                  transform:
                    i === active
                      ? "perspective(1400px) rotateY(0deg)"
                      : i === leaving
                        ? "perspective(1400px) rotateY(-12deg)"
                        : "perspective(1400px) rotateY(8deg)",
                  transformOrigin: "left center",
                }}
              >
                <Image
                  src={s.image}
                  alt={s.imageAlt}
                  fill
                  className="object-cover"
                  sizes="55vw"
                  priority={i === 0}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(10,4,0,0.15) 0%, rgba(10,4,0,0.5) 45%, rgba(10,4,0,0.95) 100%)",
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-7 z-10">
                  <span className="inline-block bg-white/12 backdrop-blur-sm border border-white/20 text-white text-[9px] tracking-[3px] uppercase px-3 py-1.5 rounded-full mb-3">
                    {getLabel(s, locale)}
                  </span>
                  <p className="font-georgia text-[15px] text-white leading-relaxed mb-2">
                    {getSubServices(s, locale)}
                  </p>
                  <p className="text-[10px] tracking-[3px] uppercase text-white/55 font-inter mb-4">
                    {tx.startingFrom}{" "}
                    <span className="text-ocre font-bold">
                      {prices[s.id] != null
                        ? `${prices[s.id]} MAD`
                        : s.price.replace("dès ", "")}
                    </span>
                  </p>
                  <Link
                    href={`/${locale}/reservation?service=${s.id}`}
                    className="inline-flex items-center gap-2 bg-white hover:bg-ocre text-nuit hover:text-white text-[10px] tracking-[3px] uppercase px-6 py-3 rounded-full font-bold transition-colors font-inter"
                  >
                    {tx.bookService}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Section vidéos Pomelli */}
      <div className="border-t border-ocre/10 mt-8 pt-10 px-6 md:px-12 pb-16">
        <p className="text-ocre text-[9px] tracking-[5px] uppercase font-inter mb-3 text-center">
          {tx.videoTitle}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              src: "https://cdn.jsdelivr.net/gh/Moujanane/atlas-swincar-media/pomelli-1.mp4",
              poster: "/images/pomelli-image-5.png",
              label: tx.videoLabels[0],
            },
            {
              src: "https://cdn.jsdelivr.net/gh/Moujanane/atlas-swincar-media/pomelli-2.mp4",
              poster: "/images/pomelli-image-2.png",
              label: tx.videoLabels[1],
            },
            {
              src: "https://cdn.jsdelivr.net/gh/Moujanane/atlas-swincar-media/pomelli-3.mp4",
              poster: "/images/pomelli-image-3.png",
              label: tx.videoLabels[2],
            },
          ].map((v, i) => (
            <figure
              key={i}
              className="rounded-2xl overflow-hidden bg-black/30 m-0"
            >
              <video
                src={v.src}
                poster={v.poster}
                autoPlay
                muted
                loop
                playsInline
                className="w-full aspect-[9/16] object-cover"
              />
              <figcaption className="text-center text-ocre text-[10px] font-inter py-3 tracking-widest uppercase">
                {v.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
