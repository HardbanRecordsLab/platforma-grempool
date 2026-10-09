import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { fromOfferRow, validateOffer } from "@/lib/offers";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("offers").select("*").eq("id", id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Nie ma takiej oferty" }, { status: 404 });
  return NextResponse.json(fromOfferRow(data));
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const result = validateOffer(await request.json().catch(() => null));
  if (!result.ok) return NextResponse.json({ error: result.errors.join(". ") }, { status: 400 });
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("offers").update(result.row).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(fromOfferRow(data));
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("offers").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
