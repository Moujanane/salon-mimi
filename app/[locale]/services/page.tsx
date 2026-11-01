export const revalidate = 3600;

import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import ServicesPageClient from "@/components/sections/ServicesPageClient";
import { getSettings } from "@/lib/settings";
import { SALON } from "@/lib/salon-info";
import { pageMetadata } from "@/lib/page-meta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    ...pageMetadata("services", locale, "/services"),
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const settings = await getSettings();

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

  const servicesList = [
    {
      name: "Tresses africaines",
      nameEn: "African braids",
      nameEs: "Trenzas africanas",
      price: prices["tresses-africaines"] || "150",
    },
    {
      name: "Tresses et nattes",
      nameEn: "Braids & plaits",
      nameEs: "Trenzas y nattes",
      price: prices["tresses-et-nattes"] || "80",
    },
    {
      name: "Box braids",
      nameEn: "Box braids",
      nameEs: "Box braids",
      price: prices["box-braids"] || "200",
    },
    {
      name: "Tresses Fulani",
      nameEn: "Fulani braids",
      nameEs: "Trenzas Fulani",
      price: prices["fulani-braids"] || "180",
    },
    {
      name: "Tresses Boho",
      nameEn: "Boho braids",
      nameEs: "Trenzas Boho",
      price: prices["boho-braids"] || "220",
    },
    {
      name: "Locks & dreads",
      nameEn: "Locks & dreads",
      nameEs: "Locks & dreads",
      price: prices["locks-dreads"] || "250",
    },
    {
      name: "Cheveux attachés",
      nameEn: "Updos",
      nameEs: "Recogidos",
      price: prices["cheveux-attaches"] || "60",
    },
    {
      name: "Perruques et tissage",
      nameEn: "Wigs & weaves",
      nameEs: "Pelucas y extensiones",
      price: prices["perruques-tissage"] || "150",
    },
    {
      name: "Colorations capillaires",
      nameEn: "Hair colouring",
      nameEs: "Coloración capilar",
      price: prices["colorations"] || "100",
    },
    {
      name: "Ongles, soins & épilation",
      nameEn: "Nails, care & waxing",
      nameEs: "Uñas, cuidados & depilación",
      price: prices["ongles-soins-epilation"] || "50",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name:
      locale === "en"
        ? "Salon Mimi Services"
        : locale === "es"
          ? "Servicios Salon Mimi"
          : "Services Salon Mimi",
    description:
      locale === "en"
        ? "African hair salon services in Marrakech — braids, locks, knotless"
        : locale === "es"
          ? "Servicios de peluquería africana en Marrakech — trenzas, locks, knotless"
          : "Services de coiffure africaine à Marrakech — tresses, locks, knotless",
    url: `https://mimi-coiffure.com/${locale}/services`,
    itemListElement: servicesList.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: locale === "en" ? s.nameEn : locale === "es" ? s.nameEs : s.name,
        provider: {
          "@type": "HairSalon",
          "@id": SALON.id,
          name: SALON.legalName,
          address: {
            "@type": "PostalAddress",
            streetAddress: SALON.address.streetAddress,
            addressLocality: SALON.address.addressLocality,
            addressCountry: SALON.address.addressCountry,
          },
        },
        areaServed: { "@type": "City", name: "Marrakech" },
        offers: {
          "@type": "Offer",
          price: s.price,
          priceCurrency: "MAD",
          availability: "https://schema.org/InStock",
          url: `https://mimi-coiffure.com/${locale}/reservation`,
        },
      },
    })),
  };

  const tarifsTx =
    locale === "en"
      ? {
          title: "Prices: starting from",
          caption: "Starting prices in Moroccan dirhams (MAD)",
          colService: "Service",
          colFrom: "From",
          note: "Book online or by WhatsApp to confirm the price of your hairstyle.",
        }
      : locale === "es"
        ? {
            title: "Precios: desde",
            caption: "Precios desde, en dirhams marroquíes (MAD)",
            colService: "Servicio",
            colFrom: "Desde",
            note: "Reserva online o por WhatsApp para confirmar el precio de tu peinado.",
          }
        : {
            title: "Tarifs : à partir de",
            caption: "Prix à partir de, en dirhams marocains (MAD)",
            colService: "Prestation",
            colFrom: "À partir de",
            note: "Réservez en ligne ou par WhatsApp pour confirmer le tarif de votre coiffure.",
          };

  return (
    <>
      {/* <script> natif (rendu côté serveur dans le HTML initial) plutôt que
          next/script : Google lit le JSON-LD dès le premier crawl. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ServicesPageClient locale={locale} prices={prices} />

      {/* Tableau des tarifs « à partir de » : même source que le carrousel
          (table settings), mais dans le HTML du serveur pour que Google le
          lise au premier passage. */}
      <section
        aria-labelledby="tarifs-title"
        className="bg-nuit px-6 md:px-12 pb-16 pt-4"
      >
        <div className="max-w-3xl mx-auto">
          <h2
            id="tarifs-title"
            className="font-georgia text-[clamp(20px,2.5vw,28px)] font-bold text-white text-center mb-6"
          >
            {tarifsTx.title}
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-ocre/20 bg-panneau">
            <table className="w-full text-left text-[14px] text-white/85 font-inter">
              <caption className="text-white/70 text-[12px] px-4 py-3 text-left">
                {tarifsTx.caption}
              </caption>
              <thead>
                <tr className="border-b border-ocre/20 text-ocre text-[11px] tracking-[2px] uppercase">
                  <th scope="col" className="px-4 py-3 font-normal">
                    {tarifsTx.colService}
                  </th>
                  <th scope="col" className="px-4 py-3 font-normal text-right">
                    {tarifsTx.colFrom}
                  </th>
                </tr>
              </thead>
              <tbody>
                {servicesList.map((s) => (
                  <tr
                    key={s.name}
                    className="border-b border-ocre/10 last:border-0"
                  >
                    <th scope="row" className="px-4 py-3 font-normal">
                      {locale === "en"
                        ? s.nameEn
                        : locale === "es"
                          ? s.nameEs
                          : s.name}
                    </th>
                    <td className="px-4 py-3 text-right font-bold text-or whitespace-nowrap">
                      {s.price} MAD
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-white/70 text-[12px] text-center mt-4">
            {tarifsTx.note}
          </p>
        </div>
      </section>
    </>
  );
}
