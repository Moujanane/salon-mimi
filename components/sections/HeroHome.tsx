import Link from "next/link";
import Image from "next/image";

interface HeroHomeProps {
  locale: string;
  title: string;
  subtitle: string;
  location: string;
  ctaBook: string;
  ctaServices: string;
}

// Photos de la grille — 6 images en quinconce comme Africa Beauty
const gridPhotos = [
  { src: "/images/s-tresse-fille1.png", alt: "Tresses fille salon Mimi" },
  { src: "/images/s-knotless.jpg", alt: "Knotless braids" },
  { src: "/images/s-fulani.jpg", alt: "Fulani braids" },
  { src: "/images/s-tresse-fille2.png", alt: "Tresses fille 2" },
  { src: "/images/s-boho.jpg", alt: "Boho braids" },
  { src: "/images/coiffure-1.jpg", alt: "Coiffure afro Marrakech" },
];

export default function HeroHome({
  locale,
  title,
  subtitle,
  location,
  ctaBook,
  ctaServices,
}: HeroHomeProps) {
  return (
    <section
      className="w-full min-h-screen flex items-center"
      style={{ backgroundColor: "#2C1508" }}
    >
      <div className="w-full max-w-7xl mx-auto px-6 py-16 lg:py-24 flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
        {/* ─── Colonne gauche — texte ─── */}
        <div className="w-full lg:w-[55%] flex flex-col items-center lg:items-start text-center lg:text-left">
          {/* Badge localisation */}
          <p className="text-ocre text-xs tracking-[0.25em] uppercase font-inter font-medium mb-6">
            {location}
          </p>

          {/* Titre principal — très grand, Playfair bold */}
          <h1 className="font-playfair font-bold text-white leading-[0.9] mb-6 text-[clamp(3.5rem,8vw,6.5rem)]">
            {title}
          </h1>

          {/* Sous-titre — petites caps espacées, couleur ocre */}
          <p className="text-ocre text-sm tracking-[0.2em] uppercase font-inter font-medium mb-8">
            {subtitle}
          </p>

          {/* Texte descriptif */}
          <p className="text-white/60 font-inter text-base leading-relaxed max-w-md mb-10">
            {locale === "fr"
              ? "Spécialistes des tresses africaines, locks, knotless et styles naturels. Un salon pensé pour sublimer chaque texture, au cœur de Marrakech."
              : locale === "en"
                ? "Specialists in African braids, locks, knotless and natural styles. A salon designed to highlight every texture, in the heart of Marrakech."
                : "Especialistas en trenzas africanas, locks, knotless y estilos naturales. Un salón pensado para realzar cada textura, en el corazón de Marrakech."}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href={`/${locale}/reservation`}
              className="bg-ocre text-white px-8 py-4 rounded-full font-inter font-medium text-base hover:bg-or transition-colors text-center"
            >
              {ctaBook}
            </Link>
            <Link
              href={`/${locale}/services`}
              className="border border-white/30 text-white px-8 py-4 rounded-full font-inter font-medium text-base hover:border-ocre hover:text-ocre transition-colors text-center"
            >
              {ctaServices}
            </Link>
          </div>
        </div>

        {/* ─── Colonne droite — grille photos ─── */}
        <div className="w-full lg:w-[45%]">
          {/*
            Grille 2 colonnes.
            La colonne de droite est décalée vers le bas (translate-y)
            pour l'effet quinconce Africa Beauty.
          */}
          <div className="grid grid-cols-2 gap-3">
            {/* Colonne A — photos 0, 2, 4 */}
            <div className="flex flex-col gap-3">
              {[gridPhotos[0], gridPhotos[2], gridPhotos[4]].map((photo) => (
                <div
                  key={photo.src}
                  className="relative w-full overflow-hidden rounded-2xl"
                  style={{ aspectRatio: "3/4" }}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 22vw"
                  />
                </div>
              ))}
            </div>

            {/* Colonne B — décalée vers le bas */}
            <div className="flex flex-col gap-3 mt-10">
              {[gridPhotos[1], gridPhotos[3], gridPhotos[5]].map((photo) => (
                <div
                  key={photo.src}
                  className="relative w-full overflow-hidden rounded-2xl"
                  style={{ aspectRatio: "3/4" }}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 22vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
