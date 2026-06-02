"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

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
}

export default function ReservationLayout({ labels, prices }: Props) {
  const searchParams = useSearchParams();
  const serviceParam = searchParams.get("service") ?? "tresses-africaines";

  const initialIndex = SERVICES.findIndex((s) => s.id === serviceParam);
  const [activeIndex, setActiveIndex] = useState(
    initialIndex >= 0 ? initialIndex : 0,
  );
  const [submitted, setSubmitted] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState("");
  const [error, setError] = useState("");

  const activeSvc = SERVICES[activeIndex];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = {
      nom: (form.elements.namedItem("name") as HTMLInputElement).value,
      telephone: (form.elements.namedItem("phone") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      service: activeSvc.label,
      date_souhaitee: (form.elements.namedItem("date") as HTMLInputElement)
        .value,
      heure_souhaitee: (form.elements.namedItem("time") as HTMLInputElement)
        .value,
      nombre_personnes: (
        form.elements.namedItem("persons") as HTMLSelectElement
      ).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement)
        .value,
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

  if (submitted) {
    return (
      <div className="h-screen flex items-center justify-center bg-nuit">
        <div className="text-center px-6">
          <div className="text-ocre text-4xl mb-4">✦</div>
          <h2 className="font-georgia text-2xl text-white mb-3">
            {labels.success}
          </h2>
          <p className="text-white/50 text-sm font-inter mb-6">
            Mimi vous contacte dès que possible pour confirmer.
          </p>
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-whatsapp hover:bg-whatsapp-hover text-white text-sm font-inter font-medium px-8 py-3.5 rounded-full transition-colors"
            >
              WhatsApp non ouvert ? Cliquer ici
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-nuit">
      <div className="h-[57px] flex-shrink-0" />

      <div className="flex-shrink-0 px-5 md:px-12 py-3 border-b border-ocre/10">
        <span className="text-ocre text-[9px] tracking-[4px] uppercase font-inter block mb-0.5">
          Réservation en ligne · Marrakech
        </span>
        <h1 className="font-georgia text-[clamp(18px,2vw,26px)] font-bold text-white">
          Réserve ton <em className="text-ocre italic">rendez-vous</em>
        </h1>
      </div>

      <div className="flex flex-col md:flex-row flex-1 min-h-0 gap-4 p-4 pt-3">
        <div className="w-full md:w-[44%] bg-panneau rounded-2xl border border-ocre/20 p-5 md:p-6 md:flex-shrink-0 overflow-y-auto">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <div className="font-georgia text-[15px] font-bold text-white mb-0.5">
                Tes informations
              </div>
              <div className="text-[10px] text-white/55 font-inter tracking-wide">
                Tous les champs * sont obligatoires
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] tracking-[2px] uppercase text-white/50 font-inter">
                Service <span className="text-ocre">*</span>
              </label>
              <select
                name="service"
                value={activeIndex}
                onChange={(e) => setActiveIndex(Number(e.target.value))}
                required
                className="border border-white/12 focus:border-ocre rounded-xl text-white text-[13px] px-4 py-2.5 focus-visible:outline-none transition-colors font-inter appearance-none cursor-pointer"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                {SERVICES.map((s, i) => (
                  <option
                    key={s.id}
                    value={i}
                    style={{ background: "#2d1005" }}
                  >
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="h-px bg-ocre/15" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] tracking-[2px] uppercase text-white/50 font-inter">
                  Nom complet <span className="text-ocre">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  placeholder="Fatima Zahra..."
                  required
                  className="border border-white/12 focus:border-ocre rounded-xl text-white text-[13px] px-4 py-2.5 focus-visible:outline-none transition-colors font-inter placeholder:text-white/25"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] tracking-[2px] uppercase text-white/50 font-inter">
                  Téléphone / WhatsApp <span className="text-ocre">*</span>
                </label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+212 6..."
                  required
                  className="border border-white/12 focus:border-ocre rounded-xl text-white text-[13px] px-4 py-2.5 focus-visible:outline-none transition-colors font-inter placeholder:text-white/25"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] tracking-[2px] uppercase text-white/50 font-inter">
                Email <span className="text-ocre">*</span>
              </label>
              <input
                name="email"
                type="email"
                placeholder="votre@email.com"
                required
                className="border border-white/12 focus:border-ocre rounded-xl text-white text-[13px] px-4 py-2.5 focus-visible:outline-none transition-colors font-inter placeholder:text-white/25"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
            </div>

            <div className="h-px bg-ocre/15" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] tracking-[2px] uppercase text-white/50 font-inter">
                  Date souhaitée <span className="text-ocre">*</span>
                </label>
                <input
                  name="date"
                  type="date"
                  required
                  className="border border-white/12 focus:border-ocre rounded-xl text-white text-[13px] px-4 py-2.5 focus-visible:outline-none transition-colors font-inter"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] tracking-[2px] uppercase text-white/50 font-inter">
                  Heure souhaitée <span className="text-ocre">*</span>
                </label>
                <input
                  name="time"
                  type="time"
                  required
                  className="border border-white/12 focus:border-ocre rounded-xl text-white text-[13px] px-4 py-2.5 focus-visible:outline-none transition-colors font-inter"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] tracking-[2px] uppercase text-white/50 font-inter">
                Nombre de personnes
              </label>
              <select
                name="persons"
                className="border border-white/12 focus:border-ocre rounded-xl text-white text-[13px] px-4 py-2.5 focus-visible:outline-none transition-colors font-inter appearance-none"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <option style={{ background: "#2d1005" }}>1 personne</option>
                <option style={{ background: "#2d1005" }}>2 personnes</option>
                <option style={{ background: "#2d1005" }}>3 personnes</option>
                <option style={{ background: "#2d1005" }}>
                  4 personnes et +
                </option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] tracking-[2px] uppercase text-white/50 font-inter">
                Message (optionnel)
              </label>
              <textarea
                name="message"
                rows={3}
                placeholder="Précisions sur le style, longueur souhaitée..."
                className="border border-white/12 focus:border-ocre rounded-xl text-white text-[13px] px-4 py-2.5 focus-visible:outline-none transition-colors font-inter placeholder:text-white/25 resize-none"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
            </div>

            {error && (
              <p className="text-red-400 text-[12px] font-inter">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-ocre hover:bg-or text-white text-[11px] tracking-[3px] uppercase py-3.5 rounded-full transition-colors font-inter font-medium"
            >
              → Confirmer la réservation
            </button>

            <p className="text-center text-white/50 text-[10px] font-inter leading-relaxed">
              Confirmation par WhatsApp sous 24h · Aucun paiement requis
              maintenant
            </p>
          </form>
        </div>

        <div className="hidden md:block flex-1 bg-panneau rounded-2xl border border-ocre/20 overflow-hidden relative">
          {SERVICES.map((s, i) => (
            <div
              key={s.id}
              className="absolute inset-0 transition-opacity duration-500"
              style={{ opacity: i === activeIndex ? 1 : 0 }}
            >
              <Image
                src={s.image}
                alt={s.imageAlt}
                fill
                className="object-cover"
                sizes="50vw"
                priority={i === 0}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(10,4,0,0.92) 0%, rgba(10,4,0,0.5) 45%, rgba(10,4,0,0.12) 100%)",
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-7 z-10">
                <span className="inline-block bg-ocre/25 border border-ocre/40 text-ocre text-[9px] tracking-[3px] uppercase px-3 py-1.5 rounded-full mb-3">
                  {s.label}
                </span>
                <p className="font-georgia text-[15px] text-white leading-relaxed mb-2">
                  {s.subServices}
                </p>
                <p className="text-[10px] tracking-[3px] uppercase text-white/50 font-inter">
                  À partir de{" "}
                  <span className="text-ocre font-bold">
                    {prices[s.id] ?? s.price} MAD
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
