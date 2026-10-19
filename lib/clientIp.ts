// lib/clientIp.ts
//
// Clé de limitation de débit dérivée de l'adresse IP du visiteur.
//
// Une IPv4 est utilisée telle quelle. Pour une IPv6, on regroupe toutes les
// adresses d'un même préfixe /64 : un abonné reçoit en général tout un /64, donc
// sans ce regroupement un attaquant disposerait de 2^64 adresses et la limite ne
// servirait à rien (relecture sécurité du 19/10/2026).

function expandIpv6(ip: string): string[] | null {
  if (ip.includes(":::") || (ip.match(/::/g) ?? []).length > 1) return null;
  const [head, tail] = ip.split("::");
  const left = head ? head.split(":") : [];
  const right = tail !== undefined && tail ? tail.split(":") : [];
  const missing = 8 - left.length - right.length;
  const groups =
    tail === undefined
      ? left
      : [...left, ...Array(Math.max(missing, 0)).fill("0"), ...right];
  if (groups.length !== 8) return null;
  if (!groups.every((g) => /^[0-9a-f]{1,4}$/i.test(g))) return null;
  return groups.map((g) => g.toLowerCase().replace(/^0+(?=.)/, ""));
}

export function rateLimitIp(ip: string): string {
  const mapped = ip.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i);
  if (mapped) return mapped[1];
  if (!ip.includes(":")) return ip; // IPv4, "unknown", valeur inattendue
  const groups = expandIpv6(ip);
  if (!groups) return ip;
  return `${groups.slice(0, 4).join(":")}::/64`;
}
