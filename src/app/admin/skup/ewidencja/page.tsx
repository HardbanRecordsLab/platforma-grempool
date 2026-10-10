import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PrintButton from "@/components/admin/PrintButton";
import { BUSINESS } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase-admin";
import { getSiteSettings } from "@/lib/site-settings-server";
import {
  formatMgRegulatory,
  formatPln,
  fromScrapPurchaseRow,
  wasteCodeLabel,
  type ScrapPurchase,
  type ScrapPurchaseItem,
} from "@/lib/scrap-purchases";

// Printable register (ewidencja) of everything bought in a period: one row
// per purchased item, in the order of purchase, with the data the FPO form and
// the waste records ask for. The admin chrome is hidden when printing.
export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ from?: string; to?: string; okres?: string; typ?: string }>;
}

const SELLER_LABEL: Record<string, string> = { osoba: "osoby prywatne", firma: "firmy" };

export default async function RegisterPage({ searchParams }: Props) {
  const params = await searchParams;
  const from = new Date(params.from ?? "");
  const to = new Date(params.to ?? "");
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || to <= from) {
    return <p className="text-red-400">Nieprawidłowy okres. Wróć do ewidencji i wybierz okres.</p>;
  }
  const typ = params.typ === "osoba" || params.typ === "firma" ? params.typ : null;

  let query = createAdminClient()
    .from("scrap_purchases")
    .select("*")
    .gte("data", from.toISOString())
    .lt("data", to.toISOString())
    .order("data", { ascending: true })
    .limit(5000);
  if (typ) query = query.eq("sprzedawca_typ", typ);
  const [{ data }, site] = await Promise.all([query, getSiteSettings()]);

  const purchases: ScrapPurchase[] = (data ?? []).map(fromScrapPurchaseRow);
  const rows = purchases.flatMap((purchase) => purchase.pozycje.map((item: ScrapPurchaseItem) => ({ purchase, item })));

  const totalKg = rows.reduce((sum, r) => sum + r.item.waga_kg, 0);
  const totalValue = rows.reduce((sum, r) => sum + r.item.wartosc, 0);
  const byCode = new Map<string, number>();
  for (const { item } of rows) byCode.set(item.kod_odpadu, (byCode.get(item.kod_odpadu) ?? 0) + item.waga_kg);

  return (
    <div>
      <style>{"@media print { @page { size: A4 landscape; margin: 10mm; } }"}</style>

      <div className="print:hidden flex flex-wrap items-center gap-3 mb-4">
        <Link href="/admin/skup" className="flex items-center gap-2 text-sm text-[#e8dfcc] hover:text-white mr-auto">
          <ArrowLeft size={16} /> Wróć do ewidencji
        </Link>
        <PrintButton label="Drukuj ewidencję / zapisz PDF" />
      </div>

      <article className="bg-white text-black mx-auto p-8 rounded-lg print:rounded-none print:p-0 text-[11px] leading-snug">
        <header className="flex items-start justify-between gap-6 pb-3 border-b-2 border-black">
          <div>
            <img src="/assets/logo-grempool-wide.png" alt="GREMPOOL" className="h-11 w-auto mb-1.5" />
            <div className="font-bold text-xs">{BUSINESS.legalName}</div>
            <div>
              {site.streetAddress}, {site.postalCode} {site.addressLocality} · NIP {BUSINESS.taxId} · REGON {BUSINESS.regon}
              {site.bdo ? ` · BDO ${site.bdo}` : ""}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">EWIDENCJA SKUPU ZŁOMU</div>
            <div className="text-xs">
              Okres: {params.okres ?? `${from.toLocaleDateString("pl-PL")} – ${to.toLocaleDateString("pl-PL")}`}
            </div>
            {typ && <div className="text-xs">Sprzedający: {SELLER_LABEL[typ]}</div>}
            <div className="text-[10px] text-gray-500 mt-1">Wydruk z dnia {new Date().toLocaleDateString("pl-PL")}</div>
          </div>
        </header>

        {rows.length === 0 ? (
          <p className="py-10 text-center text-gray-600">Brak zakupów w tym okresie.</p>
        ) : (
          <table className="w-full mt-3 border-collapse">
            <thead>
              <tr className="border-y-2 border-black text-left align-bottom">
                <th className="py-1.5 pr-2 w-7">Lp.</th>
                <th className="py-1.5 pr-2">Data</th>
                <th className="py-1.5 pr-2">Nr kwitu</th>
                <th className="py-1.5 pr-2">Sprzedający (nazwa, adres, dokument)</th>
                <th className="py-1.5 pr-2">Źródło pochodzenia</th>
                <th className="py-1.5 pr-2">Kod</th>
                <th className="py-1.5 pr-2">Rodzaj odpadu / materiał</th>
                <th className="py-1.5 pr-2 text-right">Masa (Mg)</th>
                <th className="py-1.5 pr-2 text-right">Wartość</th>
                <th className="py-1.5">Płatność</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ purchase, item }, i) => (
                <tr key={`${purchase.id}-${i}`} className="border-b border-gray-300 align-top">
                  <td className="py-1 pr-2">{i + 1}</td>
                  <td className="py-1 pr-2 whitespace-nowrap">
                    {new Date(purchase.data).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td className="py-1 pr-2 font-mono whitespace-nowrap">{purchase.numer}</td>
                  <td className="py-1 pr-2">
                    <span className="font-semibold">{purchase.sprzedawca_nazwa}</span>
                    <span className="block text-gray-600">
                      {[purchase.sprzedawca_adres, purchase.sprzedawca_dokument].filter(Boolean).join(" · ") || "—"}
                    </span>
                  </td>
                  <td className="py-1 pr-2">{purchase.zrodlo_pochodzenia || "—"}</td>
                  <td className="py-1 pr-2 whitespace-nowrap">{item.kod_odpadu}</td>
                  <td className="py-1 pr-2">
                    {wasteCodeLabel(item.kod_odpadu) || item.nazwa}
                    <span className="block text-gray-600">{item.nazwa}</span>
                  </td>
                  <td className="py-1 pr-2 text-right whitespace-nowrap">{formatMgRegulatory(item.waga_kg)}</td>
                  <td className="py-1 pr-2 text-right whitespace-nowrap">{formatPln(item.wartosc)}</td>
                  <td className="py-1 whitespace-nowrap">{purchase.platnosc === "przelew" ? "przelew" : "gotówka"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold border-t-2 border-black">
                <td colSpan={7} className="pt-2">
                  Razem ({rows.length} pozycji w {purchases.length} kwitach)
                </td>
                <td className="pt-2 pr-2 text-right whitespace-nowrap">{formatMgRegulatory(totalKg)}</td>
                <td className="pt-2 pr-2 text-right whitespace-nowrap">{formatPln(totalValue)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}

        {byCode.size > 0 && (
          <section className="mt-5 max-w-xl break-inside-avoid">
            <div className="text-xs font-bold mb-1">Podsumowanie według kodów odpadów (do karty ewidencji odpadów)</div>
            <table className="w-full border-collapse">
              <tbody>
                {[...byCode.entries()]
                  .sort((a, b) => b[1] - a[1])
                  .map(([code, kg]) => (
                    <tr key={code} className="border-b border-gray-300">
                      <td className="py-1 pr-3 font-mono whitespace-nowrap">{code}</td>
                      <td className="py-1 pr-3">{wasteCodeLabel(code)}</td>
                      <td className="py-1 text-right whitespace-nowrap">
                        {(kg / 1000).toLocaleString("pl-PL", { minimumFractionDigits: 4, maximumFractionDigits: 4 })} Mg
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </section>
        )}

        <footer className="mt-8 grid grid-cols-2 gap-16 text-center text-[10px] text-gray-600 break-inside-avoid">
          <div className="border-t border-gray-500 pt-1.5">Sporządził (data, podpis)</div>
          <div className="border-t border-gray-500 pt-1.5">Zatwierdził (data, podpis)</div>
        </footer>
      </article>
    </div>
  );
}
