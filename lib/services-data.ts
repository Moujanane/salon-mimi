export interface Service {
  id: string;
  category: "tresses" | "locks" | "soins";
  nameFr: string;
  nameEn: string;
  nameEs: string;
  durationFr: string;
  durationEn: string;
  durationEs: string;
  priceMad: number;
  priceEur: number;
  featured?: boolean;
}

export interface Package {
  id: string;
  nameFr: string;
  nameEn: string;
  nameEs: string;
  descFr: string;
  descEn: string;
  descEs: string;
  durationFr: string;
  durationEn: string;
  durationEs: string;
  priceMad: number;
  priceEur: number;
}

export const services: Service[] = [
  {
    id: "box-braids-medium",
    category: "tresses",
    nameFr: "Box Braids medium",
    nameEn: "Box Braids medium",
    nameEs: "Box Braids medianas",
    durationFr: "3–4h",
    durationEn: "3–4h",
    durationEs: "3–4h",
    priceMad: 550,
    priceEur: 52,
    featured: true,
  },
  {
    id: "box-braids-xl",
    category: "tresses",
    nameFr: "Box Braids XL / épaisse",
    nameEn: "Box Braids XL / thick",
    nameEs: "Box Braids XL / gruesas",
    durationFr: "2–3h",
    durationEn: "2–3h",
    durationEs: "2–3h",
    priceMad: 450,
    priceEur: 42,
  },
  {
    id: "knotless-braids",
    category: "tresses",
    nameFr: "Knotless Braids",
    nameEn: "Knotless Braids",
    nameEs: "Knotless Braids",
    durationFr: "4–5h",
    durationEn: "4–5h",
    durationEs: "4–5h",
    priceMad: 700,
    priceEur: 66,
    featured: true,
  },
  {
    id: "boho-braids",
    category: "tresses",
    nameFr: "Boho / Goddess Braids",
    nameEn: "Boho / Goddess Braids",
    nameEs: "Boho / Goddess Braids",
    durationFr: "3–4h",
    durationEn: "3–4h",
    durationEs: "3–4h",
    priceMad: 650,
    priceEur: 61,
    featured: true,
  },
  {
    id: "fulani-braids",
    category: "tresses",
    nameFr: "Fulani Braids + perles cauris",
    nameEn: "Fulani Braids + cowrie shells",
    nameEs: "Fulani Braids + perlas cauri",
    durationFr: "2–3h",
    durationEn: "2–3h",
    durationEs: "2–3h",
    priceMad: 500,
    priceEur: 47,
  },
  {
    id: "cornrows",
    category: "tresses",
    nameFr: "Cornrows full head",
    nameEn: "Cornrows full head",
    nameEs: "Cornrows cabeza completa",
    durationFr: "1–2h",
    durationEn: "1–2h",
    durationEs: "1–2h",
    priceMad: 300,
    priceEur: 28,
    featured: true,
  },
  {
    id: "mini-braids-enfant",
    category: "tresses",
    nameFr: "Mini braids enfant",
    nameEn: "Mini braids children",
    nameEs: "Mini trenzas niñas",
    durationFr: "1–2h",
    durationEn: "1–2h",
    durationEs: "1–2h",
    priceMad: 200,
    priceEur: 19,
  },
  {
    id: "depart-locks",
    category: "locks",
    nameFr: "Départ de locks (twist)",
    nameEn: "Starter locs (twist)",
    nameEs: "Inicio de rastas (twist)",
    durationFr: "4–6h",
    durationEn: "4–6h",
    durationEs: "4–6h",
    priceMad: 900,
    priceEur: 85,
  },
  {
    id: "retouche-locks",
    category: "locks",
    nameFr: "Retouche locks",
    nameEn: "Locs retouch",
    nameEs: "Retoque rastas",
    durationFr: "2–3h",
    durationEn: "2–3h",
    durationEs: "2–3h",
    priceMad: 450,
    priceEur: 42,
  },
  {
    id: "faux-locks",
    category: "locks",
    nameFr: "Faux Locks / Bohemian Locks",
    nameEn: "Faux Locs / Bohemian Locs",
    nameEs: "Faux Locks / Bohemian Locks",
    durationFr: "3–5h",
    durationEn: "3–5h",
    durationEs: "3–5h",
    priceMad: 750,
    priceEur: 71,
  },
  {
    id: "marley-twists",
    category: "locks",
    nameFr: "Marley Twists",
    nameEn: "Marley Twists",
    nameEs: "Marley Twists",
    durationFr: "3–4h",
    durationEn: "3–4h",
    durationEs: "3–4h",
    priceMad: 600,
    priceEur: 57,
  },
  {
    id: "crochet-braids",
    category: "locks",
    nameFr: "Crochet Braids",
    nameEn: "Crochet Braids",
    nameEs: "Crochet Braids",
    durationFr: "2–3h",
    durationEn: "2–3h",
    durationEs: "2–3h",
    priceMad: 500,
    priceEur: 47,
  },
  {
    id: "brushing-argan",
    category: "soins",
    nameFr: "Brushing naturel argan",
    nameEn: "Natural argan blowout",
    nameEs: "Brushing natural argán",
    durationFr: "—",
    durationEn: "—",
    durationEs: "—",
    priceMad: 200,
    priceEur: 19,
  },
  {
    id: "soin-argan",
    category: "soins",
    nameFr: "Soin argan seul",
    nameEn: "Argan treatment only",
    nameEs: "Tratamiento argán solo",
    durationFr: "1h",
    durationEn: "1h",
    durationEs: "1h",
    priceMad: 150,
    priceEur: 14,
  },
];

export const packages: Package[] = [
  {
    id: "boho-experience",
    nameFr: "Boho Experience",
    nameEn: "Boho Experience",
    nameEs: "Boho Experience",
    descFr:
      "Boho Braids + soin argan + photobooth instagrammable + thé à la menthe offert",
    descEn:
      "Boho Braids + argan treatment + instagrammable photobooth + mint tea included",
    descEs:
      "Boho Braids + tratamiento argán + photobooth instagrammable + té de menta incluido",
    durationFr: "4h",
    durationEn: "4h",
    durationEs: "4h",
    priceMad: 850,
    priceEur: 80,
  },
  {
    id: "faux-locks-perles",
    nameFr: "Faux Locks + bijoux perles",
    nameEn: "Faux Locs + pearl jewelry",
    nameEs: "Faux Locks + bisutería perlas",
    descFr:
      "Faux Locks + bijoux perles cauris + soin hydratant + thé à la menthe offert",
    descEn:
      "Faux Locs + cowrie pearl jewelry + hydrating treatment + mint tea included",
    descEs:
      "Faux Locks + bisutería cauri + tratamiento hidratante + té de menta incluido",
    durationFr: "5h",
    durationEn: "5h",
    durationEs: "5h",
    priceMad: 950,
    priceEur: 89,
  },
];

export function getServiceName(
  service: Service | Package,
  locale: string,
): string {
  if (locale === "en") return (service as any).nameEn;
  if (locale === "es") return (service as any).nameEs;
  return (service as any).nameFr;
}

export function getServiceDuration(service: Service, locale: string): string {
  if (locale === "en") return service.durationEn;
  if (locale === "es") return service.durationEs;
  return service.durationFr;
}

export function getPackageDuration(pkg: Package, locale: string): string {
  if (locale === "en") return pkg.durationEn;
  if (locale === "es") return pkg.durationEs;
  return pkg.durationFr;
}

export function getPackageDescription(pkg: Package, locale: string): string {
  if (locale === "en") return pkg.descEn;
  if (locale === "es") return pkg.descEs;
  return pkg.descFr;
}
