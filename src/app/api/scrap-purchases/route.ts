import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { ADMIN_COOKIE, sessionUser } from "@/lib/admin-auth";
import { fromScrapPurchaseRow, validateScrapPurchase } from "@/lib/scrap-purchases";

// Admin only (proxy.ts): the scrap purchase register.

export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");
  const supabase = createAdminClient();
  let query = supabase.from("scrap_purchases").select("*").order("data", { ascending: false }).limit(2000);
  if (from) query = query.gte("data", from);
  if (to) query = query.lt("data", to);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data.map(fromScrapPurchaseRow));
}

export async function POST(request: NextRequest) {
  const result = validateScrapPurchase(await request.json().catch(() => null));
  if (!result.ok) return NextResponse.json({ error: result.errors.join(". ") }, { status: 400 });

  const supabase = createAdminClient();
  const wystawil = await sessionUser(request.cookies.get(ADMIN_COOKIE)?.value);
  const { data, error } = await supabase
    .from("scrap_purchases")
    .insert({ ...result.row, wystawil })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(fromScrapPurchaseRow(data));
}
