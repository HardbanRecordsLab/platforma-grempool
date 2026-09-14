"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Truck,
  Package,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  CheckSquare,
  CalendarDays,
} from "lucide-react";
import { fetchCalendarEvents, pad, toISODate, type DayEvents } from "@/lib/calendar-data";
import { getPolishHolidays } from "@/lib/holidays";
import { SERVICE_LABELS } from "@/lib/supabase";
import { getMaterials } from "@/lib/materials-store";

const stats = [
  { label: "Nowe zapytania", value: "7", change: "+12%", up: true, icon: FileText },
  { label: "Do wyceny", value: "4", change: "-8%", up: false, icon: Clock },
  { label: "Aktywne zlecenia", value: "8", change: "+25%", up: true, icon: TrendingUp },
  { label: "Zakończone (miesiąc)", value: "23", change: "+15%", up: true, icon: Package },
];

const recentLeads = [
  { id: "GRE-2026-00127", client: "Jan Kowalski", service: "Skup złomu", status: "Nowe", date: "2026-09-12" },
  { id: "GRE-2026-00126", client: "Firma Budowlana XYZ", service: "Transport", status: "Do wyceny", date: "2026-09-12" },
  { id: "GRE-2026-00125", client: "Anna Nowak", service: "Koparka", status: "Wycena wysłana", date: "2026-09-11" },
  { id: "GRE-2026-00124", client: "Marek Wiśniewski", service: "Materiały", status: "Zaakceptowane", date: "2026-09-11" },
  { id: "GRE-2026-00123", client: "Spółka ABC", service: "Rozbiórka", status: "W realizacji", date: "2026-09-10" },
];

const statusColors: Record<string, string> = {
  "Nowe": "bg-blue-500/20 text-blue-400",
  "Do wyceny": "bg-yellow-500/20 text-yellow-400",
  "Wycena wysłana": "bg-purple-500/20 text-purple-400",
  "Zaakceptowane": "bg-green-500/20 text-green-400",
  "W realizacji": "bg-orange-500/20 text-orange-400",
};

const daysOfWeek = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Ndz"];
const months = [
  "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
  "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień",
];

function DashboardCalendar() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(toISODate(today));
  const [eventsByDay, setEventsByDay] = useState<Record<string, DayEvents>>({});
  const [loading, setLoading] = useState(true);

  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  useEffect(() => {
    setLoading(true);
    fetchCalendarEvents(toISODate(monthStart), toISODate(monthEnd))
      .then(setEventsByDay)
      .catch(() => setEventsByDay({}))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = (() => {
    const day = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  })();
  const todayISO = toISODate(today);
  const selectedEvents = eventsByDay[selectedDate] ?? { orders: [], leads: [], tasks: [] };
  const selectedLabel = (() => {
    const d = new Date(selectedDate + "T00:00:00");
    return `${d.getDate()} ${months[d.getMonth()]}`;
  })();
  const holidaysMap = new Map(getPolishHolidays(currentDate.getFullYear()).map((h) => [h.date, h.name]));
  const selectedHoliday = holidaysMap.get(selectedDate);

  return (
    <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4a] p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-montserrat font-bold flex items-center gap-2">
          <CalendarDays size={18} className="text-[#f0a500]" /> Kalendarz
        </h3>
        <Link href="/admin/kalendarz" className="text-xs text-[#f0a500] font-semibold hover:underline">
          Pełny widok →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1 hover:bg-[#2a3a4a] rounded transition-colors">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold">{months[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1 hover:bg-[#2a3a4a] rounded transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {daysOfWeek.map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold text-[#b8c5d6] py-1">{d[0]}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const iso = `${currentDate.getFullYear()}-${pad(currentDate.getMonth() + 1)}-${pad(day)}`;
              const isToday = iso === todayISO;
              const isSelected = iso === selectedDate;
              const dayEvents = eventsByDay[iso];
              const hasEvents = dayEvents && (dayEvents.orders.length + dayEvents.leads.length + dayEvents.tasks.length) > 0;
              const holidayName = holidaysMap.get(iso);

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(iso)}
                  title={holidayName}
                  className={`aspect-square rounded text-xs flex flex-col items-center justify-center transition-colors ${
                    isSelected ? "bg-[#f0a500] text-[#0f1419] font-semibold" : isToday ? "bg-[#f0a500]/20 text-[#f0a500]" : holidayName ? "text-red-400 hover:bg-[#2a3a4a]" : "hover:bg-[#2a3a4a]"
                  }`}
                >
                  {day}
                  {(hasEvents || holidayName) && (
                    <div className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? "bg-[#0f1419]" : holidayName ? "bg-red-500" : "bg-[#f0a500]"}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold mb-3">{selectedLabel}</div>
          {selectedHoliday && (
            <div className="mb-2 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
              {selectedHoliday}
            </div>
          )}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {loading ? (
              <p className="text-xs text-[#b8c5d6]">Wczytywanie...</p>
            ) : selectedEvents.orders.length + selectedEvents.leads.length + selectedEvents.tasks.length === 0 ? (
              <p className="text-xs text-[#b8c5d6]">Brak wydarzeń.</p>
            ) : (
              <>
                {selectedEvents.orders.map((o) => (
                  <div key={o.id} className="p-2 rounded-lg border-l-2 border-l-green-500 bg-green-500/10 text-xs">
                    <div className="font-semibold">{SERVICE_LABELS[o.usluga] ?? o.usluga}</div>
                    <div className="text-[#b8c5d6] flex items-center gap-1"><MapPin size={10} /> {o.lokalizacja}</div>
                  </div>
                ))}
                {selectedEvents.leads.map((l) => (
                  <div key={l.id} className="p-2 rounded-lg border-l-2 border-l-blue-500 bg-blue-500/10 text-xs">
                    <div className="font-semibold">{SERVICE_LABELS[l.usluga] ?? l.usluga} — {l.klient_imie}</div>
                    <div className="text-[#b8c5d6] flex items-center gap-1"><Phone size={10} /> {l.klient_telefon}</div>
                  </div>
                ))}
                {selectedEvents.tasks.map((t) => (
                  <div key={t.id} className="p-2 rounded-lg border-l-2 border-l-[#f0a500] bg-[#f0a500]/10 text-xs">
                    <div className="font-semibold flex items-center gap-1"><CheckSquare size={10} /> {t.tytul}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [materialsCount, setMaterialsCount] = useState<number | null>(null);

  useEffect(() => {
    getMaterials().then((m) => setMaterialsCount(m.length)).catch(() => setMaterialsCount(null));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-montserrat font-bold mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#1a2332] p-6 rounded-xl border border-[#2a3a4a]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#f0a500]/10 flex items-center justify-center">
                <stat.icon className="text-[#f0a500] size-5" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${stat.up ? 'text-green-400' : 'text-red-400'}`}>
                {stat.up ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                {stat.change}
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-[#b8c5d6]">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="mb-8">
        <DashboardCalendar />
      </div>

      {/* Recent Leads */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4a]">
        <div className="p-6 border-b border-[#2a3a4a]">
          <h2 className="text-lg font-montserrat font-bold">Ostatnie zapytania</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a3a4a]">
                <th className="text-left p-4 text-sm font-semibold text-[#b8c5d6]">Numer</th>
                <th className="text-left p-4 text-sm font-semibold text-[#b8c5d6]">Klient</th>
                <th className="text-left p-4 text-sm font-semibold text-[#b8c5d6]">Usługa</th>
                <th className="text-left p-4 text-sm font-semibold text-[#b8c5d6]">Status</th>
                <th className="text-left p-4 text-sm font-semibold text-[#b8c5d6]">Data</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.map((lead) => (
                <tr key={lead.id} className="border-b border-[#2a3a4a] hover:bg-[#0f1419] transition-colors">
                  <td className="p-4 text-sm font-mono text-[#f0a500]">{lead.id}</td>
                  <td className="p-4 text-sm">{lead.client}</td>
                  <td className="p-4 text-sm text-[#b8c5d6]">{lead.service}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[lead.status] || 'bg-gray-500/20 text-gray-400'}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-[#b8c5d6]">{lead.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-[#1a2332] p-6 rounded-xl border border-[#2a3a4a]">
          <h3 className="font-montserrat font-bold mb-4">Szybkie akcje</h3>
          <div className="space-y-2">
            <Link href="/admin/kalendarz" className="block w-full text-left px-4 py-2 rounded-lg hover:bg-[#2a3a4a] transition-colors text-sm">
              + Dodaj zadanie
            </Link>
            <Link href="/admin/zlecenia" className="block w-full text-left px-4 py-2 rounded-lg hover:bg-[#2a3a4a] transition-colors text-sm">
              + Nowe zlecenie
            </Link>
            <Link href="/admin/materialy" className="block w-full text-left px-4 py-2 rounded-lg hover:bg-[#2a3a4a] transition-colors text-sm">
              + Dodaj materiał
            </Link>
          </div>
        </div>

        <div className="bg-[#1a2332] p-6 rounded-xl border border-[#2a3a4a]">
          <h3 className="font-montserrat font-bold mb-4">Flota dziś</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#b8c5d6]">Bus 1</span>
              <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">W trasie</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#b8c5d6]">Wywrotka</span>
              <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">Dostępna</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#b8c5d6]">Ciężarówka</span>
              <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400">W trasie</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1a2332] p-6 rounded-xl border border-[#2a3a4a]">
          <h3 className="font-montserrat font-bold mb-4">Magazyn materiałów</h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#f0a500]/10 flex items-center justify-center">
              <Package className="text-[#f0a500] size-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{materialsCount ?? "—"}</div>
              <div className="text-xs text-[#b8c5d6]">pozycji w katalogu</div>
            </div>
          </div>
          <Link href="/admin/materialy" className="block mt-4 text-xs text-[#f0a500] font-semibold hover:underline">
            Zarządzaj katalogiem →
          </Link>
        </div>
      </div>
    </div>
  );
}
