import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { ADMIN_COOKIE, sessionUser } from "@/lib/admin-auth";
import { sendEmail } from "@/lib/notifications";
import { getSiteSettings } from "@/lib/site-settings-server";
import { clientEmailHtml } from "@/lib/client-email-html";

// Admin only (proxy.ts): e-mails to customers sent from the panel, with a log.

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref");
  if (!ref) return NextResponse.json({ error: "Brak parametru ref" }, { status: 400 });
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("client_emails")
    .select("id, recipient, subject, body, sent_by, created_at")
    .eq("ref_id", ref)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const kind = body.kind === "message" ? "message" : "lead";
  const to = typeof body.to === "string" ? body.to.trim() : "";
  const subject = typeof body.subject === "string" ? body.subject.trim().slice(0, 200) : "";
  const text = typeof body.body === "string" ? body.body.trim().slice(0, 10000) : "";
  const refId = typeof body.refId === "string" ? body.refId : null;

  if (!EMAIL.test(to)) return NextResponse.json({ error: "Nieprawidłowy adres e-mail klienta" }, { status: 400 });
  if (!subject || !text) return NextResponse.json({ error: "Uzupełnij temat i treść" }, { status: 400 });

  const site = await getSiteSettings();
  const result = await sendEmail(subject, clientEmailHtml(text, site), { to, replyTo: site.email });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });

  const supabase = createAdminClient();
  const sentBy = await sessionUser(request.cookies.get(ADMIN_COOKIE)?.value);
  await supabase.from("client_emails").insert({ kind, ref_id: refId, recipient: to, subject, body: text, sent_by: sentBy });
  if (refId && kind === "lead") {
    await supabase.from("leads").update({ data_ostatniego_kontaktu: new Date().toISOString() }).eq("id", refId);
  }
  if (refId && kind === "message") {
    await supabase.from("contact_messages").update({ status: "przeczytana" }).eq("id", refId);
  }
  return NextResponse.json({ ok: true });
}
