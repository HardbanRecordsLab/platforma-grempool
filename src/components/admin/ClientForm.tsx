"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import type { ClientForm as ClientFormData } from "@/lib/clients";

const inputClass =
  "w-full bg-[#000000] border border-[#5c4716] focus:border-[#f5b52c] rounded-lg px-3 py-2.5 text-sm text-white outline-none";

// Fields of a client card. onSubmit returns an error message, or null when saved.
export default function ClientForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: ClientFormData;
  submitLabel: string;
  onSubmit: (form: ClientFormData) => Promise<string | null>;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const set = (patch: Partial<ClientFormData>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setSaved(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const message = await onSubmit(form);
    setSaving(false);
    if (message) setError(message);
    else setSaved(true);
  };

  const firm = form.typ === "firma";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex gap-2">
        {(["osoba", "firma"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => set({ typ: t })}
            className={`px-4 py-1.5 rounded-full text-sm border ${form.typ === t ? "bg-[#f5b52c] border-[#f5b52c] text-black font-semibold" : "border-[#5c4716] text-[#e8dfcc]"}`}
          >
            {t === "osoba" ? "Osoba prywatna" : "Firma"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="block sm:col-span-2">
          <span className="block text-xs text-[#e8dfcc] mb-1">{firm ? "Nazwa firmy *" : "Imię i nazwisko *"}</span>
          <input value={form.nazwa} onChange={(e) => set({ nazwa: e.target.value })} className={inputClass} autoFocus />
        </label>
        <label className="block">
          <span className="block text-xs text-[#e8dfcc] mb-1">{firm ? "NIP" : "Nr dowodu osobistego lub innego dokumentu"}</span>
          <input value={form.dokument} onChange={(e) => set({ dokument: e.target.value })} className={inputClass} />
        </label>
        <label className="block">
          <span className="block text-xs text-[#e8dfcc] mb-1">Telefon</span>
          <input value={form.telefon} onChange={(e) => set({ telefon: e.target.value })} inputMode="tel" className={inputClass} />
        </label>
        <label className="block sm:col-span-2">
          <span className="block text-xs text-[#e8dfcc] mb-1">Adres</span>
          <input value={form.adres} onChange={(e) => set({ adres: e.target.value })} className={inputClass} />
        </label>
        <label className="block">
          <span className="block text-xs text-[#e8dfcc] mb-1">E-mail</span>
          <input type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} className={inputClass} />
        </label>
        {firm && (
          <label className="block">
            <span className="block text-xs text-[#e8dfcc] mb-1">Numer rejestrowy BDO (opcjonalnie)</span>
            <input value={form.bdo} onChange={(e) => set({ bdo: e.target.value })} className={inputClass} />
          </label>
        )}
        <label className="block sm:col-span-2">
          <span className="block text-xs text-[#e8dfcc] mb-1">Uwagi (widoczne tylko w panelu)</span>
          <textarea rows={3} value={form.uwagi} onChange={(e) => set({ uwagi: e.target.value })} className={inputClass} />
        </label>
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary px-6 py-2.5 rounded-lg font-semibold text-black flex items-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-lg border border-[#5c4716] text-[#e8dfcc] hover:text-white">
            Anuluj
          </button>
        )}
        {saved && <span className="text-sm text-green-400">Zapisano.</span>}
      </div>
    </form>
  );
}
