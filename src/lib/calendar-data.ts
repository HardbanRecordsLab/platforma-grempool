import type { Zlecenie, Lead, Task } from "@/types";

export interface DayEvents {
  orders: Zlecenie[];
  leads: Lead[];
  tasks: Task[];
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Błąd zapytania");
  return body;
}

export async function fetchCalendarEvents(from: string, to: string): Promise<Record<string, DayEvents>> {
  const [orders, leads, tasks] = await Promise.all([
    fetchJSON<Zlecenie[]>(`/api/orders?from=${from}&to=${to}T23:59:59`),
    fetchJSON<Lead[]>(`/api/leads?from=${from}&to=${to}`),
    fetchJSON<Task[]>(`/api/tasks?from=${from}&to=${to}`),
  ]);

  const map: Record<string, DayEvents> = {};
  const bucket = (day: string) => (map[day] ??= { orders: [], leads: [], tasks: [] });
  orders.forEach((o) => bucket(o.termin.slice(0, 10)).orders.push(o));
  leads.forEach((l) => {
    if (l.preferowany_termin) bucket(l.preferowany_termin.slice(0, 10)).leads.push(l);
  });
  tasks.forEach((t) => bucket(t.data.slice(0, 10)).tasks.push(t));
  return map;
}

export const pad = (n: number) => String(n).padStart(2, "0");
export const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
