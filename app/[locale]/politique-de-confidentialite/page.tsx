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
    fr: "Politique de confidentialité — Salon Mimi Marrakech",
    en: "Privacy Policy — Salon Mimi Marrakech",
    es: "Política de privacidad — Salon Mimi Marrakech",
  };
  const descriptions: Record<string, string> = {
    fr: "Politique de confidentialité du Salon Mimi Marrakech. Données collectées, finalité, durée de conservation, vos droits selon la loi marocaine 09-08.",
    en: "Privacy policy for Salon Mimi Marrakech. Data collected, purpose, retention period and your rights under Moroccan law 09-08.",
    es: "Política de privacidad del Salon Mimi Marrakech. Datos recopilados, finalidad, conservación y sus derechos según la ley marroquí 09-08.",
  };
  return {
    title: titles[locale] ?? titles.fr,
    description: descriptions[locale] ?? descriptions.fr,
    alternates: {
      canonical: `${BASE_URL}/${locale}/politique-de-confidentialite`,
    },
  };
}

export default async function PolitiqueConfidentialitePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (locale === "en") return <PrivacyEn />;
  if (locale === "es") return <PrivacyEs />;
  return <PrivacyFr />;
}

function PrivacyFr() {
  return (
    <main className="bg-nuit min-h-screen pt-[57px]">
      <div className="max-w-3xl mx-auto px-6 py-16 text-white/80 font-inter">
        <h1 className="font-georgia text-3xl font-bold text-white mb-2">
          Politique de confidentialité
        </h1>
        <p className="text-white/40 text-xs mb-10">
          Dernière mise à jour : mai 2026
        </p>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Qui sommes-nous
          </h2>
          <p>
            Le Salon Mimi est un salon de coiffure afro situé Place Jemaa
            el-Fna, Médina, Marrakech 40000, Maroc. Ce site est accessible à
            l&apos;adresse <span className="text-white">mimi-coiffure.com</span>
            .
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Données collectées
          </h2>
          <p className="mb-3">
            Lors d&apos;une demande de réservation, nous collectons :
          </p>
          <ul className="list-disc list-inside space-y-1 text-white/70">
            <li>Nom complet</li>
            <li>Numéro de téléphone / WhatsApp</li>
            <li>Service souhaité, date et heure</li>
            <li>Message éventuel</li>
          </ul>
          <p className="mt-3">
            Ces données sont transmises directement à Mimi pour confirmer votre
            rendez-vous. Aucune donnée bancaire n&apos;est collectée sur ce
            site.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Finalité du traitement
          </h2>
          <p>
            Les données collectées servent uniquement à la prise de rendez-vous
            et à la communication avec le client via WhatsApp. Elles ne sont pas
            utilisées à des fins commerciales, publicitaires ou transmises à des
            tiers.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Conservation des données
          </h2>
          <p>
            Les données de réservation sont conservées 12 mois à compter de la
            date du rendez-vous, puis supprimées.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Vos droits
          </h2>
          <p>
            Conformément à la loi marocaine 09-08 relative à la protection des
            personnes physiques à l&apos;égard du traitement des données à
            caractère personnel, vous disposez d&apos;un droit d&apos;accès, de
            rectification et de suppression de vos données. Pour exercer ces
            droits, contactez-nous par WhatsApp au{" "}
            <span className="text-white">+212 7 10 38 82 04</span>.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Cookies
          </h2>
          <p>
            Ce site utilise un cookie technique de préférence de langue (
            <span className="text-white font-mono text-xs">NEXT_LOCALE</span>).
            Ce cookie ne collecte aucune donnée personnelle et n&apos;est pas
            utilisé à des fins de traçage ou de publicité. Il est strictement
            nécessaire au bon fonctionnement du site et ne nécessite pas votre
            consentement.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Sous-traitants techniques
          </h2>
          <ul className="list-disc list-inside space-y-2 text-white/70">
            <li>
              <strong className="text-white">Supabase</strong> — stockage des
              réservations (serveurs en Europe)
            </li>
            <li>
              <strong className="text-white">Railway</strong> — hébergement du
              site (États-Unis)
            </li>
            <li>
              <strong className="text-white">Resend</strong> — envoi des
              notifications email internes
            </li>
            <li>
              <strong className="text-white">Cloudflare</strong> — réseau de
              distribution (CDN), aucune donnée personnelle stockée
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Contact
          </h2>
          <p>
            Pour toute question relative à vos données personnelles :{" "}
            <span className="text-white">contact@mimi-coiffure.com</span>
          </p>
        </section>
      </div>
    </main>
  );
}

function PrivacyEn() {
  return (
    <main className="bg-nuit min-h-screen pt-[57px]">
      <div className="max-w-3xl mx-auto px-6 py-16 text-white/80 font-inter">
        <h1 className="font-georgia text-3xl font-bold text-white mb-2">
          Privacy Policy
        </h1>
        <p className="text-white/40 text-xs mb-10">Last updated: May 2026</p>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Who we are
          </h2>
          <p>
            Salon Mimi is an afro hair salon located at Jemaa el-Fna Square,
            Medina, Marrakech 40000, Morocco. This website is accessible at{" "}
            <span className="text-white">mimi-coiffure.com</span>.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Data collected
          </h2>
          <p className="mb-3">When making a booking request, we collect:</p>
          <ul className="list-disc list-inside space-y-1 text-white/70">
            <li>Full name</li>
            <li>Phone number / WhatsApp</li>
            <li>Requested service, date and time</li>
            <li>Optional message</li>
          </ul>
          <p className="mt-3">
            This data is sent directly to Mimi to confirm your appointment. No
            payment information is collected on this website.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Purpose
          </h2>
          <p>
            Collected data is used solely for booking appointments and
            communicating with clients via WhatsApp. It is not used for
            commercial, advertising or third-party purposes.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Data retention
          </h2>
          <p>
            Booking data is retained for 12 months from the appointment date,
            then deleted.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Your rights
          </h2>
          <p>
            Under Moroccan law 09-08 on the protection of individuals with
            regard to personal data processing, you have the right to access,
            correct and delete your data. Contact us via WhatsApp at{" "}
            <span className="text-white">+212 7 10 38 82 04</span>.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Cookies
          </h2>
          <p>
            This site uses a technical language preference cookie (
            <span className="text-white font-mono text-xs">NEXT_LOCALE</span>
            ). This cookie collects no personal data and is not used for
            tracking or advertising. It is strictly necessary for the website to
            function and does not require your consent.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Technical processors
          </h2>
          <ul className="list-disc list-inside space-y-2 text-white/70">
            <li>
              <strong className="text-white">Supabase</strong> — booking storage
              (European servers)
            </li>
            <li>
              <strong className="text-white">Railway</strong> — website hosting
              (United States)
            </li>
            <li>
              <strong className="text-white">Resend</strong> — internal email
              notifications
            </li>
            <li>
              <strong className="text-white">Cloudflare</strong> — CDN, no
              personal data stored
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}

function PrivacyEs() {
  return (
    <main className="bg-nuit min-h-screen pt-[57px]">
      <div className="max-w-3xl mx-auto px-6 py-16 text-white/80 font-inter">
        <h1 className="font-georgia text-3xl font-bold text-white mb-2">
          Política de privacidad
        </h1>
        <p className="text-white/40 text-xs mb-10">
          Última actualización: mayo 2026
        </p>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Quiénes somos
          </h2>
          <p>
            Salon Mimi es un salón de peluquería afro ubicado en la Plaza Jemaa
            el-Fna, Medina, Marrakech 40000, Marruecos. Este sitio web es
            accesible en <span className="text-white">mimi-coiffure.com</span>.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Datos recopilados
          </h2>
          <p className="mb-3">Al realizar una reserva, recopilamos:</p>
          <ul className="list-disc list-inside space-y-1 text-white/70">
            <li>Nombre completo</li>
            <li>Número de teléfono / WhatsApp</li>
            <li>Servicio solicitado, fecha y hora</li>
            <li>Mensaje opcional</li>
          </ul>
          <p className="mt-3">
            Estos datos se envían directamente a Mimi para confirmar su cita. No
            se recopilan datos bancarios en este sitio.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Finalidad
          </h2>
          <p>
            Los datos recopilados se utilizan únicamente para la reserva de
            citas y la comunicación con el cliente a través de WhatsApp. No se
            utilizan con fines comerciales, publicitarios ni se transmiten a
            terceros.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Conservación de datos
          </h2>
          <p>
            Los datos de reserva se conservan durante 12 meses a partir de la
            fecha de la cita, luego se eliminan.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Sus derechos
          </h2>
          <p>
            De acuerdo con la ley marroquí 09-08, tiene derecho a acceder,
            rectificar y eliminar sus datos. Contáctenos por WhatsApp al{" "}
            <span className="text-white">+212 7 10 38 82 04</span>.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-ocre text-sm tracking-widest uppercase mb-3">
            Cookies
          </h2>
          <p>
            Este sitio utiliza una cookie técnica de preferencia de idioma (
            <span className="text-white font-mono text-xs">NEXT_LOCALE</span>
            ). Esta cookie no recopila datos personales y no se utiliza para
            rastreo o publicidad. Es estrictamente necesaria para el
            funcionamiento del sitio y no requiere su consentimiento.
          </p>
        </section>
      </div>
    </main>
  );
}
