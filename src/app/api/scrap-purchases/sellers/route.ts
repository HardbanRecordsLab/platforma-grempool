import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// Admin only: people who sold scrap recently, newest data first, so the
// receipt form can fill in their details the next time.
export async function GET() {
  const { data, error } = await createAdminClient()
    .from("scrap_purchases")
    .select("sprzedawca_typ, sprzedawca_nazwa, sprzedawca_dokument, sprzedawca_adres, sprzedawca_telefon, sprzedawca_email, nr_rejestracyjny")
    .order("data", { ascending: false })
    .limit(600);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const seen = new Set<string>();
  const sellers = (data ?? []).filter((row) => {
    const key = row.sprzedawca_nazwa.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return NextResponse.json(sellers.slice(0, 300));
}
