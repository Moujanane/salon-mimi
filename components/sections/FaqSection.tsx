import { getFaq, FAQ_TITLE, type FaqLocale } from "@/lib/faq";

// Section FAQ visible de l'accueil. Les mêmes textes (lib/faq.ts) alimentent le
// balisage JSON-LD FAQPage injecté par app/[locale]/page.tsx.
export default function FaqSection({ locale }: { locale: string }) {
  const l: FaqLocale = locale === "en" || locale === "es" ? locale : "fr";
  const items = getFaq(l);

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
      </div>
    </section>
  );
}
