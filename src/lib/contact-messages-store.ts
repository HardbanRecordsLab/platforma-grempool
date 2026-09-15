import type { ContactMessage } from "@/types";

async function parseOrThrow(res: Response) {
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Wystąpił błąd zapytania do bazy danych");
  return body;
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const res = await fetch("/api/contact-messages", { cache: "no-store" });
  return parseOrThrow(res);
}

export type ContactMessageInput = {
  imie: string;
  nazwisko: string;
  email: string;
  telefon?: string;
  temat: string;
  wiadomosc: string;
};

export async function createContactMessage(data: ContactMessageInput): Promise<ContactMessage> {
  const res = await fetch("/api/contact-messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return parseOrThrow(res);
}

export async function updateContactMessageStatus(id: string, status: "nowa" | "przeczytana"): Promise<ContactMessage> {
  const res = await fetch(`/api/contact-messages/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return parseOrThrow(res);
}

export async function deleteContactMessage(id: string): Promise<void> {
  const res = await fetch(`/api/contact-messages/${id}`, { method: "DELETE" });
  await parseOrThrow(res);
}
