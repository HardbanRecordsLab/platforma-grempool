import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { fromScrapDeliveryRow } from "@/lib/scrap-deliveries";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { data, error } = await createAdminClient().from("scrap_deliveries").select("*").eq("id", id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Nie ma takiego dokumentu" }, { status: 404 });
  return NextResponse.json(fromScrapDeliveryRow(data));
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { error } = await createAdminClient().from("scrap_deliveries").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
