import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// Admin only (proxy.ts): totals and breakdowns of scrap purchases for a
// period, calculated in the database (scrap_summary), so a whole year does
// not have to be downloaded to the browser.
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const from = new Date(params.get("from") ?? "");
  const to = new Date(params.get("to") ?? "");
  const bucket = params.get("bucket") ?? "day";
  const typ = params.get("typ");

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from) {
    return NextResponse.json({ error: "Nieprawidłowy zakres dat" }, { status: 400 });
  }
  if (to.getTime() - from.getTime() > 6 * 366 * 86_400_000) {
    return NextResponse.json({ error: "Zakres może obejmować najwyżej 6 lat" }, { status: 400 });
  }
  if (typ !== null && typ !== "osoba" && typ !== "firma") {
    return NextResponse.json({ error: "Nieprawidłowy typ sprzedającego" }, { status: 400 });
  }
  if (!["day", "week", "month"].includes(bucket)) {
    return NextResponse.json({ error: "Nieprawidłowy przedział" }, { status: 400 });
  }

  const { data, error } = await createAdminClient().rpc("scrap_summary", {
    p_from: from.toISOString(),
    p_to: to.toISOString(),
    p_bucket: bucket,
    p_type: typ,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
