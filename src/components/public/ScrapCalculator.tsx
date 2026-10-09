"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Calculator, Plus, X, Truck, Info } from "lucide-react";
import type { ScrapPrice } from "@/types";
import { SCRAP_GROUPS, getActiveScrapPrices } from "@/lib/scrap-prices-store";

interface Row {
  priceId: string;
  kg: string;
}

// Negotiation thresholds match the notes under the price list.
const NEGOTIATION_KG: Record<string, number> = { stalowy: 1000, kolorowy: 200 };

const pln = (value: number) =>
  value.toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const label = (p: ScrapPrice) => (p.grupa === "stalowy" ? `Złom stalowy ${p.nazwa.toLowerCase()}` : p.nazwa);

// Estimates the payout for scrap from the current price list and leads to
// the quote form with the calculation filled in.
export default function ScrapCalculator() {
  const [prices, setPrices] = useState<ScrapPrice[]>([]);
  const [rows, setRows] = useState<Row[]>([{ priceId: "", kg: "" }]);

  useEffect(() => {
    getActiveScrapPrices()
      .then((list) => {
        setPrices(list);
        if (list[0]) setRows([{ priceId: list[0].id, kg: "" }]);
      })
      .catch(() => setPrices([]));
  }, []);

  const lines = useMemo(
    () =>
      rows.map((row) => {
        const price = prices.find((p) => p.id === row.priceId);
        const kg = Number(row.kg.replace(",", ".")) || 0;
        return { price, kg, value: price ? kg * price.cena_od : 0 };
      }),
    [rows, prices]
  );

  const total = lines.reduce((sum, l) => sum + l.value, 0);
  const totalKg = lines.reduce((sum, l) => sum + l.kg, 0);

  const negotiable = SCRAP_GROUPS.filter((group) => {
    const kg = lines.filter((l) => l.price?.grupa === group.value).reduce((sum, l) => sum + l.kg, 0);
    return kg >= NEGOTIATION_KG[group.value];
  });

  const summary = lines
    .filter((l) => l.price && l.kg > 0)
    .map((l) => `${label(l.price!)}: ${l.kg.toLocaleString("pl-PL")} kg`)
    .join(", ");
  const orderHref = `/wycena?usluga=skup_zlomu&opis=${encodeURIComponent(
    `Chcę sprzedać złom: ${summary}. Szacunek z kalkulatora: ${pln(total)} zł. Proszę o odbiór.`
  )}`;

  if (prices.length === 0) return null;

  return (
    <section className="py-16 bg-[#000000] border-y border-[#5c4716]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-lg bg-[#f5b52c]/10 flex items-center justify-center">
              <Calculator className="text-[#f5b52c] size-6" />
            </div>
            <span className="text-[#f5b52c] font-semibold tracking-wide">KALKULATOR SKUPU</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-3">
            Ile dostaniesz za <span className="text-[#f5b52c]">swój złom</span>?
          </h2>
          <p className="text-[#e8dfcc] mb-8">
            Wybierz rodzaj, wpisz przybliżoną wagę — policzymy według aktualnego cennika.
          </p>

          <div className="rounded-2xl border border-[#5c4716] bg-[#0a0a0a] p-5 md:p-7">
            <div className="space-y-3">
              {rows.map((row, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_160px_150px_auto] gap-3 items-center">
                  <select
                    value={row.priceId}
                    onChange={(e) => setRows((prev) => prev.map((r, j) => (j === i ? { ...r, priceId: e.target.value } : r)))}
                    className="col-span-2 sm:col-span-1 bg-black border border-[#5c4716] focus:border-[#f5b52c] rounded-lg px-4 py-3 text-white outline-none"
                    aria-label="Rodzaj złomu"
                  >
                    {SCRAP_GROUPS.map((group) => (
                      <optgroup key={group.value} label={group.label}>
                        {prices
                          .filter((p) => p.grupa === group.value)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {label(p)} — {pln(p.cena_od)} zł/kg
                            </option>
                          ))}
                      </optgroup>
                    ))}
                  </select>
                  <div className="relative">
                    <input
                      value={row.kg}
                      onChange={(e) => setRows((prev) => prev.map((r, j) => (j === i ? { ...r, kg: e.target.value } : r)))}
                      inputMode="decimal"
                      placeholder="waga"
                      aria-label="Waga w kilogramach"
                      className="w-full bg-black border border-[#5c4716] focus:border-[#f5b52c] rounded-lg pl-4 pr-10 py-3 text-white outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#e8dfcc]">kg</span>
                  </div>
                  <div className="hidden sm:block text-right font-semibold text-white whitespace-nowrap">
                    {pln(lines[i]?.value ?? 0)} zł
                  </div>
                  <button
                    type="button"
                    onClick={() => setRows((prev) => (prev.length > 1 ? prev.filter((_, j) => j !== i) : prev))}
                    disabled={rows.length === 1}
                    className="p-2 rounded-lg hover:bg-[#5c4716] disabled:opacity-20 justify-self-end"
                    aria-label="Usuń pozycję"
                  >
                    <X size={18} className="text-[#e8dfcc]" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setRows((prev) => [...prev, { priceId: prices[0].id, kg: "" }])}
              className="mt-4 text-sm text-[#f5b52c] hover:underline underline-offset-2 flex items-center gap-1"
            >
              <Plus size={15} /> Dodaj inny rodzaj złomu
            </button>

            <div className="mt-6 pt-6 border-t border-[#5c4716] flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <div className="text-sm text-[#e8dfcc]">
                  Orientacyjnie za {totalKg.toLocaleString("pl-PL")} kg
                </div>
                <div className="font-montserrat font-bold text-4xl md:text-5xl text-[#f5b52c] leading-tight">
                  {pln(total)} zł
                </div>
                {negotiable.length > 0 && (
                  <p className="mt-2 text-sm text-white flex items-center gap-2">
                    <Info size={15} className="text-[#f5b52c]" /> Przy tej ilości cenę możemy wynegocjować w górę.
                  </p>
                )}
              </div>
              <Link
                href={orderHref}
                aria-disabled={total <= 0}
                className={`btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-bold text-black ${
                  total <= 0 ? "pointer-events-none opacity-50" : ""
                }`}
              >
                <Truck size={20} /> Zamów odbiór
              </Link>
            </div>
            <p className="mt-5 text-xs text-[#e8dfcc]/70">
              Wynik jest orientacyjny. Ostateczną kwotę ustalamy po zważeniu na wadze najazdowej i sprawdzeniu rodzaju
              materiału.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
