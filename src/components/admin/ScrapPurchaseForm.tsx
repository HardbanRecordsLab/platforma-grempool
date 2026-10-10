"use client";

import { useEffect, useState } from "react";
import { Plus, X, Loader2, Printer, Scale, History, CheckCircle2, ShieldCheck } from "lucide-react";
import type { ScrapPrice } from "@/types";
import { getActiveScrapPrices } from "@/lib/scrap-prices-store";
import {
  ORIGIN_SUGGESTIONS,
  WASTE_CODES,
  formatKg,
  formatPln,
  guessWasteCode,
  itemValue,
  totalValue,
  totalWeight,
} from "@/lib/scrap-purchases";

interface FormItem {
  nazwa: string;
  kod_odpadu: string;
  waga_kg: string;
  cena_kg: string;
  rodzaj_produktu: string;
}

interface SellerSuggestion {
  sprzedawca_typ: "osoba" | "firma";
  sprzedawca_nazwa: string;
  sprzedawca_dokument: string | null;
  sprzedawca_adres: string | null;
  sprzedawca_telefon: string | null;
  sprzedawca_email: string | null;
  nr_rejestracyjny: string | null;
}

const emptyItem: FormItem = { nazwa: "", kod_odpadu: "17 04 05", waga_kg: "", cena_kg: "", rodzaj_produktu: "" };

const emptySeller = {
  sprzedawca_typ: "osoba" as "osoba" | "firma",
  sprzedawca_nazwa: "",
  sprzedawca_dokument: "",
  sprzedawca_adres: "",
  sprzedawca_telefon: "",
  sprzedawca_email: "",
  nr_rejestracyjny: "",
};

const nowLocal = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const toNumber = (value: string) => Number(value.replace(",", "."));

const inputClass =
  "w-full bg-[#000000] border border-[#5c4716] focus:border-[#f5b52c] rounded-lg px-3 py-2 text-sm text-white outline-none";

const priceLabel = (p: ScrapPrice) => (p.grupa === "stalowy" ? `Złom stalowy ${p.nazwa.toLowerCase()}` : p.nazwa);

// New scrap purchase receipt. After saving, the receipt opens for printing.
export default function ScrapPurchaseForm({
  onClose,
  onSaved,
  clientId,
}: {
  onClose: () => void;
  onSaved?: () => void;
  clientId?: string | null;
}) {
  const [prices, setPrices] = useState<ScrapPrice[]>([]);
  const [sellers, setSellers] = useState<SellerSuggestion[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seller, setSeller] = useState(emptySeller);
  const [filledFrom, setFilledFrom] = useState<string | null>(null);
  const [data, setData] = useState(nowLocal());
  const [brutto, setBrutto] = useState("");
  const [tara, setTara] = useState("");
  const [items, setItems] = useState<FormItem[]>([{ ...emptyItem }]);
  const [platnosc, setPlatnosc] = useState<"gotowka" | "przelew">("gotowka");
  const [uwagi, setUwagi] = useState("");
  const [zrodlo, setZrodlo] = useState("");
  const [verified, setVerified] = useState(false);
  const [lastSaved, setLastSaved] = useState<{ id: string; numer: string } | null>(null);

  const loadSellers = () =>
    fetch("/api/scrap-purchases/sellers")
      .then((res) => (res.ok ? res.json() : []))
      .then(setSellers)
      .catch(() => setSellers([]));

  useEffect(() => {
    getActiveScrapPrices().then(setPrices).catch(() => setPrices([]));
    loadSellers();
  }, []);

  // Opened from a client card: fill in that client's data.
  useEffect(() => {
    if (!clientId) return;
    fetch(`/api/clients/${clientId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((body) => {
        const c = body?.client;
        if (!c) return;
        setSeller({
          sprzedawca_typ: c.typ,
          sprzedawca_nazwa: c.nazwa,
          sprzedawca_dokument: c.dokument ?? "",
          sprzedawca_adres: c.adres ?? "",
          sprzedawca_telefon: c.telefon ?? "",
          sprzedawca_email: c.email ?? "",
          nr_rejestracyjny: "",
        });
        setFilledFrom(c.nazwa);
      })
      .catch(() => {});
  }, [clientId]);

  // Clears the form for the next customer.
  const reset = () => {
    setSeller(emptySeller);
    setFilledFrom(null);
    setData(nowLocal());
    setBrutto("");
    setTara("");
    setItems([{ ...emptyItem }]);
    setUwagi("");
    setZrodlo("");
    setVerified(false);
  };

  const setItem = (index: number, patch: Partial<FormItem>) =>
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const pickPrice = (index: number, priceId: string) => {
    const price = prices.find((p) => p.id === priceId);
    if (!price) return;
    const nazwa = priceLabel(price);
    setItem(index, { nazwa, cena_kg: String(price.cena_od), kod_odpadu: guessWasteCode(nazwa) });
  };

  // Typing a name that matches an earlier seller fills the other fields they
  // have not filled in yet.
  const changeSellerName = (name: string) => {
    const match = sellers.find((s) => s.sprzedawca_nazwa.trim().toLowerCase() === name.trim().toLowerCase());
    if (match && !seller.sprzedawca_dokument && !seller.sprzedawca_adres) {
      setSeller({
        sprzedawca_typ: match.sprzedawca_typ,
        sprzedawca_nazwa: match.sprzedawca_nazwa,
        sprzedawca_dokument: match.sprzedawca_dokument ?? "",
        sprzedawca_adres: match.sprzedawca_adres ?? "",
        sprzedawca_telefon: match.sprzedawca_telefon ?? "",
        sprzedawca_email: match.sprzedawca_email ?? "",
        nr_rejestracyjny: seller.nr_rejestracyjny || match.nr_rejestracyjny || "",
      });
      setFilledFrom(match.sprzedawca_nazwa);
    } else {
      setSeller({ ...seller, sprzedawca_nazwa: name });
      setFilledFrom(null);
    }
  };

  const netto = brutto && tara ? Math.round((toNumber(brutto) - toNumber(tara)) * 10) / 10 : null;
  const numericItems = items.map((i) => ({ waga_kg: toNumber(i.waga_kg) || 0, cena_kg: toNumber(i.cena_kg) || 0 }));

  const isPerson = seller.sprzedawca_typ === "osoba";

  // "print" opens the receipt for printing; "next" keeps the form open for the next customer.
  const save = async (mode: "print" | "next") => {
    setSaving(true);
    setError(null);
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
          zrodlo_pochodzenia: zrodlo,
          dokument_zweryfikowany: verified,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Nie udało się zapisać kwitu");
        return;
      }
      onSaved?.();
      if (mode === "next") {
        setLastSaved({ id: body.id, numer: body.numer });
        reset();
        loadSellers();
        return;
      }
      // Same tab: a new window opened after an await is usually blocked as a pop-up.
      window.location.assign(`/admin/skup/${body.id}`);
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
          <h2 className="text-xl font-montserrat font-bold">Nowy kwit skupu</h2>
          <button onClick={onClose} className="text-[#e8dfcc] hover:text-white" aria-label="Zamknij">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
              <div>
                <input
                  value={seller.sprzedawca_nazwa}
                  onChange={(e) => changeSellerName(e.target.value)}
                  list="skup-sprzedajacy"
                  autoComplete="off"
                  placeholder={seller.sprzedawca_typ === "firma" ? "Nazwa firmy *" : "Imię i nazwisko *"}
                  className={inputClass}
                  autoFocus
                />
                <datalist id="skup-sprzedajacy">
                  {sellers.map((s) => (
                    <option key={s.sprzedawca_nazwa} value={s.sprzedawca_nazwa} />
                  ))}
                </datalist>
                {filledFrom && (
                  <p className="mt-1 text-xs text-green-400 flex items-center gap-1">
                    <History size={12} /> Dane uzupełnione z poprzedniego kwitu — sprawdź, czy są aktualne.
                  </p>
                )}
              </div>
              <input
                value={seller.sprzedawca_dokument}
                onChange={(e) => setSeller({ ...seller, sprzedawca_dokument: e.target.value })}
                placeholder={seller.sprzedawca_typ === "firma" ? "NIP" : "Nr dowodu osobistego lub innego dokumentu *"}
                className={inputClass}
              />
              <input
                value={seller.sprzedawca_adres}
                onChange={(e) => setSeller({ ...seller, sprzedawca_adres: e.target.value })}
                placeholder={isPerson ? "Adres zamieszkania *" : "Adres"}
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
              <div className="sm:col-span-2">
                <input
                  value={zrodlo}
                  onChange={(e) => setZrodlo(e.target.value)}
                  list="skup-zrodla"
                  placeholder={isPerson ? "Źródło pochodzenia złomu * (np. gospodarstwo domowe)" : "Źródło pochodzenia złomu (opcjonalnie)"}
                  className={inputClass}
                />
                <datalist id="skup-zrodla">
                  {ORIGIN_SUGGESTIONS.map((o) => (
                    <option key={o} value={o} />
                  ))}
                </datalist>
              </div>
            </div>

            {isPerson && (
              <label className="mt-3 flex items-start gap-3 text-sm text-[#e8dfcc] cursor-pointer p-3 rounded-lg border border-[#5c4716] bg-black">
                <input
                  type="checkbox"
                  checked={verified}
                  onChange={(e) => setVerified(e.target.checked)}
                  className="mt-0.5 size-4 shrink-0 accent-[#f5b52c]"
                />
                <span>
                  <span className="flex items-center gap-1.5 text-white font-semibold">
                    <ShieldCheck size={15} className="text-[#f5b52c]" /> Sprawdziłem dokument tożsamości sprzedającego
                  </span>
                  Bez okazania dokumentu nie wolno przyjąć złomu od osoby prywatnej. Sprzedający podpisze też oświadczenie
                  o własności i legalnym pochodzeniu na wydruku kwitu.
                </span>
              </label>
            )}
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
                    <select value="" onChange={(e) => pickPrice(i, e.target.value)} className={`${inputClass} text-[#e8dfcc]`}>
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
                  <input
                    value={item.rodzaj_produktu}
                    onChange={(e) => setItem(i, { rodzaj_produktu: e.target.value })}
                    placeholder="Z czego pochodzi (opcjonalnie), np. elementy konstrukcyjne, narzędzia ogrodnicze"
                    className={`${inputClass} col-span-2 sm:col-span-5 text-xs`}
                  />
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
            <div className="text-xs text-[#e8dfcc]">Razem {formatKg(totalWeight(numericItems))}</div>
            <div className="text-2xl font-montserrat font-bold text-[#f5b52c]">{formatPln(totalValue(numericItems))}</div>
          </div>
          {error && <span className="w-full text-sm text-red-400 order-first">{error}</span>}
          {lastSaved && !error && (
            <span className="w-full text-sm text-green-400 order-first flex flex-wrap items-center gap-x-3">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} /> Zapisano kwit {lastSaved.numer}.
              </span>
              <a href={`/admin/skup/${lastSaved.id}`} target="_blank" rel="noopener" className="underline underline-offset-2 hover:text-white">
                Drukuj kwit
              </a>
            </span>
          )}
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-[#5c4716] text-[#e8dfcc] hover:text-white">
            {lastSaved ? "Zamknij" : "Anuluj"}
          </button>
          <button
            onClick={() => save("next")}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg border border-[#f5b52c]/60 text-white hover:bg-[#f5b52c] hover:text-black transition-colors font-semibold flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Zapisz i dodaj kolejny
          </button>
          <button
            onClick={() => save("print")}
            disabled={saving}
            className="btn-primary px-6 py-2.5 rounded-lg font-semibold text-black flex items-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />} Zapisz i drukuj kwit
          </button>
        </div>
      </div>
    </div>
  );
}
