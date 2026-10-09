import { DEFAULT_SITE_SETTINGS, SITE_SETTINGS_TAG, normalizeSiteSettings, type SiteSettings } from "@/lib/site-settings";

// Server-side read of the admin-editable settings. The response is cached
// and tagged, so pages stay static; saving in the admin panel revalidates
// the tag and the next visit renders the new values.
export async function getSiteSettings(): Promise<SiteSettings> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return DEFAULT_SITE_SETTINGS;

  try {
    const res = await fetch(`${url}/rest/v1/site_settings?id=eq.1&select=data`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "force-cache",
      next: { tags: [SITE_SETTINGS_TAG] },
    });
    if (!res.ok) return DEFAULT_SITE_SETTINGS;
    const rows: { data: unknown }[] = await res.json();
    return normalizeSiteSettings(rows[0]?.data);
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}
