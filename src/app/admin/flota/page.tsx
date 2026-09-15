"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Truck,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Wrench,
  X,
} from "lucide-react";
import type { Pojazd } from "@/types";
import {
  createVehicle,
  deleteVehicle,
  getVehicles,
  updateVehicle,
  type VehicleInput,
} from "@/lib/vehicles-store";

const TYPE_LABELS: Record<Pojazd["typ"], string> = {
  bus_krotki: "Bus krótki",
  bus_dlugi: "Bus długi",
  wywrotka: "Wywrotka",
  ciezarowka: "Ciężarówka",
  transport_aut: "Transport aut",
};

const statusConfig: Record<Pojazd["status"], { label: string; color: string; icon: React.ElementType }> = {
  dostepny: { label: "Dostępny", color: "bg-green-500/20 text-green-400", icon: CheckCircle2 },
  w_trakcie: { label: "W trasie", color: "bg-blue-500/20 text-blue-400", icon: Truck },
  przeglad: { label: "Przegląd", color: "bg-yellow-500/20 text-yellow-400", icon: Wrench },
  serwis: { label: "Serwis", color: "bg-orange-500/20 text-orange-400", icon: AlertTriangle },
};

const emptyForm: VehicleInput = {
  nazwa: "",
  typ: "bus_krotki",
  marka: "",
  model: "",
  rejestracja: "",
  ladownosc: 0,
  wymiary: "",
  status: "dostepny",
  przeglad: "",
  oc: "",
  serwis: "",
};

function getDaysUntil(dateStr?: string) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function FlotaPage() {
  const [vehicles, setVehicles] = useState<Pojazd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VehicleInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    try {
      setVehicles(await getVehicles());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się wczytać floty");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (vehicle: Pojazd) => {
    setEditingId(vehicle.id);
    setForm({
      nazwa: vehicle.nazwa,
      typ: vehicle.typ,
      marka: vehicle.marka,
      model: vehicle.model,
      rejestracja: vehicle.rejestracja,
      ladownosc: vehicle.ladownosc,
      wymiary: vehicle.wymiary,
      status: vehicle.status,
      przeglad: vehicle.przeglad ?? "",
      oc: vehicle.oc ?? "",
      serwis: vehicle.serwis ?? "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nazwa.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateVehicle(editingId, form);
      } else {
        await createVehicle(form);
      }
      setModalOpen(false);
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Nie udało się zapisać pojazdu");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Usunąć ten pojazd?")) return;
    await deleteVehicle(id);
    refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-montserrat font-bold">Flota pojazdów</h1>
        <button
          onClick={openAddModal}
          className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold text-[#0f1419] flex items-center gap-2"
        >
          <Plus size={16} /> Dodaj pojazd
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a]">
          <div className="text-2xl font-bold text-green-400">
            {vehicles.filter((v) => v.status === "dostepny").length}
          </div>
          <div className="text-sm text-[#b8c5d6]">Dostępne</div>
        </div>
        <div className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a]">
          <div className="text-2xl font-bold text-blue-400">
            {vehicles.filter((v) => v.status === "w_trakcie").length}
          </div>
          <div className="text-sm text-[#b8c5d6]">W trasie</div>
        </div>
        <div className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a]">
          <div className="text-2xl font-bold text-yellow-400">
            {vehicles.filter((v) => v.status === "przeglad").length}
          </div>
          <div className="text-sm text-[#b8c5d6]">Na przeglądzie</div>
        </div>
        <div className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a]">
          <div className="text-2xl font-bold text-[#f0a500]">{vehicles.length}</div>
          <div className="text-sm text-[#b8c5d6]">Razem</div>
        </div>
      </div>

      {loading ? (
        <div className="bg-[#1a2332] p-12 rounded-xl border border-[#2a3a4a] text-center text-[#b8c5d6] flex items-center justify-center gap-3">
          <Loader2 className="animate-spin" size={18} /> Wczytywanie...
        </div>
      ) : vehicles.length === 0 ? (
        <div className="bg-[#1a2332] p-12 rounded-xl border border-[#2a3a4a] text-center text-[#b8c5d6]">
          Brak pojazdów. Dodaj pierwszy powyżej.
        </div>
      ) : (
        <div className="space-y-4">
          {vehicles.map((vehicle) => {
            const statusInfo = statusConfig[vehicle.status];
            const StatusIcon = statusInfo.icon;
            const inspectionDays = getDaysUntil(vehicle.przeglad);

            return (
              <div
                key={vehicle.id}
                className="bg-[#1a2332] p-6 rounded-xl border border-[#2a3a4a] hover:border-[#f0a500]/30 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-[#2a3a4a] flex items-center justify-center shrink-0">
                      <Truck className="text-[#f0a500] size-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h3 className="text-lg font-semibold">{vehicle.nazwa}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusInfo.color}`}>
                          <StatusIcon size={12} />
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-[#b8c5d6] mb-2">
                        {vehicle.marka} {vehicle.model} • {vehicle.rejestracja}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-[#b8c5d6]">
                        <span>Typ: {TYPE_LABELS[vehicle.typ]}</span>
                        <span>Ładowność: {vehicle.ladownosc} t</span>
                        {vehicle.wymiary && <span>Wymiary: {vehicle.wymiary}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {vehicle.przeglad && (
                      <div className="text-right">
                        <div className="text-xs text-[#b8c5d6] mb-1">Przegląd</div>
                        <div
                          className={`text-sm font-semibold ${
                            inspectionDays !== null && inspectionDays <= 0
                              ? "text-red-400"
                              : inspectionDays !== null && inspectionDays <= 14
                              ? "text-yellow-400"
                              : "text-white"
                          }`}
                        >
                          {vehicle.przeglad}
                          {inspectionDays !== null && inspectionDays <= 14 && inspectionDays > 0 && (
                            <span className="ml-2 text-xs">({inspectionDays} dni)</span>
                          )}
                          {inspectionDays !== null && inspectionDays <= 0 && <span className="ml-2 text-xs">WYGASŁ</span>}
                        </div>
                      </div>
                    )}
                    {vehicle.oc && (
                      <div className="text-right">
                        <div className="text-xs text-[#b8c5d6] mb-1">OC</div>
                        <div className="text-sm font-semibold text-white">{vehicle.oc}</div>
                      </div>
                    )}
                    <button
                      onClick={() => openEditModal(vehicle)}
                      className="p-2 rounded-lg hover:bg-[#2a3a4a] transition-colors"
                      title="Edytuj"
                    >
                      <Edit size={16} className="text-[#b8c5d6]" />
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="p-2 rounded-lg hover:bg-[#2a3a4a] transition-colors"
                      title="Usuń"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#2a3a4a] sticky top-0 bg-[#1a2332]">
              <h2 className="text-xl font-montserrat font-bold">{editingId ? "Edytuj pojazd" : "Nowy pojazd"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-[#b8c5d6] hover:text-white">
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-[#b8c5d6] mb-1">Nazwa *</label>
                <input
                  required
                  value={form.nazwa}
                  onChange={(e) => setForm({ ...form, nazwa: e.target.value })}
                  placeholder="np. Bus 1"
                  className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-1">Typ</label>
                  <select
                    value={form.typ}
                    onChange={(e) => setForm({ ...form, typ: e.target.value as Pojazd["typ"] })}
                    className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                  >
                    {Object.entries(TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as Pojazd["status"] })}
                    className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                  >
                    {Object.entries(statusConfig).map(([value, info]) => (
                      <option key={value} value={value}>
                        {info.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-1">Marka</label>
                  <input
                    value={form.marka}
                    onChange={(e) => setForm({ ...form, marka: e.target.value })}
                    className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-1">Model</label>
                  <input
                    value={form.model}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                    className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-1">Rejestracja</label>
                  <input
                    value={form.rejestracja}
                    onChange={(e) => setForm({ ...form, rejestracja: e.target.value })}
                    className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-1">Ładowność (t)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.ladownosc}
                    onChange={(e) => setForm({ ...form, ladownosc: Number(e.target.value) })}
                    className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#b8c5d6] mb-1">Wymiary</label>
                <input
                  value={form.wymiary}
                  onChange={(e) => setForm({ ...form, wymiary: e.target.value })}
                  placeholder="np. 4.5m x 2.0m x 2.0m"
                  className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-1">Przegląd do</label>
                  <input
                    type="date"
                    value={form.przeglad}
                    onChange={(e) => setForm({ ...form, przeglad: e.target.value })}
                    className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-1">OC do</label>
                  <input
                    type="date"
                    value={form.oc}
                    onChange={(e) => setForm({ ...form, oc: e.target.value })}
                    className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-1">Serwis do</label>
                  <input
                    type="date"
                    value={form.serwis}
                    onChange={(e) => setForm({ ...form, serwis: e.target.value })}
                    className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1 px-6 py-3 rounded-lg font-semibold text-[#0f1419] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {editingId ? "Zapisz zmiany" : "Dodaj pojazd"}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-3 rounded-lg font-semibold border border-[#2a3a4a] text-[#b8c5d6] hover:text-white"
                >
                  Anuluj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
