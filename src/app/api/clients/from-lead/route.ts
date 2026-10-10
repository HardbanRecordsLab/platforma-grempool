import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// Admin only: creates (or finds) the client card for a CRM inquiry and links them.
export async function POST(request: NextRequest) {
  const { leadId } = await request.json().catch(() => ({ leadId: null }));
  if (typeof leadId !== "string") return NextResponse.json({ error: "Brak zapytania" }, { status: 400 });

  const supabase = createAdminClient();
  const { data: lead, error } = await supabase.from("leads").select("*").eq("id", leadId).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!lead) return NextResponse.json({ error: "Nie ma takiego zapytania" }, { status: 404 });
  if (lead.client_id) return NextResponse.json({ id: lead.client_id });

  const nazwa = `${lead.klient_imie ?? ""} ${lead.klient_nazwisko && lead.klient_nazwisko !== "-" ? lead.klient_nazwisko : ""}`.trim();
  const telefon: string = lead.klient_telefon ?? "";

  // The same person asking again (same name and phone) gets the same card.
  const { data: existing } = await supabase
    .from("clients")
    .select("id")
    .eq("typ", "osoba")
    .eq("telefon", telefon)
    .ilike("nazwa", nazwa.replace(/[\\%_]/g, (c) => `\\${c}`))
    .limit(1)
    .maybeSingle();

  let clientId = existing?.id as string | undefined;
  if (!clientId) {
    const { data: created, error: insertError } = await supabase
      .from("clients")
      .insert({
        typ: "osoba",
        nazwa: nazwa || "Klient z formularza",
        telefon: telefon || null,
        email: lead.klient_email || null,
        adres: lead.lokalizacja || null,
      })
      .select("id")
      .single();
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
    clientId = created.id;
  }

  await supabase.from("leads").update({ client_id: clientId }).eq("id", leadId);
  return NextResponse.json({ id: clientId });
}
