import Link from "next/link";
import { packages } from "@/lib/services-data";

export default function PackageSignature({
  locale,
  bookLabel,
}: {
  locale: string;
  bookLabel: string;
}) {
  const pkg = packages[0];
  const name =
    locale === "en" ? pkg.nameEn : locale === "es" ? pkg.nameEs : pkg.nameFr;
  const desc =
    locale === "en" ? pkg.descEn : locale === "es" ? pkg.descEs : pkg.descFr;
  const duration =
    locale === "en"
      ? pkg.durationEn
      : locale === "es"
        ? pkg.durationEs
        : pkg.durationFr;

  return (
    <section className="py-16 px-4 bg-fond">
      <div className="max-w-3xl mx-auto">
        <div className="bg-nuit rounded-3xl p-10 text-white relative overflow-hidden">
          <div className="absolute top-4 right-6 text-6xl opacity-10 font-playfair">
            ✦
          </div>
          <span className="text-xs uppercase tracking-widest text-or">
            Package signature
          </span>
          <h2 className="font-playfair text-3xl text-or mt-2 mb-4">{name}</h2>
          <p className="text-white/70 mb-6">{desc}</p>
          <div className="flex items-baseline gap-3 mb-8">
            <span className="text-4xl font-bold text-or">
              {pkg.priceMad} MAD
            </span>
            <span className="text-white/50">~{pkg.priceEur}€</span>
            <span className="text-white/55 text-sm">· {duration}</span>
          </div>
          <Link
            href={`/${locale}/reservation?service=${pkg.id}`}
            className="inline-block bg-ocre text-white px-8 py-3 rounded-full font-medium hover:bg-or transition-colors"
          >
            {bookLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
