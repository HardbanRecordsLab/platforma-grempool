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
  Copy,
  Star,
  Eye,
  MessageSquare,
  ExternalLink,
  RotateCcw,
  Upload,
} from "lucide-react";
import type { Material, MaterialStatus } from "@/types";
import PromoteMaterialModal from "@/components/admin/PromoteMaterialModal";
import ImportMaterialsModal from "@/components/admin/ImportMaterialsModal";
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
  opis: "",
  wyrozniony: false,
};

export default function MaterialyPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("Wszystkie");
  // "aktywne" hides sold listings; they live in the archive filter.
  const [filterStatus, setFilterStatus] = useState("aktywne");
  const [importOpen, setImportOpen] = useState(false);
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
      const matchesStatus =
        filterStatus === "wszystkie" ||
        (filterStatus === "aktywne" ? material.status !== "sprzedany" : material.status === filterStatus);
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
      opis: material.opis ?? "",
      wyrozniony: material.wyrozniony,
    });
    setAskPrice(material.cena === undefined || material.cena === null);
    setModalOpen(true);
  };

  // Same fields as the original, saved as a new listing with its own number.
  const openDuplicateModal = (material: Material) => {
    openEditModal(material);
    setEditingId(null);
    setForm((prev) => ({ ...prev, nazwa: `${material.nazwa} (kopia)`, status: "dostepny", wyrozniony: false }));
  };

  const quickUpdate = async (material: Material, data: Partial<MaterialInput>, failMessage: string) => {
    try {
      await updateMaterial(material.id, data);
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : failMessage);
    }
  };

  const handleSold = (material: Material) => {
    if (!confirm(`Oznaczyć „${material.nazwa}” jako sprzedane? Zniknie ze strony i trafi do archiwum.`)) return;
    quickUpdate(material, { status: "sprzedany", wyrozniony: false }, "Nie udało się oznaczyć jako sprzedane");
  };

  const makeMainPhoto = (index: number) => {
    setForm((prev) => {
      const photos = [...(prev.zdjecia ?? [])];
      const [photo] = photos.splice(index, 1);
      return { ...prev, zdjecia: [photo, ...photos] };
    });
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
        <h1 className="text-2xl font-montserrat font-bold">Ogłoszenia</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setImportOpen(true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold border border-[#5c4716] text-[#e8dfcc] hover:text-white hover:border-[#f5b52c] flex items-center gap-2"
          >
            <Upload size={16} /> Import z Excela
          </button>
          <button
            onClick={openAddModal}
            className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold text-[#000000] flex items-center gap-2"
          >
            <Plus size={16} /> Dodaj ofertę
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-[#0a0a0a] p-12 rounded-xl border border-[#5c4716] text-center text-[#e8dfcc] flex items-center justify-center gap-3">
          <Loader2 className="animate-spin" size={18} /> Wczytywanie materiałów...
        </div>
      ) : (
      <>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0a0a0a] p-4 rounded-xl border border-[#5c4716]">
          <div className="text-2xl font-bold text-green-400">{stats.dostepne}</div>
          <div className="text-sm text-[#e8dfcc]">Dostępne</div>
        </div>
        <div className="bg-[#0a0a0a] p-4 rounded-xl border border-[#5c4716]">
          <div className="text-2xl font-bold text-yellow-400">{stats.zarezerwowane}</div>
          <div className="text-sm text-[#e8dfcc]">Zarezerwowane</div>
        </div>
        <div className="bg-[#0a0a0a] p-4 rounded-xl border border-[#5c4716]">
          <div className="text-2xl font-bold text-gray-400">{stats.sprzedane}</div>
          <div className="text-sm text-[#e8dfcc]">Sprzedane</div>
        </div>
        <div className="bg-[#0a0a0a] p-4 rounded-xl border border-[#5c4716]">
          <div className="text-2xl font-bold text-[#f5b52c]">{stats.razem}</div>
          <div className="text-sm text-[#e8dfcc]">Razem</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#0a0a0a] p-4 rounded-xl border border-[#5c4716] mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#e8dfcc] size-4" />
            <input
              type="text"
              placeholder="Szukaj materiałów..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#000000] border border-[#5c4716] rounded-lg pl-10 pr-4 py-2 text-sm text-white"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#000000] border border-[#5c4716] rounded-lg px-4 py-2 text-sm text-white"
          >
            <option value="Wszystkie">Wszystkie</option>
            {MATERIAL_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.label}>{cat.label}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#000000] border border-[#5c4716] rounded-lg px-4 py-2 text-sm text-white"
          >
            <option value="aktywne">Aktywne (bez sprzedanych)</option>
            <option value="sprzedany">Archiwum — sprzedane</option>
            <option value="wszystkie">Wszystkie</option>
            {MATERIAL_STATUSES.filter((s) => s.value !== "sprzedany").map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      {filteredMaterials.length === 0 ? (
        <div className="bg-[#0a0a0a] p-12 rounded-xl border border-[#5c4716] text-center text-[#e8dfcc]">
          Brak materiałów spełniających kryteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((material) => {
            const statusInfo = statusConfig[material.status];
            const StatusIcon = statusInfo.icon;

            return (
              <div key={material.id} className="bg-[#0a0a0a] rounded-xl border border-[#5c4716] hover:border-[#f5b52c]/30 transition-colors overflow-hidden">
                <div className="relative aspect-video bg-[#000000] flex items-center justify-center overflow-hidden">
                  {material.zdjecia && material.zdjecia.length > 0 ? (
                    <img src={material.zdjecia[0]} alt={material.nazwa} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="text-[#5c4716] size-12" />
                  )}
                  {material.wyrozniony && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#f5b52c] text-black text-[11px] font-bold flex items-center gap-1">
                      <Star size={11} fill="currentColor" /> Wyróżnione
                    </span>
                  )}
                  {(material.zdjecia?.length ?? 0) > 1 && (
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-[11px]">
                      {material.zdjecia!.length} zdjęć
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className="font-mono text-[#f5b52c] text-sm">{material.id_materialu}</span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${statusInfo.color}`}>
                      <StatusIcon size={12} />
                      {statusInfo.label}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold mb-2">{material.nazwa}</h3>

                  <div className="space-y-2 text-sm text-[#e8dfcc] mb-4">
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

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-lg font-bold text-[#f5b52c]">
                      {material.cena ? `${material.cena.toFixed(2)} zł` : "Zapytaj o cenę"}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#e8dfcc]">
                      <span className="flex items-center gap-1" title="Wyświetlenia na stronie">
                        <Eye size={13} /> {material.wyswietlenia}
                      </span>
                      <span className="flex items-center gap-1" title="Zapytania z formularza">
                        <MessageSquare size={13} /> {material.zapytania}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 pt-4 border-t border-[#5c4716]">
                    <button
                      onClick={() => openEditModal(material)}
                      className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-[#5c4716] text-sm font-semibold hover:bg-[#f5b52c] hover:text-[#000000] transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit size={14} /> Edytuj
                    </button>
                    {(material.status === "dostepny" || material.status === "zarezerwowany") && (
                      <button
                        onClick={() => handleToggleReserve(material)}
                        className="p-2 rounded-lg hover:bg-[#5c4716] transition-colors"
                        title={material.status === "zarezerwowany" ? "Zdejmij rezerwację" : "Zarezerwuj"}
                      >
                        {material.status === "zarezerwowany" ? (
                          <BookmarkCheck size={14} className="text-yellow-400" />
                        ) : (
                          <Bookmark size={14} className="text-[#e8dfcc]" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => quickUpdate(material, { wyrozniony: !material.wyrozniony }, "Nie udało się zmienić wyróżnienia")}
                      className="p-2 rounded-lg hover:bg-[#5c4716] transition-colors"
                      title={material.wyrozniony ? "Usuń wyróżnienie" : "Wyróżnij na stronie głównej"}
                    >
                      <Star
                        size={14}
                        className={material.wyrozniony ? "text-[#f5b52c]" : "text-[#e8dfcc]"}
                        fill={material.wyrozniony ? "currentColor" : "none"}
                      />
                    </button>
                    <button
                      onClick={() => openDuplicateModal(material)}
                      className="p-2 rounded-lg hover:bg-[#5c4716] transition-colors"
                      title="Duplikuj"
                    >
                      <Copy size={14} className="text-[#e8dfcc]" />
                    </button>
                    {material.status === "sprzedany" ? (
                      <button
                        onClick={() => quickUpdate(material, { status: "dostepny" }, "Nie udało się przywrócić")}
                        className="p-2 rounded-lg hover:bg-[#5c4716] transition-colors"
                        title="Przywróć do sprzedaży"
                      >
                        <RotateCcw size={14} className="text-green-400" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSold(material)}
                        className="p-2 rounded-lg hover:bg-[#5c4716] transition-colors"
                        title="Oznacz jako sprzedane"
                      >
                        <CheckCircle2 size={14} className="text-green-400" />
                      </button>
                    )}
                    <a
                      href={`/ogloszenia/${material.id_materialu}`}
                      target="_blank"
                      rel="noopener"
                      className="p-2 rounded-lg hover:bg-[#5c4716] transition-colors"
                      title="Zobacz na stronie"
                    >
                      <ExternalLink size={14} className="text-[#e8dfcc]" />
                    </a>
                    <button
                      onClick={() => setPromotingMaterial(material)}
                      className="p-2 rounded-lg hover:bg-[#5c4716] transition-colors"
                      title="Wystaw na innych portalach"
                    >
                      <Share2 size={14} className="text-[#e8dfcc]" />
                    </button>
                    <button onClick={() => handleDelete(material.id)} className="p-2 rounded-lg hover:bg-[#5c4716] transition-colors" title="Usuń">
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
          <div className="bg-[#0a0a0a] border border-[#5c4716] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#5c4716] sticky top-0 bg-[#0a0a0a]">
              <h2 className="text-xl font-montserrat font-bold">
                {editingId ? "Edytuj ogłoszenie" : "Dodaj ogłoszenie"}
              </h2>
              <button onClick={closeModal} className="text-[#e8dfcc] hover:text-white">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#e8dfcc] mb-1">Kategoria</label>
                  <select
                    value={form.kategoria}
                    onChange={(e) => setForm({ ...form, kategoria: e.target.value as Material["kategoria"] })}
                    className="w-full bg-[#000000] border border-[#5c4716] rounded-lg px-4 py-2 text-sm text-white"
                  >
                    {MATERIAL_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#e8dfcc] mb-1">Stan</label>
                  <select
                    value={form.stan}
                    onChange={(e) => setForm({ ...form, stan: e.target.value as Material["stan"] })}
                    className="w-full bg-[#000000] border border-[#5c4716] rounded-lg px-4 py-2 text-sm text-white"
                  >
                    {MATERIAL_CONDITIONS.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#e8dfcc] mb-1">Nazwa materiału *</label>
                <input
                  required
                  value={form.nazwa}
                  onChange={(e) => setForm({ ...form, nazwa: e.target.value })}
                  placeholder="np. Profil stalowy 100x100"
                  className="w-full bg-[#000000] border border-[#5c4716] rounded-lg px-4 py-2 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm text-[#e8dfcc] mb-1">Wymiary *</label>
                  <input
                    required
                    value={form.wymiary}
                    onChange={(e) => setForm({ ...form, wymiary: e.target.value })}
                    placeholder="np. 100 × 100 mm"
                    className="w-full bg-[#000000] border border-[#5c4716] rounded-lg px-4 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#e8dfcc] mb-1">Długość (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={form.dlugosc ?? ""}
                    onChange={(e) => setForm({ ...form, dlugosc: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="opcjonalnie"
                    className="w-full bg-[#000000] border border-[#5c4716] rounded-lg px-4 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#e8dfcc] mb-1">Ilość (szt.) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.ilosc}
                    onChange={(e) => setForm({ ...form, ilosc: Number(e.target.value) })}
                    className="w-full bg-[#000000] border border-[#5c4716] rounded-lg px-4 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#e8dfcc] mb-1">Lokalizacja na placu *</label>
                  <input
                    required
                    value={form.lokalizacja}
                    onChange={(e) => setForm({ ...form, lokalizacja: e.target.value })}
                    placeholder="np. Plac A / sektor 3"
                    className="w-full bg-[#000000] border border-[#5c4716] rounded-lg px-4 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm text-[#e8dfcc]">Cena (zł)</label>
                    <label className="flex items-center gap-2 text-xs text-[#e8dfcc]">
                      <input
                        type="checkbox"
                        checked={askPrice}
                        onChange={(e) => setAskPrice(e.target.checked)}
                        className="accent-[#f5b52c]"
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
                    className="w-full bg-[#000000] border border-[#5c4716] rounded-lg px-4 py-2 text-sm text-white disabled:opacity-40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#e8dfcc] mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as MaterialStatus })}
                    className="w-full bg-[#000000] border border-[#5c4716] rounded-lg px-4 py-2 text-sm text-white"
                  >
                    {MATERIAL_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#e8dfcc] mb-1">Opis widoczny na stronie</label>
                <textarea
                  rows={4}
                  value={form.opis ?? ""}
                  onChange={(e) => setForm({ ...form, opis: e.target.value })}
                  placeholder="np. Profile z rozbiórki hali, proste, bez korozji. Możliwe cięcie na wymiar."
                  className="w-full bg-[#000000] border border-[#5c4716] rounded-lg px-4 py-2 text-sm text-white"
                />
              </div>

              <label className="flex items-center gap-3 text-sm text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.wyrozniony}
                  onChange={(e) => setForm({ ...form, wyrozniony: e.target.checked })}
                  className="accent-[#f5b52c] w-4 h-4"
                />
                <Star size={15} className="text-[#f5b52c]" /> Wyróżnij na stronie głównej (duża karta)
              </label>

              <div>
                <label className="block text-sm text-[#e8dfcc] mb-1">Notatki wewnętrzne (niewidoczne dla klientów)</label>
                <textarea
                  rows={3}
                  value={form.notatki}
                  onChange={(e) => setForm({ ...form, notatki: e.target.value })}
                  className="w-full bg-[#000000] border border-[#5c4716] rounded-lg px-4 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-[#e8dfcc] mb-2">Zdjęcia</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {(form.zdjecia ?? []).map((src, i) => (
                    <div
                      key={i}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden border ${i === 0 ? "border-2 border-[#f5b52c]" : "border-[#5c4716]"}`}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      {i === 0 ? (
                        <span className="absolute bottom-0 inset-x-0 bg-[#f5b52c] text-black text-[9px] font-bold text-center">
                          GŁÓWNE
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => makeMainPhoto(i)}
                          className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9px] text-center hover:bg-[#f5b52c] hover:text-black"
                        >
                          ustaw główne
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute top-0.5 right-0.5 bg-black/70 rounded-full p-0.5"
                      >
                        <X size={12} className="text-white" />
                      </button>
                    </div>
                  ))}
                  <label className="w-20 h-20 rounded-lg border border-dashed border-[#5c4716] flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#f5b52c] transition-colors" title="Wybierz z galerii">
                    {uploading ? (
                      <Loader2 size={20} className="animate-spin text-[#f5b52c]" />
                    ) : (
                      <>
                        <ImagePlus size={18} className="text-[#e8dfcc]" />
                        <span className="text-[9px] text-[#e8dfcc]">Galeria</span>
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
                  <label className="w-20 h-20 rounded-lg border border-dashed border-[#5c4716] flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#f5b52c] transition-colors" title="Zrób zdjęcie aparatem">
                    {uploading ? (
                      <Loader2 size={20} className="animate-spin text-[#f5b52c]" />
                    ) : (
                      <>
                        <Camera size={18} className="text-[#e8dfcc]" />
                        <span className="text-[9px] text-[#e8dfcc]">Aparat</span>
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
                  className="btn-primary flex-1 px-6 py-3 rounded-lg font-semibold text-[#000000] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {editingId ? "Zapisz zmiany" : "Dodaj do magazynu"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-6 py-3 rounded-lg font-semibold border border-[#5c4716] text-[#e8dfcc] hover:text-white disabled:opacity-60"
                >
                  Anuluj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {importOpen && (
        <ImportMaterialsModal
          onClose={() => setImportOpen(false)}
          onImported={async () => {
            setImportOpen(false);
            await refresh();
          }}
        />
      )}

      {promotingMaterial && (
        <PromoteMaterialModal material={promotingMaterial} onClose={() => setPromotingMaterial(null)} />
      )}
    </div>
  );
}
