"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, X, Loader2, Trash2, Printer, Download, Receipt, BarChart3, Scale } from "lucide-react";
import type { ScrapPrice } from "@/types";
import { getActiveScrapPrices } from "@/lib/scrap-prices-store";
import {
  WASTE_CODES,
  formatKg,
  formatPln,
  guessWasteCode,
  itemValue,
  totalValue,
  totalWeight,
  wasteCodeLabel,
  type ScrapPurchase,
} from "@/lib/scrap-purchases";

interface FormItem {
  nazwa: string;
  kod_odpadu: string;
  waga_kg: string;
  cena_kg: string;
}

const emptyItem: FormItem = { nazwa: "", kod_odpadu: "17 04 05", waga_kg: "", cena_kg: "" };

const nowLocal = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const currentMonth = () => nowLocal().slice(0, 7);

const monthRange = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  return { from: new Date(y, m - 1, 1).toISOString(), to: new Date(y, m, 1).toISOString() };
};

const toNumber = (value: string) => Number(value.replace(",", "."));

const inputClass = "w-full bg-[#000000] border border-[#5c4716] focus:border-[#f5b52c] rounded-lg px-3 py-2 text-sm text-white outline-none";

const csvCell = (value: string | number | null | undefined) => {
  const s = value === null || value === undefined ? "" : String(value);
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export default function SkupPage() {
  const [tab, setTab] = useState<"kwity" | "zestawienie">("kwity");
  const [month, setMonth] = useState(currentMonth());
  const [purchases, setPurchases] = useState<ScrapPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prices, setPrices] = useState<ScrapPrice[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [seller, setSeller] = useState({
    sprzedawca_typ: "osoba" as "osoba" | "firma",
    sprzedawca_nazwa: "",
    sprzedawca_dokument: "",
    sprzedawca_adres: "",
    sprzedawca_telefon: "",
    sprzedawca_email: "",
    nr_rejestracyjny: "",
  });
  const [data, setData] = useState(nowLocal());
  const [brutto, setBrutto] = useState("");
  const [tara, setTara] = useState("");
  const [items, setItems] = useState<FormItem[]>([{ ...emptyItem }]);
  const [platnosc, setPlatnosc] = useState<"gotowka" | "przelew">("gotowka");
  const [uwagi, setUwagi] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { from, to } = monthRange(month);
      const res = await fetch(`/api/scrap-purchases?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Nie udało się wczytać kwitów");
      setPurchases(body);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się wczytać kwitów");
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getActiveScrapPrices().then(setPrices).catch(() => setPrices([]));
  }, []);

  const priceLabel = (p: ScrapPrice) => (p.grupa === "stalowy" ? `Złom stalowy ${p.nazwa.toLowerCase()}` : p.nazwa);

  const openForm = () => {
    setSeller({
      sprzedawca_typ: "osoba",
      sprzedawca_nazwa: "",
      sprzedawca_dokument: "",
      sprzedawca_adres: "",
      sprzedawca_telefon: "",
      sprzedawca_email: "",
      nr_rejestracyjny: "",
    });
    setData(nowLocal());
    setBrutto("");
    setTara("");
    setItems([{ ...emptyItem }]);
    setPlatnosc("gotowka");
    setUwagi("");
    setFormError(null);
    setFormOpen(true);
  };

  const setItem = (index: number, patch: Partial<FormItem>) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const pickPrice = (index: number, priceId: string) => {
    const price = prices.find((p) => p.id === priceId);
    if (!price) return;
    const nazwa = priceLabel(price);
    setItem(index, { nazwa, cena_kg: String(price.cena_od), kod_odpadu: guessWasteCode(nazwa) });
  };

  const netto = brutto && tara ? Math.round((toNumber(brutto) - toNumber(tara)) * 10) / 10 : null;
  const numericItems = items.map((i) => ({ waga_kg: toNumber(i.waga_kg) || 0, cena_kg: toNumber(i.cena_kg) || 0 }));

  const save = async () => {
    setSaving(true);
    setFormError(null);
    try {
      const res = await fetch("/api/scrap-purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...seller,
          data: new Date(data).toISOString(),
          waga_brutto: brutto,
          waga_tara: tara,
          pozycje: items,
          platnosc,
          uwagi,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setFormError(body.error ?? "Nie udało się zapisać kwitu");
        return;
      }
      // Same tab: a new window opened after an await is usually blocked as a pop-up.
      window.location.assign(`/admin/skup/${body.id}`);
    } catch {
      setFormError("Brak połączenia z serwerem");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: ScrapPurchase) => {
    if (!confirm(`Usunąć kwit ${p.numer}? Tej operacji nie da się cofnąć.`)) return;
    const res = await fetch(`/api/scrap-purchases/${p.id}`, { method: "DELETE" });
    if (!res.ok) alert("Nie udało się usunąć kwitu");
    await load();
  };

  const summary = useMemo(() => {
    const byMaterial = new Map<string, { kod: string; kg: number; value: number }>();
    const byCode = new Map<string, number>();
    for (const p of purchases) {
      for (const item of p.pozycje) {
        const m = byMaterial.get(item.nazwa) ?? { kod: item.kod_odpadu, kg: 0, value: 0 };
        m.kg += item.waga_kg;
        m.value += item.wartosc;
        byMaterial.set(item.nazwa, m);
        byCode.set(item.kod_odpadu, (byCode.get(item.kod_odpadu) ?? 0) + item.waga_kg);
      }
    }
    return {
      materials: [...byMaterial.entries()].sort((a, b) => b[1].kg - a[1].kg),
      codes: [...byCode.entries()].sort((a, b) => b[1] - a[1]),
      kg: purchases.reduce((s, p) => s + totalWeight(p.pozycje), 0),
      value: purchases.reduce((s, p) => s + p.suma, 0),
    };
  }, [purchases]);

  const exportCsv = () => {
    const header = ["numer", "data", "sprzedajacy", "dokument", "rodzaj", "kod_odpadu", "waga_kg", "cena_zl_kg", "wartosc_zl", "platnosc", "wystawil"];
    const lines = purchases.flatMap((p) =>
      p.pozycje.map((item) =>
        [
          p.numer,
          new Date(p.data).toLocaleString("pl-PL"),
          p.sprzedawca_nazwa,
          p.sprzedawca_dokument,
          item.nazwa,
          item.kod_odpadu,
          String(item.waga_kg).replace(".", ","),
          String(item.cena_kg).replace(".", ","),
          String(item.wartosc).replace(".", ","),
          p.platnosc,
          p.wystawil,
        ]
          .map(csvCell)
          .join(";")
      )
    );
    const blob = new Blob(["﻿" + [header.join(";"), ...lines].join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rejestr-skupu-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-montserrat font-bold">Skup złomu — kwity</h1>
          <p className="text-sm text-[#e8dfcc] mt-1">Kwity dla sprzedających i rejestr skupu do ewidencji odpadów.</p>
        </div>
        <button
          onClick={openForm}
          className="btn-primary px-4 py-2.5 rounded-lg text-sm font-semibold text-black flex items-center gap-2"
        >
          <Plus size={16} /> Nowy kwit
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex rounded-lg border border-[#5c4716] overflow-hidden">
          {[
            { id: "kwity" as const, label: "Kwity", icon: Receipt },
            { id: "zestawienie" as const, label: "Zestawienie", icon: BarChart3 },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm flex items-center gap-2 ${tab === t.id ? "bg-[#f5b52c] text-black font-semibold" : "text-[#e8dfcc] hover:bg-[#5c4716]"}`}
            >
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-[#e8dfcc]">
          Miesiąc:
          <input
            type="month"
            value={month}
            onChange={(e) => e.target.value && setMonth(e.target.value)}
            className="bg-[#0a0a0a] border border-[#5c4716] rounded-lg px-3 py-2 text-white [color-scheme:dark]"
          />
        </label>
        <button
          onClick={exportCsv}
          disabled={purchases.length === 0}
          className="ml-auto px-4 py-2 rounded-lg border border-[#5c4716] text-sm text-[#e8dfcc] hover:text-white hover:border-[#f5b52c] flex items-center gap-2 disabled:opacity-40"
        >
          <Download size={15} /> Eksport do Excela
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#0a0a0a] p-4 rounded-xl border border-[#5c4716]">
          <div className="text-2xl font-bold text-[#f5b52c]">{purchases.length}</div>
          <div className="text-sm text-[#e8dfcc]">Kwitów w miesiącu</div>
        </div>
        <div className="bg-[#0a0a0a] p-4 rounded-xl border border-[#5c4716]">
          <div className="text-2xl font-bold text-white">{formatKg(Math.round(summary.kg * 10) / 10)}</div>
          <div className="text-sm text-[#e8dfcc]">Skupiono ({(summary.kg / 1000).toLocaleString("pl-PL", { maximumFractionDigits: 3 })} t)</div>
        </div>
        <div className="bg-[#0a0a0a] p-4 rounded-xl border border-[#5c4716] col-span-2 md:col-span-1">
          <div className="text-2xl font-bold text-white">{formatPln(summary.value)}</div>
          <div className="text-sm text-[#e8dfcc]">Wypłacono</div>
        </div>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-sm">{error}</div>}

      {loading ? (
        <div className="bg-[#0a0a0a] p-12 rounded-xl border border-[#5c4716] text-center text-[#e8dfcc] flex items-center justify-center gap-3">
          <Loader2 className="animate-spin" size={18} /> Wczytywanie...
        </div>
      ) : tab === "kwity" ? (
        purchases.length === 0 ? (
          <div className="bg-[#0a0a0a] p-12 rounded-xl border border-[#5c4716] text-center text-[#e8dfcc]">
            Brak kwitów w tym miesiącu. Kliknij „Nowy kwit”, żeby wystawić pierwszy.
          </div>
        ) : (
          <div className="bg-[#0a0a0a] rounded-xl border border-[#5c4716] overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-[#e8dfcc] border-b border-[#5c4716]">
                <tr>
                  {["Numer", "Data", "Sprzedający", "Waga", "Kwota", "Płatność", ""].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#5c4716]/50">
                {purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-[#f5b52c] whitespace-nowrap">{p.numer}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(p.data).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" })}</td>
                    <td className="px-4 py-3">{p.sprzedawca_nazwa}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatKg(totalWeight(p.pozycje))}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold">{formatPln(p.suma)}</td>
                    <td className="px-4 py-3">{p.platnosc === "przelew" ? "przelew" : "gotówka"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link
                          href={`/admin/skup/${p.id}`}
                          className="p-2 rounded-lg hover:bg-[#5c4716]"
                          title="Kwit — drukuj / PDF / e-mail"
                        >
                          <Printer size={15} className="text-[#e8dfcc]" />
                        </Link>
                        <button onClick={() => remove(p)} className="p-2 rounded-lg hover:bg-[#5c4716]" title="Usuń">
                          <Trash2 size={15} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0a0a0a] rounded-xl border border-[#5c4716] p-5">
            <h2 className="font-montserrat font-bold mb-4">Według rodzaju złomu</h2>
            {summary.materials.length === 0 ? (
              <p className="text-sm text-[#e8dfcc]">Brak danych w tym miesiącu.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-[#e8dfcc] text-left">
                  <tr>
                    <th className="py-2 font-semibold">Rodzaj</th>
                    <th className="py-2 font-semibold text-right">Waga</th>
                    <th className="py-2 font-semibold text-right">Kwota</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#5c4716]/50">
                  {summary.materials.map(([name, m]) => (
                    <tr key={name}>
                      <td className="py-2">{name}</td>
                      <td className="py-2 text-right whitespace-nowrap">{formatKg(Math.round(m.kg * 10) / 10)}</td>
                      <td className="py-2 text-right whitespace-nowrap">{formatPln(m.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="bg-[#0a0a0a] rounded-xl border border-[#5c4716] p-5">
            <h2 className="font-montserrat font-bold mb-1">Według kodu odpadu</h2>
            <p className="text-xs text-[#e8dfcc]/70 mb-4">Pomoc przy ewidencji w BDO — masa w tonach (Mg).</p>
            {summary.codes.length === 0 ? (
              <p className="text-sm text-[#e8dfcc]">Brak danych w tym miesiącu.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-[#e8dfcc] text-left">
                  <tr>
                    <th className="py-2 font-semibold">Kod</th>
                    <th className="py-2 font-semibold">Opis</th>
                    <th className="py-2 font-semibold text-right">Mg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#5c4716]/50">
                  {summary.codes.map(([code, kg]) => (
                    <tr key={code}>
                      <td className="py-2 font-mono whitespace-nowrap">{code}</td>
                      <td className="py-2">{wasteCodeLabel(code)}</td>
                      <td className="py-2 text-right">{(kg / 1000).toLocaleString("pl-PL", { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#0a0a0a] border border-[#5c4716] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-[#5c4716]">
              <h2 className="text-xl font-montserrat font-bold">Nowy kwit skupu</h2>
              <button onClick={() => setFormOpen(false)} className="text-[#e8dfcc] hover:text-white" aria-label="Zamknij">
                <X size={22} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-6">
              <section>
                <h3 className="font-semibold mb-3">Sprzedający</h3>
                <div className="flex gap-2 mb-3">
                  {(["osoba", "firma"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSeller({ ...seller, sprzedawca_typ: t })}
                      className={`px-4 py-1.5 rounded-full text-sm border ${seller.sprzedawca_typ === t ? "bg-[#f5b52c] border-[#f5b52c] text-black font-semibold" : "border-[#5c4716] text-[#e8dfcc]"}`}
                    >
                      {t === "osoba" ? "Osoba prywatna" : "Firma"}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    value={seller.sprzedawca_nazwa}
                    onChange={(e) => setSeller({ ...seller, sprzedawca_nazwa: e.target.value })}
                    placeholder={seller.sprzedawca_typ === "firma" ? "Nazwa firmy *" : "Imię i nazwisko *"}
                    className={inputClass}
                  />
                  <input
                    value={seller.sprzedawca_dokument}
                    onChange={(e) => setSeller({ ...seller, sprzedawca_dokument: e.target.value })}
                    placeholder={seller.sprzedawca_typ === "firma" ? "NIP" : "Seria i nr dowodu osobistego"}
                    className={inputClass}
                  />
                  <input
                    value={seller.sprzedawca_adres}
                    onChange={(e) => setSeller({ ...seller, sprzedawca_adres: e.target.value })}
                    placeholder="Adres"
                    className={`${inputClass} sm:col-span-2`}
                  />
                  <input
                    value={seller.sprzedawca_telefon}
                    onChange={(e) => setSeller({ ...seller, sprzedawca_telefon: e.target.value })}
                    placeholder="Telefon"
                    inputMode="tel"
                    className={inputClass}
                  />
                  <input
                    type="email"
                    value={seller.sprzedawca_email}
                    onChange={(e) => setSeller({ ...seller, sprzedawca_email: e.target.value })}
                    placeholder="E-mail (do wysłania kwitu)"
                    className={inputClass}
                  />
                </div>
              </section>

              <section>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Scale size={16} className="text-[#f5b52c]" /> Ważenie (waga najazdowa)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
                  <label className="text-xs text-[#e8dfcc]">
                    Data i godzina
                    <input
                      type="datetime-local"
                      value={data}
                      onChange={(e) => setData(e.target.value)}
                      className={`${inputClass} mt-1 [color-scheme:dark]`}
                    />
                  </label>
                  <label className="text-xs text-[#e8dfcc]">
                    Nr rejestracyjny
                    <input
                      value={seller.nr_rejestracyjny}
                      onChange={(e) => setSeller({ ...seller, nr_rejestracyjny: e.target.value })}
                      placeholder="np. DLU 12345"
                      className={`${inputClass} mt-1 uppercase`}
                    />
                  </label>
                  <label className="text-xs text-[#e8dfcc]">
                    Brutto (kg)
                    <input value={brutto} onChange={(e) => setBrutto(e.target.value)} inputMode="decimal" className={`${inputClass} mt-1`} />
                  </label>
                  <label className="text-xs text-[#e8dfcc]">
                    Tara (kg)
                    <input value={tara} onChange={(e) => setTara(e.target.value)} inputMode="decimal" className={`${inputClass} mt-1`} />
                  </label>
                </div>
                {netto !== null && Number.isFinite(netto) && (
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                    <span className="text-white">
                      Netto: <strong>{formatKg(netto)}</strong>
                    </span>
                    {items.length === 1 && netto > 0 && (
                      <button
                        type="button"
                        onClick={() => setItem(0, { waga_kg: String(netto) })}
                        className="text-[#f5b52c] hover:underline underline-offset-2"
                      >
                        wstaw do pozycji 1
                      </button>
                    )}
                  </div>
                )}
              </section>

              <section>
                <h3 className="font-semibold mb-3">Pozycje</h3>
                <div className="space-y-3">
                  {items.map((item, i) => (
                    <div key={i} className="grid grid-cols-2 sm:grid-cols-[1.6fr_1fr_0.8fr_0.8fr_auto] gap-2 items-center p-3 bg-black rounded-lg">
                      <div className="col-span-2 sm:col-span-1 space-y-1.5">
                        <select
                          value=""
                          onChange={(e) => pickPrice(i, e.target.value)}
                          className={`${inputClass} text-[#e8dfcc]`}
                        >
                          <option value="">{item.nazwa || "Wybierz z cennika…"}</option>
                          {prices.map((p) => (
                            <option key={p.id} value={p.id}>
                              {priceLabel(p)} — {formatPln(p.cena_od)}/kg
                            </option>
                          ))}
                        </select>
                        <input
                          value={item.nazwa}
                          onChange={(e) => setItem(i, { nazwa: e.target.value })}
                          placeholder="lub wpisz rodzaj"
                          className={inputClass}
                        />
                      </div>
                      <select
                        value={item.kod_odpadu}
                        onChange={(e) => setItem(i, { kod_odpadu: e.target.value })}
                        className={`${inputClass} col-span-2 sm:col-span-1`}
                        title="Kod odpadu"
                      >
                        {WASTE_CODES.map((w) => (
                          <option key={w.code} value={w.code}>
                            {w.code} {w.label}
                          </option>
                        ))}
                      </select>
                      <input
                        value={item.waga_kg}
                        onChange={(e) => setItem(i, { waga_kg: e.target.value })}
                        placeholder="kg"
                        inputMode="decimal"
                        className={inputClass}
                      />
                      <input
                        value={item.cena_kg}
                        onChange={(e) => setItem(i, { cena_kg: e.target.value })}
                        placeholder="zł/kg"
                        inputMode="decimal"
                        className={inputClass}
                      />
                      <div className="col-span-2 sm:col-span-1 flex items-center justify-between sm:justify-end gap-2">
                        <span className="text-sm text-white whitespace-nowrap">{formatPln(itemValue(numericItems[i]))}</span>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))}
                            className="p-1.5 rounded hover:bg-[#5c4716]"
                            aria-label="Usuń pozycję"
                          >
                            <X size={15} className="text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setItems((prev) => [...prev, { ...emptyItem }])}
                  className="mt-3 text-sm text-[#f5b52c] hover:underline underline-offset-2 flex items-center gap-1"
                >
                  <Plus size={14} /> Dodaj pozycję
                </button>
              </section>

              <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Płatność</h3>
                  <div className="flex gap-2">
                    {(["gotowka", "przelew"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPlatnosc(m)}
                        className={`px-4 py-1.5 rounded-full text-sm border ${platnosc === m ? "bg-[#f5b52c] border-[#f5b52c] text-black font-semibold" : "border-[#5c4716] text-[#e8dfcc]"}`}
                      >
                        {m === "gotowka" ? "Gotówka" : "Przelew"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Uwagi</h3>
                  <input value={uwagi} onChange={(e) => setUwagi(e.target.value)} className={inputClass} />
                </div>
              </section>
            </div>

            <div className="p-5 border-t border-[#5c4716] flex flex-wrap items-center gap-3">
              <div className="mr-auto">
                <div className="text-xs text-[#e8dfcc]">
                  Razem {formatKg(totalWeight(numericItems))}
                </div>
                <div className="text-2xl font-montserrat font-bold text-[#f5b52c]">{formatPln(totalValue(numericItems))}</div>
              </div>
              {formError && <span className="w-full text-sm text-red-400 order-first">{formError}</span>}
              <button
                onClick={() => setFormOpen(false)}
                className="px-5 py-2.5 rounded-lg border border-[#5c4716] text-[#e8dfcc] hover:text-white"
              >
                Anuluj
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="btn-primary px-6 py-2.5 rounded-lg font-semibold text-black flex items-center gap-2 disabled:opacity-60"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />} Zapisz i wystaw kwit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
