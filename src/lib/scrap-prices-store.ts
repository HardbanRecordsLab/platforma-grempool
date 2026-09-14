import type { ScrapPrice } from "@/types";

interface ScrapPriceRow {
  id: string;
  nazwa: string;
  cena_od: number;
  jednostka: string;
  kolejnosc: number;
  aktywny: boolean;
  created_at: string;
  updated_at: string;
}

function fromRow(row: ScrapPriceRow): ScrapPrice {
  return {
    id: row.id,
    nazwa: row.nazwa,
    cena_od: row.cena_od,
    jednostka: row.jednostka,
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

export async function getScrapPrices(): Promise<ScrapPrice[]> {
  const res = await fetch("/api/scrap-prices", { cache: "no-store" });
  const rows: ScrapPriceRow[] = await parseOrThrow(res);
  return rows.map(fromRow);
}

export async function getActiveScrapPrices(): Promise<ScrapPrice[]> {
  const res = await fetch("/api/scrap-prices?active=1", { cache: "no-store" });
  const rows: ScrapPriceRow[] = await parseOrThrow(res);
  return rows.map(fromRow);
}

export type ScrapPriceInput = Omit<ScrapPrice, "id" | "utworzone" | "zaktualizowane">;

export async function createScrapPrice(data: ScrapPriceInput): Promise<ScrapPrice> {
  const res = await fetch("/api/scrap-prices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const row: ScrapPriceRow = await parseOrThrow(res);
  return fromRow(row);
}

export async function updateScrapPrice(id: string, data: Partial<ScrapPriceInput>): Promise<ScrapPrice> {
  const res = await fetch(`/api/scrap-prices/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const row: ScrapPriceRow = await parseOrThrow(res);
  return fromRow(row);
}

export async function deleteScrapPrice(id: string): Promise<void> {
  const res = await fetch(`/api/scrap-prices/${id}`, { method: "DELETE" });
  await parseOrThrow(res);
}
