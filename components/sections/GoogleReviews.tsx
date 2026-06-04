import { getGoogleReviews } from "@/lib/google-reviews";

const MAPS_URL = "https://share.google/t4j91V4ZgAESOoNwp";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i <= rating ? "text-or" : "text-white/20"}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default async function GoogleReviews({ locale }: { locale: string }) {
  const data = await getGoogleReviews();
  if (!data || data.reviews.length === 0) return null;

  const topReviews = data.reviews
    .filter((r) => r.rating >= 4 && r.text?.trim().length > 20)
    .slice(0, 3);

  if (topReviews.length === 0) return null;

  const labels: Record<
    string,
    { title: string; cta: string; badge: string; reviewsCount: string }
  > = {
    fr: {
      title: "Ce que disent nos clientes",
      cta: "Voir tous les avis",
      badge: "Avis Google",
      reviewsCount: "avis",
    },
    en: {
      title: "What our clients say",
      cta: "See all reviews",
      badge: "Google Reviews",
      reviewsCount: "reviews",
    },
    es: {
      title: "Lo que dicen nuestras clientas",
      cta: "Ver todas las reseñas",
      badge: "Reseñas Google",
      reviewsCount: "reseñas",
    },
  };
  const { title, cta, badge, reviewsCount } = labels[locale] ?? labels.fr;

  return (
    <section className="bg-nuit py-16 px-6 md:px-14">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-10 max-w-4xl">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-7 h-px bg-ocre flex-shrink-0" />
            <span className="text-ocre text-[11px] tracking-[3px] uppercase font-inter">
              {badge}
            </span>
          </div>
          <h2 className="font-playfair text-2xl text-white">{title}</h2>
        </div>
        {/* Note globale + logo Google */}
        <a
          href={MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 group"
        >
          <div className="flex items-center gap-2">
            {/* Logo Google SVG */}
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-white font-bold text-xl">
              {data.rating.toFixed(1)}
            </span>
          </div>
          <Stars rating={Math.round(data.rating)} />
          <span className="text-white/40 text-[10px] font-inter group-hover:text-ocre transition-colors">
            {data.user_ratings_total} {reviewsCount}
          </span>
        </a>
      </div>

      {/* Cartes avis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
        {topReviews.map((review, i) => (
          <div
            key={i}
            className="bg-brun rounded-xl p-5 border border-ocre/10 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <Stars rating={review.rating} />
              <span className="text-white/35 text-[10px] font-inter">
                {review.relative_time_description}
              </span>
            </div>
            <p className="text-white/75 text-sm font-inter leading-relaxed line-clamp-4">
              &ldquo;{review.text}&rdquo;
            </p>
            <p className="text-ocre text-[11px] font-inter tracking-wide mt-auto">
              — {review.author_name}
            </p>
          </div>
        ))}
      </div>

      {/* CTA vers fiche Google — obligatoire CGU */}
      <a
        href={MAPS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 mt-8 text-white/45 text-[11px] font-inter hover:text-ocre transition-colors"
      >
        <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {cta} sur Google
      </a>
    </section>
  );
}
