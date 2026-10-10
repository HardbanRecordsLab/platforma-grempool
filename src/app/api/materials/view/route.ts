import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// Public: the listing page reports a view. The visitor is a one-way hash of
// IP, browser and today's date (no IP is stored), so a person is counted once
// per listing per day without cookies or browser storage.
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse/i;

export async function POST(request: NextRequest) {
  const { code } = await request.json().catch(() => ({ code: null }));
  if (typeof code !== "string" || !/^MAT-\d+$/.test(code)) {
    return NextResponse.json({ error: "Nieprawidłowy kod" }, { status: 400 });
  }
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOT.test(ua)) return NextResponse.json({ ok: true });

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const day = new Date().toISOString().slice(0, 10);
  const visitor = createHash("sha256")
    .update(`${ip}|${ua}|${day}|${process.env.ADMIN_SESSION_SECRET ?? ""}`)
    .digest("base64url")
    .slice(0, 22);

  await createAdminClient().rpc("material_viewed", { p_code: code, p_visitor: visitor });
  return NextResponse.json({ ok: true });
}
