"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, X, Loader2, Save } from "lucide-react";
import { SERVICE_LABELS } from "@/lib/supabase";
import { UNITS, VAT_OPTIONS, formatPln, lineNet, offerTotals, type Offer, type VatRate } from "@/lib/offers";

interface FormItem {
  opis: string;
  ilosc: string;
  jm: string;
  cena: string;
}

const emptyItem: FormItem = { opis: "", ilosc: "1", jm: "szt.", cena: "" };
const toNumber = (v: string) => Number(v.replace(",", "."));
const inputClass =
  "w-full bg-[#000000] border border-[#5c4716] focus:border-[#f5b52c] rounded-lg px-3 py-2 text-sm text-white outline-none";

// Create or edit an offer. A new offer can start from a CRM inquiry (leadId),
// which fills in the customer and the requested service.
export default function OfferEditor({ offer, leadId }: { offer?: Offer; leadId?: string | null }) {
  const [klient, setKlient] = useState({
    klient_nazwa: offer?.klient_nazwa ?? "",
    klient_email: offer?.klient_email ?? "",
    klient_telefon: offer?.klient_telefon ?? "",
    klient_adres: offer?.klient_adres ?? "",
  });
  const [temat, setTemat] = useState(offer?.temat ?? "");
  const [items, setItems] = useState<FormItem[]>(
    offer?.pozycje.map((p) => ({ opis: p.opis, ilosc: String(p.ilosc), jm: p.jm, cena: String(p.cena) })) ?? [{ ...emptyItem }]
  );
  const [vat, setVat] = useState<VatRate>(offer?.vat ?? "23");
  const [waznosc, setWaznosc] = useState(String(offer?.waznosc_dni ?? 14));
  const [uwagi, setUwagi] = useState(offer?.uwagi ?? "");
  const [lead, setLead] = useState<string | null>(offer?.lead_id ?? leadId ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (offer || !leadId) return;
    fetch(`/api/leads/${leadId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((l) => {
        if (!l) return;
        setLead(l.id);
        setKlient({
          klient_nazwa: `${l.klient_imie ?? ""} ${l.klient_nazwisko ?? ""}`.trim(),
          klient_email: l.klient_email ?? "",
          klient_telefon: l.klient_telefon ?? "",
          klient_adres: l.lokalizacja ?? "",
        });
        setTemat(`${SERVICE_LABELS[l.usluga] ?? l.usluga} — ${l.numer}`);
        setItems([{ ...emptyItem, opis: SERVICE_LABELS[l.usluga] ?? "" }]);
      })
      .catch(() => {});
  }, [offer, leadId]);

  const setItem = (i: number, patch: Partial<FormItem>) =>
    setItems((prev) => prev.map((item, j) => (j === i ? { ...item, ...patch } : item)));

  const numeric = items.map((i) => ({ ilosc: toNumber(i.ilosc) || 0, cena: toNumber(i.cena) || 0 }));
  const totals = offerTotals(numeric, vat);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(offer ? `/api/offers/${offer.id}` : "/api/offers", {
        method: offer ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...klient, temat, pozycje: items, vat, waznosc_dni: waznosc, uwagi, lead_id: lead }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Nie udało się zapisać oferty");
        return;
      }
      window.location.assign(`/admin/oferty/${body.id}`);
    } catch {
      setError("Brak połączenia z serwerem");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <Link href="/admin/oferty" className="inline-flex items-center gap-2 text-sm text-[#e8dfcc] hover:text-white mb-4">
        <ArrowLeft size={16} /> Wszystkie oferty
      </Link>
      <h1 className="text-2xl font-montserrat font-bold mb-6">{offer ? `Edycja oferty ${offer.numer}` : "Nowa oferta"}</h1>

      <div className="space-y-6">
        <section className="bg-[#0a0a0a] p-5 rounded-xl border border-[#5c4716]">
          <h2 className="font-semibold mb-3">Klient</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={klient.klient_nazwa}
              onChange={(e) => setKlient({ ...klient, klient_nazwa: e.target.value })}
              placeholder="Imię i nazwisko / firma *"
              className={inputClass}
            />
            <input
              type="email"
              value={klient.klient_email}
              onChange={(e) => setKlient({ ...klient, klient_email: e.target.value })}
              placeholder="E-mail (do wysłania oferty)"
              className={inputClass}
            />
            <input
              value={klient.klient_telefon}
              onChange={(e) => setKlient({ ...klient, klient_telefon: e.target.value })}
              placeholder="Telefon"
              className={inputClass}
            />
            <input
              value={klient.klient_adres}
              onChange={(e) => setKlient({ ...klient, klient_adres: e.target.value })}
              placeholder="Adres / miejsce realizacji"
              className={inputClass}
            />
          </div>
          <input value={temat} onChange={(e) => setTemat(e.target.value)} placeholder="Temat oferty, np. Rozbiórka garażu" className={`${inputClass} mt-3`} />
        </section>

        <section className="bg-[#0a0a0a] p-5 rounded-xl border border-[#5c4716]">
          <h2 className="font-semibold mb-3">Pozycje (ceny netto)</h2>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-6 sm:grid-cols-[1fr_80px_90px_110px_110px_auto] gap-2 items-center">
                <input
                  value={item.opis}
                  onChange={(e) => setItem(i, { opis: e.target.value })}
                  placeholder="Opis usługi / towaru"
                  className={`${inputClass} col-span-6 sm:col-span-1`}
                />
                <input
                  value={item.ilosc}
                  onChange={(e) => setItem(i, { ilosc: e.target.value })}
                  inputMode="decimal"
                  className={`${inputClass} col-span-2 sm:col-span-1`}
                  aria-label="Ilość"
                />
                <select
                  value={item.jm}
                  onChange={(e) => setItem(i, { jm: e.target.value })}
                  className={`${inputClass} col-span-2 sm:col-span-1`}
                  aria-label="Jednostka"
                >
                  {UNITS.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </select>
                <input
                  value={item.cena}
                  onChange={(e) => setItem(i, { cena: e.target.value })}
                  inputMode="decimal"
                  placeholder="cena"
                  className={`${inputClass} col-span-2 sm:col-span-1`}
                  aria-label="Cena netto"
                />
                <span className="col-span-4 sm:col-span-1 text-sm text-right text-white whitespace-nowrap">
                  {formatPln(lineNet(numeric[i]))}
                </span>
                <button
                  type="button"
                  onClick={() => setItems((prev) => (prev.length > 1 ? prev.filter((_, j) => j !== i) : prev))}
                  className="col-span-2 sm:col-span-1 p-2 rounded hover:bg-[#5c4716] justify-self-end"
                  aria-label="Usuń pozycję"
                >
                  <X size={15} className="text-red-400" />
                </button>
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

          <div className="flex flex-wrap items-end justify-between gap-4 mt-5 pt-4 border-t border-[#5c4716]">
            <div className="flex flex-wrap gap-3">
              <label className="text-xs text-[#e8dfcc]">
                VAT
                <select value={vat} onChange={(e) => setVat(e.target.value as VatRate)} className={`${inputClass} mt-1`}>
                  {VAT_OPTIONS.map((v) => (
                    <option key={v.value} value={v.value}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-[#e8dfcc]">
                Ważna (dni)
                <input value={waznosc} onChange={(e) => setWaznosc(e.target.value)} inputMode="numeric" className={`${inputClass} mt-1 w-24`} />
              </label>
            </div>
            <div className="text-right text-sm">
              <div className="text-[#e8dfcc]">Netto: {formatPln(totals.netto)}</div>
              {vat !== "zw" && <div className="text-[#e8dfcc]">VAT: {formatPln(totals.podatek)}</div>}
              <div className="text-2xl font-montserrat font-bold text-[#f5b52c]">{formatPln(totals.brutto)}</div>
            </div>
          </div>
        </section>

        <section className="bg-[#0a0a0a] p-5 rounded-xl border border-[#5c4716]">
          <h2 className="font-semibold mb-3">Uwagi na ofercie</h2>
          <textarea
            rows={3}
            value={uwagi}
            onChange={(e) => setUwagi(e.target.value)}
            placeholder="np. Cena obejmuje transport i wywóz gruzu. Termin realizacji do uzgodnienia."
            className={inputClass}
          />
        </section>

        {error && <div className="text-sm text-red-400">{error}</div>}
        <button
          onClick={save}
          disabled={saving}
          className="btn-primary px-6 py-3 rounded-lg font-semibold text-black flex items-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Zapisz ofertę
        </button>
      </div>
    </div>
  );
}
