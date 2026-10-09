"use client";

import { useEffect, useState } from "react";
import { Loader2, Eye, Users, Smartphone, Monitor, Tablet } from "lucide-react";

interface Stats {
  total: number;
  visitors: number;
  daily: { day: string; views: number; visitors: number }[];
  pages: { path: string; views: number }[];
  sources: { source: string; views: number }[];
  devices: { device: string; views: number }[];
}

const RANGES = [
  { days: 7, label: "7 dni" },
  { days: 30, label: "30 dni" },
  { days: 90, label: "90 dni" },
  { days: 365, label: "Rok" },
];

const PAGE_NAMES: Record<string, string> = {
  "/": "Strona główna",
  "/ogloszenia": "Ogłoszenia",
  "/uslugi": "Usługi",
  "/uslugi/skup-zlomu": "Skup złomu",
  "/uslugi/transport": "Transport",
  "/uslugi/koparki": "Usługi koparką",
  "/uslugi/rozbiorki": "Rozbiórki",
  "/uslugi/waga-najazdowa": "Waga najazdowa",
  "/wycena": "Formularz wyceny",
  "/kontakt": "Kontakt",
};

const pageName = (path: string) =>
  PAGE_NAMES[path] ?? (path.startsWith("/ogloszenia/") ? `Ogłoszenie ${path.split("/")[2]}` : path);

const deviceIcon = { telefon: Smartphone, komputer: Monitor, tablet: Tablet } as Record<string, typeof Monitor>;

// Fills days without visits so the chart has no gaps.
function fillDays(daily: Stats["daily"], days: number) {
  const byDay = new Map(daily.map((d) => [d.day, d]));
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(Date.now() - (days - 1 - i) * 86_400_000);
    const key = date.toLocaleDateString("sv-SE", { timeZone: "Europe/Warsaw" });
    return byDay.get(key) ?? { day: key, views: 0, visitors: 0 };
  });
}

function BarList({ rows }: { rows: { label: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (rows.length === 0) return <p className="text-sm text-[#e8dfcc]">Brak danych.</p>;
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.label} className="relative">
          <div className="absolute inset-y-0 left-0 rounded bg-[#f5b52c]/15" style={{ width: `${(r.value / max) * 100}%` }} />
          <div className="relative flex justify-between gap-3 px-3 py-1.5 text-sm">
            <span className="truncate text-white">{r.label}</span>
            <span className="text-[#e8dfcc] shrink-0">{r.value}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function StatsPage() {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStats(null);
    fetch(`/api/stats?days=${days}`, { cache: "no-store" })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Nie udało się wczytać statystyk");
        setStats(body);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Nie udało się wczytać statystyk"));
  }, [days]);

  const chartDays = Math.min(days, 90);
  const daily = stats ? fillDays(stats.daily, chartDays) : [];
  const maxDay = Math.max(1, ...daily.map((d) => d.views));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-montserrat font-bold">Statystyki strony</h1>
          <p className="text-sm text-[#e8dfcc] mt-1">
            Anonimowe — bez ciasteczek i bez zapisywania adresów IP. Wejścia z panelu admina i roboty nie są liczone.
          </p>
        </div>
        <div className="flex rounded-lg border border-[#5c4716] overflow-hidden">
          {RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className={`px-3 py-2 text-sm ${days === r.days ? "bg-[#f5b52c] text-black font-semibold" : "text-[#e8dfcc] hover:bg-[#5c4716]"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-sm">{error}</div>}

      {!stats ? (
        <div className="bg-[#0a0a0a] p-12 rounded-xl border border-[#5c4716] text-center text-[#e8dfcc] flex items-center justify-center gap-3">
          <Loader2 className="animate-spin" size={18} /> Wczytywanie...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0a0a0a] p-5 rounded-xl border border-[#5c4716]">
              <Eye className="text-[#f5b52c] mb-2" size={20} />
              <div className="text-3xl font-bold text-white">{stats.total.toLocaleString("pl-PL")}</div>
              <div className="text-sm text-[#e8dfcc]">Wyświetlenia stron</div>
            </div>
            <div className="bg-[#0a0a0a] p-5 rounded-xl border border-[#5c4716]">
              <Users className="text-[#f5b52c] mb-2" size={20} />
              <div className="text-3xl font-bold text-white">{stats.visitors.toLocaleString("pl-PL")}</div>
              <div className="text-sm text-[#e8dfcc]">Odwiedzający (unikalni dziennie)</div>
            </div>
          </div>

          <div className="bg-[#0a0a0a] p-5 rounded-xl border border-[#5c4716]">
            <h2 className="font-montserrat font-bold mb-4">Wejścia dziennie{days > 90 ? " (ostatnie 90 dni)" : ""}</h2>
            <div className="flex items-end gap-[2px] h-40">
              {daily.map((d) => (
                <div key={d.day} className="group relative flex-1 h-full flex items-end">
                  <div
                    className="w-full rounded-t bg-[#f5b52c]/70 group-hover:bg-[#f5b52c] min-h-[2px]"
                    style={{ height: `${(d.views / maxDay) * 100}%` }}
                  />
                  <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block whitespace-nowrap rounded bg-black border border-[#5c4716] px-2 py-1 text-xs text-white z-10">
                    {new Date(d.day).toLocaleDateString("pl-PL")}: {d.views} wyśw., {d.visitors} os.
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[11px] text-[#e8dfcc]/60 mt-2">
              <span>{daily[0] && new Date(daily[0].day).toLocaleDateString("pl-PL")}</span>
              <span>dziś</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-[#0a0a0a] p-5 rounded-xl border border-[#5c4716] lg:col-span-2">
              <h2 className="font-montserrat font-bold mb-4">Najczęściej oglądane</h2>
              <BarList rows={stats.pages.map((p) => ({ label: pageName(p.path), value: p.views }))} />
            </div>
            <div className="space-y-6">
              <div className="bg-[#0a0a0a] p-5 rounded-xl border border-[#5c4716]">
                <h2 className="font-montserrat font-bold mb-4">Skąd przychodzą</h2>
                <BarList rows={stats.sources.map((s) => ({ label: s.source, value: s.views }))} />
              </div>
              <div className="bg-[#0a0a0a] p-5 rounded-xl border border-[#5c4716]">
                <h2 className="font-montserrat font-bold mb-4">Urządzenia</h2>
                <ul className="space-y-2 text-sm">
                  {stats.devices.map((d) => {
                    const Icon = deviceIcon[d.device] ?? Monitor;
                    const pct = stats.total ? Math.round((d.views / stats.total) * 100) : 0;
                    return (
                      <li key={d.device} className="flex items-center gap-3">
                        <Icon size={16} className="text-[#f5b52c]" />
                        <span className="flex-1 capitalize">{d.device}</span>
                        <span className="text-[#e8dfcc]">{pct}%</span>
                      </li>
                    );
                  })}
                  {stats.devices.length === 0 && <li className="text-[#e8dfcc]">Brak danych.</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
