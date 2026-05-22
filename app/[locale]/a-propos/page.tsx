import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    fr: "À propos — Salon Mimi, coiffeuse africaine à Marrakech | Jamaa El Fna",
    en: "About — Salon Mimi, African hairstylist in Marrakech | Jamaa El Fna",
    es: "Sobre nosotros — Salon Mimi, peluquera africana en Marrakech | Jamaa El Fna",
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
      canonical: `https://mimi-coiffure.com/${locale}/a-propos`,
      languages: {
        fr: "https://mimi-coiffure.com/fr/a-propos",
        en: "https://mimi-coiffure.com/en/a-propos",
        es: "https://mimi-coiffure.com/es/a-propos",
        "x-default": "https://mimi-coiffure.com/fr/a-propos",
      },
    },
  };
}

const content: Record<string, { title: string; body: string[] }> = {
  fr: {
    title: "À propos de Salon Mimi",
    body: [
      "Salon Mimi est né d'une passion pour les coiffures africaines et d'une vision : offrir à chaque cliente une transformation authentique au cœur de la médina de Marrakech.",
      "Mimi, coiffeuse ivoirienne installée à Marrakech, marie les techniques traditionnelles africaines avec une touche contemporaine. Chaque tresse raconte une histoire, chaque soin respecte les cheveux naturels.",
      "Tous nos produits sont locaux et naturels : huile d'argan du Souss, karité du Mali, eau de rose de la vallée du Dadès, henné du sud marocain. Vos cheveux méritent le meilleur du terroir africain et marocain.",
    ],
  },
  en: {
    title: "About Salon Mimi",
    body: [
      "Salon Mimi was born from a passion for African hairstyles and a vision: to offer every client an authentic transformation in the heart of Marrakech's medina.",
      "Mimi, an Ivorian hairstylist based in Marrakech, blends traditional African techniques with a contemporary touch. Every braid tells a story, every treatment respects natural hair.",
      "All our products are local and natural: argan oil from the Souss region, shea butter from Mali, rose water from the Dadès valley, henna from southern Morocco. Your hair deserves the best of African and Moroccan terroir.",
    ],
  },
  es: {
    title: "Sobre el Salon Mimi",
    body: [
      "El Salon Mimi nació de una pasión por los peinados africanos y una visión: ofrecer a cada clienta una transformación auténtica en el corazón de la medina de Marrakech.",
      "Mimi, peluquera marfileña establecida en Marrakech, combina las técnicas africanas tradicionales con un toque contemporáneo. Cada trenza cuenta una historia, cada tratamiento respeta el cabello natural.",
      "Todos nuestros productos son locales y naturales: aceite de argán del Souss, manteca de karité de Mali, agua de rosas del valle del Dadès, henna del sur de Marruecos.",
    ],
  },
};

export default async function AProposPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const data = content[locale] ?? content.fr;

  return (
    <div className="bg-fond min-h-screen">
      <div className="bg-nuit py-16 text-center">
        <h1 className="font-playfair text-5xl text-or">{data.title}</h1>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
        {data.body.map((para, i) => (
          <p key={i} className="text-brun text-lg leading-relaxed">
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}
