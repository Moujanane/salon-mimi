import Link from "next/link";

interface HeroProps {
  locale: string;
  title: string;
  subtitle: string;
  location: string;
  ctaBook: string;
  ctaServices: string;
}

export default function Hero({
  locale,
  title,
  subtitle,
  location,
  ctaBook,
  ctaServices,
}: HeroProps) {
  return (
    <section className="relative bg-nuit min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url('/images/hero-salon.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-nuit/60 via-nuit/40 to-nuit/80" />
      <div className="relative z-10 text-center text-white px-4 max-w-3xl mx-auto">
        <p className="text-or text-sm tracking-widest uppercase mb-4">
          {location}
        </p>
        <h1 className="font-playfair text-5xl md:text-7xl font-bold text-or mb-4">
          {title}
        </h1>
        <p className="font-playfair text-2xl md:text-3xl italic text-white/80 mb-10">
          {subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/${locale}/reservation`}
            className="bg-ocre text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-or transition-colors"
          >
            {ctaBook}
          </Link>
          <Link
            href={`/${locale}/services`}
            className="border-2 border-white/40 text-white px-8 py-4 rounded-full font-medium text-lg hover:border-or hover:text-or transition-colors"
          >
            {ctaServices}
          </Link>
        </div>
      </div>
    </section>
  );
}
