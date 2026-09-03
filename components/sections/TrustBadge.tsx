// Pas de note chiffrée ici : la vraie note Google (live) est affichée par le
// composant GoogleReviews plus bas. Un chiffre en dur se périmait (a affiché
// « 5/5 » alors que la fiche était à 4,2/13).
const items = {
  fr: [
    { icon: "⭐", text: "Avis clients vérifiés sur Google" },
    { icon: "📍", text: "Place Jemaa el-Fna, Marrakech" },
    { icon: "🌿", text: "Produits locaux 100% naturels" },
  ],
  en: [
    { icon: "⭐", text: "Verified client reviews on Google" },
    { icon: "📍", text: "Jemaa el-Fna Square, Marrakech" },
    { icon: "🌿", text: "100% natural local products" },
  ],
  es: [
    { icon: "⭐", text: "Reseñas de clientas verificadas en Google" },
    { icon: "📍", text: "Plaza Jemaa el-Fna, Marrakech" },
    { icon: "🌿", text: "Productos locales 100% naturales" },
  ],
};

export default function TrustBadge({ locale }: { locale: string }) {
  const data = items[locale as keyof typeof items] ?? items.fr;
  return (
    <section className="bg-nuit py-6">
      <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-8">
        {data.map((item) => (
          <div key={item.text} className="flex items-center gap-3 text-white">
            <span className="text-2xl">{item.icon}</span>
            <span className="text-sm font-medium">{item.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
