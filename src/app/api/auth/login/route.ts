import { NextRequest, NextResponse } from "next/server";
import { checkCredentials, createSessionToken, isConfigured, sessionCookie } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  if (!isConfigured()) {
    return NextResponse.json({ error: "Logowanie nie jest skonfigurowane na serwerze" }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const login = typeof body.login === "string" ? body.login.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const token = (await checkCredentials(login, password)) ? await createSessionToken(login) : null;

  if (!token) {
    // Slows down password guessing.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return NextResponse.json({ error: "Nieprawidłowy login lub hasło" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookie(token));
  return response;
}
