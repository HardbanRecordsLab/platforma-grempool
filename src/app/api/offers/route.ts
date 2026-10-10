import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { ADMIN_COOKIE, sessionUser } from "@/lib/admin-auth";
import { fromOfferRow, validateOffer } from "@/lib/offers";

// Admin only (proxy.ts).

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("offers").select("*").order("created_at", { ascending: false }).limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data.map(fromOfferRow));
}

export async function POST(request: NextRequest) {
  const result = validateOffer(await request.json().catch(() => null));
  if (!result.ok) return NextResponse.json({ error: result.errors.join(". ") }, { status: 400 });
  const supabase = createAdminClient();
  let client_id: string | null = null;
  if (result.row.lead_id) {
    const { data: lead } = await supabase.from("leads").select("client_id").eq("id", result.row.lead_id).maybeSingle();
    client_id = lead?.client_id ?? null;
  }
  const { data, error } = await supabase
    .from("offers")
    .insert({ ...result.row, client_id, wystawil: await sessionUser(request.cookies.get(ADMIN_COOKIE)?.value) })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(fromOfferRow(data));
}
