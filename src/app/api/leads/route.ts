import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { sendNewLeadNotification } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");

  let query = supabase.from("leads").select("*").order("data_kontaktu", { ascending: false });
  if (from) query = query.gte("preferowany_termin", from);
  if (to) query = query.lte("preferowany_termin", to);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// Fields the public quote form may set; everything else (status, numbers,
// assignments) is decided by the database or the admin panel.
const PUBLIC_LEAD_FIELDS = [
  "klient_imie",
  "klient_nazwisko",
  "klient_telefon",
  "klient_email",
  "usluga",
  "lokalizacja",
  "opis",
  "notatki",
  "preferowany_termin",
] as const;

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const body = await request.json().catch(() => ({}));

  const lead: Record<string, unknown> = { status: "nowy" };
  for (const field of PUBLIC_LEAD_FIELDS) {
    if (body[field] !== undefined) lead[field] = body[field];
  }

  const { data, error } = await supabase.from("leads").insert(lead).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (typeof body.material === "string" && /^MAT-\d+$/.test(body.material)) {
    await supabase.rpc("material_inquired", { p_code: body.material });
  }

  sendNewLeadNotification(data).catch(() => {});

  return NextResponse.json(data);
}
