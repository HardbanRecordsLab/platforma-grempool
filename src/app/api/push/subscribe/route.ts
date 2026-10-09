import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { ADMIN_COOKIE, sessionUser } from "@/lib/admin-auth";

// Admin only (proxy.ts): register or remove this device for push.

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const endpoint = body?.endpoint;
  const p256dh = body?.keys?.p256dh;
  const auth = body?.keys?.auth;
  if (typeof endpoint !== "string" || !endpoint.startsWith("https://") || typeof p256dh !== "string" || typeof auth !== "string") {
    return NextResponse.json({ error: "Nieprawidłowa subskrypcja" }, { status: 400 });
  }
  const supabase = createAdminClient();
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      endpoint,
      p256dh,
      auth,
      login: sessionUser(request.cookies.get(ADMIN_COOKIE)?.value),
      user_agent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
    },
    { onConflict: "endpoint" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (typeof body?.endpoint !== "string") return NextResponse.json({ error: "Brak endpointu" }, { status: 400 });
  const supabase = createAdminClient();
  await supabase.from("push_subscriptions").delete().eq("endpoint", body.endpoint);
  return NextResponse.json({ ok: true });
}
