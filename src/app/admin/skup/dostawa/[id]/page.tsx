"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, Loader2 } from "lucide-react";
import { BUSINESS } from "@/lib/site";
import { useSiteSettings } from "@/components/SiteSettingsProvider";
import type { SiteSettings } from "@/lib/site-settings";
import { CLEAN_STATEMENT, deliveryTotalWeight, type ScrapDelivery } from "@/lib/scrap-deliveries";
import { formatKg, formatMgRegulatory, formatPln, wasteCodeLabel } from "@/lib/scrap-purchases";

const copyLabels = ["Egzemplarz dla wydającego (GREMPOOL)", "Egzemplarz dla odbierającego"];

function Party({ title, lines }: { title: string; lines: (string | null | undefined)[] }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="text-[11px] uppercase tracking-widest text-gray-500 mb-1">{title}</div>
      {lines.filter(Boolean).map((line, i) => (
        <div key={i} className={i === 0 ? "font-bold" : ""}>
          {line}
        </div>
      ))}
    </div>
  );
}

function DeliveryDocument({ delivery, site, copy }: { delivery: ScrapDelivery; site: SiteSettings; copy: string }) {
  const date = new Date(delivery.data);
  const kg = deliveryTotalWeight(delivery.pozycje);
  const netto = delivery.waga_brutto !== null && delivery.waga_tara !== null ? delivery.waga_brutto - delivery.waga_tara : null;
  const priced = delivery.pozycje.some((p) => p.cena_kg > 0);

  return (
    <article className="bg-white text-black max-w-[210mm] mx-auto p-10 rounded-lg print:rounded-none print:p-0 print:max-w-none text-[12.5px] leading-relaxed">
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
          <div className="text-lg font-bold leading-tight mt-1">DOKUMENT DOSTAWY ZŁOMU</div>
          <div className="mt-1">
            Nr: <span className="font-bold font-mono">{delivery.numer}</span>
          </div>
          <div>
            {date.toLocaleDateString("pl-PL")}, godz. {date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </header>

      <section className="flex gap-8 mt-4 pb-4 border-b border-gray-300">
        <Party
          title="Wydający (sprzedawca)"
          lines={[
            BUSINESS.legalName,
            `${site.streetAddress}, ${site.postalCode} ${site.addressLocality}`,
            `NIP ${BUSINESS.taxId}${site.bdo ? ` · BDO ${site.bdo}` : ""}`,
          ]}
        />
        <Party
          title="Odbierający (odbiorca)"
          lines={[
            delivery.odbiorca_nazwa,
            delivery.odbiorca_adres,
            [delivery.odbiorca_nip ? `NIP ${delivery.odbiorca_nip}` : "", delivery.odbiorca_bdo ? `BDO ${delivery.odbiorca_bdo}` : ""]
              .filter(Boolean)
              .join(" · "),
          ]}
        />
      </section>

      <section className="grid grid-cols-2 gap-x-8 mt-3 text-[12px]">
        <div>
          <span className="text-gray-600">Pojazd: </span>
          <strong>{delivery.nr_rejestracyjny || "—"}</strong>
        </div>
        <div>
          <span className="text-gray-600">Przewoźnik / kierowca: </span>
          <strong>{delivery.przewoznik || "—"}</strong>
        </div>
        <div>
          <span className="text-gray-600">Nr zamówienia / umowy: </span>
          <strong>{delivery.nr_zamowienia || "—"}</strong>
        </div>
        <div>
          <span className="text-gray-600">Nr KPO (BDO): </span>
          <strong>{delivery.numer_kpo || "………………………………"}</strong>
        </div>
        {delivery.waga_brutto !== null && (
          <div className="col-span-2 mt-1">
            <span className="text-gray-600">Ważenie na wadze najazdowej: </span>
            brutto <strong>{formatKg(delivery.waga_brutto)}</strong>
            {delivery.waga_tara !== null && (
              <>
                , tara <strong>{formatKg(delivery.waga_tara)}</strong>
              </>
            )}
            {netto !== null && (
              <>
                , netto <strong>{formatKg(Math.round(netto * 1000) / 1000)}</strong>
              </>
            )}
          </div>
        )}
      </section>

      <table className="w-full mt-4 border-collapse">
        <thead>
          <tr className="border-y-2 border-black text-left align-bottom">
            <th className="py-2 pr-2 w-8">Lp.</th>
            <th className="py-2 pr-2">Rodzaj / gatunek złomu</th>
            <th className="py-2 pr-2">Kod odpadu</th>
            <th className="py-2 pr-2 text-right">Masa (kg)</th>
            <th className="py-2 pr-2 text-right">Masa (Mg)</th>
            {priced && <th className="py-2 pr-2 text-right">Cena za kg</th>}
            {priced && <th className="py-2 text-right">Wartość netto</th>}
          </tr>
        </thead>
        <tbody>
          {delivery.pozycje.map((item, i) => (
            <tr key={i} className="border-b border-gray-300 align-top">
              <td className="py-2 pr-2">{i + 1}</td>
              <td className="py-2 pr-2">
                {item.nazwa}
                <div className="text-[11px] text-gray-500">{wasteCodeLabel(item.kod_odpadu)}</div>
              </td>
              <td className="py-2 pr-2 whitespace-nowrap">{item.kod_odpadu}</td>
              <td className="py-2 pr-2 text-right whitespace-nowrap">{formatKg(item.waga_kg)}</td>
              <td className="py-2 pr-2 text-right whitespace-nowrap">{formatMgRegulatory(item.waga_kg)}</td>
              {priced && <td className="py-2 pr-2 text-right whitespace-nowrap">{item.cena_kg > 0 ? formatPln(item.cena_kg) : "—"}</td>}
              {priced && <td className="py-2 text-right whitespace-nowrap">{item.cena_kg > 0 ? formatPln(item.wartosc) : "—"}</td>}
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
            {priced && <td />}
            {priced && <td className="pt-3 text-right whitespace-nowrap">{formatPln(delivery.suma)}</td>}
          </tr>
        </tfoot>
      </table>

      {delivery.oswiadczenie_czystosci && (
        <section className="mt-5 p-3 border border-gray-400 rounded">
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">Oświadczenie wydającego</div>
          <p className="font-semibold">{CLEAN_STATEMENT}</p>
        </section>
      )}

      {delivery.uwagi && (
        <section className="mt-4">
          <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">Uwagi</div>
          <p>{delivery.uwagi}</p>
        </section>
      )}

      <section className="grid grid-cols-2 gap-12 mt-14 text-center text-xs text-gray-600">
        <div className="border-t border-gray-500 pt-2">
          Wydał (data, podpis){delivery.wystawil ? `: ${delivery.wystawil}` : ""}
        </div>
        <div className="border-t border-gray-500 pt-2">Odebrał (data, podpis, pieczęć)</div>
      </section>

      <footer className="mt-10 pt-3 border-t border-gray-300 text-[10px] leading-snug text-gray-500">
        Dokument potwierdza wydanie złomu odbiorcy; nie zastępuje faktury ani karty przekazania odpadów (KPO) generowanej w
        systemie BDO. Masa wg wagi wydającego, rozliczenie według ustaleń z odbiorcą.
      </footer>
    </article>
  );
}

export default function DeliveryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const site = useSiteSettings();
  const [delivery, setDelivery] = useState<ScrapDelivery | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/scrap-deliveries/${id}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Nie udało się wczytać dokumentu");
        setDelivery(body);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Nie udało się wczytać dokumentu"));
  }, [id]);

  if (error) return <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm">{error}</div>;
  if (!delivery) {
    return (
      <div className="flex items-center gap-2 text-[#e8dfcc]">
        <Loader2 size={16} className="animate-spin" /> Wczytywanie dokumentu...
      </div>
    );
  }

  return (
    <div>
      <style>{"@media print { @page { size: A4; margin: 12mm; } }"}</style>

      <div className="print:hidden flex flex-wrap items-center gap-3 mb-4">
        <Link href="/admin/skup" className="flex items-center gap-2 text-sm text-[#e8dfcc] hover:text-white mr-auto">
          <ArrowLeft size={16} /> Wróć do ewidencji
        </Link>
        <button
          onClick={() => window.print()}
          className="btn-primary px-5 py-2.5 rounded-lg text-sm font-semibold text-black flex items-center gap-2"
        >
          <Printer size={16} /> Drukuj 2 egzemplarze / zapisz PDF
        </button>
      </div>
      <p className="print:hidden text-xs text-[#e8dfcc]/70 mb-4">
        Wydruk zawiera dwa egzemplarze (dla wydającego i dla odbierającego), każdy na osobnej stronie.
      </p>

      <DeliveryDocument delivery={delivery} site={site} copy={copyLabels[0]} />
      <div className="hidden print:block print:break-before-page">
        <DeliveryDocument delivery={delivery} site={site} copy={copyLabels[1]} />
      </div>
    </div>
  );
}
