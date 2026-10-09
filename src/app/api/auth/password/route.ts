import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  checkCredentials,
  createSessionToken,
  sessionCookie,
  sessionUser,
  setPassword,
} from "@/lib/admin-auth";

// Admin only: the logged-in user changes their own password. Other devices
// are logged out; this one gets a fresh session.
export async function POST(request: NextRequest) {
  const login = await sessionUser(request.cookies.get(ADMIN_COOKIE)?.value);
  if (!login) return NextResponse.json({ error: "Wymagane logowanie" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const current = typeof body.current === "string" ? body.current : "";
  const next = typeof body.next === "string" ? body.next : "";

  if (!(await checkCredentials(login, current))) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return NextResponse.json({ error: "Obecne hasło jest nieprawidłowe" }, { status: 400 });
  }
  if (next.length < 8) return NextResponse.json({ error: "Nowe hasło musi mieć co najmniej 8 znaków" }, { status: 400 });
  if (next === current) return NextResponse.json({ error: "Nowe hasło musi być inne niż obecne" }, { status: 400 });

  await setPassword(login, next);
  const token = await createSessionToken(login);
  const response = NextResponse.json({ ok: true });
  if (token) response.cookies.set(sessionCookie(token));
  return response;
}
