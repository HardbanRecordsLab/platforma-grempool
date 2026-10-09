import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { ADMIN_COOKIE, sessionUser } from "@/lib/admin-auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const body = await request.json();

  const { data: before } = await supabase.from("scrap_prices").select("nazwa, cena_od").eq("id", id).maybeSingle();

  const { data, error } = await supabase.from("scrap_prices").update(body).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Price history: who changed which price, from what to what.
  if (before && Number(before.cena_od) !== Number(data.cena_od)) {
    await supabase.from("scrap_price_history").insert({
      scrap_price_id: id,
      nazwa: data.nazwa,
      cena_stara: before.cena_od,
      cena_nowa: data.cena_od,
      zmienil: sessionUser(request.cookies.get(ADMIN_COOKIE)?.value),
    });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { error } = await supabase.from("scrap_prices").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
