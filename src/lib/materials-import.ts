import type { Material } from "@/types";
import { MATERIAL_CATEGORIES, MATERIAL_CONDITIONS } from "@/lib/materials-store";

// Bulk import of listings from a CSV saved in Excel. Used by the admin modal
// (preview) and again by the API route, so bad rows never reach the database.

export const IMPORT_COLUMNS = [
  "kategoria",
  "nazwa",
  "wymiary",
  "ilosc",
  "stan",
  "cena",
  "lokalizacja",
  "opis",
  "dlugosc",
  "zdjecia",
] as const;

export const IMPORT_LIMIT = 500;

export interface ImportRow {
  kategoria: Material["kategoria"];
  nazwa: string;
  wymiary: string;
  ilosc: number;
  stan: Material["stan"];
  cena: number | null;
  lokalizacja: string;
  opis: string | null;
  dlugosc: number | null;
  zdjecia: string[];
  status: "dostepny";
}

export type ParsedRow = { line: number; row: ImportRow; errors: string[] };

const plain = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/g, "l")
    .trim();

function matchOption<T extends string>(value: string, options: { value: T; label: string }[]): T | null {
  const v = plain(value);
  if (!v) return null;
  return (
    options.find((o) => plain(o.value) === v || plain(o.label) === v)?.value ??
    options.find((o) => plain(o.label).startsWith(v) || v.startsWith(plain(o.value)))?.value ??
    null
  );
}

const toNumber = (value: string) => {
  const cleaned = value.replace(/\s|zł|zl/gi, "").replace(",", ".");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
};

// Minimal RFC 4180 parser: quoted fields, doubled quotes, newlines in quotes.
export function parseCsv(text: string): string[][] {
  const source = text.replace(/^﻿/, "");
  const firstLine = source.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = (firstLine.match(/;/g)?.length ?? 0) >= (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (quoted) {
      if (c === '"' && source[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === delimiter) {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && source[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

export function normalizeImportRow(input: Record<string, unknown>, line: number): ParsedRow {
  const text = (key: string) => (typeof input[key] === "string" ? (input[key] as string).trim() : String(input[key] ?? "").trim());
  const errors: string[] = [];

  const nazwa = text("nazwa").slice(0, 200);
  if (!nazwa) errors.push("brak nazwy");

  const kategoriaRaw = text("kategoria");
  const kategoria = kategoriaRaw ? matchOption(kategoriaRaw, MATERIAL_CATEGORIES) : "inne";
  if (!kategoria) errors.push(`nieznana kategoria „${kategoriaRaw}”`);

  const stanRaw = text("stan");
  const stan = stanRaw ? matchOption(stanRaw, MATERIAL_CONDITIONS) : "uzywany";
  if (!stan) errors.push(`nieznany stan „${stanRaw}”`);

  const iloscRaw = toNumber(text("ilosc"));
  const ilosc = iloscRaw === null ? 1 : Math.round(iloscRaw);
  if (Number.isNaN(iloscRaw) || ilosc < 1) errors.push("ilość musi być liczbą ≥ 1");

  const cena = toNumber(text("cena"));
  if (Number.isNaN(cena) || (cena !== null && cena < 0)) errors.push("cena nie jest liczbą");

  const dlugosc = toNumber(text("dlugosc"));
  if (Number.isNaN(dlugosc)) errors.push("długość nie jest liczbą");

  const zdjecia = text("zdjecia")
    .split(/[|\s]+/)
    .filter((url) => /^https:\/\/\S+$/.test(url))
    .slice(0, 20);

  return {
    line,
    errors,
    row: {
      kategoria: kategoria ?? "inne",
      nazwa,
      wymiary: text("wymiary").slice(0, 120) || "—",
      ilosc: Number.isNaN(ilosc) ? 1 : ilosc,
      stan: stan ?? "uzywany",
      cena: cena === null || Number.isNaN(cena) ? null : cena,
      lokalizacja: text("lokalizacja").slice(0, 120) || "Plac Raszówka",
      opis: text("opis").slice(0, 3000) || null,
      dlugosc: dlugosc === null || Number.isNaN(dlugosc) ? null : dlugosc,
      zdjecia,
      status: "dostepny",
    },
  };
}

// Turns CSV text into rows keyed by column name (header row decides order).
export function csvToRecords(text: string): { records: Record<string, string>[]; missing: string[] } {
  const [header = [], ...body] = parseCsv(text);
  const keys = header.map((h) => plain(h).replace(/[^a-z]/g, ""));
  const missing = ["nazwa"].filter((col) => !keys.includes(col));
  const records = body.map((cells) => Object.fromEntries(keys.map((k, i) => [k, cells[i] ?? ""])));
  return { records, missing };
}

export function templateCsv(): string {
  const example = [
    "stal",
    "Profil stalowy 100x100",
    "100 × 100 mm",
    "12",
    "używany",
    "45,00",
    "Plac A / sektor 2",
    "Profile z rozbiórki hali, proste.",
    "6",
    "",
  ];
  // BOM + semicolons: Excel in Polish locale opens it with the right columns and characters.
  return "﻿" + [IMPORT_COLUMNS.join(";"), example.join(";")].join("\r\n") + "\r\n";
}
