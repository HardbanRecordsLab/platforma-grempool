import { createHash } from "node:crypto";
import { NextRequest, NextResponse, after } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// Public: one page view from the visitor's browser. No cookies and no IP
// address are stored; a visitor is a hash of IP + browser + today's date,
// so the same person can be counted once per day but not tracked further.

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse/i;

function device(ua: string) {
  if (/ipad|tablet/i.test(ua)) return "tablet";
  if (/mobi|iphone|android/i.test(ua)) return "telefon";
  return "komputer";
}

function source(referrer: unknown, host: string | null) {
  if (typeof referrer !== "string" || !referrer) return null;
  try {
    const hostname = new URL(referrer).hostname.replace(/^www\./, "");
    if (host && hostname === host.replace(/^www\./, "")) return null; // internal navigation
    return hostname.slice(0, 100);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOT.test(ua)) return NextResponse.json({ ok: true });

  const body = await request.json().catch(() => ({}));
  const path = typeof body.path === "string" && body.path.startsWith("/") ? body.path.slice(0, 200) : null;
  if (!path || path.startsWith("/admin")) return NextResponse.json({ ok: true });

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const day = new Date().toISOString().slice(0, 10);
  const visitor = createHash("sha256")
    .update(`${ip}|${ua}|${day}|${process.env.ADMIN_SESSION_SECRET ?? ""}`)
    .digest("base64url")
    .slice(0, 22);

  after(async () => {
    await createAdminClient()
      .from("page_views")
      .insert({ path, referrer: source(body.referrer, request.headers.get("host")), device: device(ua), visitor });
  });
  return NextResponse.json({ ok: true });
}
