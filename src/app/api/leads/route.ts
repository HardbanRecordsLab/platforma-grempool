import { NextRequest, NextResponse, after } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { sendNewLeadNotification } from "@/lib/notifications";
import { sendPushToAdmins } from "@/lib/push";
import { PRIVACY_POLICY_VERSION } from "@/lib/privacy";
import { SERVICE_LABELS } from "@/lib/supabase";

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

  // The customer must have ticked the privacy policy checkbox; we keep when
  // and for which version of the policy.
  if (body.zgoda !== true) {
    return NextResponse.json({ error: "Zaznacz, że zapoznałeś(-aś) się z Polityką prywatności" }, { status: 400 });
  }

  const lead: Record<string, unknown> = {
    status: "nowy",
    zgoda_rodo_at: new Date().toISOString(),
    zgoda_rodo_wersja: PRIVACY_POLICY_VERSION,
  };
  for (const field of PUBLIC_LEAD_FIELDS) {
    if (body[field] !== undefined) lead[field] = body[field];
  }

  // Photos: only files uploaded to our own storage, at most 8.
  const photoBase = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");
  if (Array.isArray(body.zdjecia) && photoBase) {
    lead.zdjecia = body.zdjecia
      .filter((url: unknown): url is string => typeof url === "string" && url.startsWith(`${photoBase}/leads/`))
      .slice(0, 8);
  }

  const { data, error } = await supabase.from("leads").insert(lead).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (typeof body.material === "string" && /^MAT-\d+$/.test(body.material)) {
    await supabase.rpc("material_inquired", { p_code: body.material });
  }

  // after(): the function stays alive until e-mail and push are sent.
  after(async () => {
    await Promise.allSettled([
      sendNewLeadNotification(data),
      sendPushToAdmins({
        title: `Nowe zapytanie ${data.numer}`,
        body: `${SERVICE_LABELS[data.usluga] ?? data.usluga} · ${data.klient_imie} ${data.klient_nazwisko ?? ""} · ${data.klient_telefon}`.trim(),
        url: "/admin/crm",
      }),
    ]);
  });

  return NextResponse.json(data);
}
