"use client";

import { useState } from "react";
import { 
  Search, 
  Plus, 
  Filter,
  FileText,
  MapPin,
  Calendar,
  User,
  Truck,
  Wrench,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";

const orders = [
  {
    id: "GRE-2026-00481",
    client: "Jan Kowalski",
    service: "Skup złomu",
    location: "Raszówka",
    date: "2026-09-15",
    time: "10:00",
    status: "zaplanowane",
    vehicle: "Bus 1",
    machine: null,
    worker: "Marek",
    value: 3500,
  },
  {
    id: "GRE-2026-00480",
    client: "Firma Budowlana XYZ",
    service: "Transport",
    location: "Legnica → Raszówka",
    date: "2026-09-12",
    time: "08:00",
    status: "w_realizacji",
    vehicle: "Ciężarówka",
    machine: null,
    worker: "Piotr",
    value: 2500,
  },
  {
    id: "GRE-2026-00479",
    client: "Anna Nowak",
    service: "Koparka",
    location: "Lubin",
    date: "2026-09-14",
    time: "09:00",
    status: "zaplanowane",
    vehicle: null,
    machine: "Koparka #01",
    worker: "Jan",
    value: 4500,
  },
  {
    id: "GRE-2026-00478",
    client: "Marek Wiśniewski",
    service: "Materiały",
    location: "Raszówka",
    date: "2026-09-11",
    time: "14:00",
    status: "zakonczone",
    vehicle: "Bus 2",
    machine: null,
    worker: "Tomek",
    value: 1800,
  },
  {
    id: "GRE-2026-00477",
    client: "Spółka ABC",
    service: "Rozbiórka",
    location: "Głogów",
    date: "2026-09-10",
    time: "07:00",
    status: "w_realizacji",
    vehicle: "Wywrotka",
    machine: "Koparka #01",
    worker: "Zespół A",
    value: 15000,
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  zaplanowane: { label: "Zaplanowane", color: "bg-blue-500/20 text-blue-400", icon: Calendar },
  w_realizacji: { label: "W realizacji", color: "bg-orange-500/20 text-orange-400", icon: Clock },
  zakonczone: { label: "Zakończone", color: "bg-green-500/20 text-green-400", icon: CheckCircle2 },
  problem: { label: "Problem", color: "bg-red-500/20 text-red-400", icon: AlertCircle },
};

export default function ZleceniaPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("wszystkie");

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "wszystkie" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-montserrat font-bold">Zlecenia</h1>
        <button className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold text-[#0f1419] flex items-center gap-2">
          <Plus size={16} /> Nowe zlecenie
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a]">
          <div className="text-2xl font-bold text-blue-400">3</div>
          <div className="text-sm text-[#b8c5d6]">Zaplanowane</div>
        </div>
        <div className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a]">
          <div className="text-2xl font-bold text-orange-400">2</div>
          <div className="text-sm text-[#b8c5d6]">W realizacji</div>
        </div>
        <div className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a]">
          <div className="text-2xl font-bold text-green-400">1</div>
          <div className="text-sm text-[#b8c5d6]">Zakończone</div>
        </div>
        <div className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a]">
          <div className="text-2xl font-bold text-[#f0a500]">27.300 zł</div>
          <div className="text-sm text-[#b8c5d6]">Wartość (miesiąc)</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a] mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b8c5d6] size-4" />
          <input
            type="text"
            placeholder="Szukaj zleceń..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg pl-10 pr-4 py-2 text-sm text-white"
          />
        </div>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
        >
          <option value="wszystkie">Wszystkie statusy</option>
          <option value="zaplanowane">Zaplanowane</option>
          <option value="w_realizacji">W realizacji</option>
          <option value="zakonczone">Zakończone</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const statusInfo = statusConfig[order.status];
          const StatusIcon = statusInfo.icon;
          
          return (
            <div key={order.id} className="bg-[#1a2332] p-6 rounded-xl border border-[#2a3a4a] hover:border-[#f0a500]/30 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-[#f0a500] font-semibold">{order.id}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusInfo.color}`}>
                      <StatusIcon size={12} />
                      {statusInfo.label}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2">{order.client}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-[#b8c5d6]">
                      <FileText size={14} className="text-[#f0a500]" />
                      {order.service}
                    </div>
                    <div className="flex items-center gap-2 text-[#b8c5d6]">
                      <MapPin size={14} className="text-[#f0a500]" />
                      {order.location}
                    </div>
                    <div className="flex items-center gap-2 text-[#b8c5d6]">
                      <Calendar size={14} className="text-[#f0a500]" />
                      {order.date} {order.time}
                    </div>
                    <div className="flex items-center gap-2 text-[#b8c5d6]">
                      <User size={14} className="text-[#f0a500]" />
                      {order.worker}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {order.vehicle && (
                    <div className="flex items-center gap-2 text-sm text-[#b8c5d6]">
                      <Truck size={14} />
                      {order.vehicle}
                    </div>
                  )}
                  {order.machine && (
                    <div className="flex items-center gap-2 text-sm text-[#b8c5d6]">
                      <Wrench size={14} />
                      {order.machine}
                    </div>
                  )}
                  <div className="text-lg font-bold text-[#f0a500]">
                    {order.value.toLocaleString()} zł
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-[#2a3a4a] text-sm font-semibold hover:bg-[#f0a500] hover:text-[#0f1419] transition-colors">
                    Szczegóły
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
