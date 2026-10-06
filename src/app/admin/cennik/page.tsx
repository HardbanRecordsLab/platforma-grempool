"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, Eye, EyeOff, ChevronUp, ChevronDown } from "lucide-react";
import type { ScrapPrice } from "@/types";
import {
  SCRAP_GROUPS,
  createScrapPrice,
  deleteScrapPrice,
  getScrapPrices,
  updateScrapPrice,
  type ScrapPriceInput,
} from "@/lib/scrap-prices-store";

const emptyForm: ScrapPriceInput = {
  grupa: "stalowy",
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
  const [savingId, setSavingId] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const data = await getScrapPrices();
      setPrices(data);
      setError(null);
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
      const last = prices.reduce((max, p) => Math.max(max, p.kolejnosc), -1);
      await createScrapPrice({ ...form, nazwa: form.nazwa.trim(), kolejnosc: last + 1 });
      setForm({ ...emptyForm, grupa: form.grupa });
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Nie udało się dodać pozycji");
    } finally {
      setSaving(false);
    }
  };

  const save = async (price: ScrapPrice, data: Partial<ScrapPriceInput>) => {
    setSavingId(price.id);
    try {
      await updateScrapPrice(price.id, data);
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Nie udało się zapisać zmian");
    } finally {
      setSavingId(null);
    }
  };

  const saveName = (price: ScrapPrice, value: string) => {
    const nazwa = value.trim();
    if (nazwa && nazwa !== price.nazwa) save(price, { nazwa });
  };

  const savePrice = (price: ScrapPrice, value: string) => {
    const cena = Number(value.replace(",", "."));
    if (Number.isFinite(cena) && cena > 0 && cena !== price.cena_od) save(price, { cena_od: cena });
  };

  // Swaps the position with the neighbour in the same group.
  const move = async (items: ScrapPrice[], index: number, direction: -1 | 1) => {
    const a = items[index];
    const b = items[index + direction];
    if (!a || !b) return;
    setSavingId(a.id);
    try {
      await Promise.all([
        updateScrapPrice(a.id, { kolejnosc: b.kolejnosc }),
        updateScrapPrice(b.id, { kolejnosc: a.kolejnosc }),
      ]);
      await refresh();
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Usunąć tę pozycję z cennika?")) return;
    await deleteScrapPrice(id);
    refresh();
  };

  const blurOnEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.currentTarget.blur();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-montserrat font-bold">Cennik złomu</h1>
        <p className="text-sm text-[#e8dfcc] mt-1">
          Widoczny publicznie na stronie „Skup złomu” (tabela w nagłówku i przewijany pasek cen).
          Nazwę i cenę zmienisz, klikając w pole i wpisując nową wartość — zapis następuje po wyjściu z pola lub Enter.
          Wyłącz pozycję okiem, żeby ukryć ją bez usuwania.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleAdd} className="bg-[#0a0a0a] p-4 rounded-xl border border-[#5c4716] mb-6 flex flex-wrap items-end gap-3">
        <div className="w-40">
          <label className="block text-xs text-[#e8dfcc] mb-1">Grupa</label>
          <select
            value={form.grupa}
            onChange={(e) => setForm({ ...form, grupa: e.target.value as ScrapPriceInput["grupa"] })}
            className="w-full bg-[#000000] border border-[#5c4716] rounded-lg px-3 py-2 text-sm text-white"
          >
            {SCRAP_GROUPS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs text-[#e8dfcc] mb-1">Nazwa (np. Gruby, Miedź)</label>
          <input
            value={form.nazwa}
            onChange={(e) => setForm({ ...form, nazwa: e.target.value })}
            className="w-full bg-[#000000] border border-[#5c4716] rounded-lg px-3 py-2 text-sm text-white"
            placeholder="np. Miedź"
          />
        </div>
        <div className="w-28">
          <label className="block text-xs text-[#e8dfcc] mb-1">Cena</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.cena_od || ""}
            onChange={(e) => setForm({ ...form, cena_od: Number(e.target.value) })}
            className="w-full bg-[#000000] border border-[#5c4716] rounded-lg px-3 py-2 text-sm text-white"
          />
        </div>
        <div className="w-28">
          <label className="block text-xs text-[#e8dfcc] mb-1">Jednostka</label>
          <input
            value={form.jednostka}
            onChange={(e) => setForm({ ...form, jednostka: e.target.value })}
            className="w-full bg-[#000000] border border-[#5c4716] rounded-lg px-3 py-2 text-sm text-white"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold text-[#000000] flex items-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Dodaj
        </button>
      </form>

      {loading ? (
        <div className="bg-[#0a0a0a] p-12 rounded-xl border border-[#5c4716] text-center text-[#e8dfcc] flex items-center justify-center gap-3">
          <Loader2 className="animate-spin" size={18} /> Wczytywanie cennika...
        </div>
      ) : prices.length === 0 ? (
        <div className="bg-[#0a0a0a] p-12 rounded-xl border border-[#5c4716] text-center text-[#e8dfcc]">
          Cennik jest pusty. Dodaj pierwszą pozycję powyżej.
        </div>
      ) : (
        <div className="space-y-6">
          {SCRAP_GROUPS.map((group) => {
            const items = prices.filter((p) => p.grupa === group.value);
            return (
              <section key={group.value}>
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                  <h2 className="font-montserrat font-bold text-[#f5b52c]">{group.label}</h2>
                  <span className="text-xs text-[#e8dfcc]">Dopisek na stronie: „{group.note}”</span>
                </div>
                {items.length === 0 ? (
                  <div className="bg-[#0a0a0a] p-6 rounded-xl border border-[#5c4716] text-center text-sm text-[#e8dfcc]">
                    Brak pozycji w tej grupie.
                  </div>
                ) : (
                  <div className="bg-[#0a0a0a] rounded-xl border border-[#5c4716] divide-y divide-[#5c4716]">
                    {items.map((price, index) => (
                      <div key={`${price.id}-${price.zaktualizowane}`} className="flex flex-wrap items-center gap-2 sm:gap-3 p-3">
                        <div className="flex flex-col">
                          <button
                            onClick={() => move(items, index, -1)}
                            disabled={index === 0 || savingId !== null}
                            className="p-0.5 rounded hover:bg-[#5c4716] disabled:opacity-20"
                            title="W górę"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            onClick={() => move(items, index, 1)}
                            disabled={index === items.length - 1 || savingId !== null}
                            className="p-0.5 rounded hover:bg-[#5c4716] disabled:opacity-20"
                            title="W dół"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>
                        <input
                          defaultValue={price.nazwa}
                          onBlur={(e) => saveName(price, e.target.value)}
                          onKeyDown={blurOnEnter}
                          className={`flex-1 min-w-[140px] bg-transparent border border-transparent hover:border-[#5c4716] focus:border-[#f5b52c] rounded-lg px-2 py-1.5 font-semibold outline-none ${
                            price.aktywny ? "text-white" : "text-[#e8dfcc] line-through"
                          }`}
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={price.cena_od.toFixed(2)}
                            onBlur={(e) => savePrice(price, e.target.value)}
                            onKeyDown={blurOnEnter}
                            className="w-24 bg-[#000000] border border-[#5c4716] focus:border-[#f5b52c] rounded-lg px-2 py-1.5 text-right text-[#f5b52c] font-bold outline-none"
                          />
                          <span className="text-sm text-[#e8dfcc] w-12">{price.jednostka}</span>
                        </div>
                        <select
                          value={price.grupa}
                          onChange={(e) => save(price, { grupa: e.target.value as ScrapPriceInput["grupa"] })}
                          className="bg-[#000000] border border-[#5c4716] rounded-lg px-2 py-1.5 text-xs text-[#e8dfcc]"
                          title="Przenieś do grupy"
                        >
                          {SCRAP_GROUPS.map((g) => (
                            <option key={g.value} value={g.value}>
                              {g.label}
                            </option>
                          ))}
                        </select>
                        <div className="w-5 flex justify-center">
                          {savingId === price.id && <Loader2 size={14} className="animate-spin text-[#f5b52c]" />}
                        </div>
                        <button
                          onClick={() => save(price, { aktywny: !price.aktywny })}
                          className="p-2 rounded-lg hover:bg-[#5c4716] transition-colors"
                          title={price.aktywny ? "Ukryj" : "Pokaż"}
                        >
                          {price.aktywny ? <Eye size={16} className="text-green-400" /> : <EyeOff size={16} className="text-[#e8dfcc]" />}
                        </button>
                        <button onClick={() => handleDelete(price.id)} className="p-2 rounded-lg hover:bg-[#5c4716] transition-colors" title="Usuń">
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
