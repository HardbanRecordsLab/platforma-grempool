import type { Lead } from "@/types";
import { SERVICE_LABELS } from "@/lib/supabase";

const RESEND_FROM = "GREMPOOL <onboarding@resend.dev>";

interface ContactMessage {
  id: string;
  imie: string;
  nazwisko: string;
  email: string;
  telefon?: string | null;
  temat: string;
  wiadomosc: string;
}

// Prefer Vercel's own production URL (set automatically, stays correct even after a
// custom domain is attached) over NEXT_PUBLIC_APP_URL, which locally points at localhost.
function getAppUrl(): string {
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.NEXT_PUBLIC_APP_URL?.startsWith("http")) return process.env.NEXT_PUBLIC_APP_URL;
  return "";
}

async function sendEmail(subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFICATION_EMAIL;
  if (!apiKey || !to) return;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: RESEND_FROM, to: [to], subject, html }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Resend notification failed:", res.status, body);
    }
  } catch (err) {
    console.error("Resend notification error:", err);
  }
}

export async function sendNewLeadNotification(lead: Lead): Promise<void> {
  const usluga = SERVICE_LABELS[lead.usluga] ?? lead.usluga;
  const appUrl = getAppUrl();

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

  await sendEmail(`Nowe zapytanie ${lead.numer} — ${usluga}`, html);
}

export async function sendContactMessageNotification(msg: ContactMessage): Promise<void> {
  const appUrl = getAppUrl();

  const html = `
    <div style="font-family: sans-serif; max-width: 480px;">
      <h2 style="color:#0f1419;">Nowa wiadomość z formularza kontaktowego</h2>
      <p><strong>Od:</strong> ${msg.imie} ${msg.nazwisko}</p>
      <p><strong>Email:</strong> ${msg.email}</p>
      ${msg.telefon ? `<p><strong>Telefon:</strong> <a href="tel:${msg.telefon}">${msg.telefon}</a></p>` : ""}
      <p><strong>Temat:</strong> ${msg.temat}</p>
      <p><strong>Wiadomość:</strong> ${msg.wiadomosc}</p>
      ${appUrl ? `<p><a href="${appUrl}/admin/wiadomosci" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#f0a500;color:#0f1419;text-decoration:none;border-radius:6px;font-weight:bold;">Otwórz w panelu</a></p>` : ""}
    </div>
  `;

  await sendEmail(`Nowa wiadomość kontaktowa od ${msg.imie} ${msg.nazwisko}`, html);
}
