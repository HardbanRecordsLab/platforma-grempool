"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, Mail, Loader2, CheckCircle2, Pencil } from "lucide-react";
import { BUSINESS } from "@/lib/site";
import { useSiteSettings } from "@/components/SiteSettingsProvider";
import { VAT_OPTIONS, formatPln, lineNet, offerTotals, type Offer } from "@/lib/offers";

// Printable offer: "Drukuj / zapisz PDF" uses the browser print dialog.
export default function OfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const site = useSiteSettings();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [mailOpen, setMailOpen] = useState(false);
  const [mailState, setMailState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [mailError, setMailError] = useState("");

  useEffect(() => {
    fetch(`/api/offers/${id}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Nie udało się wczytać oferty");
        setOffer(body);
        setMessage(
          `Dzień dobry,\n\nprzesyłamy ofertę ${body.numer}${body.temat ? ` (${body.temat})` : ""}. W razie pytań prosimy o kontakt: ${site.phone}.`
        );
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Nie udało się wczytać oferty"));
  }, [id, site.phone]);

  const send = async () => {
    setMailState("sending");
    const res = await fetch(`/api/offers/${id}/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      setMailState("sent");
      setMailOpen(false);
    } else {
      setMailError(body.error ?? "Nie udało się wysłać");
      setMailState("error");
    }
  };

  if (error) return <div className="text-red-400 text-sm">{error}</div>;
  if (!offer)
    return (
      <div className="flex items-center gap-2 text-[#e8dfcc]">
        <Loader2 size={16} className="animate-spin" /> Wczytywanie oferty...
      </div>
    );

  const created = new Date(offer.created_at);
  const validUntil = new Date(created.getTime() + offer.waznosc_dni * 86_400_000);
  const totals = offerTotals(offer.pozycje, offer.vat);
  const vatLabel = VAT_OPTIONS.find((v) => v.value === offer.vat)?.label ?? "";

  return (
    <div>
      <div className="print:hidden flex flex-wrap items-center gap-3 mb-4">
        <Link href="/admin/oferty" className="flex items-center gap-2 text-sm text-[#e8dfcc] hover:text-white mr-auto">
          <ArrowLeft size={16} /> Wszystkie oferty
        </Link>
        <Link
          href={`/admin/oferty/${offer.id}/edytuj`}
          className="px-4 py-2.5 rounded-lg border border-[#5c4716] text-sm text-white hover:border-[#f5b52c] flex items-center gap-2"
        >
          <Pencil size={16} /> Edytuj
        </Link>
        {offer.klient_email && (
          <button
            onClick={() => setMailOpen((v) => !v)}
            className="px-4 py-2.5 rounded-lg border border-[#5c4716] text-sm text-white hover:border-[#f5b52c] flex items-center gap-2"
          >
            {mailState === "sent" ? <CheckCircle2 size={16} className="text-green-400" /> : <Mail size={16} />}
            {mailState === "sent" ? `Wysłano na ${offer.klient_email}` : "Wyślij mailem"}
          </button>
        )}
        <button
          onClick={() => window.print()}
          className="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold text-black flex items-center gap-2"
        >
          <Printer size={16} /> Drukuj / zapisz PDF
        </button>
      </div>

      {mailOpen && (
        <div className="print:hidden bg-[#0a0a0a] border border-[#5c4716] rounded-xl p-4 mb-4 max-w-[210mm] mx-auto">
          <label className="block text-xs text-[#e8dfcc] mb-1">Wiadomość do {offer.klient_email} (oferta będzie pod spodem)</label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-black border border-[#5c4716] rounded-lg px-3 py-2 text-sm text-white"
          />
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={send}
              disabled={mailState === "sending"}
              className="btn-primary px-5 py-2 rounded-lg text-sm font-semibold text-black flex items-center gap-2 disabled:opacity-60"
            >
              {mailState === "sending" ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />} Wyślij
            </button>
            {mailState === "error" && <span className="text-sm text-red-400">{mailError}</span>}
          </div>
        </div>
      )}

      <article className="bg-white text-black max-w-[210mm] mx-auto p-10 rounded-lg print:rounded-none print:p-0 print:max-w-none text-[13px] leading-relaxed">
        <header className="flex items-start justify-between gap-6 pb-5 border-b-2 border-black">
          <div>
            <img src="/assets/logo-grempool-wide.png" alt="GREMPOOL" className="h-12 w-auto mb-2" />
            <div className="font-bold">{BUSINESS.legalName}</div>
            <div>
              {site.streetAddress}, {site.postalCode} {site.addressLocality}
            </div>
            <div>
              NIP {BUSINESS.taxId} · REGON {BUSINESS.regon}
            </div>
            <div>
              tel. {site.phone} · {site.email} · grempool.pl
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-widest text-gray-500">Oferta</div>
            <div className="text-2xl font-bold font-mono">{offer.numer}</div>
            <div className="mt-1">z dnia {created.toLocaleDateString("pl-PL")}</div>
            <div>ważna do {validUntil.toLocaleDateString("pl-PL")}</div>
          </div>
        </header>

        <section className="py-5 border-b border-gray-300">
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">Dla</div>
          <div className="font-bold">{offer.klient_nazwa}</div>
          {offer.klient_adres && <div>{offer.klient_adres}</div>}
          <div>{[offer.klient_telefon, offer.klient_email].filter(Boolean).join(" · ")}</div>
          {offer.temat && (
            <div className="mt-3">
              Dotyczy: <strong>{offer.temat}</strong>
            </div>
          )}
        </section>

        <table className="w-full mt-5">
          <thead>
            <tr className="border-b-2 border-black text-left">
              <th className="py-2 pr-2">Lp.</th>
              <th className="py-2 pr-2">Opis</th>
              <th className="py-2 pr-2 text-right">Ilość</th>
              <th className="py-2 pr-2 text-right">Cena netto</th>
              <th className="py-2 text-right">Wartość netto</th>
            </tr>
          </thead>
          <tbody>
            {offer.pozycje.map((item, i) => (
              <tr key={i} className="border-b border-gray-300 align-top">
                <td className="py-2 pr-2">{i + 1}</td>
                <td className="py-2 pr-2">{item.opis}</td>
                <td className="py-2 pr-2 text-right whitespace-nowrap">
                  {item.ilosc.toLocaleString("pl-PL")} {item.jm}
                </td>
                <td className="py-2 pr-2 text-right whitespace-nowrap">{formatPln(item.cena)}</td>
                <td className="py-2 text-right whitespace-nowrap">{formatPln(lineNet(item))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mt-4">
          <dl className="w-64 text-sm">
            <div className="flex justify-between py-1">
              <dt>Razem netto</dt>
              <dd>{formatPln(totals.netto)}</dd>
            </div>
            {offer.vat !== "zw" && (
              <div className="flex justify-between py-1">
                <dt>{vatLabel}</dt>
                <dd>{formatPln(totals.podatek)}</dd>
              </div>
            )}
            <div className="flex justify-between py-2 mt-1 border-t-2 border-black text-base font-bold">
              <dt>{offer.vat === "zw" ? "Do zapłaty" : "Razem brutto"}</dt>
              <dd>{formatPln(totals.brutto)}</dd>
            </div>
            {offer.vat === "zw" && <div className="text-[11px] text-gray-500">Sprzedaż zwolniona z VAT.</div>}
          </dl>
        </div>

        {offer.uwagi && (
          <section className="mt-6 text-sm">
            <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">Uwagi</div>
            <p className="whitespace-pre-line">{offer.uwagi}</p>
          </section>
        )}

        <section className="mt-12 flex justify-end text-xs text-gray-600">
          <div className="w-64 border-t border-gray-400 pt-2 text-center">
            Przygotował{offer.wystawil ? `: ${offer.wystawil}` : ""} — {BUSINESS.name}
          </div>
        </section>
      </article>
    </div>
  );
}
