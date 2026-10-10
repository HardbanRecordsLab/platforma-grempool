"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { BUSINESS } from "@/lib/site";
import { useSiteSettings } from "@/components/SiteSettingsProvider";
import type { SiteSettings } from "@/lib/site-settings";
import {
  formatKg,
  formatMgRegulatory,
  formatPln,
  totalWeight,
  wasteCodeLabel,
  type ScrapPurchase,
} from "@/lib/scrap-purchases";

const STATEMENT =
  "Oświadczam, że odpad stanowi moją własność, nie jest obciążony prawami na rzecz osób trzecich i nie pochodzi z kradzieży.";

const copyLabels = ["Egzemplarz dla przekazującego (sprzedającego)", "Egzemplarz dla przyjmującego (GREMPOOL)"];

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-2 py-1 border-b border-gray-200">
      <span className="w-56 shrink-0 text-gray-600">{label}</span>
      <span className="font-semibold">{value || "—"}</span>
    </div>
  );
}

function CompanyHeader({ site, title, receipt, copy }: { site: SiteSettings; title: string; receipt: ScrapPurchase; copy: string }) {
  const date = new Date(receipt.data);
  return (
    <header className="flex items-start justify-between gap-6 pb-4 border-b-2 border-black">
      <div>
        <img src="/assets/logo-grempool-wide.png" alt="GREMPOOL" className="h-12 w-auto mb-2" />
        <div className="font-bold">{BUSINESS.legalName}</div>
        <div>
          {site.streetAddress}, {site.postalCode} {site.addressLocality}
        </div>
        <div>
          NIP {BUSINESS.taxId} · REGON {BUSINESS.regon}
          {site.bdo ? ` · BDO ${site.bdo}` : ""}
        </div>
        <div>
          tel. {site.phone} · {site.email}
        </div>
      </div>
      <div className="text-right">
        <div className="text-[11px] uppercase tracking-widest text-gray-500">{copy}</div>
        <div className="text-lg font-bold leading-tight mt-1">{title}</div>
        <div className="mt-1">
          Nr formularza: <span className="font-bold font-mono">{receipt.numer}</span>
        </div>
        <div>
          {date.toLocaleDateString("pl-PL")}, godz. {date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </header>
  );
}

function Weighing({ receipt }: { receipt: ScrapPurchase }) {
  const netto = receipt.waga_brutto !== null && receipt.waga_tara !== null ? receipt.waga_brutto - receipt.waga_tara : null;
  if (!receipt.nr_rejestracyjny && receipt.waga_brutto === null) return null;
  return (
    <div className="mt-3 text-xs text-gray-600">
      Dane dodatkowe:
      {receipt.nr_rejestracyjny ? ` pojazd ${receipt.nr_rejestracyjny};` : ""}
      {receipt.waga_brutto !== null ? ` brutto ${formatKg(receipt.waga_brutto)};` : ""}
      {receipt.waga_tara !== null ? ` tara ${formatKg(receipt.waga_tara)};` : ""}
      {netto !== null ? ` netto ${formatKg(Math.round(netto * 1000) / 1000)};` : ""} forma płatności: {receipt.platnosc === "przelew" ? "przelew" : "gotówka"}.
    </div>
  );
}

function Signatures({ receipt }: { receipt: ScrapPurchase }) {
  return (
    <section className="grid grid-cols-2 gap-12 mt-14 text-center text-xs text-gray-600">
      <div className="border-t border-gray-500 pt-2">
        Data i podpis przyjmującego odpady
        {receipt.wystawil ? ` (${receipt.wystawil})` : ""}
      </div>
      <div className="border-t border-gray-500 pt-2">
        {receipt.sprzedawca_typ === "osoba" ? "Podpis osoby przekazującej odpady" : "Podpis sprzedającego"}
      </div>
    </section>
  );
}

// Private persons: the "formularz przyjęcia odpadów metali" with the fields
// and wording of the annex to the Regulation of the Minister of the
// Environment of 9 December 2013 (Dz.U. 2013 poz. 1607).
function FpoForm({ receipt, site, copy }: { receipt: ScrapPurchase; site: SiteSettings; copy: string }) {
  const kg = totalWeight(receipt.pozycje);
  const date = new Date(receipt.data);
  return (
    <article className="bg-white text-black max-w-[210mm] mx-auto p-10 rounded-lg print:rounded-none print:p-0 print:max-w-none text-[12.5px] leading-relaxed">
      <CompanyHeader site={site} title="FORMULARZ PRZYJĘCIA ODPADÓW METALI" receipt={receipt} copy={copy} />

      <section className="mt-4">
        <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">Osoba przekazująca odpady</div>
        <Field label="Imię i nazwisko" value={receipt.sprzedawca_nazwa} />
        <Field label="Adres" value={receipt.sprzedawca_adres} />
        <Field label="Numer dowodu osobistego lub innego dowodu tożsamości" value={receipt.sprzedawca_dokument} />
      </section>

      <section className="mt-4">
        <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">Przekazanie odpadów</div>
        <Field label="Data przyjęcia odpadów" value={date.toLocaleDateString("pl-PL")} />
        <Field label="Źródło pochodzenia odpadów" value={receipt.zrodlo_pochodzenia} />
      </section>

      <table className="w-full mt-4 border-collapse">
        <thead>
          <tr className="border-y-2 border-black text-left align-bottom">
            <th className="py-2 pr-2 w-8">Lp.</th>
            <th className="py-2 pr-2">Kod odpadów</th>
            <th className="py-2 pr-2">Rodzaj odpadów</th>
            <th className="py-2 pr-2">Rodzaj produktu, z którego powstały odpady</th>
            <th className="py-2 pr-2 text-right">Masa odpadów (Mg)</th>
            <th className="py-2 text-right">Wartość odpadów</th>
          </tr>
        </thead>
        <tbody>
          {receipt.pozycje.map((item, i) => (
            <tr key={i} className="border-b border-gray-300 align-top">
              <td className="py-2 pr-2">{i + 1}</td>
              <td className="py-2 pr-2 whitespace-nowrap">{item.kod_odpadu}</td>
              <td className="py-2 pr-2">{wasteCodeLabel(item.kod_odpadu) || item.nazwa}</td>
              <td className="py-2 pr-2">{item.rodzaj_produktu || item.nazwa}</td>
              <td className="py-2 pr-2 text-right whitespace-nowrap">{formatMgRegulatory(item.waga_kg)}</td>
              <td className="py-2 text-right whitespace-nowrap">{formatPln(item.wartosc)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-bold">
            <td colSpan={4} className="pt-3">
              Suma
            </td>
            <td className="pt-3 pr-2 text-right whitespace-nowrap">{formatMgRegulatory(kg)}</td>
            <td className="pt-3 text-right whitespace-nowrap">{formatPln(receipt.suma)}</td>
          </tr>
        </tfoot>
      </table>
      <Weighing receipt={receipt} />

      <section className="mt-5 p-3 border border-gray-400 rounded">
        <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">Oświadczenie przekazującego odpady</div>
        <p className="font-semibold">{STATEMENT}</p>
      </section>

      <section className="mt-4">
        <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">Uwagi</div>
        <p className="min-h-[1.5rem]">{receipt.uwagi || ""}</p>
      </section>

      <section className="mt-3">
        <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">
          Posiadacz odpadów przyjmujący odpady (imię i nazwisko lub nazwa)
        </div>
        <p className="font-semibold">
          {BUSINESS.legalName}, {site.streetAddress}, {site.postalCode} {site.addressLocality}
        </p>
      </section>

      <Signatures receipt={receipt} />

      <footer className="mt-10 pt-3 border-t border-gray-300 text-[10px] leading-snug text-gray-500">
        Formularz sporządzony w dwóch egzemplarzach (po jednym dla przekazującego i przyjmującego) według wzoru z załącznika do
        rozporządzenia Ministra Środowiska z dnia 9 grudnia 2013 r. w sprawie wzoru formularza przyjęcia odpadów metali (Dz.U.
        2013 poz. 1607). Przechowywać 5 lat od końca roku kalendarzowego, w którym go sporządzono. Administratorem danych
        osobowych jest {BUSINESS.legalName}; dane przetwarzamy w celu udokumentowania przyjęcia odpadów metali (art. 6 ust. 1 lit.
        c RODO). Szczegóły: grempool.pl/polityka-prywatnosci.
      </footer>
    </article>
  );
}

// Companies: a purchase document with the same data, weights in kg and Mg.
function CompanyReceipt({ receipt, site, copy }: { receipt: ScrapPurchase; site: SiteSettings; copy: string }) {
  const kg = totalWeight(receipt.pozycje);
  return (
    <article className="bg-white text-black max-w-[210mm] mx-auto p-10 rounded-lg print:rounded-none print:p-0 print:max-w-none text-[12.5px] leading-relaxed">
      <CompanyHeader site={site} title="KWIT SKUPU — DOKUMENT PRZYJĘCIA ODPADÓW" receipt={receipt} copy={copy} />

      <section className="mt-4">
        <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">Sprzedający (firma)</div>
        <Field label="Nazwa" value={receipt.sprzedawca_nazwa} />
        <Field label="Adres" value={receipt.sprzedawca_adres} />
        <Field label="NIP" value={receipt.sprzedawca_dokument} />
        <Field label="Źródło pochodzenia odpadów" value={receipt.zrodlo_pochodzenia} />
      </section>

      <table className="w-full mt-4 border-collapse">
        <thead>
          <tr className="border-y-2 border-black text-left align-bottom">
            <th className="py-2 pr-2 w-8">Lp.</th>
            <th className="py-2 pr-2">Rodzaj złomu</th>
            <th className="py-2 pr-2">Kod odpadu</th>
            <th className="py-2 pr-2 text-right">Masa (kg)</th>
            <th className="py-2 pr-2 text-right">Masa (Mg)</th>
            <th className="py-2 pr-2 text-right">Cena za kg</th>
            <th className="py-2 text-right">Wartość</th>
          </tr>
        </thead>
        <tbody>
          {receipt.pozycje.map((item, i) => (
            <tr key={i} className="border-b border-gray-300 align-top">
              <td className="py-2 pr-2">{i + 1}</td>
              <td className="py-2 pr-2">
                {item.nazwa}
                <div className="text-[11px] text-gray-500">{wasteCodeLabel(item.kod_odpadu)}</div>
              </td>
              <td className="py-2 pr-2 whitespace-nowrap">{item.kod_odpadu}</td>
              <td className="py-2 pr-2 text-right whitespace-nowrap">{formatKg(item.waga_kg)}</td>
              <td className="py-2 pr-2 text-right whitespace-nowrap">{formatMgRegulatory(item.waga_kg)}</td>
              <td className="py-2 pr-2 text-right whitespace-nowrap">{formatPln(item.cena_kg)}</td>
              <td className="py-2 text-right whitespace-nowrap">{formatPln(item.wartosc)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-bold">
            <td colSpan={3} className="pt-3">
              Razem
            </td>
            <td className="pt-3 pr-2 text-right whitespace-nowrap">{formatKg(kg)}</td>
            <td className="pt-3 pr-2 text-right whitespace-nowrap">{formatMgRegulatory(kg)}</td>
            <td />
            <td className="pt-3 text-right text-base whitespace-nowrap">{formatPln(receipt.suma)}</td>
          </tr>
        </tfoot>
      </table>
      <Weighing receipt={receipt} />

      {receipt.uwagi && (
        <section className="mt-4">
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">Uwagi</div>
          <p>{receipt.uwagi}</p>
        </section>
      )}

      <Signatures receipt={receipt} />

      <footer className="mt-10 pt-3 border-t border-gray-300 text-[10px] leading-snug text-gray-500">
        Administratorem danych osobowych jest {BUSINESS.legalName}; dane przetwarzamy w celu udokumentowania zakupu i spełnienia
        obowiązków prawnych (art. 6 ust. 1 lit. c RODO). Szczegóły: grempool.pl/polityka-prywatnosci.
      </footer>
    </article>
  );
}

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

  const Form = receipt.sprzedawca_typ === "osoba" ? FpoForm : CompanyReceipt;

  return (
    <div>
      <style>{"@media print { @page { size: A4; margin: 12mm; } }"}</style>

      <div className="print:hidden flex flex-wrap items-center gap-3 mb-4">
        <Link href="/admin/skup" className="flex items-center gap-2 text-sm text-[#e8dfcc] hover:text-white mr-auto">
          <ArrowLeft size={16} /> Wróć do ewidencji
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
          <Printer size={16} /> Drukuj 2 egzemplarze / zapisz PDF
        </button>
      </div>
      {mailState === "error" && <p className="print:hidden text-sm text-red-400 mb-3">{mailError}</p>}
      <p className="print:hidden text-xs text-[#e8dfcc]/70 mb-4">
        Wydruk zawiera dwa egzemplarze (po jednym dla sprzedającego i dla przyjmującego), każdy na osobnej stronie.
      </p>

      <Form receipt={receipt} site={site} copy={copyLabels[0]} />
      <div className="hidden print:block print:break-before-page">
        <Form receipt={receipt} site={site} copy={copyLabels[1]} />
      </div>
    </div>
  );
}
