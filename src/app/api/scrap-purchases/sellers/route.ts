import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// Admin only: clients from the customer register, most recently active first,
// so the receipt form can fill in their details. The vehicle is taken from
// the client's latest receipt.
export async function GET() {
  const supabase = createAdminClient();
  const [clients, receipts] = await Promise.all([
    supabase
      .from("clients")
      .select("id, typ, nazwa, dokument, adres, telefon, email")
      .order("updated_at", { ascending: false })
      .limit(500),
    supabase
      .from("scrap_purchases")
      .select("client_id, nr_rejestracyjny")
      .not("client_id", "is", null)
      .not("nr_rejestracyjny", "is", null)
      .order("data", { ascending: false })
      .limit(800),
  ]);
  if (clients.error) return NextResponse.json({ error: clients.error.message }, { status: 500 });

  const plate = new Map<string, string>();
  for (const r of receipts.data ?? []) if (!plate.has(r.client_id)) plate.set(r.client_id, r.nr_rejestracyjny);

  return NextResponse.json(
    (clients.data ?? []).map((c) => ({
      client_id: c.id,
      sprzedawca_typ: c.typ,
      sprzedawca_nazwa: c.nazwa,
      sprzedawca_dokument: c.dokument,
      sprzedawca_adres: c.adres,
      sprzedawca_telefon: c.telefon,
      sprzedawca_email: c.email,
      nr_rejestracyjny: plate.get(c.id) ?? null,
    }))
  );
}
