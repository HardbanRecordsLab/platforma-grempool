import { BUSINESS } from "@/lib/site";
import type { SiteSettings } from "@/lib/site-settings";
import { escapeHtml } from "@/lib/notifications";

// Wraps a plain-text message from the admin panel in a simple branded
// e-mail with the company signature.
export function clientEmailHtml(body: string, site: SiteSettings, extraHtml = ""): string {
  const paragraphs = escapeHtml(body)
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 14px;">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
  return `
  <div style="font-family:Arial,sans-serif;max-width:640px;color:#111;font-size:14px;line-height:1.5;">
    ${paragraphs}
    ${extraHtml}
    <div style="margin-top:24px;padding-top:14px;border-top:3px solid #f5b52c;font-size:13px;color:#444;">
      <strong style="color:#111;">${escapeHtml(BUSINESS.legalName)}</strong><br>
      ${escapeHtml(site.streetAddress)}, ${escapeHtml(site.postalCode)} ${escapeHtml(site.addressLocality)}<br>
      tel. ${escapeHtml(site.phone)} · ${escapeHtml(site.email)} · grempool.pl
    </div>
  </div>`;
}
