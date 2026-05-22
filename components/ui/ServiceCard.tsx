import Link from "next/link";

interface ServiceCardProps {
  name: string;
  duration: string;
  priceMad: number;
  priceEur: number;
  serviceId: string;
  locale: string;
  bookLabel: string;
}

export default function ServiceCard({
  name,
  duration,
  priceMad,
  priceEur,
  serviceId,
  locale,
  bookLabel,
}: ServiceCardProps) {
  return (
    <div className="bg-panneau rounded-2xl p-6 border border-ocre/20 hover:border-ocre/40 transition-colors">
      <h3 className="font-playfair text-lg text-white mb-2">{name}</h3>
      {duration !== "—" && (
        <p className="text-sm text-white/55 mb-4">{duration}</p>
      )}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-2xl font-bold text-ocre">{priceMad} MAD</span>
        <span className="text-sm text-white/50">~{priceEur}€</span>
      </div>
      <Link
        href={`/${locale}/reservation?service=${encodeURIComponent(serviceId)}`}
        className="block text-center bg-ocre text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-or transition-colors"
      >
        {bookLabel}
      </Link>
    </div>
  );
}
