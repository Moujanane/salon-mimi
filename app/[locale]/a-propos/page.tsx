export const revalidate = 3600;

import type { Metadata } from "next";
import Image from "next/image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    fr: "Salon Mimi — Coiffeuse africaine Marrakech Jamaa El Fna",
    en: "Salon Mimi — African hairstylist Marrakech Jamaa El Fna",
    es: "Salon Mimi — Peluquera africana Marrakech Jamaa El Fna",
  };

  const descriptions: Record<string, string> = {
    fr: "Mimi, coiffeuse ivoirienne à Marrakech, spécialiste des tresses africaines, locks et knotless braids. Produits naturels : huile d'argan, karité, henné. Place Jamaa El Fna.",
    en: "Mimi, Ivorian hairstylist in Marrakech, specialist in African braids, locks and knotless braids. Natural products: argan oil, shea butter, henna. Jamaa El Fna Square.",
    es: "Mimi, peluquera marfileña en Marrakech, especialista en trenzas africanas, locks y knotless braids. Productos naturales: aceite de argán, karité, henna. Plaza Jamaa El Fna.",
  };

  return {
    title: titles[locale] ?? titles.fr,
    description: descriptions[locale] ?? descriptions.fr,
    alternates: {
      canonical: `https://mimi-coiffure.com/${locale}/a-propos/`,
      languages: {
        fr: "https://mimi-coiffure.com/fr/a-propos/",
        en: "https://mimi-coiffure.com/en/a-propos/",
        es: "https://mimi-coiffure.com/es/a-propos/",
        "x-default": "https://mimi-coiffure.com/fr/a-propos/",
      },
    },
  };
}

const content: Record<
  string,
  {
    h1: string;
    intro: string;
    h2Story: string;
    story: string[];
    h2Products: string;
    products: string;
    h2Why: string;
    whyItems: { title: string; desc: string }[];
    quote: string;
    imageAlt: string;
  }
> = {
  fr: {
    h1: "À propos de Salon Mimi",
    intro:
      "Salon Mimi est né d'une passion pour les coiffures africaines et d'une vision : offrir à chaque cliente une transformation authentique au cœur de la médina de Marrakech.",
    h2Story: "Mimi, coiffeuse africaine à Marrakech",
    story: [
      "Mimi, coiffeuse ivoirienne installée à Marrakech depuis plus de 10 ans, marie les techniques traditionnelles africaines avec une touche contemporaine. Chaque tresse raconte une histoire, chaque soin respecte les cheveux naturels.",
      "Spécialiste des tresses africaines, des knotless braids, des box braids et des locks, Mimi reçoit des clientes du monde entier Place Jamaa El Fna — le cœur touristique et culturel de Marrakech.",
    ],
    h2Products: "Des produits naturels, locaux et authentiques",
    products:
      "Tous nos produits sont soigneusement sélectionnés pour respecter vos cheveux : huile d'argan du Souss, karité du Mali, eau de rose de la vallée du Dadès, henné du sud marocain. Vos cheveux méritent le meilleur du terroir africain et marocain.",
    h2Why: "Pourquoi choisir le Salon Mimi ?",
    whyItems: [
      {
        title: "Expertise africaine",
        desc: "Plus de 10 ans d'expérience dans les coiffures africaines : tresses, locks, knotless, box braids.",
      },
      {
        title: "Emplacement unique",
        desc: "Situé Place Jamaa El Fna, le lieu le plus iconique de Marrakech — accessible à pied depuis tous les riads de la Médina.",
      },
      {
        title: "Produits naturels",
        desc: "Huile d'argan, karité, eau de rose et henné — rien que des produits locaux qui nourrissent vos cheveux.",
      },
      {
        title: "Réservation en ligne",
        desc: "Réservez votre créneau directement sur le site, sans appel, sans attente.",
      },
    ],
    quote:
      "Chaque cliente qui entre repart avec des tresses qui lui ressemblent. C'est ça, mon travail.",
    imageAlt:
      "Mimi, coiffeuse africaine spécialiste tresses au Salon Mimi Marrakech, Place Jamaa El Fna",
  },
  en: {
    h1: "About Salon Mimi",
    intro:
      "Salon Mimi was born from a passion for African hairstyles and a vision: to offer every client an authentic transformation in the heart of Marrakech's medina.",
    h2Story: "Mimi, African hairstylist in Marrakech",
    story: [
      "Mimi, an Ivorian hairstylist based in Marrakech for over 10 years, blends traditional African techniques with a contemporary touch. Every braid tells a story, every treatment respects natural hair.",
      "Specialist in African braids, knotless braids, box braids and locks, Mimi welcomes clients from around the world at Jamaa El Fna Square — the cultural heart of Marrakech.",
    ],
    h2Products: "Natural, local and authentic products",
    products:
      "All our products are carefully selected to care for your hair: argan oil from the Souss region, shea butter from Mali, rose water from the Dadès valley, henna from southern Morocco. Your hair deserves the best of African and Moroccan terroir.",
    h2Why: "Why choose Salon Mimi?",
    whyItems: [
      {
        title: "African expertise",
        desc: "Over 10 years of experience in African hairstyles: braids, locks, knotless, box braids.",
      },
      {
        title: "Unique location",
        desc: "Located at Jamaa El Fna Square, the most iconic spot in Marrakech — walking distance from all medina riads.",
      },
      {
        title: "Natural products",
        desc: "Argan oil, shea butter, rose water and henna — only local products that nourish your hair.",
      },
      {
        title: "Online booking",
        desc: "Book your appointment directly on the website, no phone calls, no waiting.",
      },
    ],
    quote:
      "Every client who walks in leaves with braids that are truly hers. That's my work.",
    imageAlt:
      "Mimi, African braids specialist hairstylist at Salon Mimi Marrakech, Jamaa El Fna Square",
  },
  es: {
    h1: "Sobre el Salon Mimi",
    intro:
      "El Salon Mimi nació de una pasión por los peinados africanos y una visión: ofrecer a cada clienta una transformación auténtica en el corazón de la medina de Marrakech.",
    h2Story: "Mimi, peluquera africana en Marrakech",
    story: [
      "Mimi, peluquera marfileña establecida en Marrakech desde hace más de 10 años, combina las técnicas africanas tradicionales con un toque contemporáneo. Cada trenza cuenta una historia, cada tratamiento respeta el cabello natural.",
      "Especialista en trenzas africanas, knotless braids, box braids y locks, Mimi recibe clientas de todo el mundo en la Plaza Jamaa El Fna — el corazón cultural de Marrakech.",
    ],
    h2Products: "Productos naturales, locales y auténticos",
    products:
      "Todos nuestros productos son cuidadosamente seleccionados para respetar tu cabello: aceite de argán del Souss, manteca de karité de Mali, agua de rosas del valle del Dadès, henna del sur de Marruecos.",
    h2Why: "¿Por qué elegir el Salon Mimi?",
    whyItems: [
      {
        title: "Experiencia africana",
        desc: "Más de 10 años de experiencia en peinados africanos: trenzas, locks, knotless, box braids.",
      },
      {
        title: "Ubicación única",
        desc: "Situado en la Plaza Jamaa El Fna, el lugar más icónico de Marrakech — a pie desde todos los riads de la Medina.",
      },
      {
        title: "Productos naturales",
        desc: "Aceite de argán, karité, agua de rosas y henna — solo productos locales que nutren tu cabello.",
      },
      {
        title: "Reserva online",
        desc: "Reserva tu cita directamente en el sitio web, sin llamadas, sin esperas.",
      },
    ],
    quote:
      "Cada clienta que entra sale con trenzas que realmente le pertenecen. Ese es mi trabajo.",
    imageAlt:
      "Mimi, peluquera especialista en trenzas africanas en el Salon Mimi Marrakech, Plaza Jamaa El Fna",
  },
};

export default async function AProposPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const data = content[locale] ?? content.fr;

  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Mimi",
    jobTitle:
      locale === "fr"
        ? "Coiffeuse spécialiste tresses africaines"
        : locale === "en"
          ? "African braids specialist hairstylist"
          : "Peluquera especialista en trenzas africanas",
    worksFor: {
      "@type": "HairSalon",
      name: "Salon Mimi",
      url: "https://mimi-coiffure.com",
    },
    knowsAbout: [
      "tresses africaines",
      "knotless braids",
      "box braids",
      "locks",
      "dreads",
      "tresses Fulani",
      "coiffures africaines",
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Place Jemaa el-Fna",
      addressLocality: "Marrakech",
      postalCode: "40000",
      addressCountry: "MA",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />
      <div className="bg-fond min-h-screen">
        <div className="bg-nuit py-16 text-center">
          <h1 className="font-playfair text-5xl text-or">{data.h1}</h1>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-16 space-y-16">
          <p className="text-brun text-xl leading-relaxed font-playfair italic">
            {data.intro}
          </p>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="font-playfair text-2xl text-brun">
                {data.h2Story}
              </h2>
              {data.story.map((para, i) => (
                <p key={i} className="text-brun/80 text-base leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-panneau">
              <Image
                src="/images/s-tressage-mains.jpg"
                alt={data.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          <blockquote className="border-l-4 border-ocre pl-6 py-2">
            <p className="font-playfair text-xl italic text-brun">
              &ldquo;{data.quote}&rdquo;
            </p>
            <footer className="text-ocre text-sm mt-2 font-inter tracking-widest uppercase">
              Mimi
            </footer>
          </blockquote>

          <div>
            <h2 className="font-playfair text-2xl text-brun mb-4">
              {data.h2Products}
            </h2>
            <p className="text-brun/80 text-base leading-relaxed">
              {data.products}
            </p>
          </div>

          <div>
            <h2 className="font-playfair text-2xl text-brun mb-8">
              {data.h2Why}
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {data.whyItems.map((item, i) => (
                <div
                  key={i}
                  className="bg-panneau rounded-xl p-5 border border-ocre/15"
                >
                  <p className="font-playfair text-or text-lg mb-2">
                    {item.title}
                  </p>
                  <p className="text-white/65 text-sm leading-relaxed font-inter">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
