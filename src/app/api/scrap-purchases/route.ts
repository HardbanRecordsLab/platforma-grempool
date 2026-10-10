import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { ADMIN_COOKIE, sessionUser } from "@/lib/admin-auth";
import { fromScrapPurchaseRow, validateScrapPurchase } from "@/lib/scrap-purchases";
import { linkClient } from "@/lib/clients-server";

// Admin only (proxy.ts): the scrap purchase register.

export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");
  const typ = request.nextUrl.searchParams.get("typ");
  const supabase = createAdminClient();
  let query = supabase.from("scrap_purchases").select("*").order("data", { ascending: false }).limit(2000);
  if (from) query = query.gte("data", from);
  if (to) query = query.lt("data", to);
  if (typ === "osoba" || typ === "firma") query = query.eq("sprzedawca_typ", typ);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data.map(fromScrapPurchaseRow));
}

export async function POST(request: NextRequest) {
  const result = validateScrapPurchase(await request.json().catch(() => null));
  if (!result.ok) return NextResponse.json({ error: result.errors.join(". ") }, { status: 400 });

  const supabase = createAdminClient();
  const wystawil = await sessionUser(request.cookies.get(ADMIN_COOKIE)?.value);

  // Every receipt adds to, or refreshes, the seller's card in the customer register.
  const row = result.row;
  const client_id = await linkClient(supabase, {
    typ: row.sprzedawca_typ,
    nazwa: row.sprzedawca_nazwa,
    dokument: row.sprzedawca_dokument,
    adres: row.sprzedawca_adres,
    telefon: row.sprzedawca_telefon,
    email: row.sprzedawca_email,
  });

  const { data, error } = await supabase
    .from("scrap_purchases")
    .insert({ ...row, wystawil, client_id })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(fromScrapPurchaseRow(data));
}
