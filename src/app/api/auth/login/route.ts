import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, SESSION_DAYS, checkCredentials, createSessionToken, isConfigured } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json({ error: "Logowanie nie jest skonfigurowane na serwerze" }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const login = typeof body.login === "string" ? body.login.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const token = checkCredentials(login, password) ? createSessionToken(login) : null;

  if (!token) {
    // Slows down password guessing.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return NextResponse.json({ error: "Nieprawidłowy login lub hasło" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return response;
}
