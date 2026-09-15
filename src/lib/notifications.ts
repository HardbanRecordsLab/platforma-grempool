import type { Lead } from "@/types";
import { SERVICE_LABELS } from "@/lib/supabase";

const RESEND_FROM = "GREMPOOL <onboarding@resend.dev>";

export async function sendNewLeadNotification(lead: Lead): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFICATION_EMAIL;
  if (!apiKey || !to) return;

  const usluga = SERVICE_LABELS[lead.usluga] ?? lead.usluga;
  // Prefer Vercel's own production URL (set automatically, stays correct even after a
  // custom domain is attached) over NEXT_PUBLIC_APP_URL, which locally points at localhost.
  const appUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.NEXT_PUBLIC_APP_URL?.startsWith("http")
      ? process.env.NEXT_PUBLIC_APP_URL
      : "";

  const html = `
    <div style="font-family: sans-serif; max-width: 480px;">
      <h2 style="color:#0f1419;">Nowe zapytanie: ${lead.numer}</h2>
      <p><strong>Usługa:</strong> ${usluga}</p>
      <p><strong>Klient:</strong> ${lead.klient_imie} ${lead.klient_nazwisko}</p>
      <p><strong>Telefon:</strong> <a href="tel:${lead.klient_telefon}">${lead.klient_telefon}</a></p>
      ${lead.klient_email ? `<p><strong>Email:</strong> ${lead.klient_email}</p>` : ""}
      <p><strong>Lokalizacja:</strong> ${lead.lokalizacja}</p>
      ${lead.opis ? `<p><strong>Opis:</strong> ${lead.opis}</p>` : ""}
      ${lead.notatki ? `<p><strong>Szczegóły:</strong> ${lead.notatki}</p>` : ""}
      ${appUrl ? `<p><a href="${appUrl}/admin/crm" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#f0a500;color:#0f1419;text-decoration:none;border-radius:6px;font-weight:bold;">Otwórz w CRM</a></p>` : ""}
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [to],
        subject: `Nowe zapytanie ${lead.numer} — ${usluga}`,
        html,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Resend notification failed:", res.status, body);
    }
  } catch (err) {
    console.error("Resend notification error:", err);
  }
}
