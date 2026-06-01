import Link from "next/link";
import Image from "next/image";

interface HeroHomeProps {
  locale: string;
  title?: string;
  subtitle?: string;
  location?: string;
  ctaBook?: string;
  ctaServices?: string;
  badge?: string;
  h1Line1?: string;
  h1Line2?: string;
  tagline?: string;
  taglineEm?: string;
  body?: string;
  bodyEm?: string;
  ctaBookLabel?: string;
  ctaServicesLabel?: string;
}

const col1 = [
  {
    src: "/images/s-tresse-fille1.png",
    alt: "Tresses africaines salon Mimi Marrakech",
  },
  { src: "/images/s-knotless.jpg", alt: "Knotless braids Marrakech" },
  {
    src: "/images/s-box-braids-profil.jpg",
    alt: "Box braids salon afro Marrakech",
  },
  { src: "/images/s-boho.jpg", alt: "Boho braids Marrakech" },
];
const col2 = [
  {
    src: "/images/s-tresse-fille2.png",
    alt: "Tresses africaines fille Marrakech",
  },
  {
    src: "/images/s-tressage-action.jpg",
    alt: "Tressage africain en cours salon Mimi Marrakech",
  },
  { src: "/images/s-mini-braids.jpg", alt: "Mini braids salon Mimi Marrakech" },
  {
    src: "/images/s-box-braids-longues.jpg",
    alt: "Box braids longues dorées Marrakech",
  },
];
const col3 = [
  { src: "/images/s-tresse-garcon.png", alt: "Tresses garçon salon Mimi" },
  {
    src: "/images/s-retouche-locks.jpg",
    alt: "Retouche locks salon Mimi Marrakech",
  },
  {
    src: "/images/s-tressage-mains.jpg",
    alt: "Mains expertes tressage afro Marrakech",
  },
  { src: "/images/s-fulani.jpg", alt: "Fulani braids salon afro Marrakech" },
];

function PhotoColumn({
  photos,
  animClass,
}: {
  photos: { src: string; alt: string }[];
  animClass: string;
}) {
  const doubled = [...photos, ...photos];
  return (
    <div className={`flex flex-col gap-2 ${animClass}`}>
      {doubled.map((p, i) => (
        <div
          key={i}
          className="relative rounded-xl overflow-hidden flex-shrink-0"
          style={{ aspectRatio: "0.68" }}
        >
          <Image
            src={p.src}
            alt={p.alt}
            fill
            className="object-cover"
            sizes="15vw"
          />
        </div>
      ))}
    </div>
  );
}

export default function HeroHome({
  locale,
  badge,
  h1Line1,
  h1Line2,
  tagline,
  taglineEm,
  body,
  bodyEm,
  ctaBookLabel,
  ctaServicesLabel,
}: HeroHomeProps) {
  return (
    <section className="relative min-h-screen md:h-screen flex flex-col md:flex-row overflow-hidden bg-nuit pt-[57px]">
      {/* Halo ocre arrière-plan */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 25% 50%, rgba(193,123,63,0.10) 0%, transparent 55%)",
        }}
      />

      {/* ── Colonne gauche ── */}
      <div
        className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-14 relative z-10"
        style={{ height: "100%" }}
      >
        <div className="flex items-center gap-3 mb-7">
          <div className="w-7 h-px bg-ocre flex-shrink-0" />
          <span className="text-ocre text-[9px] tracking-[4px] uppercase font-inter">
            {badge ?? "Salon afro · Marrakech"}
          </span>
        </div>

        <h1 className="font-georgia text-[clamp(38px,4.5vw,68px)] font-bold uppercase leading-[0.9] text-white mb-4">
          {h1Line1 ?? "Tresses africaines & Rasta"}
          <em className="block not-italic text-ocre italic">
            {h1Line2 ?? "Marrakech"}
          </em>
        </h1>
        <p className="font-georgia text-[18px] font-semibold text-white/70 leading-snug mb-4">
          Salon Mimi · <span className="text-ocre">Place Jamaa El Fna</span>
        </p>

        <p className="font-georgia text-[18px] font-bold text-white leading-snug mb-4 max-w-sm">
          {tagline ?? "Tes cheveux méritent"}
          <br />
          <em className="text-ocre">
            {taglineEm ?? "mieux qu'une coiffure ordinaire."}
          </em>
        </p>

        <p className="text-white/55 text-[14px] leading-relaxed max-w-[360px] mb-10 font-inter">
          {body ??
            "À Marrakech, Salon Mimi est le spécialiste des tresses africaines, knotless, locks et styles naturels. Chaque cliente repart avec une coiffure qui lui ressemble —"}{" "}
          <strong className="text-white">
            {bodyEm ?? "réalisée par des mains expertes"}
          </strong>
          .
        </p>

        <div className="flex flex-col gap-3 max-w-[260px]">
          <Link
            href={`/${locale}/reservation`}
            className="flex items-center justify-center gap-2 bg-ocre hover:bg-or text-white text-[10px] tracking-[3px] uppercase px-7 py-4 rounded-full transition-all hover:-translate-y-0.5 font-inter"
          >
            {ctaBookLabel ?? "→ Prendre rendez-vous"}
          </Link>
          <Link
            href={`/${locale}/services`}
            className="flex items-center justify-center text-white border border-white/20 hover:border-ocre hover:text-ocre text-[10px] tracking-[3px] uppercase px-7 py-4 rounded-full transition-colors font-inter"
          >
            {ctaServicesLabel ?? "Découvrir les services"}
          </Link>
        </div>
      </div>

      {/* ── Colonne droite — grille scroll ── */}
      <div
        className="hidden md:grid grid-cols-3 gap-2 flex-1 overflow-hidden relative items-start"
        style={{ padding: "16px 16px 16px 8px" }}
      >
        {/* Fades haut et bas */}
        <div
          className="absolute top-0 inset-x-0 h-24 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, #1a0d05 20%, transparent)",
          }}
        />
        <div
          className="absolute bottom-0 inset-x-0 h-24 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to top, #1a0d05 20%, transparent)",
          }}
        />
        <PhotoColumn photos={col1} animClass="animate-scroll-up" />
        <PhotoColumn photos={col2} animClass="animate-scroll-down2" />
        <PhotoColumn photos={col3} animClass="animate-scroll-up3" />
      </div>
    </section>
  );
}
