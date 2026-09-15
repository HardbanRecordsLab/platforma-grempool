import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { sendNewLeadNotification } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  const supabase = createAdminClient();
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");

  let query = supabase.from("leads").select("*").order("data_kontaktu", { ascending: false });
  if (from) query = query.gte("preferowany_termin", from);
  if (to) query = query.lte("preferowany_termin", to);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const body = await request.json();

  const { data, error } = await supabase.from("leads").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  sendNewLeadNotification(data).catch(() => {});

  return NextResponse.json(data);
}
