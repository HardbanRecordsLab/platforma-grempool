// Price offers (oferty) for customers: shared by the editor, the printable
// offer and the API, which re-validates and recalculates the totals.

export type VatRate = "zw" | "8" | "23";

export interface OfferItem {
  opis: string;
  ilosc: number;
  jm: string;
  cena: number; // net unit price
}

export interface Offer {
  id: string;
  numer: string;
  lead_id: string | null;
  klient_nazwa: string;
  klient_email: string | null;
  klient_telefon: string | null;
  klient_adres: string | null;
  temat: string | null;
  pozycje: OfferItem[];
  vat: VatRate;
  suma_netto: number;
  suma_brutto: number;
  waznosc_dni: number;
  uwagi: string | null;
  wystawil: string | null;
  created_at: string;
}

export const VAT_OPTIONS: { value: VatRate; label: string }[] = [
  { value: "23", label: "VAT 23%" },
  { value: "8", label: "VAT 8%" },
  { value: "zw", label: "zw. (bez VAT)" },
];

export const UNITS = ["szt.", "kg", "t", "m", "m²", "m³", "h", "kurs", "usł."];

const round2 = (n: number) => Math.round(n * 100) / 100;

export const lineNet = (item: Pick<OfferItem, "ilosc" | "cena">) => round2((item.ilosc || 0) * (item.cena || 0));

export function offerTotals(items: Pick<OfferItem, "ilosc" | "cena">[], vat: VatRate) {
  const netto = round2(items.reduce((sum, item) => sum + lineNet(item), 0));
  const rate = vat === "zw" ? 0 : Number(vat) / 100;
  const podatek = round2(netto * rate);
  return { netto, podatek, brutto: round2(netto + podatek) };
}

export const formatPln = (value: number) =>
  `${value.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const num = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
};

export function validateOffer(
  input: unknown
): { ok: true; row: Omit<Offer, "id" | "numer" | "wystawil" | "created_at"> } | { ok: false; errors: string[] } {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const errors: string[] = [];

  const klient_nazwa = text(raw.klient_nazwa, 200);
  if (!klient_nazwa) errors.push("Podaj klienta");

  const pozycje: OfferItem[] = [];
  (Array.isArray(raw.pozycje) ? raw.pozycje : []).forEach((value, i) => {
    const item = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
    const opis = text(item.opis, 300);
    const ilosc = num(item.ilosc);
    const cena = num(item.cena);
    if (!opis && !(cena > 0)) return; // empty row
    if (!opis) errors.push(`Pozycja ${i + 1}: brak opisu`);
    if (!(ilosc > 0)) errors.push(`Pozycja ${i + 1}: ilość musi być większa od 0`);
    if (!(cena >= 0)) errors.push(`Pozycja ${i + 1}: nieprawidłowa cena`);
    pozycje.push({ opis, ilosc: Math.round(ilosc * 1000) / 1000, jm: text(item.jm, 10) || "szt.", cena: round2(cena) });
  });
  if (pozycje.length === 0) errors.push("Dodaj przynajmniej jedną pozycję");

  const vat: VatRate = raw.vat === "zw" || raw.vat === "8" ? raw.vat : "23";
  const waznosc = Math.round(num(raw.waznosc_dni));
  const email = text(raw.klient_email, 120);
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.push("Nieprawidłowy e-mail klienta");

  if (errors.length > 0) return { ok: false, errors };
  const totals = offerTotals(pozycje, vat);
  return {
    ok: true,
    row: {
      lead_id: typeof raw.lead_id === "string" && raw.lead_id ? raw.lead_id : null,
      klient_nazwa,
      klient_email: email || null,
      klient_telefon: text(raw.klient_telefon, 40) || null,
      klient_adres: text(raw.klient_adres, 200) || null,
      temat: text(raw.temat, 200) || null,
      pozycje,
      vat,
      suma_netto: totals.netto,
      suma_brutto: totals.brutto,
      waznosc_dni: waznosc > 0 && waznosc <= 365 ? waznosc : 14,
      uwagi: text(raw.uwagi, 2000) || null,
    },
  };
}

export function fromOfferRow(row: Record<string, unknown>): Offer {
  return {
    ...(row as unknown as Offer),
    suma_netto: Number(row.suma_netto ?? 0),
    suma_brutto: Number(row.suma_brutto ?? 0),
    pozycje: ((row.pozycje as OfferItem[]) ?? []).map((p) => ({ ...p, ilosc: Number(p.ilosc), cena: Number(p.cena) })),
  };
}
