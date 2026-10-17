import Link from "next/link";

type Item = string | { label: string; href: string };

// Bloc de contenu SEO générique : titre H2, paragraphe et/ou liste.
// - tone "dark"  : section pleine largeur sur fond nuit (accueil, contact, galerie)
// - tone "light" : bloc nu, à placer dans un conteneur existant (page À propos)
// Les textes viennent de lib/page-content.ts (calculés depuis le catalogue).
export default function InfoBlock({
  id,
  title,
  paragraph,
  intro,
  items,
  tone,
}: {
  id: string;
  title: string;
  paragraph?: string;
  intro?: string;
  items?: Item[];
  tone: "dark" | "light";
}) {
  const dark = tone === "dark";

  const body = (
    <>
      <h2
        id={id}
        className={
          dark
            ? "font-playfair text-3xl text-white text-center mb-6"
            : "font-playfair text-2xl text-brun mb-4"
        }
      >
        {title}
      </h2>
      {paragraph && (
        <p
          className={
            dark
              ? "text-white/75 leading-relaxed text-center"
              : "text-brun/80 text-base leading-relaxed"
          }
        >
          {paragraph}
        </p>
      )}
      {intro && (
        <p
          className={
            dark
              ? "text-white/75 leading-relaxed text-center mb-6"
              : "text-brun/80 text-base leading-relaxed mb-4"
          }
        >
          {intro}
        </p>
      )}
      {items && (
        <ul
          className={
            dark
              ? "list-disc pl-6 space-y-2 text-white/75 leading-relaxed marker:text-ocre"
              : "list-disc pl-6 space-y-2 text-brun/80 leading-relaxed marker:text-ocre"
          }
        >
          {items.map((it) => {
            const label = typeof it === "string" ? it : it.label;
            return (
              <li key={label}>
                {typeof it === "string" ? (
                  it
                ) : (
                  <Link
                    href={it.href}
                    className="underline decoration-ocre/60 underline-offset-4 hover:text-ocre transition-colors"
                  >
                    {it.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );

  if (!dark) {
    return <div>{body}</div>;
  }
  return (
    <section
      aria-labelledby={id}
      className="bg-nuit border-t border-ocre/15 py-16 px-6 md:px-16"
    >
      <div className="max-w-3xl mx-auto">{body}</div>
    </section>
  );
}
