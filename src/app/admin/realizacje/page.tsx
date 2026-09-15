"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  ImagePlus,
  Eye,
  CheckCircle2,
  FileEdit,
} from "lucide-react";
import type { Realizacja, ServiceType } from "@/types";
import { SERVICE_LABELS } from "@/lib/supabase";
import {
  createRealization,
  deleteRealization,
  getRealizations,
  updateRealization,
  type RealizationInput,
} from "@/lib/realizations-store";
import { fileToCompressedDataUrl } from "@/lib/image-utils";

const STATUS_CONFIG: Record<Realizacja["status"], { label: string; color: string; icon: React.ElementType }> = {
  robocza: { label: "Robocza", color: "bg-[#2a3a4a] text-[#b8c5d6]", icon: FileEdit },
  zatwierdzona: { label: "Zatwierdzona", color: "bg-blue-500/20 text-blue-400", icon: CheckCircle2 },
  publiczna: { label: "Publiczna", color: "bg-green-500/20 text-green-400", icon: Eye },
};

const emptyForm: RealizationInput = {
  usluga: "skup_zlomu",
  lokalizacja: "",
  zakres: "",
  opis: "",
  zdjecia_przed: [],
  zdjecia_w_trakcie: [],
  zdjecia_po: [],
  data_realizacji: new Date().toISOString().slice(0, 10),
  zgoda_publikacja: false,
  status: "robocza",
};

type PhotoField = "zdjecia_przed" | "zdjecia_w_trakcie" | "zdjecia_po";

function PhotoUploader({
  label,
  photos,
  onChange,
}: {
  label: string;
  photos: string[];
  onChange: (photos: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const compressed = await Promise.all(Array.from(files).map((f) => fileToCompressedDataUrl(f)));
      onChange([...photos, ...compressed]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm text-[#b8c5d6] mb-2">{label}</label>
      <div className="flex flex-wrap items-center gap-3">
        {photos.map((p, i) => (
          <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#2a3a4a]">
            <img src={p} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(photos.filter((_, idx) => idx !== i))}
              className="absolute top-0.5 right-0.5 bg-black/70 rounded-full p-0.5"
            >
              <X size={10} className="text-white" />
            </button>
          </div>
        ))}
        <label className="w-16 h-16 rounded-lg border border-dashed border-[#2a3a4a] flex items-center justify-center cursor-pointer hover:border-[#f0a500] transition-colors">
          {uploading ? <Loader2 size={18} className="animate-spin text-[#f0a500]" /> : <ImagePlus size={18} className="text-[#b8c5d6]" />}
          <input type="file" accept="image/*" multiple capture="environment" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        </label>
      </div>
    </div>
  );
}

export default function RealizacjeAdminPage() {
  const [items, setItems] = useState<Realizacja[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RealizationInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    try {
      setItems(await getRealizations());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się wczytać realizacji");
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

  const openEditModal = (item: Realizacja) => {
    setEditingId(item.id);
    setForm({
      usluga: item.usluga,
      lokalizacja: item.lokalizacja,
      zakres: item.zakres,
      opis: item.opis,
      zdjecia_przed: item.zdjecia_przed ?? [],
      zdjecia_w_trakcie: item.zdjecia_w_trakcie ?? [],
      zdjecia_po: item.zdjecia_po ?? [],
      data_realizacji: item.data_realizacji?.slice(0, 10) ?? "",
      zgoda_publikacja: item.zgoda_publikacja,
      status: item.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.lokalizacja.trim() || !form.zakres.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateRealization(editingId, form);
      } else {
        await createRealization(form);
      }
      setModalOpen(false);
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Nie udało się zapisać realizacji");
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (item: Realizacja, status: Realizacja["status"]) => {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status } : i)));
    await updateRealization(item.id, { status });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Usunąć tę realizację?")) return;
    await deleteRealization(id);
    refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-montserrat font-bold">Realizacje</h1>
          <p className="text-sm text-[#b8c5d6] mt-1">
            Portfolio wykonanych prac — status &quot;Publiczna&quot; pokazuje realizację na stronie /realizacje.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold text-[#0f1419] flex items-center gap-2 shrink-0"
        >
          <Plus size={16} /> Dodaj realizację
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-[#1a2332] p-12 rounded-xl border border-[#2a3a4a] text-center text-[#b8c5d6] flex items-center justify-center gap-3">
          <Loader2 className="animate-spin" size={18} /> Wczytywanie...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-[#1a2332] p-12 rounded-xl border border-[#2a3a4a] text-center text-[#b8c5d6]">
          Brak realizacji. Dodaj pierwszą powyżej.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const statusInfo = STATUS_CONFIG[item.status];
            const StatusIcon = statusInfo.icon;
            const cover = item.zdjecia_po[0] ?? item.zdjecia_w_trakcie[0] ?? item.zdjecia_przed[0];

            return (
              <div key={item.id} className="bg-[#1a2332] rounded-xl border border-[#2a3a4a] overflow-hidden">
                <div className="aspect-video bg-[#0f1419] flex items-center justify-center overflow-hidden">
                  {cover ? (
                    <img src={cover} alt={item.zakres} className="w-full h-full object-cover" />
                  ) : (
                    <ImagePlus className="text-[#2a3a4a] size-10" />
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusInfo.color}`}>
                      <StatusIcon size={12} />
                      {statusInfo.label}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-[#f0a500]/10 text-[#f0a500]">
                      {SERVICE_LABELS[item.usluga] ?? item.usluga}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-1">{item.zakres}</h3>
                  <p className="text-xs text-[#b8c5d6] mb-4">
                    {item.lokalizacja} • {item.data_realizacji}
                  </p>
                  <div className="flex items-center gap-2 pt-3 border-t border-[#2a3a4a]">
                    <button
                      onClick={() => openEditModal(item)}
                      className="flex-1 px-3 py-2 rounded-lg bg-[#2a3a4a] text-sm font-semibold hover:bg-[#f0a500] hover:text-[#0f1419] transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit size={14} /> Edytuj
                    </button>
                    <select
                      value={item.status}
                      onChange={(e) => setStatus(item, e.target.value as Realizacja["status"])}
                      className="bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-2 py-2 text-xs text-white"
                    >
                      {Object.entries(STATUS_CONFIG).map(([value, info]) => (
                        <option key={value} value={value}>
                          {info.label}
                        </option>
                      ))}
                    </select>
                    <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-[#2a3a4a] transition-colors" title="Usuń">
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
              <h2 className="text-xl font-montserrat font-bold">{editingId ? "Edytuj realizację" : "Nowa realizacja"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-[#b8c5d6] hover:text-white">
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-1">Usługa</label>
                  <select
                    value={form.usluga}
                    onChange={(e) => setForm({ ...form, usluga: e.target.value as ServiceType })}
                    className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                  >
                    {Object.entries(SERVICE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-1">Data realizacji</label>
                  <input
                    type="date"
                    value={form.data_realizacji}
                    onChange={(e) => setForm({ ...form, data_realizacji: e.target.value })}
                    className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#b8c5d6] mb-1">Lokalizacja *</label>
                <input
                  required
                  value={form.lokalizacja}
                  onChange={(e) => setForm({ ...form, lokalizacja: e.target.value })}
                  placeholder="np. Głogów"
                  className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-[#b8c5d6] mb-1">Tytuł / zakres prac *</label>
                <input
                  required
                  value={form.zakres}
                  onChange={(e) => setForm({ ...form, zakres: e.target.value })}
                  placeholder="np. Rozbiórka hali magazynowej"
                  className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-[#b8c5d6] mb-1">Opis</label>
                <textarea
                  rows={3}
                  value={form.opis}
                  onChange={(e) => setForm({ ...form, opis: e.target.value })}
                  className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                />
              </div>
              <PhotoUploader
                label="Zdjęcia przed"
                photos={form.zdjecia_przed}
                onChange={(photos) => setForm({ ...form, zdjecia_przed: photos })}
              />
              <PhotoUploader
                label="Zdjęcia w trakcie"
                photos={form.zdjecia_w_trakcie}
                onChange={(photos) => setForm({ ...form, zdjecia_w_trakcie: photos })}
              />
              <PhotoUploader
                label="Zdjęcia po"
                photos={form.zdjecia_po}
                onChange={(photos) => setForm({ ...form, zdjecia_po: photos })}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="zgoda"
                  checked={form.zgoda_publikacja}
                  onChange={(e) => setForm({ ...form, zgoda_publikacja: e.target.checked })}
                  className="size-4"
                />
                <label htmlFor="zgoda" className="text-sm text-[#b8c5d6]">
                  Zgoda klienta na publikację
                </label>
              </div>
              <div>
                <label className="block text-sm text-[#b8c5d6] mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as Realizacja["status"] })}
                  className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                >
                  {Object.entries(STATUS_CONFIG).map(([value, info]) => (
                    <option key={value} value={value}>
                      {info.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1 px-6 py-3 rounded-lg font-semibold text-[#0f1419] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {editingId ? "Zapisz zmiany" : "Dodaj realizację"}
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
