// components/ui/EmailNonMasque.tsx
//
// Affiche contact@mimi-coiffure.com en l'excluant du masquage d'e-mails de
// Cloudflare (Scrape Shield > Email Address Obfuscation). Sans cela, Cloudflare
// remplace l'adresse par un lien /cdn-cgi/l/email-protection qui répond 404
// aux robots (signalé par Search Console, handoff §47bis).
// Syntaxe officielle : <!--email_off--> ... <!--/email_off-->
// https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/
//
// Chaîne fixe (aucune donnée visiteur) : dangerouslySetInnerHTML sans risque.

export const CONTACT_EMAIL = "contact@mimi-coiffure.com";

export default function EmailNonMasque({ className }: { className?: string }) {
  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{
        __html: `<!--email_off-->${CONTACT_EMAIL}<!--/email_off-->`,
      }}
    />
  );
}
