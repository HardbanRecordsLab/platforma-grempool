"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Phone,
  Mail,
  MapPin,
  Clock,
  X,
  Loader2,
  Trash2,
  ArrowRightCircle,
} from "lucide-react";
import type { Lead, LeadStatus } from "@/types";
import { SERVICE_LABELS } from "@/lib/supabase";
import { deleteLead, getLeads, updateLead } from "@/lib/leads-store";
import { createOrder } from "@/lib/orders-store";

const pipelineStages: { id: LeadStatus; label: string; color: string }[] = [
  { id: "nowy", label: "NOWE", color: "bg-blue-500" },
  { id: "do_uzupelnienia", label: "DO UZUPEŁNIENIA", color: "bg-slate-400" },
  { id: "do_wyceny", label: "DO WYCENY", color: "bg-yellow-500" },
  { id: "wycena_wyslana", label: "WYCENA WYSŁANA", color: "bg-purple-500" },
  { id: "negocjacja", label: "NEGOCJACJA", color: "bg-orange-500" },
  { id: "zaakceptowane", label: "ZAAKCEPTOWANE", color: "bg-green-500" },
  { id: "zaplanowane", label: "ZAPLANOWANE", color: "bg-teal-500" },
  { id: "w_realizacji", label: "W REALIZACJI", color: "bg-cyan-500" },
  { id: "zakonczone", label: "ZAKOŃCZONE", color: "bg-emerald-500" },
  { id: "utracone", label: "UTRACONE", color: "bg-red-500" },
];

const stageLabel = (status: LeadStatus) => pipelineStages.find((s) => s.id === status)?.label ?? status;
const stageColor = (status: LeadStatus) => pipelineStages.find((s) => s.id === status)?.color ?? "bg-gray-500";

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    try {
      setLeads(await getLeads());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się wczytać zapytań");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const filteredLeads = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return leads.filter(
      (lead) =>
        `${lead.klient_imie} ${lead.klient_nazwisko}`.toLowerCase().includes(q) ||
        lead.numer.toLowerCase().includes(q)
    );
  }, [leads, searchQuery]);

  const handleStatusChange = async (lead: Lead, status: LeadStatus) => {
    setSaving(true);
    try {
      const updated = await updateLead(lead.id, { status });
      setSelected(updated);
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Nie udało się zmienić statusu");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lead: Lead) => {
    if (!confirm(`Usunąć zapytanie ${lead.numer}?`)) return;
    await deleteLead(lead.id);
    setSelected(null);
    refresh();
  };

  const handleConvertToOrder = async (lead: Lead) => {
    setSaving(true);
    try {
      await createOrder({
        usluga: lead.usluga,
        lokalizacja: lead.lokalizacja,
        zakres: lead.opis,
        termin: lead.preferowany_termin ? `${lead.preferowany_termin}T08:00:00` : new Date().toISOString(),
        cena: lead.wartosc_wyceny ?? 0,
        status: "zaplanowane",
        notatki: lead.notatki,
        lead_id: lead.id,
      });
      const updated = await updateLead(lead.id, { status: "zaplanowane" });
      setSelected(updated);
      await refresh();
      alert(`Utworzono zlecenie na podstawie zapytania ${lead.numer}.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Nie udało się utworzyć zlecenia");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-montserrat font-bold">CRM / Leady</h1>
        {loading && <Loader2 size={18} className="animate-spin text-[#f0a500]" />}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Pipeline View */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex gap-4 min-w-max pb-4">
          {pipelineStages.map((stage) => {
            const stageLeads = leads.filter((l) => l.status === stage.id);
            return (
              <div key={stage.id} className="w-64 shrink-0">
                <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-lg ${stage.color}/20`}>
                  <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                  <span className="text-xs font-semibold">{stage.label}</span>
                  <span className="ml-auto text-xs bg-white/10 px-2 py-0.5 rounded">{stageLeads.length}</span>
                </div>
                <div className="space-y-3">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className={`bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a] cursor-pointer hover:border-[#f0a500]/50 transition-colors ${
                        selected?.id === lead.id ? "border-[#f0a500]" : ""
                      }`}
                      onClick={() => setSelected(lead)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-[#f0a500]">{lead.numer}</span>
                      </div>
                      <h4 className="font-semibold text-sm mb-1">
                        {lead.klient_imie} {lead.klient_nazwisko}
                      </h4>
                      <p className="text-xs text-[#b8c5d6] mb-2">{SERVICE_LABELS[lead.usluga] ?? lead.usluga}</p>
                      {lead.wartosc_wyceny ? (
                        <p className="text-sm font-semibold text-[#f0a500]">{lead.wartosc_wyceny.toLocaleString()} zł</p>
                      ) : null}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#2a3a4a] text-xs text-[#b8c5d6]">
                        <Clock size={12} /> {new Date(lead.data_kontaktu).toLocaleDateString("pl-PL")}
                      </div>
                    </div>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="text-xs text-[#b8c5d6]/60 text-center py-4">Brak</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Table View */}
      <div className="bg-[#1a2332] rounded-xl border border-[#2a3a4a]">
        <div className="p-4 border-b border-[#2a3a4a] flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b8c5d6] size-4" />
            <input
              type="text"
              placeholder="Szukaj zapytań..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg pl-10 pr-4 py-2 text-sm text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a3a4a]">
                <th className="text-left p-4 text-sm font-semibold text-[#b8c5d6]">Numer</th>
                <th className="text-left p-4 text-sm font-semibold text-[#b8c5d6]">Klient</th>
                <th className="text-left p-4 text-sm font-semibold text-[#b8c5d6]">Usługa</th>
                <th className="text-left p-4 text-sm font-semibold text-[#b8c5d6]">Status</th>
                <th className="text-left p-4 text-sm font-semibold text-[#b8c5d6]">Data</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-[#b8c5d6]">
                    Brak zapytań. Nowe pojawią się tu automatycznie po wysłaniu formularza wyceny.
                  </td>
                </tr>
              )}
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setSelected(lead)}
                  className="border-b border-[#2a3a4a] hover:bg-[#0f1419] transition-colors cursor-pointer"
                >
                  <td className="p-4 text-sm font-mono text-[#f0a500]">{lead.numer}</td>
                  <td className="p-4">
                    <div className="text-sm font-semibold">{lead.klient_imie} {lead.klient_nazwisko}</div>
                    <div className="text-xs text-[#b8c5d6]">{lead.klient_telefon}</div>
                  </td>
                  <td className="p-4 text-sm text-[#b8c5d6]">{SERVICE_LABELS[lead.usluga] ?? lead.usluga}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${stageColor(lead.status)}/20`}>
                      {stageLabel(lead.status)}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-[#b8c5d6]">{new Date(lead.data_kontaktu).toLocaleDateString("pl-PL")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#2a3a4a] sticky top-0 bg-[#1a2332]">
              <div>
                <span className="text-xs font-mono text-[#f0a500]">{selected.numer}</span>
                <h2 className="text-xl font-montserrat font-bold">
                  {selected.klient_imie} {selected.klient_nazwisko}
                </h2>
              </div>
              <button onClick={() => setSelected(null)} className="text-[#b8c5d6] hover:text-white">
                <X size={22} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex flex-wrap gap-4 text-sm">
                <a href={`tel:${selected.klient_telefon}`} className="flex items-center gap-2 text-[#b8c5d6] hover:text-[#f0a500]">
                  <Phone size={14} /> {selected.klient_telefon}
                </a>
                {selected.klient_email && (
                  <a href={`mailto:${selected.klient_email}`} className="flex items-center gap-2 text-[#b8c5d6] hover:text-[#f0a500]">
                    <Mail size={14} /> {selected.klient_email}
                  </a>
                )}
                <span className="flex items-center gap-2 text-[#b8c5d6]">
                  <MapPin size={14} /> {selected.lokalizacja}
                </span>
              </div>

              <div>
                <div className="text-xs text-[#b8c5d6] mb-1">Usługa</div>
                <div className="text-sm font-semibold">{SERVICE_LABELS[selected.usluga] ?? selected.usluga}</div>
              </div>

              <div>
                <div className="text-xs text-[#b8c5d6] mb-1">Opis zgłoszenia</div>
                <div className="text-sm whitespace-pre-wrap">{selected.opis || "—"}</div>
              </div>

              {selected.notatki && (
                <div>
                  <div className="text-xs text-[#b8c5d6] mb-1">Szczegóły z formularza</div>
                  <div className="text-sm whitespace-pre-wrap">{selected.notatki}</div>
                </div>
              )}

              {selected.preferowany_termin && (
                <div>
                  <div className="text-xs text-[#b8c5d6] mb-1">Preferowany termin</div>
                  <div className="text-sm">{new Date(selected.preferowany_termin).toLocaleDateString("pl-PL")}</div>
                </div>
              )}

              <div>
                <label className="block text-xs text-[#b8c5d6] mb-1">Status</label>
                <select
                  value={selected.status}
                  onChange={(e) => handleStatusChange(selected, e.target.value as LeadStatus)}
                  disabled={saving}
                  className="w-full bg-[#0f1419] border border-[#2a3a4a] rounded-lg px-4 py-2 text-sm text-white"
                >
                  {pipelineStages.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => handleConvertToOrder(selected)}
                  disabled={saving}
                  className="btn-primary flex-1 px-4 py-3 rounded-lg font-semibold text-[#0f1419] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <ArrowRightCircle size={16} />}
                  Przekształć w zlecenie
                </button>
                <button
                  onClick={() => handleDelete(selected)}
                  className="p-3 rounded-lg border border-[#2a3a4a] hover:bg-[#2a3a4a] transition-colors"
                  title="Usuń"
                >
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
