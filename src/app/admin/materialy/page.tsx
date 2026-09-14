"use client";

import { useState } from "react";
import { 
  Search, 
  Plus, 
  Filter,
  Package,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";

const materials = [
  {
    id: "MAT-000184",
    category: "Stal",
    name: "Profil 100x100",
    dimensions: "100 × 100 mm",
    length: "4.2 m",
    quantity: 6,
    condition: "używany",
    status: "dostepny",
    location: "Plac A / Sektor 3",
    price: null,
  },
  {
    id: "MAT-000185",
    category: "Cegła",
    name: "Cegła rozbiórkowa",
    dimensions: "Standard",
    length: null,
    quantity: 1500,
    condition: "używany",
    status: "dostepny",
    location: "Plac B / Sektor 1",
    price: 0.80,
  },
  {
    id: "MAT-000186",
    category: "Okna",
    name: "Okno PCV 120x150",
    dimensions: "120 × 150 cm",
    length: null,
    quantity: 8,
    condition: "dobry",
    status: "zarezerwowany",
    location: "Magazyn",
    price: 250,
  },
  {
    id: "MAT-000187",
    category: "Drzwi",
    name: "Drzwi stalowe wejściowe",
    dimensions: "100 × 210 cm",
    length: null,
    quantity: 3,
    condition: "dobry",
    status: "dostepny",
    location: "Magazyn",
    price: 450,
  },
  {
    id: "MAT-000188",
    category: "Stal",
    name: "Kątownik 80x80",
    dimensions: "80 × 80 mm",
    length: "6 m",
    quantity: 12,
    condition: "używany",
    status: "sprzedany",
    location: "Plac A / Sektor 2",
    price: null,
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  dostepny: { label: "Dostępny", color: "bg-green-500/20 text-green-400", icon: CheckCircle2 },
  zarezerwowany: { label: "Zarezerwowany", color: "bg-yellow-500/20 text-yellow-400", icon: Clock },
  sprzedany: { label: "Sprzedany", color: "bg-gray-500/20 text-gray-400", icon: Package },
  ukryty: { label: "Ukryty", color: "bg-red-500/20 text-red-400", icon: EyeOff },
  do_weryfikacji: { label: "Do weryfikacji", color: "bg-orange-500/20 text-orange-400", icon: AlertCircle },
};

const categories = ["Wszystkie", "Stal", "Cegła", "Okna", "Drzwi", "Inne"];

export default function MaterialyPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("Wszystkie");
  const [filterStatus, setFilterStatus] = useState("wszystkie");

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "Wszystkie" || material.category === filterCategory;
    const matchesStatus = filterStatus === "wszystkie" || material.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    dostepne: materials.filter(m => m.status === "dostepny").length,
    zarezerwowane: materials.filter(m => m.status === "zarezerwowany").length,
    sprzedane: materials.filter(m => m.status === "sprzedany").length,
    razem: materials.length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-montserrat font-bold">Materiały</h1>
        <button className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold text-[#0f1419] flex items-center gap-2">
          <Plus size={16} /> Dodaj materiał
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a]">
          <div className="text-2xl font-bold text-green-400">{stats.dostepne}</div>
          <div className="text-sm text-[#b8c5d6]">Dostępne</div>
        </div>
        <div className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a]">
          <div className="text-2xl font-bold text-yellow-400">{stats.zarezerwowane}</div>
          <div className="text-sm text-[#b8c5d6]">Zarezerwowane</div>
        </div>
        <div className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a]">
          <div className="text-2xl font-bold text-gray-400">{stats.sprzedane}</div>
          <div className="text-sm text-[#b8c5d6]">Sprzedane</div>
        </div>
        <div className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a]">
          <div className="text-2xl font-bold text-[#f0a500]">{stats.razem}</div>
          <div className="text-sm text-[#b8c5d6]">Razem</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a] mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b8c5d6] size-4" />
            <input
              type="text"
              placeholder="Szukaj materiałów..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg pl-10 pr-4 py-2 text-sm text-white"
            />
          </div>
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
          >
            <option value="wszystkie">Wszystkie statusy</option>
            <option value="dostepny">Dostępny</option>
            <option value="zarezerwowany">Zarezerwowany</option>
            <option value="sprzedany">Sprzedany</option>
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.map((material) => {
          const statusInfo = statusConfig[material.status];
          const StatusIcon = statusInfo.icon;
          
          return (
            <div key={material.id} className="bg-[#1a2332] p-6 rounded-xl border border-[#2a3a4a] hover:border-[#f0a500]/30 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <span className="font-mono text-[#f0a500] text-sm">{material.id}</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${statusInfo.color}`}>
                  <StatusIcon size={12} />
                  {statusInfo.label}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold mb-2">{material.name}</h3>
              
              <div className="space-y-2 text-sm text-[#b8c5d6] mb-4">
                <div className="flex justify-between">
                  <span>Kategoria:</span>
                  <span className="text-white">{material.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>Wymiary:</span>
                  <span className="text-white">{material.dimensions}</span>
                </div>
                {material.length && (
                  <div className="flex justify-between">
                    <span>Długość:</span>
                    <span className="text-white">{material.length}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Ilość:</span>
                  <span className="text-white">{material.quantity} szt.</span>
                </div>
                <div className="flex justify-between">
                  <span>Stan:</span>
                  <span className="text-white capitalize">{material.condition}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lokalizacja:</span>
                  <span className="text-white">{material.location}</span>
                </div>
              </div>

              {material.price && (
                <div className="text-lg font-bold text-[#f0a500] mb-4">
                  {material.price.toFixed(2)} zł / szt.
                </div>
              )}

              <div className="flex items-center gap-2 pt-4 border-t border-[#2a3a4a]">
                <button className="flex-1 px-3 py-2 rounded-lg bg-[#2a3a4a] text-sm font-semibold hover:bg-[#f0a500] hover:text-[#0f1419] transition-colors">
                  Zapytaj
                </button>
                <button className="p-2 rounded-lg hover:bg-[#2a3a4a] transition-colors" title="Edytuj">
                  <Edit size={14} className="text-[#b8c5d6]" />
                </button>
                <button className="p-2 rounded-lg hover:bg-[#2a3a4a] transition-colors" title="Usuń">
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
