import type { CustomService } from "@/types";

interface CustomServiceRow {
  id: string;
  nazwa: string;
  opis: string | null;
  zdjecie: string | null;
  href: string | null;
  kolejnosc: number;
  aktywny: boolean;
  created_at: string;
  updated_at: string;
}

function fromRow(row: CustomServiceRow): CustomService {
  return {
    id: row.id,
    nazwa: row.nazwa,
    opis: row.opis ?? undefined,
    zdjecie: row.zdjecie ?? undefined,
    href: row.href ?? undefined,
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

export async function getCustomServices(): Promise<CustomService[]> {
  const res = await fetch("/api/services", { cache: "no-store" });
  const rows: CustomServiceRow[] = await parseOrThrow(res);
  return rows.map(fromRow);
}

export async function getActiveCustomServices(): Promise<CustomService[]> {
  const res = await fetch("/api/services?active=1", { cache: "no-store" });
  const rows: CustomServiceRow[] = await parseOrThrow(res);
  return rows.map(fromRow);
}

export type CustomServiceInput = Omit<CustomService, "id" | "utworzone" | "zaktualizowane">;

export async function createCustomService(data: CustomServiceInput): Promise<CustomService> {
  const res = await fetch("/api/services", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const row: CustomServiceRow = await parseOrThrow(res);
  return fromRow(row);
}

export async function updateCustomService(id: string, data: Partial<CustomServiceInput>): Promise<CustomService> {
  const res = await fetch(`/api/services/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const row: CustomServiceRow = await parseOrThrow(res);
  return fromRow(row);
}

export async function deleteCustomService(id: string): Promise<void> {
  const res = await fetch(`/api/services/${id}`, { method: "DELETE" });
  await parseOrThrow(res);
}
