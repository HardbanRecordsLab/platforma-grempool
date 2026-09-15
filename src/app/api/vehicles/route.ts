import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

const DATE_FIELDS = ["przeglad", "oc", "serwis"];

function normalizeDates(body: Record<string, unknown>) {
  const normalized = { ...body };
  for (const field of DATE_FIELDS) {
    if (normalized[field] === "") normalized[field] = null;
  }
  return normalized;
}

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("vehicles").select("*").order("nazwa", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const body = await request.json();
  const { data, error } = await supabase.from("vehicles").insert(normalizeDates(body)).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
