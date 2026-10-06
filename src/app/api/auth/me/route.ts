import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_ROLE_LABELS, sessionUser } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const login = sessionUser(request.cookies.get(ADMIN_COOKIE)?.value);
  if (!login) return NextResponse.json({ error: "Niezalogowany" }, { status: 401 });
  return NextResponse.json({ login, label: ADMIN_ROLE_LABELS[login] ?? login });
}
