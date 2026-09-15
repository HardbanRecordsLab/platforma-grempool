"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Wrench,
  Edit,
  Trash2,
  CheckCircle2,
  Settings,
  Loader2,
  Clock,
  X,
} from "lucide-react";
import type { Maszyna } from "@/types";
import {
  createMachine,
  deleteMachine,
  getMachines,
  updateMachine,
  type MachineInput,
} from "@/lib/machines-store";

const TYPE_LABELS: Record<Maszyna["typ"], string> = {
  koparka: "Koparka",
  koparkoladowarka: "Koparkoładowarka",
  waldor: "Walec",
};

const statusConfig: Record<Maszyna["status"], { label: string; color: string; icon: React.ElementType }> = {
  dostepna: { label: "Dostępna", color: "bg-green-500/20 text-green-400", icon: CheckCircle2 },
  w_trakcie: { label: "W użyciu", color: "bg-blue-500/20 text-blue-400", icon: Settings },
  przeglad: { label: "Przegląd", color: "bg-yellow-500/20 text-yellow-400", icon: Wrench },
  serwis: { label: "Serwis", color: "bg-orange-500/20 text-orange-400", icon: Clock },
};

const emptyForm: MachineInput = {
  nazwa: "",
  typ: "koparka",
  marka: "",
  model: "",
  masa: 0,
  szerokosc: 0,
  glebokosc: 0,
  osprzet: [],
  status: "dostepna",
  operator: "",
};

export default function MaszynyPage() {
  const [machines, setMachines] = useState<Maszyna[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MachineInput>(emptyForm);
  const [osprzetText, setOsprzetText] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    try {
      setMachines(await getMachines());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się wczytać maszyn");
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
    setOsprzetText("");
    setModalOpen(true);
  };

  const openEditModal = (machine: Maszyna) => {
    setEditingId(machine.id);
    setForm({
      nazwa: machine.nazwa,
      typ: machine.typ,
      marka: machine.marka,
      model: machine.model,
      masa: machine.masa,
      szerokosc: machine.szerokosc,
      glebokosc: machine.glebokosc,
      osprzet: machine.osprzet ?? [],
      status: machine.status,
      operator: machine.operator ?? "",
    });
    setOsprzetText((machine.osprzet ?? []).join(", "));
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nazwa.trim()) return;
    setSaving(true);
    try {
      const payload: MachineInput = {
        ...form,
        osprzet: osprzetText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      if (editingId) {
        await updateMachine(editingId, payload);
      } else {
        await createMachine(payload);
      }
      setModalOpen(false);
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Nie udało się zapisać maszyny");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Usunąć tę maszynę?")) return;
    await deleteMachine(id);
    refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-montserrat font-bold">Maszyny</h1>
        <button
          onClick={openAddModal}
          className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold text-[#0f1419] flex items-center gap-2"
        >
          <Plus size={16} /> Dodaj maszynę
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
            {machines.filter((m) => m.status === "dostepna").length}
          </div>
          <div className="text-sm text-[#b8c5d6]">Dostępne</div>
        </div>
        <div className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a]">
          <div className="text-2xl font-bold text-blue-400">
            {machines.filter((m) => m.status === "w_trakcie").length}
          </div>
          <div className="text-sm text-[#b8c5d6]">W użyciu</div>
        </div>
        <div className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a]">
          <div className="text-2xl font-bold text-yellow-400">
            {machines.filter((m) => m.status === "przeglad").length}
          </div>
          <div className="text-sm text-[#b8c5d6]">Na przeglądzie</div>
        </div>
        <div className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a]">
          <div className="text-2xl font-bold text-[#f0a500]">{machines.length}</div>
          <div className="text-sm text-[#b8c5d6]">Razem</div>
        </div>
      </div>

      {loading ? (
        <div className="bg-[#1a2332] p-12 rounded-xl border border-[#2a3a4a] text-center text-[#b8c5d6] flex items-center justify-center gap-3">
          <Loader2 className="animate-spin" size={18} /> Wczytywanie...
        </div>
      ) : machines.length === 0 ? (
        <div className="bg-[#1a2332] p-12 rounded-xl border border-[#2a3a4a] text-center text-[#b8c5d6]">
          Brak maszyn. Dodaj pierwszą powyżej.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {machines.map((machine) => {
            const statusInfo = statusConfig[machine.status];
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={machine.id}
                className="bg-[#1a2332] p-6 rounded-xl border border-[#2a3a4a] hover:border-[#f0a500]/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[#f0a500]/10 flex items-center justify-center shrink-0">
                      <Wrench className="text-[#f0a500] size-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{machine.nazwa}</h3>
                      <p className="text-sm text-[#b8c5d6]">
                        {machine.marka} {machine.model} • {TYPE_LABELS[machine.typ]}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shrink-0 ${statusInfo.color}`}>
                    <StatusIcon size={12} />
                    {statusInfo.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-[#0f1419] p-3 rounded-lg">
                    <div className="text-xs text-[#b8c5d6] mb-1">Masa</div>
                    <div className="font-semibold">{machine.masa} t</div>
                  </div>
                  <div className="bg-[#0f1419] p-3 rounded-lg">
                    <div className="text-xs text-[#b8c5d6] mb-1">Szerokość</div>
                    <div className="font-semibold">{machine.szerokosc} m</div>
                  </div>
                  <div className="bg-[#0f1419] p-3 rounded-lg">
                    <div className="text-xs text-[#b8c5d6] mb-1">Maks. głębokość</div>
                    <div className="font-semibold">{machine.glebokosc} m</div>
                  </div>
                  <div className="bg-[#0f1419] p-3 rounded-lg">
                    <div className="text-xs text-[#b8c5d6] mb-1">Operator</div>
                    <div className="font-semibold">{machine.operator || "Brak"}</div>
                  </div>
                </div>

                {machine.osprzet?.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs text-[#b8c5d6] mb-2">Osprzęt:</div>
                    <div className="flex flex-wrap gap-2">
                      {machine.osprzet.map((item) => (
                        <span key={item} className="px-2 py-1 bg-[#2a3a4a] rounded text-xs">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#2a3a4a]">
                  <button
                    onClick={() => openEditModal(machine)}
                    className="p-2 rounded-lg hover:bg-[#2a3a4a] transition-colors"
                    title="Edytuj"
                  >
                    <Edit size={16} className="text-[#b8c5d6]" />
                  </button>
                  <button
                    onClick={() => handleDelete(machine.id)}
                    className="p-2 rounded-lg hover:bg-[#2a3a4a] transition-colors"
                    title="Usuń"
                  >
                    <Trash2 size={16} className="text-red-400" />
                  </button>
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
              <h2 className="text-xl font-montserrat font-bold">{editingId ? "Edytuj maszynę" : "Nowa maszyna"}</h2>
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
                  placeholder="np. Koparka #01"
                  className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-1">Typ</label>
                  <select
                    value={form.typ}
                    onChange={(e) => setForm({ ...form, typ: e.target.value as Maszyna["typ"] })}
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
                    onChange={(e) => setForm({ ...form, status: e.target.value as Maszyna["status"] })}
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
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-1">Masa (t)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.masa}
                    onChange={(e) => setForm({ ...form, masa: Number(e.target.value) })}
                    className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-1">Szerokość (m)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.szerokosc}
                    onChange={(e) => setForm({ ...form, szerokosc: Number(e.target.value) })}
                    className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-1">Głębokość (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.glebokosc}
                    onChange={(e) => setForm({ ...form, glebokosc: Number(e.target.value) })}
                    className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#b8c5d6] mb-1">Operator</label>
                <input
                  value={form.operator}
                  onChange={(e) => setForm({ ...form, operator: e.target.value })}
                  placeholder="np. Jan Kowalczyk"
                  className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-[#b8c5d6] mb-1">Osprzęt (oddziel przecinkami)</label>
                <input
                  value={osprzetText}
                  onChange={(e) => setOsprzetText(e.target.value)}
                  placeholder="Łyżka 0.8m³, Świder, Chwytak"
                  className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1 px-6 py-3 rounded-lg font-semibold text-[#0f1419] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {editingId ? "Zapisz zmiany" : "Dodaj maszynę"}
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
