"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  FileText,
  MapPin,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  X,
  Loader2,
  Edit,
  Trash2,
} from "lucide-react";
import type { Zlecenie, LeadStatus, ServiceType } from "@/types";
import { SERVICE_LABELS } from "@/lib/supabase";
import { createOrder, deleteOrder, getOrders, updateOrder, type OrderInput } from "@/lib/orders-store";

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  zaplanowane: { label: "Zaplanowane", color: "bg-blue-500/20 text-blue-400", icon: Calendar },
  w_realizacji: { label: "W realizacji", color: "bg-orange-500/20 text-orange-400", icon: Clock },
  zakonczone: { label: "Zakończone", color: "bg-green-500/20 text-green-400", icon: CheckCircle2 },
  utracone: { label: "Utracone", color: "bg-red-500/20 text-red-400", icon: X },
};

const statusOptions: LeadStatus[] = ["zaplanowane", "w_realizacji", "zakonczone", "utracone"];
const serviceOptions: ServiceType[] = ["skup_zlomu", "transport", "koparki", "rozbiorki", "materialy", "klimatyzacja"];

const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const emptyForm: OrderInput = {
  usluga: "skup_zlomu",
  lokalizacja: "",
  zakres: "",
  termin: toLocalInput(new Date().toISOString()),
  cena: 0,
  status: "zaplanowane",
  pracownik: "",
  notatki: "",
};

export default function ZleceniaPage() {
  const [orders, setOrders] = useState<Zlecenie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("wszystkie");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<OrderInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    try {
      setOrders(await getOrders());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się wczytać zleceń");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return orders.filter((order) => {
      const matchesSearch =
        order.numer.toLowerCase().includes(q) || order.lokalizacja.toLowerCase().includes(q);
      const matchesStatus = filterStatus === "wszystkie" || order.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, filterStatus]);

  const stats = {
    zaplanowane: orders.filter((o) => o.status === "zaplanowane").length,
    w_realizacji: orders.filter((o) => o.status === "w_realizacji").length,
    zakonczone: orders.filter((o) => o.status === "zakonczone").length,
    wartoscMiesiac: orders
      .filter((o) => {
        const d = new Date(o.termin);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, o) => sum + (o.cena || 0), 0),
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm, termin: toLocalInput(new Date().toISOString()) });
    setModalOpen(true);
  };

  const openEditModal = (order: Zlecenie) => {
    setEditingId(order.id);
    setForm({
      usluga: order.usluga,
      lokalizacja: order.lokalizacja,
      zakres: order.zakres,
      termin: toLocalInput(order.termin),
      cena: order.cena,
      status: order.status,
      pracownik: order.pracownik ?? "",
      notatki: order.notatki ?? "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.lokalizacja.trim() || !form.zakres.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, termin: new Date(form.termin).toISOString() };
      if (editingId) {
        await updateOrder(editingId, payload);
      } else {
        await createOrder(payload);
      }
      setModalOpen(false);
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Nie udało się zapisać zlecenia");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (order: Zlecenie) => {
    if (!confirm(`Usunąć zlecenie ${order.numer}?`)) return;
    await deleteOrder(order.id);
    refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-montserrat font-bold">Zlecenia</h1>
        <button
          onClick={openAddModal}
          className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold text-[#0f1419] flex items-center gap-2"
        >
          <Plus size={16} /> Nowe zlecenie
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a]">
          <div className="text-2xl font-bold text-blue-400">{stats.zaplanowane}</div>
          <div className="text-sm text-[#b8c5d6]">Zaplanowane</div>
        </div>
        <div className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a]">
          <div className="text-2xl font-bold text-orange-400">{stats.w_realizacji}</div>
          <div className="text-sm text-[#b8c5d6]">W realizacji</div>
        </div>
        <div className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a]">
          <div className="text-2xl font-bold text-green-400">{stats.zakonczone}</div>
          <div className="text-sm text-[#b8c5d6]">Zakończone</div>
        </div>
        <div className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a]">
          <div className="text-2xl font-bold text-[#f0a500]">{stats.wartoscMiesiac.toLocaleString()} zł</div>
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
          {statusOptions.map((s) => (
            <option key={s} value={s}>{statusConfig[s].label}</option>
          ))}
        </select>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="bg-[#1a2332] p-12 rounded-xl border border-[#2a3a4a] text-center text-[#b8c5d6] flex items-center justify-center gap-3">
          <Loader2 className="animate-spin" size={18} /> Wczytywanie zleceń...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-[#1a2332] p-12 rounded-xl border border-[#2a3a4a] text-center text-[#b8c5d6]">
          Brak zleceń. Dodaj nowe ręcznie lub przekształć zaakceptowane zapytanie w CRM.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusInfo = statusConfig[order.status] ?? statusConfig.zaplanowane;
            const StatusIcon = statusInfo.icon;

            return (
              <div key={order.id} className="bg-[#1a2332] p-6 rounded-xl border border-[#2a3a4a] hover:border-[#f0a500]/30 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-[#f0a500] font-semibold">{order.numer}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusInfo.color}`}>
                        <StatusIcon size={12} />
                        {statusInfo.label}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold mb-2">{order.zakres}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-[#b8c5d6]">
                        <FileText size={14} className="text-[#f0a500]" />
                        {SERVICE_LABELS[order.usluga] ?? order.usluga}
                      </div>
                      <div className="flex items-center gap-2 text-[#b8c5d6]">
                        <MapPin size={14} className="text-[#f0a500]" />
                        {order.lokalizacja}
                      </div>
                      <div className="flex items-center gap-2 text-[#b8c5d6]">
                        <Calendar size={14} className="text-[#f0a500]" />
                        {new Date(order.termin).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" })}
                      </div>
                      {order.pracownik && (
                        <div className="flex items-center gap-2 text-[#b8c5d6]">
                          <User size={14} className="text-[#f0a500]" />
                          {order.pracownik}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-lg font-bold text-[#f0a500]">
                      {order.cena ? `${order.cena.toLocaleString()} zł` : "—"}
                    </div>
                    <button
                      onClick={() => openEditModal(order)}
                      className="px-4 py-2 rounded-lg bg-[#2a3a4a] text-sm font-semibold hover:bg-[#f0a500] hover:text-[#0f1419] transition-colors flex items-center gap-2"
                    >
                      <Edit size={14} /> Edytuj
                    </button>
                    <button onClick={() => handleDelete(order)} className="p-2 rounded-lg hover:bg-[#2a3a4a] transition-colors" title="Usuń">
                      <Trash2 size={14} className="text-red-400" />
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
              <h2 className="text-xl font-montserrat font-bold">{editingId ? "Edytuj zlecenie" : "Nowe zlecenie"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-[#b8c5d6] hover:text-white">
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-1">Usługa</label>
                  <select
                    value={form.usluga}
                    onChange={(e) => setForm({ ...form, usluga: e.target.value as ServiceType })}
                    className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                  >
                    {serviceOptions.map((s) => (
                      <option key={s} value={s}>{SERVICE_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as LeadStatus })}
                    className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>{statusConfig[s].label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#b8c5d6] mb-1">Lokalizacja *</label>
                <input
                  required
                  value={form.lokalizacja}
                  onChange={(e) => setForm({ ...form, lokalizacja: e.target.value })}
                  className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                  placeholder="np. Raszówka"
                />
              </div>

              <div>
                <label className="block text-sm text-[#b8c5d6] mb-1">Zakres prac *</label>
                <textarea
                  required
                  rows={3}
                  value={form.zakres}
                  onChange={(e) => setForm({ ...form, zakres: e.target.value })}
                  className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-1">Termin</label>
                  <input
                    type="datetime-local"
                    value={form.termin}
                    onChange={(e) => setForm({ ...form, termin: e.target.value })}
                    className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-1">Cena (zł)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.cena}
                    onChange={(e) => setForm({ ...form, cena: Number(e.target.value) })}
                    className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#b8c5d6] mb-1">Pracownik / operator</label>
                <input
                  value={form.pracownik}
                  onChange={(e) => setForm({ ...form, pracownik: e.target.value })}
                  className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-[#b8c5d6] mb-1">Notatki</label>
                <textarea
                  rows={2}
                  value={form.notatki}
                  onChange={(e) => setForm({ ...form, notatki: e.target.value })}
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
                  {editingId ? "Zapisz zmiany" : "Dodaj zlecenie"}
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
