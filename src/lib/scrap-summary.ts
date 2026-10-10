import { wasteCodeLabel } from "@/lib/scrap-purchases";

// Result of the scrap_summary database function for one period.
export interface ScrapSummary {
  receipts: number;
  kg: number;
  value: number;
  by_seller_type: { typ: "osoba" | "firma"; receipts: number; kg: number; value: number }[];
  by_material: { name: string; code: string; kg: number; value: number; receipts: number }[];
  by_code: { code: string; kg: number; value: number }[];
  by_payment: { platnosc: "gotowka" | "przelew"; receipts: number; value: number }[];
  buckets: { bucket: string; receipts: number; kg: number; value: number }[];
  top_sellers: { key: string; name: string; receipts: number; kg: number; value: number }[];
}

export const avgPrice = (s: Pick<ScrapSummary, "kg" | "value">) => (s.kg > 0 ? s.value / s.kg : 0);

// Change against the previous period in percent; null when there is nothing to compare with.
export function deltaPercent(current: number, previous: number): number | null {
  if (!(previous > 0)) return null;
  return ((current - previous) / previous) * 100;
}

const decimal = (value: number, digits: number) =>
  value.toLocaleString("pl-PL", { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: false });

const cell = (value: string | number) => {
  const s = String(value);
  return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// CSV for Excel (semicolons, decimal commas, BOM): totals, per scrap type and per waste code.
export function summaryCsv(label: string, s: ScrapSummary): string {
  const row = (...cells: (string | number)[]) => cells.map(cell).join(";");
  const lines = [
    row("Zestawienie skupu", label),
    row("Kwitów", s.receipts),
    row("Masa [kg]", decimal(s.kg, 3)),
    row("Masa [Mg]", decimal(s.kg / 1000, 4)),
    row("Wypłacono [zł]", decimal(s.value, 2)),
    row("Średnia cena [zł/kg]", decimal(avgPrice(s), 2)),
    "",
    row("Rodzaj", "Kod odpadu", "Kwitów", "Masa [kg]", "Masa [Mg]", "Wartość [zł]", "Średnia cena [zł/kg]", "Udział w masie [%]"),
    ...s.by_material.map((m) =>
      row(m.name, m.code, m.receipts, decimal(m.kg, 3), decimal(m.kg / 1000, 4), decimal(m.value, 2), decimal(m.kg > 0 ? m.value / m.kg : 0, 2), decimal(s.kg > 0 ? (m.kg / s.kg) * 100 : 0, 1))
    ),
    "",
    row("Kod odpadu", "Opis", "Masa [kg]", "Masa [Mg]", "Wartość [zł]"),
    ...s.by_code.map((c) => row(c.code, wasteCodeLabel(c.code), decimal(c.kg, 3), decimal(c.kg / 1000, 4), decimal(c.value, 2))),
  ];
  return "﻿" + lines.join("\r\n");
}

export function downloadCsv(filename: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export { decimal as csvDecimal, cell as csvCell };
