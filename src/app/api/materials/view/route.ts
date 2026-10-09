import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// Public: the listing page reports one view per visitor session.
export async function POST(request: NextRequest) {
  const { code } = await request.json().catch(() => ({ code: null }));
  if (typeof code !== "string" || !/^MAT-\d+$/.test(code)) {
    return NextResponse.json({ error: "Nieprawidłowy kod" }, { status: 400 });
  }
  const supabase = createAdminClient();
  await supabase.rpc("material_viewed", { p_code: code });
  return NextResponse.json({ ok: true });
}
