import type { Lead } from "@/types";
import { SERVICE_LABELS } from "@/lib/supabase";

const RESEND_FROM = "GREMPOOL <powiadomienia@grempool.pl>";

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

// Form fields come from anonymous visitors, so they must not be able to
// inject markup or links into the owner's inbox.
export function escapeHtml(value: string | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type SendResult = { ok: true } | { ok: false; error: string };

// Sends to the owner's notification address unless another recipient is
// given (e.g. a receipt for a customer, with replies going to the owner).
export async function sendEmail(
  subject: string,
  html: string,
  options: { to?: string; replyTo?: string } = {}
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = options.to ?? process.env.NOTIFICATION_EMAIL;
  if (!apiKey || !to) return { ok: false, error: "Brak RESEND_API_KEY lub adresu odbiorcy" };

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
        subject,
        html,
        ...(options.replyTo ? { reply_to: options.replyTo } : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Resend notification failed:", res.status, body);
      return { ok: false, error: `Resend ${res.status}: ${body}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("Resend notification error:", err);
    return { ok: false, error: err instanceof Error ? err.message : "Błąd połączenia z Resend" };
  }
}

export async function sendNewLeadNotification(lead: Lead): Promise<void> {
  const usluga = SERVICE_LABELS[lead.usluga] ?? lead.usluga;
  const appUrl = getAppUrl();

  const html = `
    <div style="font-family: sans-serif; max-width: 480px;">
      <h2 style="color:#000000;">Nowe zapytanie: ${escapeHtml(lead.numer)}</h2>
      <p><strong>Usługa:</strong> ${usluga}</p>
      <p><strong>Klient:</strong> ${escapeHtml(lead.klient_imie)} ${escapeHtml(lead.klient_nazwisko)}</p>
      <p><strong>Telefon:</strong> <a href="tel:${escapeHtml(lead.klient_telefon)}">${escapeHtml(lead.klient_telefon)}</a></p>
      ${lead.klient_email ? `<p><strong>Email:</strong> ${escapeHtml(lead.klient_email)}</p>` : ""}
      <p><strong>Lokalizacja:</strong> ${escapeHtml(lead.lokalizacja)}</p>
      ${lead.opis ? `<p><strong>Opis:</strong> ${escapeHtml(lead.opis)}</p>` : ""}
      ${lead.notatki ? `<p><strong>Szczegóły:</strong> ${escapeHtml(lead.notatki)}</p>` : ""}
      ${appUrl ? `<p><a href="${appUrl}/admin/crm" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#f5b52c;color:#000000;text-decoration:none;border-radius:6px;font-weight:bold;">Otwórz w CRM</a></p>` : ""}
    </div>
  `;

  await sendEmail(`Nowe zapytanie ${lead.numer} — ${usluga}`, html);
}

export async function sendTestNotification(): Promise<SendResult> {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px;">
      <h2 style="color:#000000;">Test powiadomień GREMPOOL</h2>
      <p>To jest wiadomość testowa wysłana z panelu administracyjnego (Ustawienia).</p>
      <p>Skoro ją widzisz, powiadomienia o nowych zapytaniach i wiadomościach działają.</p>
    </div>
  `;
  return sendEmail("Test powiadomień GREMPOOL", html);
}

export async function sendContactMessageNotification(msg: ContactMessage): Promise<void> {
  const appUrl = getAppUrl();

  const html = `
    <div style="font-family: sans-serif; max-width: 480px;">
      <h2 style="color:#000000;">Nowa wiadomość z formularza kontaktowego</h2>
      <p><strong>Od:</strong> ${escapeHtml(msg.imie)} ${escapeHtml(msg.nazwisko)}</p>
      <p><strong>Email:</strong> ${escapeHtml(msg.email)}</p>
      ${msg.telefon ? `<p><strong>Telefon:</strong> <a href="tel:${escapeHtml(msg.telefon)}">${escapeHtml(msg.telefon)}</a></p>` : ""}
      <p><strong>Temat:</strong> ${escapeHtml(msg.temat)}</p>
      <p><strong>Wiadomość:</strong> ${escapeHtml(msg.wiadomosc)}</p>
      ${appUrl ? `<p><a href="${appUrl}/admin/wiadomosci" style="display:inline-block;margin-top:12px;padding:10px 20px;background:#f5b52c;color:#000000;text-decoration:none;border-radius:6px;font-weight:bold;">Otwórz w panelu</a></p>` : ""}
    </div>
  `;

  await sendEmail(`Nowa wiadomość kontaktowa od ${msg.imie} ${msg.nazwisko}`, html);
}
