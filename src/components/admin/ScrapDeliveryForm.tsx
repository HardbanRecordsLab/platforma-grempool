"use client";

import { useEffect, useState } from "react";
import { Plus, X, Loader2, Printer, Scale, Building2 } from "lucide-react";
import type { ScrapPrice } from "@/types";
import type { ClientOverview } from "@/lib/clients";
import { getActiveScrapPrices } from "@/lib/scrap-prices-store";
import { CLEAN_STATEMENT, deliveryItemValue, deliveryTotalValue, deliveryTotalWeight } from "@/lib/scrap-deliveries";
import { WASTE_CODES, formatKg, formatPln, guessWasteCode } from "@/lib/scrap-purchases";

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

const toNumber = (value: string) => Number(value.replace(",", "."));

const inputClass =
  "w-full bg-[#000000] border border-[#5c4716] focus:border-[#f5b52c] rounded-lg px-3 py-2 text-sm text-white outline-none";

const priceLabel = (p: ScrapPrice) => (p.grupa === "stalowy" ? `Złom stalowy ${p.nazwa.toLowerCase()}` : p.nazwa);

// New delivery (sale) of scrap to a steelworks or another buyer. After
// saving, the delivery document opens for printing.
export default function ScrapDeliveryForm({ onClose }: { onClose: () => void }) {
  const [prices, setPrices] = useState<ScrapPrice[]>([]);
  const [buyers, setBuyers] = useState<ClientOverview[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [odbiorca, setOdbiorca] = useState({ odbiorca_nazwa: "", odbiorca_nip: "", odbiorca_adres: "", odbiorca_bdo: "" });
  const [data, setData] = useState(nowLocal());
  const [transport, setTransport] = useState({ nr_rejestracyjny: "", przewoznik: "", nr_zamowienia: "", numer_kpo: "" });
  const [brutto, setBrutto] = useState("");
  const [tara, setTara] = useState("");
  const [items, setItems] = useState<FormItem[]>([{ ...emptyItem }]);
  const [clean, setClean] = useState(true);
  const [uwagi, setUwagi] = useState("");

  useEffect(() => {
    getActiveScrapPrices().then(setPrices).catch(() => setPrices([]));
    fetch("/api/clients?typ=firma")
      .then((res) => (res.ok ? res.json() : []))
      .then(setBuyers)
      .catch(() => setBuyers([]));
  }, []);

  // Typing the name of a known company fills in its NIP, address and BDO number.
  const changeBuyerName = (name: string) => {
    const match = buyers.find((b) => b.nazwa.trim().toLowerCase() === name.trim().toLowerCase());
    if (match && !odbiorca.odbiorca_nip && !odbiorca.odbiorca_adres) {
      setOdbiorca({
        odbiorca_nazwa: match.nazwa,
        odbiorca_nip: match.dokument ?? "",
        odbiorca_adres: match.adres ?? "",
        odbiorca_bdo: match.bdo ?? "",
      });
    } else {
      setOdbiorca({ ...odbiorca, odbiorca_nazwa: name });
    }
  };

  const setItem = (index: number, patch: Partial<FormItem>) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const pickPrice = (index: number, priceId: string) => {
    const price = prices.find((p) => p.id === priceId);
    if (!price) return;
    const nazwa = priceLabel(price);
    setItem(index, { nazwa, kod_odpadu: guessWasteCode(nazwa) });
  };

  const netto = brutto && tara ? Math.round((toNumber(brutto) - toNumber(tara)) * 10) / 10 : null;
  const numeric = items.map((i) => ({ waga_kg: toNumber(i.waga_kg) || 0, cena_kg: toNumber(i.cena_kg) || 0 }));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/scrap-deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...odbiorca,
          ...transport,
          data: new Date(data).toISOString(),
          waga_brutto: brutto,
          waga_tara: tara,
          pozycje: items,
          oswiadczenie_czystosci: clean,
          uwagi,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Nie udało się zapisać dokumentu");
        return;
      }
      window.location.assign(`/admin/skup/dostawa/${body.id}`);
    } catch {
      setError("Brak połączenia z serwerem");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-[#0a0a0a] border border-[#5c4716] rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-[#5c4716]">
          <h2 className="text-xl font-montserrat font-bold">Nowa dostawa złomu (sprzedaż)</h2>
          <button onClick={onClose} className="text-[#e8dfcc] hover:text-white" aria-label="Zamknij">
            <X size={22} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-6">
          <section>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Building2 size={16} className="text-[#f5b52c]" /> Odbiorca (huta, firma)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <input
                  value={odbiorca.odbiorca_nazwa}
                  onChange={(e) => changeBuyerName(e.target.value)}
                  list="dostawa-odbiorcy"
                  autoComplete="off"
                  autoFocus
                  placeholder="Nazwa odbiorcy *"
                  className={inputClass}
                />
                <datalist id="dostawa-odbiorcy">
                  {buyers.map((b) => (
                    <option key={b.id} value={b.nazwa} />
                  ))}
                </datalist>
              </div>
              <input
                value={odbiorca.odbiorca_nip}
                onChange={(e) => setOdbiorca({ ...odbiorca, odbiorca_nip: e.target.value })}
                placeholder="NIP"
                className={inputClass}
              />
              <input
                value={odbiorca.odbiorca_bdo}
                onChange={(e) => setOdbiorca({ ...odbiorca, odbiorca_bdo: e.target.value })}
                placeholder="Numer BDO odbiorcy"
                className={inputClass}
              />
              <input
                value={odbiorca.odbiorca_adres}
                onChange={(e) => setOdbiorca({ ...odbiorca, odbiorca_adres: e.target.value })}
                placeholder="Adres"
                className={`${inputClass} sm:col-span-2`}
              />
            </div>
          </section>

          <section>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Scale size={16} className="text-[#f5b52c]" /> Transport i ważenie
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
              <label className="text-xs text-[#e8dfcc]">
                Data i godzina
                <input type="datetime-local" value={data} onChange={(e) => setData(e.target.value)} className={`${inputClass} mt-1 [color-scheme:dark]`} />
              </label>
              <label className="text-xs text-[#e8dfcc]">
                Nr rejestracyjny
                <input
                  value={transport.nr_rejestracyjny}
                  onChange={(e) => setTransport({ ...transport, nr_rejestracyjny: e.target.value })}
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
              <label className="text-xs text-[#e8dfcc] col-span-2">
                Przewoźnik / kierowca
                <input
                  value={transport.przewoznik}
                  onChange={(e) => setTransport({ ...transport, przewoznik: e.target.value })}
                  className={`${inputClass} mt-1`}
                />
              </label>
              <label className="text-xs text-[#e8dfcc]">
                Nr zamówienia / umowy
                <input
                  value={transport.nr_zamowienia}
                  onChange={(e) => setTransport({ ...transport, nr_zamowienia: e.target.value })}
                  className={`${inputClass} mt-1`}
                />
              </label>
              <label className="text-xs text-[#e8dfcc]">
                Nr KPO (z BDO)
                <input
                  value={transport.numer_kpo}
                  onChange={(e) => setTransport({ ...transport, numer_kpo: e.target.value })}
                  placeholder="po wystawieniu w BDO"
                  className={`${inputClass} mt-1`}
                />
              </label>
            </div>
            {netto !== null && Number.isFinite(netto) && (
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                <span className="text-white">
                  Netto: <strong>{formatKg(netto)}</strong>
                </span>
                {items.length === 1 && netto > 0 && (
                  <button type="button" onClick={() => setItem(0, { waga_kg: String(netto) })} className="text-[#f5b52c] hover:underline underline-offset-2">
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
                    <select value="" onChange={(e) => pickPrice(i, e.target.value)} className={`${inputClass} text-[#e8dfcc]`}>
                      <option value="">{item.nazwa || "Wybierz rodzaj…"}</option>
                      {prices.map((p) => (
                        <option key={p.id} value={p.id}>
                          {priceLabel(p)}
                        </option>
                      ))}
                    </select>
                    <input
                      value={item.nazwa}
                      onChange={(e) => setItem(i, { nazwa: e.target.value })}
                      placeholder="lub wpisz rodzaj / gatunek"
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
                  <input value={item.waga_kg} onChange={(e) => setItem(i, { waga_kg: e.target.value })} placeholder="kg" inputMode="decimal" className={inputClass} />
                  <input
                    value={item.cena_kg}
                    onChange={(e) => setItem(i, { cena_kg: e.target.value })}
                    placeholder="zł/kg (opcj.)"
                    inputMode="decimal"
                    className={inputClass}
                  />
                  <div className="col-span-2 sm:col-span-1 flex items-center justify-between sm:justify-end gap-2">
                    <span className="text-sm text-white whitespace-nowrap">{formatPln(deliveryItemValue(numeric[i]))}</span>
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

          <section className="space-y-3">
            <label className="flex items-start gap-3 text-sm text-[#e8dfcc] cursor-pointer">
              <input type="checkbox" checked={clean} onChange={(e) => setClean(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-[#f5b52c]" />
              <span>
                Dodaj na dokumencie oświadczenie o braku zanieczyszczeń
                <span className="block text-xs text-[#e8dfcc]/60 mt-0.5">„{CLEAN_STATEMENT}”</span>
              </span>
            </label>
            <label className="block text-xs text-[#e8dfcc]">
              Uwagi
              <input value={uwagi} onChange={(e) => setUwagi(e.target.value)} className={`${inputClass} mt-1`} />
            </label>
          </section>
        </div>

        <div className="p-5 border-t border-[#5c4716] flex flex-wrap items-center gap-3">
          <div className="mr-auto">
            <div className="text-xs text-[#e8dfcc]">Razem {formatKg(deliveryTotalWeight(numeric))}</div>
            <div className="text-xl font-montserrat font-bold text-[#f5b52c]">
              {deliveryTotalValue(numeric) > 0 ? formatPln(deliveryTotalValue(numeric)) : "wartość wg odbiorcy"}
            </div>
          </div>
          {error && <span className="w-full text-sm text-red-400 order-first">{error}</span>}
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-[#5c4716] text-[#e8dfcc] hover:text-white">
            Anuluj
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="btn-primary px-6 py-2.5 rounded-lg font-semibold text-black flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />} Zapisz i drukuj dokument
          </button>
        </div>
      </div>
    </div>
  );
}
