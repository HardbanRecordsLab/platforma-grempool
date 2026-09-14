"use client";

import { 
  Plus, 
  Truck, 
  Edit, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench
} from "lucide-react";

const vehicles = [
  {
    id: "VH-001",
    name: "Bus 1",
    type: "Bus krótki",
    brand: "Ford",
    model: "Transit",
    registration: "DWR 12345",
    capacity: "1.5 tony",
    dimensions: "3.2m x 1.8m x 1.8m",
    status: "w_trakcie",
    inspection: "2026-10-15",
    insurance: "2026-12-31",
    service: "2026-11-01",
  },
  {
    id: "VH-002",
    name: "Bus 2",
    type: "Bus długi",
    brand: "Mercedes",
    model: "Sprinter",
    registration: "DWR 67890",
    capacity: "3 tony",
    dimensions: "4.5m x 2.0m x 2.0m",
    status: "dostepny",
    inspection: "2026-11-20",
    insurance: "2026-12-31",
    service: "2026-12-15",
  },
  {
    id: "VH-003",
    name: "Wywrotka",
    type: "Wywrotka",
    brand: "MAN",
    model: "TGS",
    registration: "DWR 11111",
    capacity: "10 ton",
    dimensions: "6.0m x 2.5m x 1.2m",
    status: "dostepny",
    inspection: "2026-09-30",
    insurance: "2026-12-31",
    service: "2026-10-20",
  },
  {
    id: "VH-004",
    name: "Ciężarówka",
    type: "Ciężarówka z plandeką",
    brand: "Volvo",
    model: "FH",
    registration: "DWR 22222",
    capacity: "24 tony",
    dimensions: "13.6m x 2.5m x 2.7m",
    status: "w_trakcie",
    inspection: "2026-10-10",
    insurance: "2026-12-31",
    service: "2026-11-15",
  },
  {
    id: "VH-005",
    name: "Laweta",
    type: "Transport aut",
    brand: "Iveco",
    model: "Eurocargo",
    registration: "DWR 33333",
    capacity: "3.5 tony",
    dimensions: "6.5m x 2.2m",
    status: "przeglad",
    inspection: "2026-09-12",
    insurance: "2026-12-31",
    service: "2026-09-15",
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  dostepny: { label: "Dostępny", color: "bg-green-500/20 text-green-400", icon: CheckCircle2 },
  w_trakcie: { label: "W trasie", color: "bg-blue-500/20 text-blue-400", icon: Truck },
  przeglad: { label: "Przegląd", color: "bg-yellow-500/20 text-yellow-400", icon: Wrench },
  serwis: { label: "Serwis", color: "bg-orange-500/20 text-orange-400", icon: AlertTriangle },
};

function getDaysUntil(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function FlotaPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-montserrat font-bold">Flota pojazdów</h1>
        <button className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold text-[#0f1419] flex items-center gap-2">
          <Plus size={16} /> Dodaj pojazd
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a]">
          <div className="text-2xl font-bold text-green-400">
            {vehicles.filter(v => v.status === 'dostepny').length}
          </div>
          <div className="text-sm text-[#b8c5d6]">Dostępne</div>
        </div>
        <div className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a]">
          <div className="text-2xl font-bold text-blue-400">
            {vehicles.filter(v => v.status === 'w_trakcie').length}
          </div>
          <div className="text-sm text-[#b8c5d6]">W trasie</div>
        </div>
        <div className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a]">
          <div className="text-2xl font-bold text-yellow-400">
            {vehicles.filter(v => v.status === 'przeglad').length}
          </div>
          <div className="text-sm text-[#b8c5d6]">Na przeglądzie</div>
        </div>
        <div className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a]">
          <div className="text-2xl font-bold text-[#f0a500]">{vehicles.length}</div>
          <div className="text-sm text-[#b8c5d6]">Razem</div>
        </div>
      </div>

      {/* Vehicles List */}
      <div className="space-y-4">
        {vehicles.map((vehicle) => {
          const statusInfo = statusConfig[vehicle.status];
          const StatusIcon = statusInfo.icon;
          const inspectionDays = getDaysUntil(vehicle.inspection);
          const insuranceDays = getDaysUntil(vehicle.insurance);
          
          return (
            <div key={vehicle.id} className="bg-[#1a2332] p-6 rounded-xl border border-[#2a3a4a] hover:border-[#f0a500]/30 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-[#2a3a4a] flex items-center justify-center">
                    <Truck className="text-[#f0a500] size-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold">{vehicle.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusInfo.color}`}>
                        <StatusIcon size={12} />
                        {statusInfo.label}
                      </span>
                    </div>
                    <p className="text-sm text-[#b8c5d6] mb-2">
                      {vehicle.brand} {vehicle.model} • {vehicle.registration}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-[#b8c5d6]">
                      <span>Typ: {vehicle.type}</span>
                      <span>Ładowność: {vehicle.capacity}</span>
                      <span>Wymiary: {vehicle.dimensions}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-xs text-[#b8c5d6] mb-1">Przegląd</div>
                    <div className={`text-sm font-semibold ${inspectionDays <= 14 ? 'text-yellow-400' : inspectionDays <= 0 ? 'text-red-400' : 'text-white'}`}>
                      {vehicle.inspection}
                      {inspectionDays <= 14 && inspectionDays > 0 && (
                        <span className="ml-2 text-xs">({inspectionDays} dni)</span>
                      )}
                      {inspectionDays <= 0 && (
                        <span className="ml-2 text-xs">WYGASŁ</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#b8c5d6] mb-1">OC</div>
                    <div className={`text-sm font-semibold ${insuranceDays <= 30 ? 'text-yellow-400' : 'text-white'}`}>
                      {vehicle.insurance}
                    </div>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-[#2a3a4a] transition-colors" title="Edytuj">
                    <Edit size={16} className="text-[#b8c5d6]" />
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
