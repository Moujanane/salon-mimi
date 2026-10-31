// lib/llms.ts
//
// Contenu de /llms.txt (résumé du site pour les moteurs IA). Généré depuis le
// catalogue (lib/services-data.ts) et les constantes du salon
// (lib/salon-info.ts) : aucun prix ni coordonnée n'est écrit en dur ici.
// Les horaires viennent de SALON.hours (tous les jours de 9h à 23h, confirmé
// par Mouj le 31 oct 2026), comme le JSON-LD.

import { services, packages } from "./services-data";
import { SALON } from "./salon-info";

/** « 09:00 » devient « 9h », « 23:00 » devient « 23h ». */
function hoursLabel(hhmm: string): string {
  const [h, m] = hhmm.split(":");
  return `${Number(h)}h${m === "00" ? "" : m}`;
}

export function llmsTxt(): string {
  const base = SALON.url;
  const all = [...services, ...packages];
  const min = SALON.priceRange.min;
  const max = Math.max(...all.map((i) => i.priceMad));

  const tarifs = all.map(
    (i) =>
      `- ${i.nameFr} : ${i.priceMad} MAD (~${i.priceEur} EUR), durée ${i.durationFr}`,
  );

  return [
    `# ${SALON.legalName}`,
    "",
    `> Salon de coiffure afro à Marrakech, ${SALON.address.streetAddress} (${SALON.address.neighborhood}) : tresses africaines, tresses rasta, box braids, knotless braids, locks et cornrows. Tarifs de ${min} à ${max} MAD. Réservation en ligne ou par WhatsApp. Dernière mise à jour : ${SALON.lastReviewed}.`,
    "",
    "## Pages principales",
    "",
    `- [Accueil](${base}/fr) : présentation du salon, services vedettes, avis Google, FAQ`,
    `- [Services et tarifs](${base}/fr/services) : toutes les prestations avec leur prix`,
    `- [Galerie](${base}/fr/galerie) : photos des réalisations`,
    `- [Réserver](${base}/fr/reservation) : prise de rendez-vous en ligne (confirmation par WhatsApp)`,
    `- [À propos](${base}/fr/a-propos) : Mimi, coiffeuse ivoirienne, et les produits naturels utilisés`,
    `- [Contact et accès](${base}/fr/contact) : adresse, WhatsApp, itinéraire`,
    "",
    "## Tarifs indicatifs (MAD)",
    "",
    ...tarifs,
    "",
    "## Coordonnées",
    "",
    `- Adresse : ${SALON.address.streetAddress}, ${SALON.address.neighborhood} de ${SALON.address.addressLocality}, ${SALON.address.postalCode}, Maroc`,
    `- Téléphone et WhatsApp : ${SALON.telephone}`,
    `- Horaires : tous les jours de ${hoursLabel(SALON.hours.opens)} à ${hoursLabel(SALON.hours.closes)}`,
    `- Langues du site : français, anglais, espagnol`,
    "",
    "## Autres langues",
    "",
    `- [English](${base}/en)`,
    `- [Español](${base}/es)`,
    "",
  ].join("\n");
}
