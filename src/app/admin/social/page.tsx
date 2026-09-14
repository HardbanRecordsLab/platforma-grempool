"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, GripVertical, Eye, EyeOff, ExternalLink, Globe } from "lucide-react";
import type { SocialChannel } from "@/types";
import {
  SOCIAL_PLATFORMS,
  createSocialChannel,
  deleteSocialChannel,
  getSocialChannels,
  updateSocialChannel,
  type SocialChannelInput,
} from "@/lib/social-channels-store";

const platformLabel = (value: string) => SOCIAL_PLATFORMS.find((p) => p.value === value)?.label ?? value;

const emptyForm: SocialChannelInput = {
  platforma: "facebook",
  nazwa: "",
  url: "",
  opis: "",
  kolejnosc: 0,
  aktywny: true,
};

export default function SocialPage() {
  const [channels, setChannels] = useState<SocialChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<SocialChannelInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    try {
      setChannels(await getSocialChannels());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się wczytać kanałów");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nazwa.trim() || !form.url.trim()) return;
    setSaving(true);
    try {
      await createSocialChannel({ ...form, kolejnosc: channels.length });
      setForm(emptyForm);
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Nie udało się dodać kanału");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (channel: SocialChannel) => {
    await updateSocialChannel(channel.id, { aktywny: !channel.aktywny });
    refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Usunąć ten kanał?")) return;
    await deleteSocialChannel(id);
    refresh();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-montserrat font-bold">Social media i wizytówki</h1>
        <p className="text-sm text-[#b8c5d6] mt-1">
          Facebook, Instagram, Google Profil Firmy, OLX i inne portale ogłoszeniowe. Aktywne kanały pojawiają się
          w stopce strony publicznej. Wyłącz kanał, żeby ukryć go bez usuwania.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleAdd} className="bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a] mb-6 flex flex-wrap items-end gap-3">
        <div className="w-40">
          <label className="block text-xs text-[#b8c5d6] mb-1">Platforma</label>
          <select
            value={form.platforma}
            onChange={(e) => setForm({ ...form, platforma: e.target.value })}
            className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-3 py-2 text-sm text-white"
          >
            {SOCIAL_PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs text-[#b8c5d6] mb-1">Nazwa wyświetlana</label>
          <input
            value={form.nazwa}
            onChange={(e) => setForm({ ...form, nazwa: e.target.value })}
            className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-3 py-2 text-sm text-white"
            placeholder="np. GREMPOOL na Facebooku"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-[#b8c5d6] mb-1">Link</label>
          <input
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-3 py-2 text-sm text-white"
            placeholder="https://facebook.com/grempool"
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
          <Loader2 className="animate-spin" size={18} /> Wczytywanie...
        </div>
      ) : channels.length === 0 ? (
        <div className="bg-[#1a2332] p-12 rounded-xl border border-[#2a3a4a] text-center text-[#b8c5d6]">
          Brak dodanych kanałów. Dodaj pierwszy powyżej.
        </div>
      ) : (
        <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4a] divide-y divide-[#2a3a4a]">
          {channels.map((channel) => (
            <div key={channel.id} className="flex items-center gap-4 p-4">
              <GripVertical size={16} className="text-[#2a3a4a] shrink-0" />
              <div className="w-9 h-9 rounded-lg bg-[#f0a500]/10 flex items-center justify-center shrink-0">
                <Globe className="text-[#f0a500] size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-semibold ${channel.aktywny ? "text-white" : "text-[#b8c5d6] line-through"}`}>
                  {channel.nazwa}
                </div>
                <div className="text-xs text-[#b8c5d6]">{platformLabel(channel.platforma)}</div>
              </div>
              <a
                href={channel.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#f0a500] hover:underline flex items-center gap-1 max-w-[220px] truncate"
              >
                {channel.url} <ExternalLink size={12} className="shrink-0" />
              </a>
              <button
                onClick={() => toggleActive(channel)}
                className="p-2 rounded-lg hover:bg-[#2a3a4a] transition-colors"
                title={channel.aktywny ? "Ukryj" : "Pokaż"}
              >
                {channel.aktywny ? <Eye size={16} className="text-green-400" /> : <EyeOff size={16} className="text-[#b8c5d6]" />}
              </button>
              <button onClick={() => handleDelete(channel.id)} className="p-2 rounded-lg hover:bg-[#2a3a4a] transition-colors" title="Usuń">
                <Trash2 size={16} className="text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
