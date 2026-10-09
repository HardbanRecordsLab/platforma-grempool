"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { BUSINESS } from "@/lib/site";
import { useSiteSettings } from "@/components/SiteSettingsProvider";
import { formatKg, formatPln, totalWeight, wasteCodeLabel, type ScrapPurchase } from "@/lib/scrap-purchases";

// Printable receipt. "Drukuj" opens the browser print dialog, where
// "Zapisz jako PDF" gives the PDF; the admin chrome is hidden in print.
export default function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const site = useSiteSettings();
  const [receipt, setReceipt] = useState<ScrapPurchase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mailState, setMailState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [mailError, setMailError] = useState("");

  useEffect(() => {
    fetch(`/api/scrap-purchases/${id}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Nie udało się wczytać kwitu");
        setReceipt(body);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Nie udało się wczytać kwitu"));
  }, [id]);

  const sendMail = async () => {
    setMailState("sending");
    const res = await fetch(`/api/scrap-purchases/${id}/email`, { method: "POST" });
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      setMailState("sent");
    } else {
      setMailError(body.error ?? "Nie udało się wysłać");
      setMailState("error");
    }
  };

  if (error) {
    return <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm">{error}</div>;
  }
  if (!receipt) {
    return (
      <div className="flex items-center gap-2 text-[#e8dfcc]">
        <Loader2 size={16} className="animate-spin" /> Wczytywanie kwitu...
      </div>
    );
  }

  const date = new Date(receipt.data);
  const netto = receipt.waga_brutto !== null && receipt.waga_tara !== null ? receipt.waga_brutto - receipt.waga_tara : null;

  return (
    <div>
      <div className="print:hidden flex flex-wrap items-center gap-3 mb-6">
        <Link href="/admin/skup" className="flex items-center gap-2 text-sm text-[#e8dfcc] hover:text-white mr-auto">
          <ArrowLeft size={16} /> Wróć do listy kwitów
        </Link>
        {receipt.sprzedawca_email && (
          <button
            onClick={sendMail}
            disabled={mailState === "sending" || mailState === "sent"}
            className="px-4 py-2.5 rounded-lg border border-[#5c4716] text-sm text-white hover:border-[#f5b52c] flex items-center gap-2 disabled:opacity-60"
          >
            {mailState === "sending" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : mailState === "sent" ? (
              <CheckCircle2 size={16} className="text-green-400" />
            ) : (
              <Mail size={16} />
            )}
            {mailState === "sent" ? `Wysłano na ${receipt.sprzedawca_email}` : `Wyślij na ${receipt.sprzedawca_email}`}
          </button>
        )}
        <button
          onClick={() => window.print()}
          className="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold text-black flex items-center gap-2"
        >
          <Printer size={16} /> Drukuj / zapisz PDF
        </button>
      </div>
      {mailState === "error" && <p className="print:hidden text-sm text-red-400 mb-4">{mailError}</p>}

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
              tel. {site.phone} · {site.email}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-widest text-gray-500">Kwit skupu</div>
            <div className="text-2xl font-bold font-mono">{receipt.numer}</div>
            <div className="mt-1">{date.toLocaleDateString("pl-PL")}, godz. {date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}</div>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-6 py-5 border-b border-gray-300">
          <div>
            <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">Sprzedający</div>
            <div className="font-bold">{receipt.sprzedawca_nazwa}</div>
            {receipt.sprzedawca_adres && <div>{receipt.sprzedawca_adres}</div>}
            {receipt.sprzedawca_dokument && (
              <div>
                {receipt.sprzedawca_typ === "firma" ? "NIP" : "Dokument tożsamości"}: {receipt.sprzedawca_dokument}
              </div>
            )}
            {receipt.sprzedawca_telefon && <div>tel. {receipt.sprzedawca_telefon}</div>}
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">Ważenie</div>
            {receipt.nr_rejestracyjny && <div>Pojazd: {receipt.nr_rejestracyjny}</div>}
            {receipt.waga_brutto !== null && <div>Brutto: {formatKg(receipt.waga_brutto)}</div>}
            {receipt.waga_tara !== null && <div>Tara: {formatKg(receipt.waga_tara)}</div>}
            {netto !== null && <div className="font-semibold">Netto: {formatKg(Math.round(netto * 10) / 10)}</div>}
            {receipt.waga_brutto === null && !receipt.nr_rejestracyjny && <div>Waga netto wg pozycji</div>}
          </div>
        </section>

        <table className="w-full mt-5">
          <thead>
            <tr className="border-b-2 border-black text-left">
              <th className="py-2 pr-2">Lp.</th>
              <th className="py-2 pr-2">Rodzaj złomu</th>
              <th className="py-2 pr-2">Kod odpadu</th>
              <th className="py-2 pr-2 text-right">Waga</th>
              <th className="py-2 pr-2 text-right">Cena</th>
              <th className="py-2 text-right">Wartość</th>
            </tr>
          </thead>
          <tbody>
            {receipt.pozycje.map((item, i) => (
              <tr key={i} className="border-b border-gray-300 align-top">
                <td className="py-2 pr-2">{i + 1}</td>
                <td className="py-2 pr-2">{item.nazwa}</td>
                <td className="py-2 pr-2 whitespace-nowrap">
                  {item.kod_odpadu}
                  <div className="text-[11px] text-gray-500">{wasteCodeLabel(item.kod_odpadu)}</div>
                </td>
                <td className="py-2 pr-2 text-right whitespace-nowrap">{formatKg(item.waga_kg)}</td>
                <td className="py-2 pr-2 text-right whitespace-nowrap">{formatPln(item.cena_kg)}/kg</td>
                <td className="py-2 text-right whitespace-nowrap">{formatPln(item.wartosc)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="pt-3 font-semibold">
                Razem
              </td>
              <td className="pt-3 pr-2 text-right font-semibold whitespace-nowrap">{formatKg(totalWeight(receipt.pozycje))}</td>
              <td />
              <td className="pt-3 text-right text-lg font-bold whitespace-nowrap">{formatPln(receipt.suma)}</td>
            </tr>
          </tfoot>
        </table>

        <section className="mt-5 text-sm">
          <div>
            Forma płatności: <strong>{receipt.platnosc === "przelew" ? "przelew" : "gotówka"}</strong>
          </div>
          {receipt.uwagi && <div className="mt-1">Uwagi: {receipt.uwagi}</div>}
        </section>

        <section className="grid grid-cols-2 gap-16 mt-16 text-center text-xs text-gray-600">
          <div className="border-t border-gray-400 pt-2">Podpis sprzedającego</div>
          <div className="border-t border-gray-400 pt-2">
            Podpis przyjmującego{receipt.wystawil ? ` (${receipt.wystawil})` : ""}
          </div>
        </section>
      </article>
    </div>
  );
}
