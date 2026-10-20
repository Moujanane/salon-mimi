// app/admin/acces-refuse/page.tsx
//
// Affichée à un compte CONNECTÉ mais non reconnu comme administrateur (au lieu
// d'une redirection muette vers la connexion). Explique la raison sans jamais
// révéler la liste des administrateurs : on n'affiche que l'e-mail du visiteur
// lui-même et le NOMBRE d'adresses configurées.
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminStatus } from "@/lib/adminAuth";

export const metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AccesRefusePage() {
  const { user, decision } = await getAdminStatus();
  if (!user) redirect("/admin/login");
  if (decision.admin) redirect("/admin/dashboard");

  const explications = {
    "no-user": "Aucun e-mail n'est associé à ce compte.",
    "no-list":
      "Aucune adresse administrateur n'est configurée sur le serveur (variable ADMIN_EMAILS absente ou vide). Si tu viens de la définir dans Railway, redéploie le site : une variable n'est prise en compte qu'au redéploiement suivant.",
    "not-confirmed":
      "L'adresse e-mail de ce compte n'est pas confirmée dans Supabase (Authentication > Users).",
    "not-in-list": `Cette adresse ne figure pas parmi les ${decision.configured} adresse(s) administrateur configurée(s) (variable ADMIN_EMAILS). Vérifie l'orthographe : elle doit être identique à l'e-mail de connexion.`,
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center max-w-lg mx-auto">
      <h1 className="font-playfair text-3xl text-brun mb-4">Accès refusé</h1>
      <p className="text-gray-700 mb-2">
        Tu es connecté avec <strong>{user.email}</strong>, mais ce compte
        n&apos;a pas accès à l&apos;administration.
      </p>
      <p className="text-gray-600 text-sm mb-8">
        {explications[decision.reason]}
      </p>
      <Link
        href="/admin/login"
        className="text-sm text-brun underline underline-offset-4 hover:text-ocre"
      >
        Retour à la connexion
      </Link>
    </div>
  );
}
