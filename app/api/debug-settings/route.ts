// app/api/debug-settings/route.ts — À SUPPRIMER APRÈS DIAGNOSTIC
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const report: Record<string, unknown> = {
    url_present: !!url,
    service_key_present: !!key,
    anon_key_present: !!anonKey,
    url_prefix: url?.slice(0, 30),
  };

  if (url && key) {
    const client = createClient(url, key);
    const { data, error } = await client.from("settings").select("key, value");
    report.service_role_data = data;
    report.service_role_error = error?.message ?? null;
  }

  if (url && anonKey) {
    const client = createClient(url, anonKey);
    const { data, error } = await client.from("settings").select("key, value");
    report.anon_data = data;
    report.anon_error = error?.message ?? null;
  }

  return NextResponse.json(report);
}
