"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Loader2,
  Trash2,
  Printer,
  Download,
  Receipt,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Search,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import ScrapPurchaseForm from "@/components/admin/ScrapPurchaseForm";
import ScrapSummaryView, { formatMass } from "@/components/admin/ScrapSummaryView";
import { formatKg, formatPln, type ScrapPurchase } from "@/lib/scrap-purchases";
import {
  PREVIOUS_LABEL,
  bucketFor,
  isCurrentOrFuture,
  periodFor,
  previousPeriod,
  shift,
  ymd,
  type CustomRange,
  type PeriodMode,
} from "@/lib/scrap-periods";
import { avgPrice, csvCell, csvDecimal, deltaPercent, downloadCsv, summaryCsv, type ScrapSummary } from "@/lib/scrap-summary";

const MODES: { id: PeriodMode; label: string }[] = [
  { id: "day", label: "Dzień" },
  { id: "week", label: "Tydzień" },
  { id: "month", label: "Miesiąc" },
  { id: "year", label: "Rok" },
  { id: "custom", label: "Własny zakres" },
];

const LIST_LIMIT = 2000;

type SellerFilter = "all" | "osoba" | "firma";

const SELLER_FILTERS: { id: SellerFilter; label: string }[] = [
  { id: "all", label: "Wszyscy" },
  { id: "osoba", label: "Osoby prywatne" },
  { id: "firma", label: "Firmy" },
];

const typQuery = (typ: SellerFilter) => (typ === "all" ? "" : `&typ=${typ}`);

function Delta({ current, previous, label }: { current: number; previous: number | null; label: string }) {
  const pct = previous === null ? null : deltaPercent(current, previous);
  if (pct === null) return <div className="text-xs text-[#e8dfcc]/50 mt-1">brak danych do porównania</div>;
  const flat = Math.abs(pct) < 0.5;
  const Icon = flat ? Minus : pct > 0 ? TrendingUp : TrendingDown;
  const color = flat ? "text-[#e8dfcc]" : pct > 0 ? "text-green-400" : "text-red-400";
  return (
    <div className={`text-xs mt-1 flex items-center gap-1 ${color}`}>
      <Icon size={13} />
      {pct > 0 ? "+" : ""}
      {pct.toFixed(0)}% <span className="text-[#e8dfcc]/60">vs {label}</span>
    </div>
  );
}

export default function SkupClient({ initialClientId }: { initialClientId: string | null }) {
  const [tab, setTab] = useState<"ewidencja" | "zestawienie">("ewidencja");
  const [mode, setMode] = useState<PeriodMode>("day");
  const [anchor, setAnchor] = useState(() => new Date());
  const [custom, setCustom] = useState<CustomRange>(() => {
    const now = new Date();
    return { from: ymd(new Date(now.getFullYear(), now.getMonth(), 1)), to: ymd(now) };
  });

  const period = useMemo(() => periodFor(mode, anchor, custom), [mode, anchor, custom]);
  const previous = useMemo(() => previousPeriod(period), [period]);
  const bucket = bucketFor(period);

  const [typ, setTyp] = useState<SellerFilter>("all");
  const [result, setResult] = useState<{ key: string; summary: ScrapSummary; previous: ScrapSummary } | null>(null);
  const [purchases, setPurchases] = useState<ScrapPurchase[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(Boolean(initialClientId));
  const [formClientId, setFormClientId] = useState<string | null>(initialClientId);
  const [reloadKey, setReloadKey] = useState(0);

  const fromIso = period.from.toISOString();
  const toIso = period.to.toISOString();

  const fetchSummary = useCallback(async (from: string, to: string, unit: string, who: SellerFilter): Promise<ScrapSummary> => {
    const res = await fetch(`/api/scrap-purchases/summary?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&bucket=${unit}${typQuery(who)}`, {
      cache: "no-store",
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? "Nie udało się wczytać zestawienia");
    return body;
  }, []);

  const fetchList = useCallback(async (from: string, to: string, who: SellerFilter): Promise<ScrapPurchase[]> => {
    const res = await fetch(`/api/scrap-purchases?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}${typQuery(who)}`, { cache: "no-store" });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? "Nie udało się wczytać kwitów");
    return body;
  }, []);

  // What is being shown depends on this key; while the stored result has an
  // older key, new data is on its way (the old numbers stay, dimmed).
  const requestKey = `${fromIso}|${toIso}|${bucket}|${typ}|${reloadKey}`;
  const loading = result?.key !== requestKey;
  const summary = result?.summary ?? null;
  const prevSummary = result?.previous ?? null;

  // Summary for the period and the one before it (for the comparison).
  useEffect(() => {
    let stale = false;
    Promise.all([
      fetchSummary(fromIso, toIso, bucket, typ),
      fetchSummary(previous.from.toISOString(), previous.to.toISOString(), "day", typ),
    ])
      .then(([current, before]) => {
        if (stale) return;
        setResult({ key: requestKey, summary: current, previous: before });
        setError(null);
      })
      .catch((err) => !stale && setError(err instanceof Error ? err.message : "Nie udało się wczytać zestawienia"));
    return () => {
      stale = true;
    };
  }, [fromIso, toIso, bucket, typ, previous, requestKey, fetchSummary]);

  useEffect(() => {
    if (tab !== "ewidencja") return;
    let stale = false;
    fetchList(fromIso, toIso, typ)
      .then((list) => !stale && setPurchases(list))
      .catch((err) => !stale && setError(err instanceof Error ? err.message : "Nie udało się wczytać kwitów"));
    return () => {
      stale = true;
    };
  }, [tab, fromIso, toIso, typ, reloadKey, fetchList]);

  const move = (dir: -1 | 1) => {
    const next = shift(mode, anchor, custom, dir);
    setAnchor(next.anchor);
    setCustom(next.custom);
  };

  const changeMode = (next: PeriodMode) => {
    if (next === "custom" && mode !== "custom") {
      // Start the custom range from the period that is currently shown.
      setCustom({ from: ymd(period.from), to: ymd(new Date(period.to.getTime() - 86_400_000)) });
    }
    setMode(next);
  };

  const remove = async (p: ScrapPurchase) => {
    if (!confirm(`Usunąć cały kwit ${p.numer} (pozycji: ${p.pozycje.length})? Tej operacji nie da się cofnąć.`)) return;
    const res = await fetch(`/api/scrap-purchases/${p.id}`, { method: "DELETE" });
    if (!res.ok) alert("Nie udało się usunąć kwitu");
    setReloadKey((k) => k + 1);
  };

  const fileStem = `${ymd(period.from)}_${ymd(new Date(period.to.getTime() - 86_400_000))}`;

  const typLabel = typ === "all" ? "" : ` — ${SELLER_FILTERS.find((f) => f.id === typ)?.label}`;
  const exportSummary = () => summary && downloadCsv(`zestawienie-skupu-${fileStem}.csv`, summaryCsv(`${period.label}${typLabel}`, summary));

  // Printable register (ewidencja) of every purchase in the period.
  const registerHref = `/admin/skup/ewidencja?from=${encodeURIComponent(fromIso)}&to=${encodeURIComponent(toIso)}&okres=${encodeURIComponent(period.label)}${typQuery(typ)}`;

  const exportReceipts = async () => {
    try {
      const list = await fetchList(fromIso, toIso, typ);
      const header = ["numer", "data", "sprzedajacy", "dokument", "rodzaj", "kod_odpadu", "waga_kg", "cena_zl_kg", "wartosc_zl", "platnosc", "wystawil"];
      const lines = list.flatMap((p) =>
        p.pozycje.map((item) =>
          [
            p.numer,
            new Date(p.data).toLocaleString("pl-PL"),
            p.sprzedawca_nazwa,
            p.sprzedawca_dokument ?? "",
            item.nazwa,
            item.kod_odpadu,
            csvDecimal(item.waga_kg, 1),
            csvDecimal(item.cena_kg, 2),
            csvDecimal(item.wartosc, 2),
            p.platnosc,
            p.wystawil ?? "",
          ]
            .map(csvCell)
            .join(";")
        )
      );
      downloadCsv(`rejestr-skupu-${fileStem}.csv`, "﻿" + [header.join(";"), ...lines].join("\r\n"));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Eksport się nie udał");
    }
  };

  // One row per purchased item (the register is kept per material).
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return purchases
      .flatMap((purchase) => purchase.pozycje.map((item, index) => ({ purchase, item, index })))
      .filter(
        ({ purchase, item }) =>
          !q ||
          [purchase.numer, purchase.sprzedawca_nazwa, purchase.nr_rejestracyjny, purchase.sprzedawca_dokument, item.nazwa, item.kod_odpadu].some(
            (v) => v?.toLowerCase().includes(q)
          )
      );
  }, [purchases, search]);
  const rowsKg = rows.reduce((sum, r) => sum + r.item.waga_kg, 0);
  const rowsValue = rows.reduce((sum, r) => sum + r.item.wartosc, 0);

  const prevLabel = PREVIOUS_LABEL[mode];
  const kpis = summary
    ? [
        { label: "Kwitów", value: String(summary.receipts), cur: summary.receipts, prev: prevSummary?.receipts ?? null },
        { label: "Masa skupu", value: formatMass(summary.kg), cur: summary.kg, prev: prevSummary?.kg ?? null },
        { label: "Wypłacono", value: formatPln(summary.value), cur: summary.value, prev: prevSummary?.value ?? null },
        { label: "Średnia cena", value: `${formatPln(avgPrice(summary))}/kg`, cur: avgPrice(summary), prev: prevSummary ? avgPrice(prevSummary) : null },
      ]
    : [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-montserrat font-bold">Skup złomu</h1>
          <p className="text-sm text-[#e8dfcc] mt-1">Kwity, rejestr skupu i zestawienia: tygodniowe, miesięczne, roczne lub za dowolny okres.</p>
        </div>
        <button
          onClick={() => {
            setFormClientId(null);
            setFormOpen(true);
          }}
          className="btn-primary px-4 py-2.5 rounded-lg text-sm font-semibold text-black flex items-center gap-2"
        >
          <Plus size={16} /> Nowy kwit
        </button>
      </div>

      {/* Period */}
      <div className="bg-[#0a0a0a] border border-[#5c4716] rounded-xl p-3 mb-4 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-[#5c4716] overflow-hidden">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => changeMode(m.id)}
              className={`px-3.5 py-2 text-sm whitespace-nowrap ${mode === m.id ? "bg-[#f5b52c] text-black font-semibold" : "text-[#e8dfcc] hover:bg-[#5c4716]"}`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => move(-1)} className="p-2 rounded-lg hover:bg-[#5c4716]" aria-label="Poprzedni okres">
            <ChevronLeft size={18} />
          </button>
          <div className="min-w-[12rem] text-center font-semibold">{period.label}</div>
          <button
            onClick={() => move(1)}
            disabled={isCurrentOrFuture(period)}
            className="p-2 rounded-lg hover:bg-[#5c4716] disabled:opacity-25"
            aria-label="Następny okres"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {mode !== "custom" && (
          <button onClick={() => setAnchor(new Date())} className="text-sm text-[#f5b52c] hover:underline underline-offset-2">
            {mode === "day" ? "Dziś" : mode === "week" ? "Ten tydzień" : mode === "month" ? "Ten miesiąc" : "Ten rok"}
          </button>
        )}

        {mode === "custom" && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-[#e8dfcc]">
            <input
              type="date"
              value={custom.from}
              max={custom.to}
              onChange={(e) => e.target.value && setCustom({ ...custom, from: e.target.value })}
              className="bg-black border border-[#5c4716] rounded-lg px-3 py-1.5 text-white [color-scheme:dark]"
              aria-label="Od"
            />
            –
            <input
              type="date"
              value={custom.to}
              min={custom.from}
              onChange={(e) => e.target.value && setCustom({ ...custom, to: e.target.value })}
              className="bg-black border border-[#5c4716] rounded-lg px-3 py-1.5 text-white [color-scheme:dark]"
              aria-label="Do"
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4 text-sm text-[#e8dfcc]">
        Sprzedający:
        {SELLER_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setTyp(f.id)}
            className={`px-3.5 py-1.5 rounded-full border ${typ === f.id ? "bg-[#f5b52c] border-[#f5b52c] text-black font-semibold" : "border-[#5c4716] hover:border-[#f5b52c]"}`}
          >
            {f.label}
          </button>
        ))}
        <span className="text-xs text-[#e8dfcc]/60">dotyczy wskaźników, zestawień, listy i eksportów</span>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-4 text-sm">{error}</div>}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading && !summary
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-white/[0.03] animate-pulse" />)
          : kpis.map((k) => (
              <div key={k.label} className={`bg-[#0a0a0a] p-4 rounded-xl border border-[#5c4716] ${loading ? "opacity-60" : ""}`}>
                <div className="text-sm text-[#e8dfcc]">{k.label}</div>
                <div className="text-2xl font-bold text-white mt-1">{k.value}</div>
                <Delta current={k.cur} previous={k.prev} label={prevLabel} />
              </div>
            ))}
      </div>

      {/* Tabs + export */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex rounded-lg border border-[#5c4716] overflow-hidden">
          {[
            { id: "ewidencja" as const, label: "Ewidencja", icon: Receipt },
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

        <div className="ml-auto flex flex-wrap gap-2">
          <Link
            href={registerHref}
            target="_blank"
            className="px-4 py-2 rounded-lg border border-[#f5b52c]/60 text-sm text-white hover:bg-[#f5b52c] hover:text-black flex items-center gap-2 transition-colors"
          >
            <BookOpen size={15} /> Drukuj ewidencję
          </Link>
          <button
            onClick={exportSummary}
            disabled={!summary || summary.receipts === 0}
            className="px-4 py-2 rounded-lg border border-[#5c4716] text-sm text-[#e8dfcc] hover:text-white hover:border-[#f5b52c] flex items-center gap-2 disabled:opacity-40"
          >
            <Download size={15} /> Zestawienie do Excela
          </button>
          <button
            onClick={exportReceipts}
            disabled={!summary || summary.receipts === 0}
            className="px-4 py-2 rounded-lg border border-[#5c4716] text-sm text-[#e8dfcc] hover:text-white hover:border-[#f5b52c] flex items-center gap-2 disabled:opacity-40"
          >
            <Download size={15} /> Rejestr kwitów do Excela
          </button>
        </div>
      </div>

      {tab === "zestawienie" ? (
        summary ? (
          <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
            <ScrapSummaryView period={period} bucket={bucket} summary={summary} />
          </div>
        ) : (
          !error && (
            <div className="bg-[#0a0a0a] p-12 rounded-xl border border-[#5c4716] text-center text-[#e8dfcc] flex items-center justify-center gap-3">
              <Loader2 className="animate-spin" size={18} /> Wczytywanie...
            </div>
          )
        )
      ) : (
        <div>
          <p className="text-sm text-[#e8dfcc] mb-3">
            Każdy skupiony materiał w osobnym wierszu, od najnowszego. Kwit (formularz przyjęcia) otworzysz ikoną drukarki.
          </p>
          <div className="relative max-w-sm mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#e8dfcc] size-4" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Szukaj: sprzedający, materiał, numer, rejestracja…"
              className="w-full bg-[#0a0a0a] border border-[#5c4716] rounded-lg pl-10 pr-4 py-2 text-sm text-white outline-none focus:border-[#f5b52c]"
            />
          </div>

          {rows.length === 0 ? (
            <div className="bg-[#0a0a0a] p-12 rounded-xl border border-[#5c4716] text-center text-[#e8dfcc]">
              {purchases.length === 0
                ? "Nic nie skupiono w tym okresie. Kliknij „Nowy kwit”, żeby zapisać pierwszy zakup."
                : "Nic nie pasuje do wyszukiwania."}
            </div>
          ) : (
            <div className="bg-[#0a0a0a] rounded-xl border border-[#5c4716] overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-[#e8dfcc] border-b border-[#5c4716]">
                  <tr>
                    {["Data", "Sprzedający", "Materiał", "Masa", "Cena", "Wartość", "Kwit", ""].map((h) => (
                      <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#5c4716]/50">
                  {rows.map((row) => (
                    <tr key={`${row.purchase.id}-${row.index}`} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-2.5 whitespace-nowrap text-[#e8dfcc]">
                        {new Date(row.purchase.data).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" })}
                      </td>
                      <td className="px-4 py-2.5">
                        {row.purchase.sprzedawca_nazwa}
                        <span className="block text-[11px] text-[#e8dfcc]/50">
                          {row.purchase.sprzedawca_typ === "firma" ? "firma" : "osoba prywatna"}
                          {row.purchase.nr_rejestracyjny ? ` · ${row.purchase.nr_rejestracyjny}` : ""}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        {row.item.nazwa}
                        <span className="block text-[11px] text-[#e8dfcc]/50 font-mono">{row.item.kod_odpadu}</span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">{formatKg(row.item.waga_kg)}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-[#e8dfcc]">{formatPln(row.item.cena_kg)}/kg</td>
                      <td className="px-4 py-2.5 whitespace-nowrap font-semibold">{formatPln(row.item.wartosc)}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-[#f5b52c] whitespace-nowrap">{row.purchase.numer}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex justify-end gap-1">
                          <Link href={`/admin/skup/${row.purchase.id}`} className="p-2 rounded-lg hover:bg-[#5c4716]" title="Kwit: drukuj, PDF, e-mail">
                            <Printer size={15} className="text-[#e8dfcc]" />
                          </Link>
                          <button onClick={() => remove(row.purchase)} className="p-2 rounded-lg hover:bg-[#5c4716]" title="Usuń cały kwit">
                            <Trash2 size={15} className="text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-[#5c4716] font-semibold">
                  <tr>
                    <td className="px-4 py-3" colSpan={3}>
                      Razem ({rows.length} {rows.length === 1 ? "pozycja" : "pozycji"})
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatKg(rowsKg)}</td>
                    <td />
                    <td className="px-4 py-3 whitespace-nowrap">{formatPln(rowsValue)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
          {purchases.length >= LIST_LIMIT && (
            <p className="text-xs text-[#e8dfcc]/70 mt-3">
              Pokazano najnowsze {LIST_LIMIT} kwitów. Zawęź okres albo użyj zestawienia, które liczy wszystkie.
            </p>
          )}
        </div>
      )}

      {formOpen && (
        <ScrapPurchaseForm
          clientId={formClientId}
          onClose={() => setFormOpen(false)}
          onSaved={() => setReloadKey((k) => k + 1)}
        />
      )}
    </div>
  );
}
