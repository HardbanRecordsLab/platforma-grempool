import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// Admin only: the latest price changes, newest first.
export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("scrap_price_history")
    .select("id, nazwa, cena_stara, cena_nowa, zmienil, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
