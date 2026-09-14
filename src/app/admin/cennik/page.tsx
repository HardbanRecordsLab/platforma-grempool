"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, GripVertical, Eye, EyeOff } from "lucide-react";
import type { ScrapPrice } from "@/types";
import {
  createScrapPrice,
  deleteScrapPrice,
  getScrapPrices,
  updateScrapPrice,
  type ScrapPriceInput,
} from "@/lib/scrap-prices-store";

const emptyForm: ScrapPriceInput = {
  nazwa: "",
  cena_od: 0,
  jednostka: "zł/kg",
  kolejnosc: 0,
  aktywny: true,
};

export default function CennikPage() {
  const [prices, setPrices] = useState<ScrapPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ScrapPriceInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    try {
      const data = await getScrapPrices();
      setPrices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się wczytać cennika");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nazwa.trim() || form.cena_od <= 0) return;
    setSaving(true);
    try {
      await createScrapPrice({ ...form, kolejnosc: prices.length });
      setForm(emptyForm);
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Nie udało się dodać pozycji");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (price: ScrapPrice) => {
    await updateScrapPrice(price.id, { aktywny: !price.aktywny });
    refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Usunąć tę pozycję z cennika?")) return;
    await deleteScrapPrice(id);
    refresh();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-montserrat font-bold">Cennik złomu</h1>
        <p className="text-sm text-[#b8c5d6] mt-1">
          Widoczny publicznie na stronie głównej (widget) oraz na stronie „Skup złomu” (pasek cen).
          Wyłącz pozycję, żeby ukryć ją bez usuwania.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleAdd} className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a] mb-6 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs text-[#b8c5d6] mb-1">Nazwa (np. Stal, Miedź)</label>
          <input
            value={form.nazwa}
            onChange={(e) => setForm({ ...form, nazwa: e.target.value })}
            className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-3 py-2 text-sm text-white"
            placeholder="np. Stal czarna"
          />
        </div>
        <div className="w-28">
          <label className="block text-xs text-[#b8c5d6] mb-1">Cena od</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.cena_od || ""}
            onChange={(e) => setForm({ ...form, cena_od: Number(e.target.value) })}
            className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-3 py-2 text-sm text-white"
          />
        </div>
        <div className="w-28">
          <label className="block text-xs text-[#b8c5d6] mb-1">Jednostka</label>
          <input
            value={form.jednostka}
            onChange={(e) => setForm({ ...form, jednostka: e.target.value })}
            className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-3 py-2 text-sm text-white"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold text-[#0f1419] flex items-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Dodaj
        </button>
      </form>

      {loading ? (
        <div className="bg-[#1a2332] p-12 rounded-xl border border-[#2a3a4a] text-center text-[#b8c5d6] flex items-center justify-center gap-3">
          <Loader2 className="animate-spin" size={18} /> Wczytywanie cennika...
        </div>
      ) : prices.length === 0 ? (
        <div className="bg-[#1a2332] p-12 rounded-xl border border-[#2a3a4a] text-center text-[#b8c5d6]">
          Cennik jest pusty. Dodaj pierwszą pozycję powyżej.
        </div>
      ) : (
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4a] divide-y divide-[#2a3a4a]">
          {prices.map((price) => (
            <div key={price.id} className="flex items-center gap-4 p-4">
              <GripVertical size={16} className="text-[#2a3a4a] shrink-0" />
              <div className="flex-1 min-w-0">
                <div className={`font-semibold ${price.aktywny ? "text-white" : "text-[#b8c5d6] line-through"}`}>
                  {price.nazwa}
                </div>
              </div>
              <div className="text-[#f0a500] font-bold whitespace-nowrap">
                od {price.cena_od.toFixed(2)} {price.jednostka}
              </div>
              <button
                onClick={() => toggleActive(price)}
                className="p-2 rounded-lg hover:bg-[#2a3a4a] transition-colors"
                title={price.aktywny ? "Ukryj" : "Pokaż"}
              >
                {price.aktywny ? <Eye size={16} className="text-green-400" /> : <EyeOff size={16} className="text-[#b8c5d6]" />}
              </button>
              <button onClick={() => handleDelete(price.id)} className="p-2 rounded-lg hover:bg-[#2a3a4a] transition-colors" title="Usuń">
                <Trash2 size={16} className="text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
