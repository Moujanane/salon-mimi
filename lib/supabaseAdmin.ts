// lib/supabaseAdmin.ts
//
// ATTENTION : client Supabase avec SUPABASE_SERVICE_ROLE_KEY — il contourne
// ENTIÈREMENT les règles RLS de Postgres (lecture et écriture sur toutes les
// tables, sans restriction). Il est utilisé aussi bien par les routes
// publiques (ex. POST /api/reservations, GET /api/settings) que par les
// routes admin (ex. PATCH /api/settings, /api/gallery) : la sécurité de
// chaque route dépend donc UNIQUEMENT de son propre garde applicatif
// (getAuthUser()/checkMimiPin() appelé en tout début de handler), jamais de
// Supabase.
//
// Avant d'utiliser supabaseAdmin dans une nouvelle route :
//  - si la donnée est censée être publique (prix, disponibilité…), vérifier
//    explicitement qu'aucune donnée sensible ne peut fuiter par la même
//    requête (colonnes sélectionnées, filtres) ;
//  - si la donnée est sensible, appeler le garde d'authentification
//    approprié (lib/adminAuth.ts ou lib/mimiAuth.ts) et retourner avant
//    toute requête à ce client.
// Un garde manquant sur une seule route expose la base entière : il n'y a
// pas de filet de sécurité côté base de données.
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
