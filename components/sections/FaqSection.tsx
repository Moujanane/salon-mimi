import { getFaq, FAQ_TITLE, type FaqLocale } from "@/lib/faq";
import { SALON } from "@/lib/salon-info";

const UPDATED_LABEL: Record<FaqLocale, string> = {
  fr: "Informations et tarifs mis à jour le",
  en: "Information and prices last updated on",
  es: "Información y precios actualizados el",
};

// Section FAQ visible de l'accueil. Les mêmes textes (lib/faq.ts) alimentent le
// balisage JSON-LD FAQPage injecté par app/[locale]/page.tsx. La date affichée
// est SALON.lastReviewed : la même que dateModified (JSON-LD) et le sitemap.
export default function FaqSection({ locale }: { locale: string }) {
  const l: FaqLocale = locale === "en" || locale === "es" ? locale : "fr";
  const items = getFaq(l);
  const updatedOn = new Date(
    `${SALON.lastReviewed}T00:00:00Z`,
  ).toLocaleDateString(l, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <section
      aria-labelledby="faq-title"
      className="bg-nuit border-t border-ocre/15 py-16 px-6 md:px-16"
    >
      <div className="max-w-3xl mx-auto">
        <h2
          id="faq-title"
          className="font-playfair text-3xl text-white text-center mb-10"
        >
          {FAQ_TITLE[l]}
        </h2>
        <dl className="flex flex-col gap-8">
          {items.map((item) => (
            <div key={item.question}>
              <dt className="font-playfair text-lg text-ocre mb-2">
                {item.question}
              </dt>
              <dd className="text-white/75 leading-relaxed">{item.answer}</dd>
            </div>
          ))}
        </dl>
        <p className="text-white/50 text-sm text-center mt-10">
          {UPDATED_LABEL[l]}{" "}
          <time dateTime={SALON.lastReviewed}>{updatedOn}</time>
        </p>
      </div>
    </section>
  );
}
