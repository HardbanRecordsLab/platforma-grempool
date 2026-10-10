import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { ADMIN_COOKIE, sessionUser } from "@/lib/admin-auth";
import { fromScrapDeliveryRow, validateScrapDelivery } from "@/lib/scrap-deliveries";
import { linkClient } from "@/lib/clients-server";

// Admin only (proxy.ts): deliveries (sales) of scrap to steelworks and other buyers.

export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");
  let query = createAdminClient().from("scrap_deliveries").select("*").order("data", { ascending: false }).limit(2000);
  if (from) query = query.gte("data", from);
  if (to) query = query.lt("data", to);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data.map(fromScrapDeliveryRow));
}

export async function POST(request: NextRequest) {
  const result = validateScrapDelivery(await request.json().catch(() => null));
  if (!result.ok) return NextResponse.json({ error: result.errors.join(". ") }, { status: 400 });

  const supabase = createAdminClient();
  const row = result.row;

  // The buyer joins the customer register as a company.
  const client_id = await linkClient(supabase, {
    typ: "firma",
    nazwa: row.odbiorca_nazwa,
    dokument: row.odbiorca_nip,
    adres: row.odbiorca_adres,
    bdo: row.odbiorca_bdo,
  });

  const { data, error } = await supabase
    .from("scrap_deliveries")
    .insert({ ...row, client_id, wystawil: await sessionUser(request.cookies.get(ADMIN_COOKIE)?.value) })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(fromScrapDeliveryRow(data));
}
