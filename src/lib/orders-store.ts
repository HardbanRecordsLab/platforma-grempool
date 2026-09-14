import type { Zlecenie } from "@/types";

async function parseOrThrow(res: Response) {
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Wystąpił błąd zapytania do bazy danych");
  return body;
}

export async function getOrders(): Promise<Zlecenie[]> {
  const res = await fetch("/api/orders", { cache: "no-store" });
  return parseOrThrow(res);
}

export type OrderInput = {
  usluga: Zlecenie["usluga"];
  lokalizacja: string;
  zakres: string;
  termin: string;
  cena: number;
  status: Zlecenie["status"];
  pracownik?: string;
  notatki?: string;
  lead_id?: string;
};

export async function createOrder(data: OrderInput): Promise<Zlecenie> {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseOrThrow(res);
}

export async function updateOrder(id: string, data: Partial<OrderInput>): Promise<Zlecenie> {
  const res = await fetch(`/api/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseOrThrow(res);
}

export async function deleteOrder(id: string): Promise<void> {
  const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
  await parseOrThrow(res);
}
