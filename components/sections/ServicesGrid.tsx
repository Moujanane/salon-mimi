import ServiceCard from "@/components/ui/ServiceCard";
import {
  Service,
  getServiceName,
  getServiceDuration,
} from "@/lib/services-data";

interface ServicesGridProps {
  services: Service[];
  locale: string;
  bookLabel: string;
  showAll?: boolean;
}

export default function ServicesGrid({
  services,
  locale,
  bookLabel,
  showAll = true,
}: ServicesGridProps) {
  const title =
    {
      fr: showAll ? "Tous nos services" : "Services vedettes",
      en: showAll ? "All services" : "Featured services",
      es: showAll ? "Todos los servicios" : "Servicios destacados",
    }[locale] ?? "Services";

  return (
    <section className="py-16 px-4 bg-fond">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-playfair text-3xl text-brun text-center mb-12">
          {title}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              name={getServiceName(service, locale)}
              duration={getServiceDuration(service, locale)}
              priceMad={service.priceMad}
              priceEur={service.priceEur}
              serviceId={service.id}
              locale={locale}
              bookLabel={bookLabel}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
