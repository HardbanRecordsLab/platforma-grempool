import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  const publicOnly = request.nextUrl.searchParams.get("public") === "1";

  let query = supabase.from("realizations").select("*").order("data_realizacji", { ascending: false });
  if (publicOnly) query = query.eq("status", "publiczna");

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const body = await request.json();
  const { data, error } = await supabase.from("realizations").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
