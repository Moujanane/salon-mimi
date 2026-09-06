// app/api/gallery/order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthUser } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

type OrderEntry = { id: string; sort_order: number };

function isValidOrder(v: unknown): v is OrderEntry[] {
  return (
    Array.isArray(v) &&
    v.length > 0 &&
    v.every(
      (e) =>
        e &&
        typeof e === "object" &&
        typeof (e as OrderEntry).id === "string" &&
        Number.isInteger((e as OrderEntry).sort_order),
    )
  );
}

export async function PATCH(request: NextRequest) {
  const user = await getAuthUser();
  if (!user)
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const order = body?.order;

  if (!isValidOrder(order)) {
    return NextResponse.json(
      { error: "Corps invalide : { order: [{ id, sort_order }] }" },
      { status: 400 },
    );
  }

  for (const { id, sort_order } of order) {
    const { error } = await supabaseAdmin
      .from("gallery_items")
      .update({ sort_order })
      .eq("id", id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidateTag("gallery-items");
  return NextResponse.json({ success: true });
}
