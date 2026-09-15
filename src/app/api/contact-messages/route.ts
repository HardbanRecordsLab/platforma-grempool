import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { sendContactMessageNotification } from "@/lib/notifications";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createAdminClient();
  const body = await request.json();
  const { data, error } = await supabase.from("contact_messages").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  sendContactMessageNotification(data).catch(() => {});

  return NextResponse.json(data);
}
