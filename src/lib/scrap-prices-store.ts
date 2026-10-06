import type { ScrapGroup, ScrapPrice } from "@/types";

export interface ScrapGroupInfo {
  value: ScrapGroup;
  label: string;
  note: string;
}

// Sections of the public price list, in display order.
export const SCRAP_GROUPS: ScrapGroupInfo[] = [
  { value: "stalowy", label: "Złom stalowy", note: "Możliwość negocjacji ceny przy ilości od 1 tony wzwyż." },
  { value: "kolorowy", label: "Złom kolorowy", note: "Możliwość negocjacji cen przy ilości powyżej 200 kg." },
];

export const formatScrapPrice = (price: ScrapPrice) =>
  `${price.cena_od.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${price.jednostka}`;

interface ScrapPriceRow {
  id: string;
  grupa: ScrapGroup;
  nazwa: string;
  cena_od: number | string;
  jednostka: string;
  kolejnosc: number;
  aktywny: boolean;
  created_at: string;
  updated_at: string;
}

function fromRow(row: ScrapPriceRow): ScrapPrice {
  return {
    id: row.id,
    grupa: row.grupa,
    nazwa: row.nazwa,
    cena_od: Number(row.cena_od),
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
