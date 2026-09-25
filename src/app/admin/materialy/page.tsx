"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Package,
  Edit,
  Trash2,
  EyeOff,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  ImagePlus,
  Loader2,
  Bookmark,
  BookmarkCheck,
  Camera,
  Share2,
} from "lucide-react";
import type { Material, MaterialStatus } from "@/types";
import PromoteMaterialModal from "@/components/admin/PromoteMaterialModal";
import {
  MATERIAL_CATEGORIES,
  MATERIAL_CONDITIONS,
  MATERIAL_STATUSES,
  createMaterial,
  deleteMaterial,
  getMaterials,
  updateMaterial,
  type MaterialInput,
} from "@/lib/materials-store";
import { uploadImageFile } from "@/lib/image-utils";

const statusConfig: Record<MaterialStatus, { label: string; color: string; icon: React.ElementType }> = {
  dostepny: { label: "Dostępny", color: "bg-green-500/20 text-green-400", icon: CheckCircle2 },
  zarezerwowany: { label: "Zarezerwowany", color: "bg-yellow-500/20 text-yellow-400", icon: Clock },
  sprzedany: { label: "Sprzedany", color: "bg-gray-500/20 text-gray-400", icon: Package },
  ukryty: { label: "Ukryty", color: "bg-red-500/20 text-red-400", icon: EyeOff },
  do_weryfikacji: { label: "Do weryfikacji", color: "bg-orange-500/20 text-orange-400", icon: AlertCircle },
};

const categoryLabel = (value: Material["kategoria"]) =>
  MATERIAL_CATEGORIES.find((c) => c.value === value)?.label ?? value;

const emptyForm: MaterialInput = {
  kategoria: "stal",
  nazwa: "",
  wymiary: "",
  dlugosc: undefined,
  ilosc: 1,
  stan: "uzywany",
  zdjecia: [],
  lokalizacja: "",
  cena: undefined,
  status: "dostepny",
  notatki: "",
};

export default function MaterialyPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("Wszystkie");
  const [filterStatus, setFilterStatus] = useState("wszystkie");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MaterialInput>(emptyForm);
  const [askPrice, setAskPrice] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [promotingMaterial, setPromotingMaterial] = useState<Material | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setMaterials(await getMaterials());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się wczytać materiałów");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      const matchesSearch =
        material.nazwa.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.id_materialu.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === "Wszystkie" || categoryLabel(material.kategoria) === filterCategory;
      const matchesStatus = filterStatus === "wszystkie" || material.status === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [materials, searchQuery, filterCategory, filterStatus]);

  const stats = {
    dostepne: materials.filter((m) => m.status === "dostepny").length,
    zarezerwowane: materials.filter((m) => m.status === "zarezerwowany").length,
    sprzedane: materials.filter((m) => m.status === "sprzedany").length,
    razem: materials.length,
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setAskPrice(true);
    setModalOpen(true);
  };

  const openEditModal = (material: Material) => {
    setEditingId(material.id);
    setForm({
      kategoria: material.kategoria,
      nazwa: material.nazwa,
      wymiary: material.wymiary,
      dlugosc: material.dlugosc,
      ilosc: material.ilosc,
      stan: material.stan,
      zdjecia: material.zdjecia ?? [],
      lokalizacja: material.lokalizacja,
      cena: material.cena,
      status: material.status,
      notatki: material.notatki ?? "",
    });
    setAskPrice(material.cena === undefined || material.cena === null);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleToggleReserve = async (material: Material) => {
    const nextStatus: MaterialStatus = material.status === "zarezerwowany" ? "dostepny" : "zarezerwowany";
    try {
      await updateMaterial(material.id, { status: nextStatus });
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Nie udało się zmienić statusu rezerwacji");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Na pewno usunąć tę ofertę z magazynu?")) return;
    try {
      await deleteMaterial(id);
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Nie udało się usunąć materiału");
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const urls = await Promise.all(Array.from(files).map((f) => uploadImageFile(f, "materials")));
      setForm((prev) => ({ ...prev, zdjecia: [...(prev.zdjecia ?? []), ...urls] }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Nie udało się wgrać zdjęcia");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setForm((prev) => ({ ...prev, zdjecia: (prev.zdjecia ?? []).filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nazwa.trim() || !form.wymiary.trim() || !form.lokalizacja.trim()) return;

    const payload: MaterialInput = {
      ...form,
      cena: askPrice ? undefined : form.cena,
    };

    setSaving(true);
    try {
      if (editingId) {
        await updateMaterial(editingId, payload);
      } else {
        await createMaterial(payload);
      }
      await refresh();
      setModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Nie udało się zapisać materiału");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-montserrat font-bold">Materiały</h1>
        <button
          onClick={openAddModal}
          className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold text-[#0f1419] flex items-center gap-2"
        >
          <Plus size={16} /> Dodaj ofertę
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-[#1a2332] p-12 rounded-xl border border-[#2a3a4a] text-center text-[#b8c5d6] flex items-center justify-center gap-3">
          <Loader2 className="animate-spin" size={18} /> Wczytywanie materiałów...
        </div>
      ) : (
      <>
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
            <option value="Wszystkie">Wszystkie</option>
            {MATERIAL_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.label}>{cat.label}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
          >
            <option value="wszystkie">Wszystkie statusy</option>
            {MATERIAL_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="bg-[#1a2332] p-12 rounded-xl border border-[#2a3a4a] text-center text-[#b8c5d6]">
          Brak materiałów spełniających kryteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((material) => {
            const statusInfo = statusConfig[material.status];
            const StatusIcon = statusInfo.icon;

            return (
              <div key={material.id} className="bg-[#1a2332] rounded-xl border border-[#2a3a4a] hover:border-[#f0a500]/30 transition-colors overflow-hidden">
                <div className="aspect-video bg-[#0f1419] flex items-center justify-center overflow-hidden">
                  {material.zdjecia && material.zdjecia.length > 0 ? (
                    <img src={material.zdjecia[0]} alt={material.nazwa} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="text-[#2a3a4a] size-12" />
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className="font-mono text-[#f0a500] text-sm">{material.id_materialu}</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${statusInfo.color}`}>
                      <StatusIcon size={12} />
                      {statusInfo.label}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold mb-2">{material.nazwa}</h3>

                  <div className="space-y-2 text-sm text-[#b8c5d6] mb-4">
                    <div className="flex justify-between">
                      <span>Kategoria:</span>
                      <span className="text-white">{categoryLabel(material.kategoria)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wymiary:</span>
                      <span className="text-white">{material.wymiary}</span>
                    </div>
                    {material.dlugosc && (
                      <div className="flex justify-between">
                        <span>Długość:</span>
                        <span className="text-white">{material.dlugosc} m</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Ilość:</span>
                      <span className="text-white">{material.ilosc} szt.</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stan:</span>
                      <span className="text-white capitalize">{material.stan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lokalizacja:</span>
                      <span className="text-white">{material.lokalizacja}</span>
                    </div>
                  </div>

                  <div className="text-lg font-bold text-[#f0a500] mb-4">
                    {material.cena ? `${material.cena.toFixed(2)} zł` : "Zapytaj o cenę"}
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-[#2a3a4a]">
                    <button
                      onClick={() => openEditModal(material)}
                      className="flex-1 px-3 py-2 rounded-lg bg-[#2a3a4a] text-sm font-semibold hover:bg-[#f0a500] hover:text-[#0f1419] transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit size={14} /> Edytuj
                    </button>
                    {(material.status === "dostepny" || material.status === "zarezerwowany") && (
                      <button
                        onClick={() => handleToggleReserve(material)}
                        className="p-2 rounded-lg hover:bg-[#2a3a4a] transition-colors"
                        title={material.status === "zarezerwowany" ? "Zdejmij rezerwację" : "Zarezerwuj"}
                      >
                        {material.status === "zarezerwowany" ? (
                          <BookmarkCheck size={14} className="text-yellow-400" />
                        ) : (
                          <Bookmark size={14} className="text-[#b8c5d6]" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => setPromotingMaterial(material)}
                      className="p-2 rounded-lg hover:bg-[#2a3a4a] transition-colors"
                      title="Wystaw na innych portalach"
                    >
                      <Share2 size={14} className="text-[#b8c5d6]" />
                    </button>
                    <button onClick={() => handleDelete(material.id)} className="p-2 rounded-lg hover:bg-[#2a3a4a] transition-colors" title="Usuń">
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#2a3a4a] sticky top-0 bg-[#1a2332]">
              <h2 className="text-xl font-montserrat font-bold">
                {editingId ? "Edytuj ofertę" : "Dodaj ofertę materiału"}
              </h2>
              <button onClick={closeModal} className="text-[#b8c5d6] hover:text-white">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-1">Kategoria</label>
                  <select
                    value={form.kategoria}
                    onChange={(e) => setForm({ ...form, kategoria: e.target.value as Material["kategoria"] })}
                    className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                  >
                    {MATERIAL_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-1">Stan</label>
                  <select
                    value={form.stan}
                    onChange={(e) => setForm({ ...form, stan: e.target.value as Material["stan"] })}
                    className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                  >
                    {MATERIAL_CONDITIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#b8c5d6] mb-1">Nazwa materiału *</label>
                <input
                  required
                  value={form.nazwa}
                  onChange={(e) => setForm({ ...form, nazwa: e.target.value })}
                  placeholder="np. Profil stalowy 100x100"
                  className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm text-[#b8c5d6] mb-1">Wymiary *</label>
                  <input
                    required
                    value={form.wymiary}
                    onChange={(e) => setForm({ ...form, wymiary: e.target.value })}
                    placeholder="np. 100 × 100 mm"
                    className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-1">Długość (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={form.dlugosc ?? ""}
                    onChange={(e) => setForm({ ...form, dlugosc: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="opcjonalnie"
                    className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-1">Ilość (szt.) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.ilosc}
                    onChange={(e) => setForm({ ...form, ilosc: Number(e.target.value) })}
                    className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-1">Lokalizacja na placu *</label>
                  <input
                    required
                    value={form.lokalizacja}
                    onChange={(e) => setForm({ ...form, lokalizacja: e.target.value })}
                    placeholder="np. Plac A / sektor 3"
                    className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm text-[#b8c5d6]">Cena (zł)</label>
                    <label className="flex items-center gap-2 text-xs text-[#b8c5d6]">
                      <input
                        type="checkbox"
                        checked={askPrice}
                        onChange={(e) => setAskPrice(e.target.checked)}
                        className="accent-[#f0a500]"
                      />
                      Zapytaj o cenę
                    </label>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    disabled={askPrice}
                    value={form.cena ?? ""}
                    onChange={(e) => setForm({ ...form, cena: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white disabled:opacity-40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#b8c5d6] mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as MaterialStatus })}
                    className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                  >
                    {MATERIAL_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#b8c5d6] mb-1">Notatki wewnętrzne</label>
                <textarea
                  rows={3}
                  value={form.notatki}
                  onChange={(e) => setForm({ ...form, notatki: e.target.value })}
                  className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-[#b8c5d6] mb-2">Zdjęcia</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {(form.zdjecia ?? []).map((src, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#2a3a4a]">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute top-0.5 right-0.5 bg-black/70 rounded-full p-0.5"
                      >
                        <X size={12} className="text-white" />
                      </button>
                    </div>
                  ))}
                  <label className="w-20 h-20 rounded-lg border border-dashed border-[#2a3a4a] flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#f0a500] transition-colors" title="Wybierz z galerii">
                    {uploading ? (
                      <Loader2 size={20} className="animate-spin text-[#f0a500]" />
                    ) : (
                      <>
                        <ImagePlus size={18} className="text-[#b8c5d6]" />
                        <span className="text-[9px] text-[#b8c5d6]">Galeria</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFiles(e.target.files)}
                    />
                  </label>
                  <label className="w-20 h-20 rounded-lg border border-dashed border-[#2a3a4a] flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#f0a500] transition-colors" title="Zrób zdjęcie aparatem">
                    {uploading ? (
                      <Loader2 size={20} className="animate-spin text-[#f0a500]" />
                    ) : (
                      <>
                        <Camera size={18} className="text-[#b8c5d6]" />
                        <span className="text-[9px] text-[#b8c5d6]">Aparat</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handleFiles(e.target.files)}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex-1 px-6 py-3 rounded-lg font-semibold text-[#0f1419] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {editingId ? "Zapisz zmiany" : "Dodaj do magazynu"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-6 py-3 rounded-lg font-semibold border border-[#2a3a4a] text-[#b8c5d6] hover:text-white disabled:opacity-60"
                >
                  Anuluj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {promotingMaterial && (
        <PromoteMaterialModal material={promotingMaterial} onClose={() => setPromotingMaterial(null)} />
      )}
    </div>
  );
}
