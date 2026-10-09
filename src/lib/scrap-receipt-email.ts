import { BUSINESS } from "@/lib/site";
import type { SiteSettings } from "@/lib/site-settings";
import { escapeHtml } from "@/lib/notifications";
import { formatKg, formatPln, type ScrapPurchase } from "@/lib/scrap-purchases";

// HTML version of the printed receipt, sent to the customer by e-mail.
export function receiptEmailHtml(p: ScrapPurchase, site: SiteSettings): string {
  const date = new Date(p.data).toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" });
  const rows = p.pozycje
    .map(
      (item, i) => `
      <tr>
        <td style="padding:6px;border-bottom:1px solid #ddd;">${i + 1}</td>
        <td style="padding:6px;border-bottom:1px solid #ddd;">${escapeHtml(item.nazwa)}<br><span style="color:#777;font-size:11px;">${escapeHtml(item.kod_odpadu)}</span></td>
        <td style="padding:6px;border-bottom:1px solid #ddd;text-align:right;">${formatKg(item.waga_kg)}</td>
        <td style="padding:6px;border-bottom:1px solid #ddd;text-align:right;">${formatPln(item.cena_kg)}/kg</td>
        <td style="padding:6px;border-bottom:1px solid #ddd;text-align:right;">${formatPln(item.wartosc)}</td>
      </tr>`
    )
    .join("");

  return `
  <div style="font-family:Arial,sans-serif;max-width:640px;color:#111;">
    <h2 style="margin:0 0 4px;">Kwit skupu ${escapeHtml(p.numer)}</h2>
    <p style="margin:0 0 16px;color:#555;">${escapeHtml(date)}</p>
    <table style="width:100%;margin-bottom:16px;font-size:13px;">
      <tr>
        <td style="vertical-align:top;width:50%;">
          <strong>Kupujący</strong><br>
          ${escapeHtml(BUSINESS.legalName)}<br>
          ${escapeHtml(site.streetAddress)}, ${escapeHtml(site.postalCode)} ${escapeHtml(site.addressLocality)}<br>
          NIP ${escapeHtml(BUSINESS.taxId)} · tel. ${escapeHtml(site.phone)}
        </td>
        <td style="vertical-align:top;">
          <strong>Sprzedający</strong><br>
          ${escapeHtml(p.sprzedawca_nazwa)}<br>
          ${p.sprzedawca_adres ? `${escapeHtml(p.sprzedawca_adres)}<br>` : ""}
          ${p.sprzedawca_dokument ? `${p.sprzedawca_typ === "firma" ? "NIP" : "Dokument"}: ${escapeHtml(p.sprzedawca_dokument)}` : ""}
        </td>
      </tr>
    </table>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead>
        <tr style="background:#f5b52c;">
          <th style="padding:6px;text-align:left;">Lp.</th>
          <th style="padding:6px;text-align:left;">Rodzaj</th>
          <th style="padding:6px;text-align:right;">Waga</th>
          <th style="padding:6px;text-align:right;">Cena</th>
          <th style="padding:6px;text-align:right;">Wartość</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="text-align:right;font-size:16px;margin:12px 0;"><strong>Razem: ${formatPln(p.suma)}</strong></p>
    <p style="font-size:13px;color:#555;">Płatność: ${p.platnosc === "przelew" ? "przelew" : "gotówka"}${
      p.nr_rejestracyjny ? ` · Pojazd: ${escapeHtml(p.nr_rejestracyjny)}` : ""
    }</p>
    <p style="font-size:12px;color:#777;margin-top:24px;">Dziękujemy za współpracę. ${escapeHtml(BUSINESS.legalName)}, ${escapeHtml(site.phone)}, ${escapeHtml(site.email)}</p>
  </div>`;
}
