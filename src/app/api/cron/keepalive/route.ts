import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// Called once a day by Vercel Cron (vercel.json). Supabase pauses free
// projects after a week without database activity; one small query a day
// keeps the database awake even when nobody visits the site.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Brak dostępu" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { count, error } = await supabase.from("scrap_prices").select("id", { count: "exact", head: true });

  // Statistics are kept for 13 months.
  const cutoff = new Date(Date.now() - 395 * 86_400_000).toISOString();
  await supabase.from("page_views").delete().lt("created_at", cutoff);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, rows: count, at: new Date().toISOString() });
}
