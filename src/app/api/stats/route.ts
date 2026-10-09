import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// Admin only (proxy.ts): visit statistics for the last N days.
export async function GET(request: NextRequest) {
  const days = Math.min(Math.max(Number(request.nextUrl.searchParams.get("days")) || 30, 1), 365);
  const { data, error } = await createAdminClient().rpc("page_view_stats", { p_days: days });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
