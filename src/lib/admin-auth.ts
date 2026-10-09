import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "grempool_admin";
export const SESSION_DAYS = 30;

export const ADMIN_ROLE_LABELS: Record<string, string> = {
  owner: "Właściciel",
  admin: "Administrator",
};

// Accounts come from ADMIN_USERS ("login:password;login2:password2"). Once a
// password is changed in the panel, its scrypt hash in admin_users takes
// precedence over the one from the environment.
function envUsers(): Map<string, string> {
  const map = new Map<string, string>();
  for (const entry of (process.env.ADMIN_USERS ?? "").split(";")) {
    const at = entry.indexOf(":");
    if (at > 0) map.set(entry.slice(0, at).trim(), entry.slice(at + 1));
  }
  return map;
}

export const isKnownLogin = (login: string) => envUsers().has(login);

interface StoredPassword {
  hash: string;
  updatedAt: string;
}

// Short per-instance cache so the proxy does not hit the database on every
// request; after a password change other instances notice within a minute.
const cache = new Map<string, { value: StoredPassword | null; expires: number }>();
const CACHE_MS = 60_000;

async function storedPassword(login: string, fresh = false): Promise<StoredPassword | null> {
  const hit = cache.get(login);
  if (!fresh && hit && hit.expires > Date.now()) return hit.value;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/admin_users?login=eq.${encodeURIComponent(login)}&select=password_hash,updated_at`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" }
    );
    if (!res.ok) return hit?.value ?? null;
    const rows: { password_hash: string; updated_at: string }[] = await res.json();
    const value = rows[0] ? { hash: rows[0].password_hash, updatedAt: rows[0].updated_at } : null;
    cache.set(login, { value, expires: Date.now() + CACHE_MS });
    return value;
  } catch {
    return hit?.value ?? null;
  }
}

const SCRYPT = { N: 16384, r: 8, p: 1 };

function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64, SCRYPT);
  return `scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

function verifyHash(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = scryptSync(password, Buffer.from(salt, "base64url"), expected.length, SCRYPT);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

const digest = (value: string) => createHmac("sha256", "grempool-admin").update(value).digest();

// A short fingerprint of the user's current password. It is part of every
// session token, so changing the password invalidates older sessions.
async function passwordStamp(login: string, fresh = false): Promise<string | null> {
  if (!isKnownLogin(login)) return null;
  const stored = await storedPassword(login, fresh);
  const source = stored ? `db:${stored.updatedAt}` : `env:${envUsers().get(login)}`;
  return createHash("sha256").update(source).digest("base64url").slice(0, 12);
}

function signingKey(login: string): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  return secret && isKnownLogin(login) ? `${secret}:${login}` : null;
}

const sign = (payload: string, key: string) => createHmac("sha256", key).update(payload).digest("base64url");

export function isConfigured(): boolean {
  return Boolean(process.env.ADMIN_SESSION_SECRET) && envUsers().size > 0;
}

export async function checkCredentials(login: string, password: string): Promise<boolean> {
  if (!isKnownLogin(login)) {
    // Same amount of work for unknown logins.
    timingSafeEqual(digest(password), digest("\u0000unknown-user"));
    return false;
  }
  const stored = await storedPassword(login);
  if (stored) return verifyHash(password, stored.hash);
  return timingSafeEqual(digest(password), digest(envUsers().get(login)!));
}

export async function setPassword(login: string, password: string): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const res = await fetch(`${url}/rest/v1/admin_users?on_conflict=login`, {
    method: "POST",
    headers: {
      apikey: key!,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({ login, password_hash: hashPassword(password), updated_at: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error("Nie udało się zapisać hasła");
  cache.delete(login);
}

export async function createSessionToken(login: string): Promise<string | null> {
  const key = signingKey(login);
  const stamp = await passwordStamp(login, true);
  if (!key || !stamp) return null;
  const payload = `${encodeURIComponent(login)}.${Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000}.${stamp}`;
  return `${payload}.${sign(payload, key)}`;
}

// Returns the logged-in login, or null when the session is missing or invalid.
export async function sessionUser(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const [encodedLogin, expires, stamp, signature] = token.split(".");
  if (!encodedLogin || !expires || !stamp || !signature || Number(expires) < Date.now()) return null;
  const login = decodeURIComponent(encodedLogin);
  const key = signingKey(login);
  if (!key) return null;
  const expected = Buffer.from(sign(`${encodedLogin}.${expires}.${stamp}`, key));
  const given = Buffer.from(signature);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;

  // The cache may be up to a minute old (and each server instance has its
  // own), so on a mismatch check the database before rejecting.
  const current = (await passwordStamp(login)) === stamp ? stamp : await passwordStamp(login, true);
  return current === stamp ? login : null;
}

export const sessionCookie = (token: string) => ({
  name: ADMIN_COOKIE,
  value: token,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_DAYS * 24 * 60 * 60,
});
