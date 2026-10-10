"use client";

import { useMemo, useState } from "react";
import { Banknote, Building2, CreditCard, User, Users } from "lucide-react";
import { formatKg, formatPln, wasteCodeLabel } from "@/lib/scrap-purchases";
import { avgPrice, type ScrapSummary } from "@/lib/scrap-summary";
import { bucketKeys, bucketLabel, bucketTitle, type Bucket, type Period } from "@/lib/scrap-periods";

type Metric = "kg" | "value";

// "2,35 kg" below a tonne (exact to the gram), "12,34 t" above.
export const formatMass = (kg: number) =>
  kg >= 1000
    ? `${(kg / 1000).toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} t`
    : formatKg(kg);

// Waste records (KEO) want the mass in Mg to four decimal places.
const mg = (kg: number) =>
  (kg / 1000).toLocaleString("pl-PL", { minimumFractionDigits: 4, maximumFractionDigits: 4 });

function Card({ title, hint, children, className = "" }: { title: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#0a0a0a] rounded-xl border border-[#5c4716] p-5 ${className}`}>
      <h2 className="font-montserrat font-bold">{title}</h2>
      {hint && <p className="text-xs text-[#e8dfcc]/70 mt-1">{hint}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-[#e8dfcc]">Brak danych w tym okresie.</p>;
}

function TimeChart({ period, bucket, summary }: { period: Period; bucket: Bucket; summary: ScrapSummary }) {
  const [metric, setMetric] = useState<Metric>("kg");

  const bars = useMemo(() => {
    const byKey = new Map(summary.buckets.map((b) => [b.bucket, b]));
    return bucketKeys(period, bucket).map((key) => {
      const b = byKey.get(key);
      return { key, kg: b?.kg ?? 0, value: b?.value ?? 0, receipts: b?.receipts ?? 0 };
    });
  }, [period, bucket, summary]);

  const peak = Math.max(0, ...bars.map((b) => b[metric]));
  const max = Math.max(1, peak);
  const every = Math.max(1, Math.ceil(bars.length / 14));
  const format = (n: number) => (metric === "kg" ? formatMass(n) : formatPln(n));
  const unit = bucket === "day" ? "dzień" : bucket === "week" ? "tydzień" : "miesiąc";

  return (
    <Card title={`Skup w czasie — według: ${unit}`}>
      <div className="flex items-center justify-between gap-3 -mt-2 mb-4">
        <span className="text-xs text-[#e8dfcc]/70">Najwyżej: {format(peak)}</span>
        <div className="flex rounded-lg border border-[#5c4716] overflow-hidden text-xs">
          {([["kg", "Masa"], ["value", "Kwota"]] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setMetric(id)}
              className={`px-3 py-1.5 ${metric === id ? "bg-[#f5b52c] text-black font-semibold" : "text-[#e8dfcc] hover:bg-[#5c4716]"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-end gap-[3px] h-44">
        {bars.map((b) => (
          <div key={b.key} className="group relative flex-1 h-full flex items-end">
            <div
              className={`w-full rounded-t min-h-[2px] ${b[metric] > 0 ? "bg-[#f5b52c]/75 group-hover:bg-[#f5b52c]" : "bg-[#5c4716]/40"}`}
              style={{ height: `${(b[metric] / max) * 100}%` }}
            />
            <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block whitespace-nowrap rounded bg-black border border-[#5c4716] px-2.5 py-1.5 text-xs text-white z-10">
              <div className="capitalize text-[#e8dfcc]">{bucketTitle(b.key, bucket)}</div>
              <div>
                {formatMass(b.kg)} · {formatPln(b.value)} · {b.receipts} kw.
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-[3px] mt-2">
        {bars.map((b, i) => (
          <div key={b.key} className="flex-1 text-center text-[10px] text-[#e8dfcc]/60 overflow-visible whitespace-nowrap">
            {i % every === 0 ? bucketLabel(b.key, bucket) : ""}
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function ScrapSummaryView({
  period,
  bucket,
  summary,
}: {
  period: Period;
  bucket: Bucket;
  summary: ScrapSummary;
}) {
  if (summary.receipts === 0) {
    return (
      <div className="bg-[#0a0a0a] p-12 rounded-xl border border-[#5c4716] text-center text-[#e8dfcc]">
        Brak kwitów w tym okresie. Wystaw kwit przyciskiem „Nowy kwit” albo zmień okres.
      </div>
    );
  }

  const cash = summary.by_payment.find((p) => p.platnosc === "gotowka");
  const transfer = summary.by_payment.find((p) => p.platnosc === "przelew");
  const paid = (cash?.value ?? 0) + (transfer?.value ?? 0);

  return (
    <div className="space-y-6">
      <TimeChart period={period} bucket={bucket} summary={summary} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card title="Według rodzaju złomu" className="xl:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[#e8dfcc] text-left">
                <tr>
                  <th className="py-2 pr-3 font-semibold">Rodzaj</th>
                  <th className="py-2 pr-3 font-semibold text-right">Masa</th>
                  <th className="py-2 pr-3 font-semibold w-36">Udział</th>
                  <th className="py-2 pr-3 font-semibold text-right">Kwota</th>
                  <th className="py-2 font-semibold text-right whitespace-nowrap">Śr. cena</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#5c4716]/50">
                {summary.by_material.map((m) => {
                  const share = summary.kg > 0 ? (m.kg / summary.kg) * 100 : 0;
                  return (
                    <tr key={m.name}>
                      <td className="py-2 pr-3">
                        {m.name}
                        <span className="block text-[11px] text-[#e8dfcc]/50 font-mono">{m.code}</span>
                      </td>
                      <td className="py-2 pr-3 text-right whitespace-nowrap">{formatMass(m.kg)}</td>
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded bg-[#5c4716]/40 overflow-hidden">
                            <div className="h-full bg-[#f5b52c]" style={{ width: `${share}%` }} />
                          </div>
                          <span className="text-xs text-[#e8dfcc] w-10 text-right">{share.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="py-2 pr-3 text-right whitespace-nowrap font-semibold">{formatPln(m.value)}</td>
                      <td className="py-2 text-right whitespace-nowrap text-[#e8dfcc]">
                        {formatPln(m.kg > 0 ? m.value / m.kg : 0)}/kg
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t border-[#5c4716]">
                <tr className="font-semibold">
                  <td className="py-2 pr-3">Razem</td>
                  <td className="py-2 pr-3 text-right whitespace-nowrap">{formatMass(summary.kg)}</td>
                  <td />
                  <td className="py-2 pr-3 text-right whitespace-nowrap">{formatPln(summary.value)}</td>
                  <td className="py-2 text-right whitespace-nowrap text-[#e8dfcc]">{formatPln(avgPrice(summary))}/kg</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        <Card title="Według kodu odpadu" hint="Pomoc przy karcie ewidencji odpadów w BDO — masa w Mg z dokładnością do 4 miejsc.">
          {summary.by_code.length === 0 ? (
            <Empty />
          ) : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-[#5c4716]/50">
                {summary.by_code.map((c) => (
                  <tr key={c.code}>
                    <td className="py-2 pr-2">
                      <span className="font-mono whitespace-nowrap">{c.code}</span>
                      <span className="block text-xs text-[#e8dfcc]/70">{wasteCodeLabel(c.code)}</span>
                    </td>
                    <td className="py-2 text-right whitespace-nowrap font-semibold">{mg(c.kg)} Mg</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-[#5c4716]">
                <tr className="font-semibold">
                  <td className="py-2">Razem</td>
                  <td className="py-2 text-right whitespace-nowrap">{mg(summary.kg)} Mg</td>
                </tr>
              </tfoot>
            </table>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
        <Card title="Osoby prywatne i firmy" hint="Zawsze liczone razem, niezależnie od wybranego filtra.">
          <div className="space-y-4">
            {([
              ["osoba", "Osoby prywatne", User],
              ["firma", "Firmy", Building2],
            ] as const).map(([typ, label, Icon]) => {
              const row = summary.by_seller_type.find((t) => t.typ === typ);
              const total = summary.by_seller_type.reduce((sum, t) => sum + t.kg, 0);
              const share = total > 0 ? ((row?.kg ?? 0) / total) * 100 : 0;
              return (
                <div key={typ}>
                  <div className="flex items-center justify-between text-sm mb-1.5 gap-3">
                    <span className="flex items-center gap-2">
                      <Icon size={16} className="text-[#f5b52c]" /> {label}
                    </span>
                    <span className="text-right">
                      <strong>{formatMass(row?.kg ?? 0)}</strong> · {formatPln(row?.value ?? 0)}{" "}
                      <span className="text-[#e8dfcc]/70">({row?.receipts ?? 0} kw.)</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded bg-[#5c4716]/40 overflow-hidden">
                    <div className="h-full bg-[#f5b52c]" style={{ width: `${share}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Forma płatności">
          <div className="space-y-4">
            {[
              { label: "Gotówka", icon: Banknote, data: cash },
              { label: "Przelew", icon: CreditCard, data: transfer },
            ].map(({ label, icon: Icon, data }) => {
              const share = paid > 0 ? ((data?.value ?? 0) / paid) * 100 : 0;
              return (
                <div key={label}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="flex items-center gap-2">
                      <Icon size={16} className="text-[#f5b52c]" /> {label}
                    </span>
                    <span>
                      <strong>{formatPln(data?.value ?? 0)}</strong>{" "}
                      <span className="text-[#e8dfcc]/70">({data?.receipts ?? 0} kw.)</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded bg-[#5c4716]/40 overflow-hidden">
                    <div className="h-full bg-[#f5b52c]" style={{ width: `${share}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        </div>

        <Card title="Najwięksi sprzedający" hint="Według kwoty w wybranym okresie.">
          <table className="w-full text-sm">
            <thead className="text-[#e8dfcc] text-left">
              <tr>
                <th className="py-1.5 pr-2 font-semibold">
                  <Users size={14} className="inline mr-1.5 -mt-0.5" />
                  Sprzedający
                </th>
                <th className="py-1.5 pr-2 font-semibold text-right">Kwitów</th>
                <th className="py-1.5 pr-2 font-semibold text-right">Masa</th>
                <th className="py-1.5 font-semibold text-right">Kwota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#5c4716]/50">
              {summary.top_sellers.map((s) => (
                <tr key={s.key}>
                  <td className="py-2 pr-2">{s.name}</td>
                  <td className="py-2 pr-2 text-right">{s.receipts}</td>
                  <td className="py-2 pr-2 text-right whitespace-nowrap">{formatMass(s.kg)}</td>
                  <td className="py-2 text-right whitespace-nowrap font-semibold">{formatPln(s.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
