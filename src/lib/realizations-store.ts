import type { Realizacja } from "@/types";

async function parseOrThrow(res: Response) {
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Wystąpił błąd zapytania do bazy danych");
  return body;
}

export async function getRealizations(): Promise<Realizacja[]> {
  const res = await fetch("/api/realizations", { cache: "no-store" });
  return parseOrThrow(res);
}

export async function getPublicRealizations(): Promise<Realizacja[]> {
  const res = await fetch("/api/realizations?public=1", { cache: "no-store" });
  return parseOrThrow(res);
}

export type RealizationInput = Omit<Realizacja, "id" | "created_at" | "updated_at">;

export async function createRealization(data: RealizationInput): Promise<Realizacja> {
  const res = await fetch("/api/realizations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseOrThrow(res);
}

export async function updateRealization(id: string, data: Partial<RealizationInput>): Promise<Realizacja> {
  const res = await fetch(`/api/realizations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseOrThrow(res);
}

export async function deleteRealization(id: string): Promise<void> {
  const res = await fetch(`/api/realizations/${id}`, { method: "DELETE" });
  await parseOrThrow(res);
}
