import type { Pojazd } from "@/types";

async function parseOrThrow(res: Response) {
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Wystąpił błąd zapytania do bazy danych");
  return body;
}

export async function getVehicles(): Promise<Pojazd[]> {
  const res = await fetch("/api/vehicles", { cache: "no-store" });
  return parseOrThrow(res);
}

export type VehicleInput = Omit<Pojazd, "id" | "created_at" | "updated_at">;

export async function createVehicle(data: VehicleInput): Promise<Pojazd> {
  const res = await fetch("/api/vehicles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseOrThrow(res);
}

export async function updateVehicle(id: string, data: Partial<VehicleInput>): Promise<Pojazd> {
  const res = await fetch(`/api/vehicles/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseOrThrow(res);
}

export async function deleteVehicle(id: string): Promise<void> {
  const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
  await parseOrThrow(res);
}
