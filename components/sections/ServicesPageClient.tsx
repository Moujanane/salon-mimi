"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

interface ServiceData {
  id: string;
  label: string;
  icon: string;
  subServices: string;
  price: string;
  image: string;
  imageAlt: string;
}

const SERVICES: ServiceData[] = [
  {
    id: "tresses-africaines",
    label: "Tresses africaines",
    icon: "✦",
    subServices:
      "Box braids · Cornrows · Tresses tribales · Tresse frontale · Micro tresses",
    price: "dès 150 MAD",
    image: "/images/s-tresse-fille1.png",
    imageAlt: "Tresses africaines salon Mimi Marrakech",
  },
  {
    id: "tresses-et-nattes",
    label: "Tresses et nattes",
    icon: "✿",
    subServices:
      "Nattes collées · Nattes libres · Nattes en couronne · Nattes enfant",
    price: "dès 80 MAD",
    image: "/images/s-tresse-fille2.png",
    imageAlt: "Tresses et nattes salon Mimi Marrakech",
  },
  {
    id: "box-braids",
    label: "Box braids",
    icon: "◈",
    subServices:
      "Box braids classiques · Jumbo · Knotless · Avec couleur · Fini perles",
    price: "dès 200 MAD",
    image: "/images/s-knotless.jpg",
    imageAlt: "Box braids salon Mimi Marrakech",
  },
  {
    id: "fulani-braids",
    label: "Tresses Fulani",
    icon: "❋",
    subServices: "Classiques · Avec perles · Fils de couleur · Style tribal",
    price: "dès 180 MAD",
    image: "/images/s-fulani.jpg",
    imageAlt: "Tresses Fulani salon afro Marrakech",
  },
  {
    id: "boho-braids",
    label: "Tresses Boho",
    icon: "◉",
    subServices: "Boho knotless · Avec frisures · Jumbo · Colorées",
    price: "dès 220 MAD",
    image: "/images/s-boho.jpg",
    imageAlt: "Tresses Boho salon Mimi Marrakech",
  },
  {
    id: "locks-dreads",
    label: "Locks & dreads",
    icon: "⟁",
    subServices: "Pose de locks · Sisterlocks · Entretien · Retouche racines",
    price: "dès 250 MAD",
    image: "/images/s-depart-locks.jpg",
    imageAlt: "Locks dreads salon afro Marrakech",
  },
  {
    id: "cheveux-attaches",
    label: "Cheveux attachés",
    icon: "◌",
    subServices: "Chignon · Queue de cheval · Updo · Bun · Twisted updo",
    price: "dès 60 MAD",
    image: "/images/s-mini-braids.jpg",
    imageAlt: "Cheveux attachés coiffure salon Mimi Marrakech",
  },
  {
    id: "perruques-tissage",
    label: "Perruques et tissage",
    icon: "◎",
    subServices: "Pose de perruque · Tissage · Rajouts · Entretien perruque",
    price: "dès 150 MAD",
    image: "/images/s-box-braids-longues.jpg",
    imageAlt: "Perruques et tissage salon Mimi Marrakech",
  },
  {
    id: "colorations",
    label: "Colorations capillaires",
    icon: "✺",
    subServices: "Couleur complète · Mèches · Balayage · Décoloration · Henné",
    price: "dès 100 MAD",
    image: "/images/s-tressage-action.jpg",
    imageAlt: "Coloration capillaire salon Mimi Marrakech",
  },
  {
    id: "ongles-soins-epilation",
    label: "Ongles, soins & épilation",
    icon: "❀",
    subServices:
      "Pose d'ongles · Manucure · Soins du visage · Épilation · Sourcils",
    price: "dès 50 MAD",
    image: "/images/s-ongles.jpg",
    imageAlt: "Ongles soins épilation salon Mimi Marrakech",
  },
];

export default function ServicesPageClient({ locale }: { locale: string }) {
  const [active, setActive] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % SERVICES.length);
    }, 4500);
  }

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function goTo(index: number) {
    if (index === active) return;
    setLeaving(active);
    setTimeout(() => setLeaving(null), 700);
    setActive(index);
    startTimer();
  }

  return (
    <div className="min-h-screen flex flex-col bg-nuit">
      <div className="h-[57px] flex-shrink-0" />

      <div className="flex-shrink-0 text-center px-12 py-4 border-b border-ocre/10">
        <span className="text-ocre text-[9px] tracking-[5px] uppercase font-inter block mb-1">
          Ce qu&apos;on fait · ce qu&apos;on maîtrise
        </span>
        <h1 className="font-georgia text-[clamp(20px,2.5vw,30px)] font-bold text-white">
          Des services pensés pour{" "}
          <em className="text-ocre italic">chaque texture</em>
        </h1>
        <p className="text-white/45 text-[12px] max-w-lg mx-auto mt-1 leading-relaxed font-inter">
          Que tu veuilles des{" "}
          <strong className="text-ocre">tresses africaines</strong>, des{" "}
          <strong className="text-white">knotless braids</strong>, des locks ou
          un soin naturel — on a ce qu&apos;il te faut.{" "}
          <strong className="text-white">Réserve en ligne</strong>, on
          s&apos;occupe du reste.
        </p>
        <div className="flex justify-center gap-3 mt-3">
          <Link
            href={`/${locale}/reservation`}
            className="flex items-center gap-2 bg-ocre hover:bg-or text-white text-[9px] tracking-[3px] uppercase px-5 py-2.5 rounded-full transition-colors font-inter"
          >
            → Réserver maintenant
          </Link>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 min-h-0 gap-4 p-4 pt-3">
        <div className="w-full md:w-[36%] bg-panneau rounded-2xl border border-ocre/20 p-4 md:p-6 flex flex-col gap-3 md:flex-shrink-0">
          <div className="text-[9px] tracking-[4px] uppercase text-white/35 font-inter mb-1">
            Choisir un service
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
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-[400px] md:min-h-0 bg-panneau rounded-2xl border border-ocre/20 overflow-hidden relative">
          {SERVICES.map((s, i) => (
            <div
              key={s.id}
              className="absolute inset-0 transition-all duration-700"
              style={{
                opacity: i === active ? 1 : 0,
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
                  {s.label}
                </span>
                <p className="font-georgia text-[15px] text-white leading-relaxed mb-2">
                  {s.subServices}
                </p>
                <p className="text-[10px] tracking-[3px] uppercase text-white/55 font-inter mb-4">
                  À partir de{" "}
                  <span className="text-ocre font-bold">
                    {s.price.replace("dès ", "")}
                  </span>
                </p>
                <Link
                  href={`/${locale}/reservation?service=${s.id}`}
                  className="inline-flex items-center gap-2 bg-white hover:bg-ocre text-nuit hover:text-white text-[10px] tracking-[3px] uppercase px-6 py-3 rounded-full font-bold transition-colors font-inter"
                >
                  → Réserver ce service
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
