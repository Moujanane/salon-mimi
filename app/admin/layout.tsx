// app/admin/layout.tsx
import "@/app/globals.css";

export const metadata = {
  title: "Admin — Salon Mimi",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-fond min-h-screen">
        <header className="bg-nuit text-white px-6 py-4 flex items-center justify-between">
          <span className="font-playfair text-or text-lg">
            Salon Mimi — Admin
          </span>
          <a
            href="/fr"
            className="text-xs text-white/50 hover:text-white transition-colors"
          >
            ← Retour au site
          </a>
        </header>
        <nav className="bg-white border-b border-gray-100 px-6">
          <div className="max-w-6xl mx-auto flex gap-6">
            <a
              href="/admin/dashboard"
              className="text-sm text-gray-600 hover:text-brun py-3 border-b-2 border-transparent hover:border-brun transition-colors"
            >
              Réservations
            </a>
            <a
              href="/admin/settings"
              className="text-sm text-gray-600 hover:text-brun py-3 border-b-2 border-transparent hover:border-brun transition-colors"
            >
              Paramètres
            </a>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-10">{children}</main>
      </body>
    </html>
  );
}
