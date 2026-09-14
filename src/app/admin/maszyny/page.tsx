"use client";

import { 
  Plus, 
  Wrench, 
  Edit, 
  CheckCircle2,
  Clock,
  Settings
} from "lucide-react";

const machines = [
  {
    id: "MCH-001",
    name: "Koparka #01",
    type: "Koparka",
    brand: "Caterpillar",
    model: "320D",
    weight: "22 tony",
    width: "2.98 m",
    maxDepth: "6.7 m",
    equipment: ["Łyżka 0.8m³", "Łyżka 1.2m³", "Świder", "Chwytak"],
    status: "dostepna",
    operator: "Jan Kowalczyk",
    lastInspection: "2026-08-15",
    nextInspection: "2026-11-15",
  },
  {
    id: "MCH-002",
    name: "Koparka #02",
    type: "Koparka",
    brand: "Komatsu",
    model: "PC210",
    weight: "21 tony",
    width: "2.95 m",
    maxDepth: "6.5 m",
    equipment: ["Łyżka 0.7m³", "Łyżka 1.0m³"],
    status: "w_trakcie",
    operator: "Marek Nowak",
    lastInspection: "2026-07-20",
    nextInspection: "2026-10-20",
  },
  {
    id: "MCH-003",
    name: "Koparko-ładowarka",
    type: "Koparkoładowarka",
    brand: "JCB",
    model: "3CX",
    weight: "8.5 tony",
    width: "2.5 m",
    maxDepth: "4.5 m",
    equipment: ["Łyżka kop. 0.3m³", "Łyżka ładow. 1.0m³", "Świder"],
    status: "dostepna",
    operator: null,
    lastInspection: "2026-09-01",
    nextInspection: "2026-12-01",
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  dostepna: { label: "Dostępna", color: "bg-green-500/20 text-green-400", icon: CheckCircle2 },
  w_trakcie: { label: "W użyciu", color: "bg-blue-500/20 text-blue-400", icon: Settings },
  przeglad: { label: "Przegląd", color: "bg-yellow-500/20 text-yellow-400", icon: Wrench },
  serwis: { label: "Serwis", color: "bg-orange-500/20 text-orange-400", icon: Clock },
};

export default function MaszynyPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-montserrat font-bold">Maszyny</h1>
        <button className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold text-[#0f1419] flex items-center gap-2">
          <Plus size={16} /> Dodaj maszynę
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a]">
          <div className="text-2xl font-bold text-green-400">
            {machines.filter(m => m.status === 'dostepna').length}
          </div>
          <div className="text-sm text-[#b8c5d6]">Dostępne</div>
        </div>
        <div className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a]">
          <div className="text-2xl font-bold text-blue-400">
            {machines.filter(m => m.status === 'w_trakcie').length}
          </div>
          <div className="text-sm text-[#b8c5d6]">W użyciu</div>
        </div>
        <div className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a]">
          <div className="text-2xl font-bold text-yellow-400">
            {machines.filter(m => m.status === 'przeglad').length}
          </div>
          <div className="text-sm text-[#b8c5d6]">Na przeglądzie</div>
        </div>
        <div className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a]">
          <div className="text-2xl font-bold text-[#f0a500]">{machines.length}</div>
          <div className="text-sm text-[#b8c5d6]">Razem</div>
        </div>
      </div>

      {/* Machines Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {machines.map((machine) => {
          const statusInfo = statusConfig[machine.status];
          const StatusIcon = statusInfo.icon;
          
          return (
            <div key={machine.id} className="bg-[#1a2332] p-6 rounded-xl border border-[#2a3a4a] hover:border-[#f0a500]/30 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#f0a500]/10 flex items-center justify-center">
                    <Wrench className="text-[#f0a500] size-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{machine.name}</h3>
                    <p className="text-sm text-[#b8c5d6]">{machine.brand} {machine.model}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusInfo.color}`}>
                  <StatusIcon size={12} />
                  {statusInfo.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-[#0f1419] p-3 rounded-lg">
                  <div className="text-xs text-[#b8c5d6] mb-1">Masa</div>
                  <div className="font-semibold">{machine.weight}</div>
                </div>
                <div className="bg-[#0f1419] p-3 rounded-lg">
                  <div className="text-xs text-[#b8c5d6] mb-1">Szerokość</div>
                  <div className="font-semibold">{machine.width}</div>
                </div>
                <div className="bg-[#0f1419] p-3 rounded-lg">
                  <div className="text-xs text-[#b8c5d6] mb-1">Maks. głębokość</div>
                  <div className="font-semibold">{machine.maxDepth}</div>
                </div>
                <div className="bg-[#0f1419] p-3 rounded-lg">
                  <div className="text-xs text-[#b8c5d6] mb-1">Operator</div>
                  <div className="font-semibold">{machine.operator || 'Brak'}</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs text-[#b8c5d6] mb-2">Osprzęt:</div>
                <div className="flex flex-wrap gap-2">
                  {machine.equipment.map((item) => (
                    <span key={item} className="px-2 py-1 bg-[#2a3a4a] rounded text-xs">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#2a3a4a]">
                <div className="text-sm text-[#b8c5d6]">
                  Następny przegląd: <span className="text-white">{machine.nextInspection}</span>
                </div>
                <button className="p-2 rounded-lg hover:bg-[#2a3a4a] transition-colors" title="Edytuj">
                  <Edit size={16} className="text-[#b8c5d6]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
