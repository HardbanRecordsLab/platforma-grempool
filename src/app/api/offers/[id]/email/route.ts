import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { ADMIN_COOKIE, sessionUser } from "@/lib/admin-auth";
import { BUSINESS } from "@/lib/site";
import { escapeHtml, sendEmail } from "@/lib/notifications";
import { getSiteSettings } from "@/lib/site-settings-server";
import { clientEmailHtml } from "@/lib/client-email-html";
import { formatPln, fromOfferRow, lineNet, offerTotals, VAT_OPTIONS } from "@/lib/offers";

// Admin only: e-mails the offer to the customer, with an optional message.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { message } = await request.json().catch(() => ({ message: "" }));
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("offers").select("*").eq("id", id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Nie ma takiej oferty" }, { status: 404 });

  const offer = fromOfferRow(data);
  if (!offer.klient_email) return NextResponse.json({ error: "Oferta nie ma adresu e-mail klienta" }, { status: 400 });

  const site = await getSiteSettings();
  const totals = offerTotals(offer.pozycje, offer.vat);
  const validUntil = new Date(new Date(offer.created_at).getTime() + offer.waznosc_dni * 86_400_000).toLocaleDateString("pl-PL");
  const rows = offer.pozycje
    .map(
      (item, i) => `<tr>
        <td style="padding:6px;border-bottom:1px solid #ddd;">${i + 1}</td>
        <td style="padding:6px;border-bottom:1px solid #ddd;">${escapeHtml(item.opis)}</td>
        <td style="padding:6px;border-bottom:1px solid #ddd;text-align:right;">${item.ilosc} ${escapeHtml(item.jm)}</td>
        <td style="padding:6px;border-bottom:1px solid #ddd;text-align:right;">${formatPln(item.cena)}</td>
        <td style="padding:6px;border-bottom:1px solid #ddd;text-align:right;">${formatPln(lineNet(item))}</td>
      </tr>`
    )
    .join("");
  const vatLabel = VAT_OPTIONS.find((v) => v.value === offer.vat)?.label ?? "";
  const table = `
    <h3 style="margin:20px 0 8px;">Oferta ${escapeHtml(offer.numer)}${offer.temat ? ` — ${escapeHtml(offer.temat)}` : ""}</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead><tr style="background:#f5b52c;">
        <th style="padding:6px;text-align:left;">Lp.</th><th style="padding:6px;text-align:left;">Opis</th>
        <th style="padding:6px;text-align:right;">Ilość</th><th style="padding:6px;text-align:right;">Cena netto</th>
        <th style="padding:6px;text-align:right;">Wartość netto</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="text-align:right;margin:10px 0 0;">Netto: ${formatPln(totals.netto)}${
      offer.vat === "zw" ? "" : `<br>${vatLabel}: ${formatPln(totals.podatek)}`
    }<br><strong style="font-size:16px;">Razem${offer.vat === "zw" ? "" : " brutto"}: ${formatPln(totals.brutto)}</strong></p>
    <p style="font-size:13px;color:#555;">Oferta ważna do ${validUntil}.${offer.uwagi ? `<br>${escapeHtml(offer.uwagi)}` : ""}</p>`;

  const intro =
    typeof message === "string" && message.trim()
      ? message.trim()
      : `Dzień dobry,\n\nw załączeniu przesyłamy ofertę ${offer.numer}. W razie pytań prosimy o kontakt: ${site.phone}.`;

  const subject = `Oferta ${offer.numer} — ${BUSINESS.name}`;
  const result = await sendEmail(subject, clientEmailHtml(intro, site, table), { to: offer.klient_email, replyTo: site.email });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 500 });

  await supabase.from("client_emails").insert({
    kind: "offer",
    ref_id: offer.lead_id ?? offer.id,
    recipient: offer.klient_email,
    subject,
    body: intro,
    sent_by: await sessionUser(request.cookies.get(ADMIN_COOKIE)?.value),
  });
  return NextResponse.json({ ok: true });
}
