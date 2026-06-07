export const revalidate = 3600;

import type { Metadata } from "next";
import Image from "next/image";
import { getSettings } from "@/lib/settings";
import ContactForm from "@/components/sections/ContactForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles: Record<string, string> = {
    fr: "Contact & Accès — Salon Mimi Marrakech | Place Jamaa El Fna",
    en: "Contact & Location — Salon Mimi Marrakech | Jamaa El Fna",
    es: "Contacto y Ubicación — Salon Mimi Marrakech | Plaza Jamaa El Fna",
  };

  const descriptions: Record<string, string> = {
    fr: "Contactez le Salon Mimi à Marrakech. Situé Place Jamaa El Fna, Médina. WhatsApp, Instagram, horaires et itinéraire. Réservation en ligne disponible.",
    en: "Contact Salon Mimi in Marrakech. Located at Jamaa El Fna Square, Medina. WhatsApp, Instagram, opening hours and directions. Online booking available.",
    es: "Contacta con el Salon Mimi en Marrakech. Ubicado en la Plaza Jamaa El Fna, Medina. WhatsApp, Instagram, horarios e indicaciones. Reserva online disponible.",
  };

  return {
    title: titles[locale] ?? titles.fr,
    description: descriptions[locale] ?? descriptions.fr,
    alternates: {
      canonical: `https://mimi-coiffure.com/${locale}/contact/`,
      languages: {
        fr: "https://mimi-coiffure.com/fr/contact/",
        en: "https://mimi-coiffure.com/en/contact/",
        es: "https://mimi-coiffure.com/es/contact/",
        "x-default": "https://mimi-coiffure.com/fr/contact/",
      },
    },
  };
}

const content: Record<
  string,
  {
    title: string;
    address: string;
    hours: string;
    hoursDetail: string;
    waLabel: string;
    igLabel: string;
    reviewLabel: string;
    lostTitle: string;
    lostText: string;
    lostCallLabel: string;
  }
> = {
  fr: {
    title: "Contact & Accès — Salon Mimi Marrakech",
    address: "Place Jemaa el-Fna, Médina, Marrakech 40000, Maroc",
    hours: "Horaires",
    hoursDetail: "Lundi – Samedi : 9h – 19h",
    waLabel: "Contacter sur WhatsApp",
    igLabel: "Suivre sur Instagram",
    reviewLabel: "Laisser un avis Google ⭐",
    lostTitle: "Vous ne trouvez pas le salon ?",
    lostText:
      "Rendez-vous devant le restaurant Argana, en face de la Place Jamaa El Fna. Appelez Mimi — elle viendra vous chercher.",
    lostCallLabel: "Appeler Mimi",
  },
  en: {
    title: "Contact & Location — Salon Mimi Marrakech",
    address: "Jemaa el-Fna Square, Medina, Marrakech 40000, Morocco",
    hours: "Opening hours",
    hoursDetail: "Monday – Saturday: 9am – 7pm",
    waLabel: "Contact on WhatsApp",
    igLabel: "Follow on Instagram",
    reviewLabel: "Leave a Google review ⭐",
    lostTitle: "Can't find the salon?",
    lostText:
      "Head to the Argana restaurant, right at Jamaa El Fna Square. Call Mimi — she will come and meet you.",
    lostCallLabel: "Call Mimi",
  },
  es: {
    title: "Contacto y Ubicación — Salon Mimi Marrakech",
    address: "Plaza Jemaa el-Fna, Medina, Marrakech 40000, Marruecos",
    hours: "Horario",
    hoursDetail: "Lunes – Sábado: 9h – 19h",
    waLabel: "Contactar por WhatsApp",
    igLabel: "Seguir en Instagram",
    reviewLabel: "Dejar una reseña en Google ⭐",
    lostTitle: "¿No encuentras el salón?",
    lostText:
      "Ve al restaurante Argana, justo en la Plaza Jamaa El Fna. Llama a Mimi — ella vendrá a buscarte.",
    lostCallLabel: "Llamar a Mimi",
  },
};

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const settings = await getSettings();
  const data = content[locale] ?? content.fr;

  return (
    <div className="bg-fond min-h-screen">
      <div className="bg-nuit py-16 text-center">
        <h1 className="font-playfair text-5xl text-or">{data.title}</h1>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Adresse + horaires */}
        <div className="bg-white rounded-2xl p-8 border border-ocre/20 mb-10 shadow-sm">
          <a
            href="https://maps.app.goo.gl/2VHUxKWpLpYFE8836"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl font-playfair text-brun hover:text-ocre transition-colors mb-2 inline-block"
          >
            📍 {data.address}
          </a>
          <p className="text-brun mt-6 font-medium">{data.hours}</p>
          <p className="text-brun/60">{data.hoursDetail}</p>
        </div>

        {/* Section "Vous ne trouvez pas le salon ?" */}
        <div className="bg-nuit rounded-2xl overflow-hidden mb-10 shadow-sm border border-ocre/20">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center">
            <div className="relative h-64 md:h-full min-h-[240px] bg-black">
              <Image
                src="/images/restaurant-argana.jpg"
                alt="Restaurant Argana — Place Jamaa El Fna, Marrakech"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="p-8 flex flex-col gap-4">
              <h2 className="font-playfair text-2xl text-or">
                {data.lostTitle}
              </h2>
              <p className="text-white/80 leading-relaxed">{data.lostText}</p>
              <a
                href={`tel:${settings.whatsapp_number}`}
                className="inline-block bg-ocre text-white text-center py-3 px-6 rounded-full font-medium hover:bg-ocre/80 transition-colors self-start"
              >
                📞 {data.lostCallLabel}
              </a>
            </div>
          </div>
        </div>

        {/* Disposition 2 colonnes : formulaire à gauche, boutons + carte à droite */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Colonne gauche — formulaire */}
          <div className="lg:col-span-3">
            <ContactForm locale={locale} />
          </div>

          {/* Colonne droite — boutons + carte */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <a
              href={`https://wa.me/${settings.whatsapp_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-whatsapp text-white text-center py-4 rounded-full font-medium hover:bg-whatsapp-hover transition-colors"
            >
              {data.waLabel}
            </a>
            <a
              href="https://www.instagram.com/salonmimi.marrakech"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-nuit border border-ocre/30 text-white text-center py-4 rounded-full font-medium hover:border-ocre transition-colors"
            >
              {data.igLabel}
            </a>
            <a
              href="https://g.page/r/CXqJtbaOg9FUEBM/review"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-ocre/30 text-brun text-center py-4 rounded-full font-medium hover:border-ocre transition-colors"
            >
              {data.reviewLabel}
            </a>
            <div
              className="rounded-2xl overflow-hidden bg-gray-200"
              style={{ height: "320px" }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3397.3462!2d-7.989167!3d31.625956!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xdafee443af05f15%3A0x8ba8a7c0b3ba6da3!2sJemaa%20el-Fna!5e0!3m2!1sfr!2sma!4v1715700000000!5m2!1sfr!2sma"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Salon Mimi — Place Jemaa el-Fna Marrakech"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
