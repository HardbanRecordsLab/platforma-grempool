import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { validateClient } from "@/lib/clients";

type Ctx = { params: Promise<{ id: string }> };

// A client card together with everything done for that client.
export async function GET(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: client, error } = await supabase.from("clients").select("*").eq("id", id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!client) return NextResponse.json({ error: "Nie ma takiego klienta" }, { status: 404 });

  const [purchases, deliveries, offers, leads] = await Promise.all([
    supabase.from("scrap_purchases").select("id, numer, data, suma, platnosc, pozycje").eq("client_id", id).order("data", { ascending: false }).limit(300),
    supabase.from("scrap_deliveries").select("id, numer, data, suma, pozycje").eq("client_id", id).order("data", { ascending: false }).limit(300),
    supabase.from("offers").select("id, numer, created_at, temat, suma_brutto").eq("client_id", id).order("created_at", { ascending: false }).limit(100),
    supabase.from("leads").select("id, numer, usluga, status, data_kontaktu").eq("client_id", id).order("data_kontaktu", { ascending: false }).limit(100),
  ]);

  return NextResponse.json({
    client,
    purchases: purchases.data ?? [],
    deliveries: deliveries.data ?? [],
    offers: offers.data ?? [],
    leads: leads.data ?? [],
  });
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const result = validateClient(await request.json().catch(() => null));
  if (!result.ok) return NextResponse.json({ error: result.errors.join(". ") }, { status: 400 });

  const { data, error } = await createAdminClient().from("clients").update(result.row).eq("id", id).select().single();
  if (error) {
    const duplicate = error.code === "23505";
    return NextResponse.json(
      { error: duplicate ? "Inny klient ma już taki dokument lub NIP" : error.message },
      { status: duplicate ? 409 : 500 }
    );
  }
  return NextResponse.json(data);
}

// Deletes the card only. Receipts keep their own copy of the seller's data,
// because the regulations require keeping them for five years.
export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { error } = await createAdminClient().from("clients").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
