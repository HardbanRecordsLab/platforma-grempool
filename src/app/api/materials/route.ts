import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  const availableOnly = request.nextUrl.searchParams.get("available") === "1";

  let query = supabase.from("materials").select("*").order("created_at", { ascending: false });
  if (availableOnly) query = query.eq("status", "dostepny");

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const body = await request.json();

  const { data, error } = await supabase.from("materials").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
