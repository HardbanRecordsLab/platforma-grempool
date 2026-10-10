// Customer register (kartoteka klientów): regular scrap sellers, buyers of
// deliveries (steelworks and other companies) and customers of inquiries.
// A card is identified by the ID document number (private persons) or the
// NIP (companies), so the same person is never entered twice.

export type ClientType = "osoba" | "firma";

export interface Client {
  id: string;
  typ: ClientType;
  nazwa: string;
  dokument: string | null;
  adres: string | null;
  telefon: string | null;
  email: string | null;
  bdo: string | null;
  uwagi: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientOverview extends Omit<Client, "updated_at"> {
  receipts: number;
  kg: number;
  value: number;
  deliveries: number;
  last_activity: string | null;
}

export interface ClientInput {
  typ: ClientType;
  nazwa: string;
  dokument: string | null;
  adres: string | null;
  telefon: string | null;
  email: string | null;
  bdo: string | null;
  uwagi: string | null;
}

export const CLIENT_TYPE_LABEL: Record<ClientType, string> = { osoba: "Osoba prywatna", firma: "Firma" };

// "ABC 123456" and "abc123456" are the same document; "692-119-10-50" is "6921191050".
export const normalizeDocument = (value: string | null | undefined) =>
  (value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const optional = (value: unknown, max: number) => text(value, max) || null;

export function validateClient(
  input: unknown
): { ok: true; row: ClientInput & { dokument_norm: string | null } } | { ok: false; errors: string[] } {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const errors: string[] = [];

  const typ: ClientType = raw.typ === "firma" ? "firma" : "osoba";
  const nazwa = text(raw.nazwa, 200);
  if (!nazwa) errors.push(typ === "firma" ? "Podaj nazwę firmy" : "Podaj imię i nazwisko");

  const email = optional(raw.email, 120);
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.push("Nieprawidłowy adres e-mail");

  if (errors.length > 0) return { ok: false, errors };

  const dokument = optional(raw.dokument, 60);
  const norm = normalizeDocument(dokument);
  return {
    ok: true,
    row: {
      typ,
      nazwa,
      dokument,
      dokument_norm: norm || null,
      adres: optional(raw.adres, 200),
      telefon: optional(raw.telefon, 40),
      email,
      bdo: optional(raw.bdo, 30),
      uwagi: optional(raw.uwagi, 2000),
    },
  };
}

export const emptyClientForm = {
  typ: "osoba" as ClientType,
  nazwa: "",
  dokument: "",
  adres: "",
  telefon: "",
  email: "",
  bdo: "",
  uwagi: "",
};

export type ClientForm = typeof emptyClientForm;

export const clientToForm = (client: Client): ClientForm => ({
  typ: client.typ,
  nazwa: client.nazwa,
  dokument: client.dokument ?? "",
  adres: client.adres ?? "",
  telefon: client.telefon ?? "",
  email: client.email ?? "",
  bdo: client.bdo ?? "",
  uwagi: client.uwagi ?? "",
});
