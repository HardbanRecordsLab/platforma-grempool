// Deliveries of scrap to steelworks and other buyers (sprzedaż / dostawy):
// shared by the form, the printed delivery document and the API, which
// re-validates and recalculates everything it stores.

import { WASTE_CODES, guessWasteCode } from "@/lib/scrap-purchases";

export interface ScrapDeliveryItem {
  nazwa: string; // kind / grade, e.g. "Złom stalowy E3"
  kod_odpadu: string;
  waga_kg: number;
  cena_kg: number; // optional: 0 when the price is settled later
  wartosc: number;
}

export interface ScrapDelivery {
  id: string;
  numer: string;
  data: string;
  odbiorca_nazwa: string;
  odbiorca_nip: string | null;
  odbiorca_adres: string | null;
  odbiorca_bdo: string | null;
  nr_zamowienia: string | null;
  nr_rejestracyjny: string | null;
  przewoznik: string | null;
  numer_kpo: string | null;
  waga_brutto: number | null;
  waga_tara: number | null;
  pozycje: ScrapDeliveryItem[];
  suma: number;
  oswiadczenie_czystosci: boolean;
  uwagi: string | null;
  wystawil: string | null;
  client_id: string | null;
  created_at: string;
}

export const CLEAN_STATEMENT =
  "Oświadczam, że przekazywany złom nie zawiera materiałów wybuchowych, substancji promieniotwórczych, zamkniętych zbiorników ani innych niebezpiecznych zanieczyszczeń.";

const round = (value: number, digits: number) => Math.round(value * 10 ** digits) / 10 ** digits;

export const deliveryItemValue = (item: Pick<ScrapDeliveryItem, "waga_kg" | "cena_kg">) =>
  round((item.waga_kg || 0) * (item.cena_kg || 0), 2);

export const deliveryTotalValue = (items: Pick<ScrapDeliveryItem, "waga_kg" | "cena_kg">[]) =>
  round(items.reduce((sum, item) => sum + deliveryItemValue(item), 0), 2);

export const deliveryTotalWeight = (items: Pick<ScrapDeliveryItem, "waga_kg">[]) =>
  round(items.reduce((sum, item) => sum + (item.waga_kg || 0), 0), 3);

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const optional = (value: unknown, max: number) => text(value, max) || null;
const num = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
};

export function validateScrapDelivery(
  input: unknown
): { ok: true; row: Omit<ScrapDelivery, "id" | "numer" | "wystawil" | "client_id" | "created_at"> } | { ok: false; errors: string[] } {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const errors: string[] = [];

  const odbiorca_nazwa = text(raw.odbiorca_nazwa, 200);
  if (!odbiorca_nazwa) errors.push("Podaj odbiorcę (nazwa huty lub firmy)");

  const date = raw.data ? new Date(String(raw.data)) : new Date();
  if (Number.isNaN(date.getTime())) errors.push("Nieprawidłowa data");

  const pozycje: ScrapDeliveryItem[] = [];
  (Array.isArray(raw.pozycje) ? raw.pozycje : []).forEach((value, i) => {
    const item = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
    const nazwa = text(item.nazwa, 120);
    const rawKg = num(item.waga_kg);
    const rawPrice = item.cena_kg === "" || item.cena_kg == null ? 0 : num(item.cena_kg);
    if (!nazwa && !rawKg) return; // empty row left in the form
    if (!nazwa) errors.push(`Pozycja ${i + 1}: brak rodzaju złomu`);
    if (!(rawKg > 0)) errors.push(`Pozycja ${i + 1}: masa musi być większa od 0`);
    if (!(rawPrice >= 0)) errors.push(`Pozycja ${i + 1}: nieprawidłowa cena`);
    const kod = text(item.kod_odpadu, 12);
    const waga_kg = round(rawKg, 3);
    const cena_kg = round(Number.isFinite(rawPrice) ? rawPrice : 0, 2);
    pozycje.push({
      nazwa,
      kod_odpadu: WASTE_CODES.some((w) => w.code === kod) ? kod : guessWasteCode(nazwa),
      waga_kg,
      cena_kg,
      wartosc: deliveryItemValue({ waga_kg, cena_kg }),
    });
  });
  if (pozycje.length === 0) errors.push("Dodaj przynajmniej jedną pozycję");
  if (pozycje.length > 30) errors.push("Maksymalnie 30 pozycji na dokumencie");

  const brutto = raw.waga_brutto === "" || raw.waga_brutto == null ? null : num(raw.waga_brutto);
  const tara = raw.waga_tara === "" || raw.waga_tara == null ? null : num(raw.waga_tara);
  if (brutto !== null && !(brutto > 0)) errors.push("Waga brutto musi być liczbą");
  if (tara !== null && !(tara >= 0)) errors.push("Tara musi być liczbą");
  if (brutto !== null && tara !== null && tara > brutto) errors.push("Tara nie może być większa od wagi brutto");

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    row: {
      data: date.toISOString(),
      odbiorca_nazwa,
      odbiorca_nip: optional(raw.odbiorca_nip, 30),
      odbiorca_adres: optional(raw.odbiorca_adres, 200),
      odbiorca_bdo: optional(raw.odbiorca_bdo, 30),
      nr_zamowienia: optional(raw.nr_zamowienia, 60),
      nr_rejestracyjny: optional(raw.nr_rejestracyjny, 20)?.toUpperCase() ?? null,
      przewoznik: optional(raw.przewoznik, 120),
      numer_kpo: optional(raw.numer_kpo, 60),
      waga_brutto: brutto === null ? null : round(brutto, 1),
      waga_tara: tara === null ? null : round(tara, 1),
      pozycje,
      suma: deliveryTotalValue(pozycje),
      oswiadczenie_czystosci: raw.oswiadczenie_czystosci === true,
      uwagi: optional(raw.uwagi, 1000),
    },
  };
}

// Postgres numeric comes back as a string through PostgREST.
export function fromScrapDeliveryRow(row: Record<string, unknown>): ScrapDelivery {
  const n = (v: unknown) => (v === null || v === undefined ? null : Number(v));
  return {
    ...(row as unknown as ScrapDelivery),
    waga_brutto: n(row.waga_brutto),
    waga_tara: n(row.waga_tara),
    suma: Number(row.suma ?? 0),
    numer_kpo: (row.numer_kpo as string | null) ?? null,
    pozycje: ((row.pozycje as ScrapDeliveryItem[]) ?? []).map((p) => ({
      ...p,
      waga_kg: Number(p.waga_kg),
      cena_kg: Number(p.cena_kg),
      wartosc: Number(p.wartosc),
    })),
  };
}
