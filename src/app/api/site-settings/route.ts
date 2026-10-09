import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase-admin";
import { SITE_SETTINGS_TAG, normalizeSiteSettings } from "@/lib/site-settings";

// Admin only (see proxy.ts): read and save the settings edited in Ustawienia.

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("site_settings").select("data, updated_at").eq("id", 1).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: normalizeSiteSettings(data?.data), updatedAt: data?.updated_at ?? null });
}

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }

  const settings = normalizeSiteSettings(body);
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("site_settings")
    .upsert({ id: 1, data: settings })
    .select("updated_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Pages are static; drop the cached settings and every rendered page so
  // the next visit shows the new values straight away.
  revalidateTag(SITE_SETTINGS_TAG, { expire: 0 });
  revalidatePath("/", "layout");

  return NextResponse.json({ settings, updatedAt: data.updated_at });
}
