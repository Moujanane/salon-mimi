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
        <main className="max-w-6xl mx-auto px-4 py-10">{children}</main>
      </body>
    </html>
  );
}
