import type { Metadata } from "next";

export const revalidate = 86400;

const BASE_URL = "https://mimi-coiffure.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const titles: Record<string, string> = {
    fr: "Mentions légales — Salon Mimi Marrakech",
    en: "Legal Notice — Salon Mimi Marrakech",
    es: "Aviso legal — Salon Mimi Marrakech",
  };
  const descriptions: Record<string, string> = {
    fr: "Mentions légales du Salon Mimi, salon de coiffure afro à Marrakech. Éditeur, hébergeur, propriété intellectuelle et droit applicable.",
    en: "Legal notice for Salon Mimi, afro hair salon in Marrakech. Publisher, hosting, intellectual property and applicable law.",
    es: "Aviso legal del Salon Mimi, salón de peluquería afro en Marrakech. Editor, alojamiento, propiedad intelectual y legislación aplicable.",
  };
  return {
    title: titles[locale] ?? titles.fr,
    description: descriptions[locale] ?? descriptions.fr,
    alternates: {
      canonical: `${BASE_URL}/${locale}/mentions-legales/`,
    },
  };
}

export default async function MentionsLegalesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (locale === "en") {
    return <LegalEn />;
  }
  if (locale === "es") {
    return <LegalEs />;
  }
  return <LegalFr />;
}

function LegalFr() {
  return (
    <main className="bg-nuit min-h-screen pt-[57px]">
      <div className="max-w-3xl mx-auto px-6 py-16 text-white/80 font-inter">
        <h1 className="font-georgia text-3xl font-bold text-white mb-10">
          Mentions légales
        </h1>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Éditeur du site
          </h2>
          <p>
            <strong className="text-white">Salon Mimi</strong>
            <br />
            Entreprise individuelle
            <br />
            Place Jemaa el-Fna, Médina, Marrakech 40000, Maroc
            <br />
            Téléphone : +212 7 10 38 82 04
            <br />
            Email : contact@mimi-coiffure.com
            <br />
            <br />
            Responsable de publication :{" "}
            <strong className="text-white">Moujahid ANANE</strong>
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Hébergement
          </h2>
          <p>
            Ce site est hébergé par{" "}
            <strong className="text-white">Railway Corp.</strong>
            <br />
            1250 Borregas Ave, Sunnyvale, CA 94089, États-Unis
            <br />
            railway.app
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Propriété intellectuelle
          </h2>
          <p>
            L&apos;ensemble du contenu de ce site (textes, images,
            photographies) est la propriété exclusive du Salon Mimi. Toute
            reproduction, distribution ou utilisation sans autorisation écrite
            préalable est interdite.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Responsabilité
          </h2>
          <p>
            Le Salon Mimi s&apos;efforce de maintenir les informations de ce
            site à jour et exactes. En cas d&apos;erreur ou d&apos;omission,
            merci de nous contacter directement.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widets uppercase mb-3">
            Droit applicable
          </h2>
          <p>
            Ce site est soumis au droit marocain. Tout litige relatif à son
            utilisation relève de la compétence exclusive des tribunaux de
            Marrakech.
          </p>
        </section>
      </div>
    </main>
  );
}

function LegalEn() {
  return (
    <main className="bg-nuit min-h-screen pt-[57px]">
      <div className="max-w-3xl mx-auto px-6 py-16 text-white/80 font-inter">
        <h1 className="font-georgia text-3xl font-bold text-white mb-10">
          Legal Notice
        </h1>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Publisher
          </h2>
          <p>
            <strong className="text-white">Salon Mimi</strong>
            <br />
            Sole proprietorship
            <br />
            Jemaa el-Fna Square, Medina, Marrakech 40000, Morocco
            <br />
            Phone: +212 7 10 38 82 04
            <br />
            Email: contact@mimi-coiffure.com
            <br />
            <br />
            Publication manager:{" "}
            <strong className="text-white">Moujahid ANANE</strong>
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Hosting
          </h2>
          <p>
            This website is hosted by{" "}
            <strong className="text-white">Railway Corp.</strong>
            <br />
            1250 Borregas Ave, Sunnyvale, CA 94089, United States
            <br />
            railway.app
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Intellectual property
          </h2>
          <p>
            All content on this website (texts, images, photographs) is the
            exclusive property of Salon Mimi. Any reproduction, distribution or
            use without prior written authorization is prohibited.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Applicable law
          </h2>
          <p>
            This site is governed by Moroccan law. Any dispute relating to its
            use falls under the exclusive jurisdiction of the courts of
            Marrakech.
          </p>
        </section>
      </div>
    </main>
  );
}

function LegalEs() {
  return (
    <main className="bg-nuit min-h-screen pt-[57px]">
      <div className="max-w-3xl mx-auto px-6 py-16 text-white/80 font-inter">
        <h1 className="font-georgia text-3xl font-bold text-white mb-10">
          Aviso legal
        </h1>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Editor del sitio
          </h2>
          <p>
            <strong className="text-white">Salon Mimi</strong>
            <br />
            Empresa individual
            <br />
            Plaza Jemaa el-Fna, Medina, Marrakech 40000, Marruecos
            <br />
            Teléfono: +212 7 10 38 82 04
            <br />
            Email: contact@mimi-coiffure.com
            <br />
            <br />
            Responsable de publicación:{" "}
            <strong className="text-white">Moujahid ANANE</strong>
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Alojamiento
          </h2>
          <p>
            Este sitio está alojado por{" "}
            <strong className="text-white">Railway Corp.</strong>
            <br />
            1250 Borregas Ave, Sunnyvale, CA 94089, Estados Unidos
            <br />
            railway.app
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Propiedad intelectual
          </h2>
          <p>
            Todo el contenido de este sitio (textos, imágenes, fotografías) es
            propiedad exclusiva del Salon Mimi. Cualquier reproducción,
            distribución o uso sin autorización escrita previa está prohibido.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Legislación aplicable
          </h2>
          <p>
            Este sitio se rige por la legislación marroquí. Cualquier litigio
            relacionado con su uso es competencia exclusiva de los tribunales de
            Marrakech.
          </p>
        </section>
      </div>
    </main>
  );
}
