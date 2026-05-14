import { getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  services,
  packages,
  getServiceName,
  getServiceDuration,
  getPackageDescription,
  getPackageDuration,
} from "@/lib/services-data";
import ServiceCard from "@/components/ui/ServiceCard";

const categoryLabels: Record<string, Record<string, string>> = {
  fr: {
    tresses: "Tresses",
    locks: "Locks & Twists",
    soins: "Soins & Packages",
  },
  en: {
    tresses: "Braids",
    locks: "Locks & Twists",
    soins: "Treatments & Packages",
  },
  es: {
    tresses: "Trenzas",
    locks: "Locks & Twists",
    soins: "Tratamientos y Paquetes",
  },
};

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  fr: {
    title: "Services & Tarifs",
    subtitle: "Tous les prix incluent les produits et accessoires",
  },
  en: {
    title: "Services & Prices",
    subtitle: "All prices include products and accessories",
  },
  es: {
    title: "Servicios & Precios",
    subtitle: "Todos los precios incluyen productos y accesorios",
  },
};

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const tBooking = await getTranslations({ locale, namespace: "booking" });
  const labels = categoryLabels[locale] ?? categoryLabels.fr;
  const pageTitle = pageTitles[locale] ?? pageTitles.fr;
  const categories = ["tresses", "locks", "soins"] as const;

  return (
    <div className="bg-fond min-h-screen">
      <div className="bg-nuit py-16 text-center">
        <h1 className="font-playfair text-5xl text-or">{pageTitle.title}</h1>
        <p className="text-white/60 mt-3">{pageTitle.subtitle}</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {categories.map((cat) => {
          const catServices = services.filter((s) => s.category === cat);

          if (cat === "soins") {
            return (
              <div key={cat} className="mb-16">
                <h2 className="font-playfair text-3xl text-brun mb-8 pb-3 border-b-2 border-or/30">
                  {labels[cat]}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  {catServices.map((service) => (
                    <ServiceCard
                      key={service.id}
                      name={getServiceName(service, locale)}
                      duration={getServiceDuration(service, locale)}
                      priceMad={service.priceMad}
                      priceEur={service.priceEur}
                      serviceId={service.id}
                      locale={locale}
                      bookLabel={tBooking("submit")}
                    />
                  ))}
                </div>
                <h3 className="font-playfair text-2xl text-brun mb-6">
                  {locale === "en"
                    ? "Packages"
                    : locale === "es"
                      ? "Paquetes"
                      : "Packages"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {packages.map((pkg) => {
                    const name = getServiceName(pkg, locale);
                    const desc = getPackageDescription(pkg, locale);
                    const duration = getPackageDuration(pkg, locale);
                    return (
                      <div
                        key={pkg.id}
                        className="bg-nuit rounded-2xl p-8 text-white"
                      >
                        <h4 className="font-playfair text-xl text-or mb-3">
                          {name}
                        </h4>
                        <p className="text-white/70 text-sm mb-4">{desc}</p>
                        <div className="flex items-baseline gap-2 mb-6">
                          <span className="text-3xl font-bold text-or">
                            {pkg.priceMad} MAD
                          </span>
                          <span className="text-white/50">
                            ~{pkg.priceEur}€
                          </span>
                          <span className="text-white/40 text-sm">
                            · {duration}
                          </span>
                        </div>
                        <Link
                          href={`/${locale}/reservation?service=${encodeURIComponent(pkg.id)}`}
                          className="inline-block bg-ocre text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-or transition-colors"
                        >
                          {tBooking("submit")}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          return (
            <div key={cat} className="mb-16">
              <h2 className="font-playfair text-3xl text-brun mb-8 pb-3 border-b-2 border-or/30">
                {labels[cat]}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {catServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    name={getServiceName(service, locale)}
                    duration={getServiceDuration(service, locale)}
                    priceMad={service.priceMad}
                    priceEur={service.priceEur}
                    serviceId={service.id}
                    locale={locale}
                    bookLabel={tBooking("submit")}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
