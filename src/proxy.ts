import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
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
  { method: "POST", path: "/api/materials/view" },
  { method: "POST", path: "/api/stats/view" },
  { method: "POST", path: "/api/upload/public" },
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

// Changes made in the panel go to the audit log (Dziennik zmian). Requests
// that change nothing worth tracking are skipped.
const NOT_AUDITED = ["/api/auth/", "/api/push/", "/api/stats/", "/api/materials/view", "/api/cron/"];

function audit(request: NextRequest, login: string, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;
  if (request.method === "GET" || NOT_AUDITED.some((p) => pathname.startsWith(p))) return;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  event.waitUntil(
    fetch(`${url}/rest/v1/audit_log`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ login, method: request.method, path: pathname.slice(0, 200) }),
    }).catch(() => {})
  );
}

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname, search } = request.nextUrl;
  const login = await sessionUser(request.cookies.get(ADMIN_COOKIE)?.value);

  if (pathname.startsWith("/api/")) {
    if (login) {
      audit(request, login, event);
      return NextResponse.next();
    }
    if (isPublicApi(request)) return NextResponse.next();
    return NextResponse.json({ error: "Wymagane logowanie do panelu" }, { status: 401 });
  }

  if (pathname === "/admin/login") {
    return login ? NextResponse.redirect(new URL("/admin/dashboard", request.url)) : NextResponse.next();
  }

  if (!login) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/:path*"],
};
