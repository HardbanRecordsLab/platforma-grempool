// Scrap purchase receipts (kwity skupu): shared by the admin forms, the
// printable receipt and the API, which re-validates everything it stores.
//
// For a seller who is a private person the receipt is the "formularz przyjęcia
// odpadów metali" from the annex to the Regulation of the Minister of the
// Environment of 9 December 2013 (Dz.U. 2013 poz. 1607): number, seller's
// name, address and ID document number, date, origin of the waste, and per
// item the waste code and kind, the product it came from, mass in Mg and
// value, plus the seller's statement and both signatures, in two copies.

export interface ScrapPurchaseItem {
  nazwa: string;
  kod_odpadu: string;
  waga_kg: number;
  cena_kg: number;
  wartosc: number;
  // "Rodzaj produktu, z którego powstały odpady" on the FPO form, e.g.
  // "elementy konstrukcyjne"; the printout falls back to the scrap name.
  rodzaj_produktu?: string;
}

export interface ScrapPurchase {
  id: string;
  numer: string;
  data: string;
  sprzedawca_typ: "osoba" | "firma";
  sprzedawca_nazwa: string;
  sprzedawca_dokument: string | null;
  sprzedawca_adres: string | null;
  sprzedawca_telefon: string | null;
  sprzedawca_email: string | null;
  nr_rejestracyjny: string | null;
  // Place where the waste was produced or obtained (FPO: "źródło pochodzenia odpadów").
  zrodlo_pochodzenia: string | null;
  // Staff confirmed the ID document was checked (required for private persons).
  dokument_zweryfikowany: boolean;
  waga_brutto: number | null;
  waga_tara: number | null;
  pozycje: ScrapPurchaseItem[];
  suma: number;
  platnosc: "gotowka" | "przelew";
  uwagi: string | null;
  wystawil: string | null;
  created_at: string;
}

export type ScrapPurchaseInput = Omit<ScrapPurchase, "id" | "numer" | "suma" | "wystawil" | "created_at">;

// Waste codes for metal scrap with their names from the Polish waste
// catalogue (the FPO form asks for the code and the kind of waste).
export const WASTE_CODES = [
  { code: "17 04 05", label: "Żelazo i stal" },
  { code: "17 04 01", label: "Miedź, brąz, mosiądz" },
  { code: "17 04 02", label: "Aluminium" },
  { code: "17 04 03", label: "Ołów" },
  { code: "17 04 04", label: "Cynk" },
  { code: "17 04 06", label: "Cyna" },
  { code: "17 04 07", label: "Mieszaniny metali" },
  { code: "17 04 11", label: "Kable inne niż wymienione w 17 04 10" },
  { code: "15 01 04", label: "Opakowania z metali" },
  { code: "16 01 17", label: "Metale żelazne" },
  { code: "16 01 18", label: "Metale nieżelazne" },
  { code: "19 12 02", label: "Metale żelazne" },
  { code: "19 12 03", label: "Metale nieżelazne" },
  { code: "20 01 40", label: "Metale" },
];

// Examples of the origin of waste given in the FPO instructions.
export const ORIGIN_SUGGESTIONS = ["gospodarstwo domowe", "gospodarstwo rolne", "rozbiórka obiektu"];

export const wasteCodeLabel = (code: string) => WASTE_CODES.find((w) => w.code === code)?.label ?? "";

// Suggests a waste code from a price-list name; the admin can change it.
export function guessWasteCode(name: string): string {
  const n = name.toLowerCase();
  if (/mied|mosi|brąz|braz/.test(n)) return "17 04 01";
  if (/puszk/.test(n)) return "15 01 04";
  if (/alu|chłodnic|chlodnic/.test(n)) return "17 04 02";
  if (/ołów|olow/.test(n)) return "17 04 03";
  if (/cynk/.test(n)) return "17 04 04";
  if (/kabel|kable/.test(n)) return "17 04 11";
  return "17 04 05";
}

const round = (value: number, digits: number) => Math.round(value * 10 ** digits) / 10 ** digits;

export const itemValue = (item: Pick<ScrapPurchaseItem, "waga_kg" | "cena_kg">) =>
  round((item.waga_kg || 0) * (item.cena_kg || 0), 2);

export const totalValue = (items: Pick<ScrapPurchaseItem, "waga_kg" | "cena_kg">[]) =>
  round(items.reduce((sum, item) => sum + itemValue(item), 0), 2);

export const totalWeight = (items: Pick<ScrapPurchaseItem, "waga_kg">[]) =>
  round(items.reduce((sum, item) => sum + (item.waga_kg || 0), 0), 3);

export const formatKg = (kg: number) =>
  `${kg.toLocaleString("pl-PL", { minimumFractionDigits: 0, maximumFractionDigits: 3 })} kg`;

// Mass in Mg as the FPO form and the waste records (KEO) want it: three
// decimal places, four for quantities below 1 kg.
export const formatMgRegulatory = (kg: number) => {
  const digits = kg < 1 ? 4 : 3;
  return (kg / 1000).toLocaleString("pl-PL", { minimumFractionDigits: digits, maximumFractionDigits: digits });
};

export const formatPln = (value: number) =>
  `${value.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const optionalText = (value: unknown, max: number) => text(value, max) || null;
const num = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
};

// Validates a receipt from the admin form. Returns the row to store, or the
// list of problems in Polish.
export function validateScrapPurchase(
  input: unknown
): { ok: true; row: Omit<ScrapPurchase, "id" | "numer" | "wystawil" | "created_at"> } | { ok: false; errors: string[] } {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const errors: string[] = [];

  const sprzedawca_nazwa = text(raw.sprzedawca_nazwa, 200);
  if (!sprzedawca_nazwa) errors.push("Podaj sprzedającego");

  // A private person must be identified: the metal waste acceptance form
  // needs name, address and ID document number, and the origin of the waste.
  const typ = raw.sprzedawca_typ === "firma" ? "firma" : "osoba";
  const zrodlo = optionalText(raw.zrodlo_pochodzenia, 200);
  if (typ === "osoba") {
    if (!optionalText(raw.sprzedawca_adres, 200)) errors.push("Podaj adres sprzedającego (wymagany na formularzu przyjęcia odpadów metali)");
    if (!optionalText(raw.sprzedawca_dokument, 60)) errors.push("Podaj numer dokumentu tożsamości sprzedającego (bez niego nie wolno przyjąć złomu)");
    if (!zrodlo) errors.push("Podaj źródło pochodzenia złomu, np. gospodarstwo domowe");
    if (raw.dokument_zweryfikowany !== true) errors.push("Potwierdź, że sprawdzono dokument tożsamości sprzedającego");
  }

  const date = raw.data ? new Date(String(raw.data)) : new Date();
  if (Number.isNaN(date.getTime())) errors.push("Nieprawidłowa data");

  const rawItems = Array.isArray(raw.pozycje) ? raw.pozycje : [];
  const pozycje: ScrapPurchaseItem[] = [];
  rawItems.forEach((value, i) => {
    const item = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
    const nazwa = text(item.nazwa, 120);
    const rawKg = num(item.waga_kg);
    const rawPrice = num(item.cena_kg);
    if (!nazwa && !rawKg) return; // empty row left in the form
    if (!nazwa) errors.push(`Pozycja ${i + 1}: brak rodzaju złomu`);
    if (!(rawKg > 0)) errors.push(`Pozycja ${i + 1}: waga musi być większa od 0`);
    if (!(rawPrice >= 0)) errors.push(`Pozycja ${i + 1}: nieprawidłowa cena`);
    const kod = text(item.kod_odpadu, 12);
    // Value is calculated from the weight and price exactly as they are stored.
    const waga_kg = round(rawKg, 3);
    const cena_kg = round(rawPrice, 2);
    const rodzaj_produktu = text(item.rodzaj_produktu, 120);
    pozycje.push({
      nazwa,
      kod_odpadu: WASTE_CODES.some((w) => w.code === kod) ? kod : guessWasteCode(nazwa),
      waga_kg,
      cena_kg,
      wartosc: itemValue({ waga_kg, cena_kg }),
      ...(rodzaj_produktu ? { rodzaj_produktu } : {}),
    });
  });
  if (pozycje.length === 0) errors.push("Dodaj przynajmniej jedną pozycję");
  if (pozycje.length > 30) errors.push("Maksymalnie 30 pozycji na kwicie");

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
      sprzedawca_typ: typ,
      sprzedawca_nazwa,
      sprzedawca_dokument: optionalText(raw.sprzedawca_dokument, 60),
      sprzedawca_adres: optionalText(raw.sprzedawca_adres, 200),
      sprzedawca_telefon: optionalText(raw.sprzedawca_telefon, 40),
      sprzedawca_email: optionalText(raw.sprzedawca_email, 120),
      nr_rejestracyjny: optionalText(raw.nr_rejestracyjny, 20)?.toUpperCase() ?? null,
      zrodlo_pochodzenia: zrodlo,
      dokument_zweryfikowany: raw.dokument_zweryfikowany === true,
      waga_brutto: brutto === null ? null : round(brutto, 1),
      waga_tara: tara === null ? null : round(tara, 1),
      pozycje,
      suma: totalValue(pozycje),
      platnosc: raw.platnosc === "przelew" ? "przelew" : "gotowka",
      uwagi: optionalText(raw.uwagi, 1000),
    },
  };
}

// Postgres numeric comes back as a string through PostgREST.
export function fromScrapPurchaseRow(row: Record<string, unknown>): ScrapPurchase {
  const n = (v: unknown) => (v === null || v === undefined ? null : Number(v));
  return {
    ...(row as unknown as ScrapPurchase),
    waga_brutto: n(row.waga_brutto),
    waga_tara: n(row.waga_tara),
    suma: Number(row.suma ?? 0),
    zrodlo_pochodzenia: (row.zrodlo_pochodzenia as string | null) ?? null,
    dokument_zweryfikowany: row.dokument_zweryfikowany === true,
    pozycje: ((row.pozycje as ScrapPurchaseItem[]) ?? []).map((p) => ({
      ...p,
      waga_kg: Number(p.waga_kg),
      cena_kg: Number(p.cena_kg),
      wartosc: Number(p.wartosc),
    })),
  };
}
