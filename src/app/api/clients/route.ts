import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { validateClient } from "@/lib/clients";

// Admin only (proxy.ts): the customer register.

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim().slice(0, 100) || null;
  const typ = request.nextUrl.searchParams.get("typ");
  const { data, error } = await createAdminClient().rpc("clients_overview", {
    p_q: q,
    p_typ: typ === "osoba" || typ === "firma" ? typ : null,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const result = validateClient(await request.json().catch(() => null));
  if (!result.ok) return NextResponse.json({ error: result.errors.join(". ") }, { status: 400 });

  const { data, error } = await createAdminClient().from("clients").insert(result.row).select().single();
  if (error) {
    const duplicate = error.code === "23505";
    return NextResponse.json(
      { error: duplicate ? "Klient z takim dokumentem lub NIP-em już jest w kartotece" : error.message },
      { status: duplicate ? 409 : 500 }
    );
  }
  return NextResponse.json(data);
}
