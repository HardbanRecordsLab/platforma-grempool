"use client";

import { 
  FileText, 
  Users, 
  Truck, 
  Package, 
  TrendingUp, 
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

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

export default function DashboardPage() {
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
            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#2a3a4a] transition-colors text-sm">
              + Nowe zapytanie
            </button>
            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#2a3a4a] transition-colors text-sm">
              + Nowe zlecenie
            </button>
            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-[#2a3a4a] transition-colors text-sm">
              + Dodaj materiał
            </button>
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
          <h3 className="font-montserrat font-bold mb-4">Nadchodzące terminy</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#b8c5d6]">Przegląd Bus 1</span>
              <span className="text-xs text-red-400">za 3 dni</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#b8c5d6]">OC Wywrotka</span>
              <span className="text-xs text-yellow-400">za 14 dni</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#b8c5d6]">Serwis koparki</span>
              <span className="text-xs text-green-400">za 30 dni</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
