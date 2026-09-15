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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const body = await request.json();
  const { data, error } = await supabase.from("vehicles").update(normalizeDates(body)).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("vehicles").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
