"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, Eye, EyeOff, ImagePlus, X, Edit } from "lucide-react";
import type { CustomService } from "@/types";
import {
  createCustomService,
  deleteCustomService,
  getCustomServices,
  updateCustomService,
  type CustomServiceInput,
} from "@/lib/custom-services-store";
import { uploadImageFile } from "@/lib/image-utils";

const emptyForm: CustomServiceInput = {
  nazwa: "",
  opis: "",
  zdjecie: "",
  href: "/wycena",
  kolejnosc: 0,
  aktywny: true,
};

export default function AdminUslugiPage() {
  const [services, setServices] = useState<CustomService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CustomServiceInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const refresh = async () => {
    try {
      setServices(await getCustomServices());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się wczytać usług");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm, kolejnosc: services.length });
    setModalOpen(true);
  };

  const openEditModal = (service: CustomService) => {
    setEditingId(service.id);
    setForm({
      nazwa: service.nazwa,
      opis: service.opis ?? "",
      zdjecie: service.zdjecie ?? "",
      href: service.href ?? "/wycena",
      kolejnosc: service.kolejnosc,
      aktywny: service.aktywny,
    });
    setModalOpen(true);
  };

  const handleFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageFile(file, "services");
      setForm((prev) => ({ ...prev, zdjecie: url }));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Nie udało się wgrać zdjęcia");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nazwa.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateCustomService(editingId, form);
      } else {
        await createCustomService(form);
      }
      setModalOpen(false);
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Nie udało się zapisać usługi");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (service: CustomService) => {
    await updateCustomService(service.id, { aktywny: !service.aktywny });
    refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Usunąć tę usługę?")) return;
    await deleteCustomService(id);
    refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-montserrat font-bold">Nasze usługi</h1>
          <p className="text-sm text-[#b8c5d6] mt-1">
            Dodatkowe usługi wyświetlane w sekcji „Nasze usługi” na stronie głównej, obok stałych 6 usług
            (skup złomu, transport, koparki, rozbiórki, materiały, klimatyzacja).
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold text-[#0f1419] flex items-center gap-2 shrink-0"
        >
          <Plus size={16} /> Dodaj usługę
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
      ) : services.length === 0 ? (
        <div className="bg-[#1a2332] p-12 rounded-xl border border-[#2a3a4a] text-center text-[#b8c5d6]">
          Brak dodatkowych usług. Dodaj pierwszą powyżej.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div key={service.id} className="bg-[#1a2332] rounded-xl border border-[#2a3a4a] overflow-hidden">
              <div className="aspect-video bg-[#0f1419] flex items-center justify-center overflow-hidden">
                {service.zdjecie ? (
                  <img src={service.zdjecie} alt={service.nazwa} className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus className="text-[#2a3a4a] size-10" />
                )}
              </div>
              <div className="p-5">
                <h3 className={`font-semibold mb-1 ${service.aktywny ? "text-white" : "text-[#b8c5d6] line-through"}`}>
                  {service.nazwa}
                </h3>
                {service.opis && <p className="text-xs text-[#b8c5d6] mb-4 line-clamp-2">{service.opis}</p>}
                <div className="flex items-center gap-2 pt-3 border-t border-[#2a3a4a]">
                  <button
                    onClick={() => openEditModal(service)}
                    className="flex-1 px-3 py-2 rounded-lg bg-[#2a3a4a] text-sm font-semibold hover:bg-[#f0a500] hover:text-[#0f1419] transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit size={14} /> Edytuj
                  </button>
                  <button onClick={() => toggleActive(service)} className="p-2 rounded-lg hover:bg-[#2a3a4a] transition-colors" title={service.aktywny ? "Ukryj" : "Pokaż"}>
                    {service.aktywny ? <Eye size={16} className="text-green-400" /> : <EyeOff size={16} className="text-[#b8c5d6]" />}
                  </button>
                  <button onClick={() => handleDelete(service.id)} className="p-2 rounded-lg hover:bg-[#2a3a4a] transition-colors" title="Usuń">
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#2a3a4a] sticky top-0 bg-[#1a2332]">
              <h2 className="text-xl font-montserrat font-bold">{editingId ? "Edytuj usługę" : "Nowa usługa"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-[#b8c5d6] hover:text-white">
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-[#b8c5d6] mb-1">Nazwa usługi *</label>
                <input
                  required
                  value={form.nazwa}
                  onChange={(e) => setForm({ ...form, nazwa: e.target.value })}
                  placeholder="np. Wynajem kontenerów"
                  className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-[#b8c5d6] mb-1">Krótki opis</label>
                <textarea
                  rows={2}
                  value={form.opis}
                  onChange={(e) => setForm({ ...form, opis: e.target.value })}
                  className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-[#b8c5d6] mb-1">Link (np. do wyceny)</label>
                <input
                  value={form.href}
                  onChange={(e) => setForm({ ...form, href: e.target.value })}
                  placeholder="/wycena"
                  className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-[#b8c5d6] mb-2">Zdjęcie</label>
                <div className="flex items-center gap-3">
                  {form.zdjecie && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#2a3a4a]">
                      <img src={form.zdjecie} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, zdjecie: "" })}
                        className="absolute top-0.5 right-0.5 bg-black/70 rounded-full p-0.5"
                      >
                        <X size={12} className="text-white" />
                      </button>
                    </div>
                  )}
                  <label className="w-20 h-20 rounded-lg border border-dashed border-[#2a3a4a] flex items-center justify-center cursor-pointer hover:border-[#f0a500] transition-colors">
                    {uploading ? <Loader2 size={20} className="animate-spin text-[#f0a500]" /> : <ImagePlus size={20} className="text-[#b8c5d6]" />}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files)} />
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
                  {editingId ? "Zapisz zmiany" : "Dodaj usługę"}
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
