// app/admin/crm/page.tsx
import { cookies } from "next/headers";

export const metadata = {
  robots: { index: false, follow: false },
};
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import CrmDashboard from "@/components/admin/CrmDashboard";

export default async function CrmPage() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    },
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user || authError) {
    redirect("/admin/login");
  }

  const [
    { data: leads, error: leadsError },
    { data: deals, error: dealsError },
  ] = await Promise.all([
    supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("deals").select("*"),
  ]);

  if (leadsError || dealsError) {
    return (
      <div className="text-red-600 text-center py-10">
        Erreur : {leadsError?.message ?? dealsError?.message}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-playfair text-3xl text-brun">CRM</h1>
        <span className="text-sm text-gray-500">
          {leads?.length ?? 0} leads
        </span>
      </div>
      <CrmDashboard leads={leads ?? []} deals={deals ?? []} />
    </div>
  );
}
