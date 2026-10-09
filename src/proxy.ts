import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, sessionUser } from "@/lib/admin-auth";

interface PublicEndpoint {
  method: string;
  path: string;
  // Required query parameter, so the public site only gets the filtered list.
  query?: [string, string];
}

// What the public website calls without logging in. Everything else under
// /api and every /admin page needs an admin session.
const PUBLIC_API: PublicEndpoint[] = [
  { method: "GET", path: "/api/materials", query: ["available", "1"] },
  { method: "GET", path: "/api/scrap-prices", query: ["active", "1"] },
  { method: "GET", path: "/api/services", query: ["active", "1"] },
  { method: "GET", path: "/api/social-channels", query: ["active", "1"] },
  { method: "POST", path: "/api/leads" },
  { method: "POST", path: "/api/contact-messages" },
  { method: "POST", path: "/api/auth/login" },
  { method: "POST", path: "/api/auth/logout" },
  // Daily database ping from Vercel Cron; the route checks CRON_SECRET itself.
  { method: "GET", path: "/api/cron/keepalive" },
];

const isPublicApi = (request: NextRequest) => {
  const { pathname, searchParams } = request.nextUrl;
  return PUBLIC_API.some(
    (e) =>
      e.method === request.method &&
      e.path === pathname &&
      (!e.query || searchParams.get(e.query[0]) === e.query[1])
  );
};

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const loggedIn = sessionUser(request.cookies.get(ADMIN_COOKIE)?.value) !== null;

  if (pathname.startsWith("/api/")) {
    if (loggedIn || isPublicApi(request)) return NextResponse.next();
    return NextResponse.json({ error: "Wymagane logowanie do panelu" }, { status: 401 });
  }

  if (pathname === "/admin/login") {
    return loggedIn ? NextResponse.redirect(new URL("/admin/dashboard", request.url)) : NextResponse.next();
  }

  if (!loggedIn) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/:path*"],
};
