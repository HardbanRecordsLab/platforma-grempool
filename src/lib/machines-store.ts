import type { Maszyna } from "@/types";

async function parseOrThrow(res: Response) {
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Wystąpił błąd zapytania do bazy danych");
  return body;
}

export async function getMachines(): Promise<Maszyna[]> {
  const res = await fetch("/api/machines", { cache: "no-store" });
  return parseOrThrow(res);
}

export type MachineInput = Omit<Maszyna, "id" | "created_at" | "updated_at">;

export async function createMachine(data: MachineInput): Promise<Maszyna> {
  const res = await fetch("/api/machines", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseOrThrow(res);
}

export async function updateMachine(id: string, data: Partial<MachineInput>): Promise<Maszyna> {
  const res = await fetch(`/api/machines/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseOrThrow(res);
}

export async function deleteMachine(id: string): Promise<void> {
  const res = await fetch(`/api/machines/${id}`, { method: "DELETE" });
  await parseOrThrow(res);
}
