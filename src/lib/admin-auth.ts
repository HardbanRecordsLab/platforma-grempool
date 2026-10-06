import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "grempool_admin";
export const SESSION_DAYS = 30;

export const ADMIN_ROLE_LABELS: Record<string, string> = {
  owner: "Właściciel",
  admin: "Administrator",
};

// ADMIN_USERS holds "login:password" pairs separated by semicolons,
// e.g. "owner:secret1;admin:secret2".
function users(): Map<string, string> {
  const map = new Map<string, string>();
  for (const entry of (process.env.ADMIN_USERS ?? "").split(";")) {
    const at = entry.indexOf(":");
    if (at > 0) map.set(entry.slice(0, at).trim(), entry.slice(at + 1));
  }
  return map;
}

// The user's password is part of the signing key, so changing it logs that
// user out on every device that still holds an old session.
function signingKey(login: string): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const password = users().get(login);
  return secret && password ? `${secret}:${login}:${password}` : null;
}

function sign(payload: string, key: string) {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

const digest = (value: string) => createHmac("sha256", "grempool-admin").update(value).digest();

export function isConfigured(): boolean {
  return Boolean(process.env.ADMIN_SESSION_SECRET) && users().size > 0;
}

export function checkCredentials(login: string, password: string): boolean {
  const expected = users().get(login);
  // Compare against a dummy value for unknown logins so both cases take the same time.
  const ok = timingSafeEqual(digest(password), digest(expected ?? "\u0000unknown-user"));
  return ok && expected !== undefined;
}

export function createSessionToken(login: string): string | null {
  const key = signingKey(login);
  if (!key) return null;
  const payload = `${encodeURIComponent(login)}.${Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000}`;
  return `${payload}.${sign(payload, key)}`;
}

// Returns the logged-in login, or null when the session is missing or invalid.
export function sessionUser(token: string | undefined): string | null {
  if (!token) return null;
  const [encodedLogin, expires, signature] = token.split(".");
  if (!encodedLogin || !expires || !signature || Number(expires) < Date.now()) return null;
  const login = decodeURIComponent(encodedLogin);
  const key = signingKey(login);
  if (!key) return null;
  const expected = Buffer.from(sign(`${encodedLogin}.${expires}`, key));
  const given = Buffer.from(signature);
  return given.length === expected.length && timingSafeEqual(given, expected) ? login : null;
}
