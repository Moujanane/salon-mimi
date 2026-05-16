import Link from "next/link";

interface CTAFinalProps {
  locale: string;
  title: string;
  ctaBook: string;
  whatsappNumber: string;
}

export default function CTAFinal({
  locale,
  title,
  ctaBook,
  whatsappNumber,
}: CTAFinalProps) {
  return (
    <section className="bg-nuit border-t border-ocre/18 py-20 px-4 text-center">
      <h2 className="font-playfair text-4xl text-white mb-8">{title}</h2>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href={`/${locale}/reservation`}
          className="bg-ocre text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-or transition-colors"
        >
          {ctaBook}
        </Link>
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="border-2 border-white text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-white hover:text-ocre transition-colors"
        >
          WhatsApp
        </a>
      </div>
    </section>
  );
}
