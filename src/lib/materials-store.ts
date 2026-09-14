import type { Material, MaterialStatus } from "@/types";

export const MATERIAL_CATEGORIES: { value: Material["kategoria"]; label: string }[] = [
  { value: "stal", label: "Stal użytkowa" },
  { value: "cegla", label: "Cegła" },
  { value: "okna", label: "Okna" },
  { value: "drzwi", label: "Drzwi" },
  { value: "inne", label: "Inne materiały" },
];

export const MATERIAL_CONDITIONS: { value: Material["stan"]; label: string }[] = [
  { value: "nowy", label: "Nowy" },
  { value: "dobry", label: "Dobry" },
  { value: "uzywany", label: "Używany" },
  { value: "uszkodzony", label: "Uszkodzony" },
];

export const MATERIAL_STATUSES: { value: MaterialStatus; label: string }[] = [
  { value: "dostepny", label: "Dostępny" },
  { value: "zarezerwowany", label: "Zarezerwowany" },
  { value: "sprzedany", label: "Sprzedany" },
  { value: "ukryty", label: "Ukryty" },
  { value: "do_weryfikacji", label: "Do weryfikacji" },
];

interface MaterialRow {
  id: string;
  id_materialu: string;
  kategoria: Material["kategoria"];
  nazwa: string;
  wymiary: string;
  dlugosc: number | null;
  ilosc: number;
  stan: Material["stan"];
  zdjecia: string[] | null;
  lokalizacja: string;
  cena: number | null;
  status: MaterialStatus;
  notatki: string | null;
  created_at: string;
  updated_at: string;
}

function fromRow(row: MaterialRow): Material {
  return {
    id: row.id,
    id_materialu: row.id_materialu,
    kategoria: row.kategoria,
    nazwa: row.nazwa,
    wymiary: row.wymiary,
    dlugosc: row.dlugosc ?? undefined,
    ilosc: row.ilosc,
    stan: row.stan,
    zdjecia: row.zdjecia ?? [],
    lokalizacja: row.lokalizacja,
    cena: row.cena ?? undefined,
    status: row.status,
    notatki: row.notatki ?? undefined,
    utworzone: row.created_at,
    zaktualizowane: row.updated_at,
  };
}

async function parseOrThrow(res: Response) {
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Wystąpił błąd zapytania do bazy danych");
  return body;
}

export async function getMaterials(): Promise<Material[]> {
  const res = await fetch("/api/materials", { cache: "no-store" });
  const rows: MaterialRow[] = await parseOrThrow(res);
  return rows.map(fromRow);
}

export async function getAvailableMaterials(): Promise<Material[]> {
  const res = await fetch("/api/materials?available=1", { cache: "no-store" });
  const rows: MaterialRow[] = await parseOrThrow(res);
  return rows.map(fromRow);
}

export type MaterialInput = Omit<Material, "id" | "id_materialu" | "utworzone" | "zaktualizowane">;

export async function createMaterial(data: MaterialInput): Promise<Material> {
  const res = await fetch("/api/materials", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const row: MaterialRow = await parseOrThrow(res);
  return fromRow(row);
}

export async function updateMaterial(id: string, data: Partial<MaterialInput>): Promise<Material> {
  const res = await fetch(`/api/materials/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const row: MaterialRow = await parseOrThrow(res);
  return fromRow(row);
}

export async function deleteMaterial(id: string): Promise<void> {
  const res = await fetch(`/api/materials/${id}`, { method: "DELETE" });
  await parseOrThrow(res);
}
