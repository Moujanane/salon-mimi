// app/api/reservations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getSettings } from "@/lib/settings";
import { generateWhatsAppLink } from "@/lib/whatsapp";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const maxRequests = 5;
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

const VALID_SERVICES = [
  "Tresses africaines",
  "Tresses et nattes",
  "Box braids",
  "Tresses Fulani",
  "Tresses Boho",
  "Locks & dreads",
  "Cheveux attachés",
  "Perruques et tissage",
  "Colorations capillaires",
  "Ongles, soins & épilation",
];

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Trop de tentatives, réessaie dans 10 minutes." },
      { status: 429 },
    );
  }

  const body = await request.json();
  const {
    nom,
    telephone,
    service,
    date_souhaitee,
    heure_souhaitee,
    nombre_personnes,
    message,
  } = body;

  if (
    !nom ||
    typeof nom !== "string" ||
    nom.trim().length < 2 ||
    nom.length > 100
  ) {
    return NextResponse.json({ error: "Nom invalide" }, { status: 400 });
  }
  if (
    !telephone ||
    typeof telephone !== "string" ||
    !/^\+?[\d\s\-().]{6,20}$/.test(telephone)
  ) {
    return NextResponse.json({ error: "Téléphone invalide" }, { status: 400 });
  }
  if (!service || !VALID_SERVICES.includes(service)) {
    return NextResponse.json({ error: "Service invalide" }, { status: 400 });
  }
  if (message && typeof message === "string" && message.length > 1000) {
    return NextResponse.json({ error: "Message trop long" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("reservations").insert({
    nom,
    telephone,
    service,
    date_souhaitee: date_souhaitee || null,
    heure_souhaitee: heure_souhaitee || null,
    nombre_personnes: nombre_personnes || null,
    message: message || null,
    statut: "en_attente",
  });

  if (error) {
    console.error("Erreur insertion réservation:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement" },
      { status: 500 },
    );
  }

  const settings = await getSettings();
  const whatsappLink = generateWhatsAppLink(
    {
      nom,
      telephone,
      service,
      dateSouhaitee: date_souhaitee
        ? `${date_souhaitee}${heure_souhaitee ? " à " + heure_souhaitee : ""}`
        : undefined,
      message:
        [
          nombre_personnes ? `Personnes : ${nombre_personnes}` : null,
          message || null,
        ]
          .filter(Boolean)
          .join(" — ") || undefined,
    },
    settings.whatsapp_number,
  );

  return NextResponse.json({ success: true, whatsappLink }, { status: 201 });
}
