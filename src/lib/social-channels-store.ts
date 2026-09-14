import type { SocialChannel } from "@/types";

export const SOCIAL_PLATFORMS: { value: string; label: string }[] = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "google", label: "Google Profil Firmy" },
  { value: "olx", label: "OLX" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "inne", label: "Inny portal" },
];

interface SocialChannelRow {
  id: string;
  platforma: string;
  nazwa: string;
  url: string;
  opis: string | null;
  kolejnosc: number;
  aktywny: boolean;
  created_at: string;
  updated_at: string;
}

function fromRow(row: SocialChannelRow): SocialChannel {
  return {
    id: row.id,
    platforma: row.platforma,
    nazwa: row.nazwa,
    url: row.url,
    opis: row.opis ?? undefined,
    kolejnosc: row.kolejnosc,
    aktywny: row.aktywny,
    utworzone: row.created_at,
    zaktualizowane: row.updated_at,
  };
}

async function parseOrThrow(res: Response) {
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Wystąpił błąd zapytania do bazy danych");
  return body;
}

export async function getSocialChannels(): Promise<SocialChannel[]> {
  const res = await fetch("/api/social-channels", { cache: "no-store" });
  const rows: SocialChannelRow[] = await parseOrThrow(res);
  return rows.map(fromRow);
}

export async function getActiveSocialChannels(): Promise<SocialChannel[]> {
  const res = await fetch("/api/social-channels?active=1", { cache: "no-store" });
  const rows: SocialChannelRow[] = await parseOrThrow(res);
  return rows.map(fromRow);
}

export type SocialChannelInput = Omit<SocialChannel, "id" | "utworzone" | "zaktualizowane">;

export async function createSocialChannel(data: SocialChannelInput): Promise<SocialChannel> {
  const res = await fetch("/api/social-channels", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const row: SocialChannelRow = await parseOrThrow(res);
  return fromRow(row);
}

export async function updateSocialChannel(id: string, data: Partial<SocialChannelInput>): Promise<SocialChannel> {
  const res = await fetch(`/api/social-channels/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const row: SocialChannelRow = await parseOrThrow(res);
  return fromRow(row);
}

export async function deleteSocialChannel(id: string): Promise<void> {
  const res = await fetch(`/api/social-channels/${id}`, { method: "DELETE" });
  await parseOrThrow(res);
}
