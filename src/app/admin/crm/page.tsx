"use client";

import { useState } from "react";
import { 
  Search, 
  Filter, 
  Plus, 
  Phone, 
  Mail, 
  MoreVertical,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";

const pipelineStages = [
  { id: "nowe", label: "NOWE", color: "bg-blue-500" },
  { id: "do_wyceny", label: "DO WYCENY", color: "bg-yellow-500" },
  { id: "wycena_wyslana", label: "WYCENA WYSŁANA", color: "bg-purple-500" },
  { id: "negocjacja", label: "NEGOCJACJA", color: "bg-orange-500" },
  { id: "zaakceptowane", label: "ZAAKCEPTOWANE", color: "bg-green-500" },
  { id: "w_realizacji", label: "W REALIZACJI", color: "bg-cyan-500" },
  { id: "zakonczone", label: "ZAKOŃCZONE", color: "bg-emerald-500" },
  { id: "utracone", label: "UTRAZONE", color: "bg-red-500" },
];

const leads = [
  {
    id: "GRE-2026-00127",
    client: "Jan Kowalski",
    phone: "+48 123 456 789",
    email: "jan@example.com",
    service: "Skup złomu",
    status: "nowe",
    value: null,
    date: "2026-09-12",
    returning: false,
  },
  {
    id: "GRE-2026-00126",
    client: "Firma Budowlana XYZ",
    phone: "+48 987 654 321",
    email: "kontakt@xyz.pl",
    service: "Transport",
    status: "do_wyceny",
    value: 2500,
    date: "2026-09-12",
    returning: true,
  },
  {
    id: "GRE-2026-00125",
    client: "Anna Nowak",
    phone: "+48 555 123 456",
    email: "anna@example.com",
    service: "Koparka",
    status: "wycena_wyslana",
    value: 4500,
    date: "2026-09-11",
    returning: false,
  },
  {
    id: "GRE-2026-00124",
    client: "Marek Wiśniewski",
    phone: "+48 666 789 012",
    email: "marek@example.com",
    service: "Materiały",
    status: "zaakceptowane",
    value: 1800,
    date: "2026-09-11",
    returning: true,
  },
  {
    id: "GRE-2026-00123",
    client: "Spółka ABC",
    phone: "+48 777 890 123",
    email: "abc@firma.pl",
    service: "Rozbiórka",
    status: "w_realizacji",
    value: 15000,
    date: "2026-09-10",
    returning: false,
  },
];

export default function CRMPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<string | null>(null);

  const filteredLeads = leads.filter(lead => 
    lead.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-montserrat font-bold">CRM / Leady</h1>
        <button className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold text-[#0f1419] flex items-center gap-2">
          <Plus size={16} /> Nowe zapytanie
        </button>
      </div>

      {/* Pipeline View */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex gap-4 min-w-max pb-4">
          {pipelineStages.map((stage) => {
            const stageLeads = leads.filter(l => l.status === stage.id);
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
                      className={`bg-[#1a2332] p-4 rounded-xl border border-[#2a3a4a] cursor-pointer hover:border-[#f0a500]/50 transition-colors ${selectedLead === lead.id ? 'border-[#f0a500]' : ''}`}
                      onClick={() => setSelectedLead(lead.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-[#f0a500]">{lead.id}</span>
                        {lead.returning && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Powracający</span>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{lead.client}</h4>
                      <p className="text-xs text-[#b8c5d6] mb-2">{lead.service}</p>
                      {lead.value && (
                        <p className="text-sm font-semibold text-[#f0a500]">{lead.value.toLocaleString()} zł</p>
                      )}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#2a3a4a]">
                        <button className="p-1 hover:bg-[#2a3a4a] rounded transition-colors">
                          <Phone size={14} className="text-[#b8c5d6]" />
                        </button>
                        <button className="p-1 hover:bg-[#2a3a4a] rounded transition-colors">
                          <Mail size={14} className="text-[#b8c5d6]" />
                        </button>
                        <button className="ml-auto p-1 hover:bg-[#2a3a4a] rounded transition-colors">
                          <MoreVertical size={14} className="text-[#b8c5d6]" />
                        </button>
                      </div>
                    </div>
                  ))}
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
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2a3a4a] text-sm hover:bg-[#2a3a4a] transition-colors">
            <Filter size={16} /> Filtry
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a3a4a]">
                <th className="text-left p-4 text-sm font-semibold text-[#b8c5d6]">Numer</th>
                <th className="text-left p-4 text-sm font-semibold text-[#b8c5d6]">Klient</th>
                <th className="text-left p-4 text-sm font-semibold text-[#b8c5d6]">Usługa</th>
                <th className="text-left p-4 text-sm font-semibold text-[#b8c5d6]">Status</th>
                <th className="text-left p-4 text-sm font-semibold text-[#b8c5d6]">Wartość</th>
                <th className="text-left p-4 text-sm font-semibold text-[#b8c5d6]">Data</th>
                <th className="text-left p-4 text-sm font-semibold text-[#b8c5d6]">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="border-b border-[#2a3a4a] hover:bg-[#0f1419] transition-colors">
                  <td className="p-4 text-sm font-mono text-[#f0a500]">{lead.id}</td>
                  <td className="p-4">
                    <div className="text-sm font-semibold">{lead.client}</div>
                    <div className="text-xs text-[#b8c5d6]">{lead.phone}</div>
                  </td>
                  <td className="p-4 text-sm text-[#b8c5d6]">{lead.service}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      lead.status === 'nowe' ? 'bg-blue-500/20 text-blue-400' :
                      lead.status === 'do_wyceny' ? 'bg-yellow-500/20 text-yellow-400' :
                      lead.status === 'wycena_wyslana' ? 'bg-purple-500/20 text-purple-400' :
                      lead.status === 'zaakceptowane' ? 'bg-green-500/20 text-green-400' :
                      'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {pipelineStages.find(s => s.id === lead.status)?.label}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-semibold">
                    {lead.value ? `${lead.value.toLocaleString()} zł` : '-'}
                  </td>
                  <td className="p-4 text-sm text-[#b8c5d6]">{lead.date}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-[#2a3a4a] rounded-lg transition-colors" title="Zadzwoń">
                        <Phone size={14} className="text-[#b8c5d6]" />
                      </button>
                      <button className="p-2 hover:bg-[#2a3a4a] rounded-lg transition-colors" title="Wyślij email">
                        <Mail size={14} className="text-[#b8c5d6]" />
                      </button>
                      <button className="p-2 hover:bg-[#2a3a4a] rounded-lg transition-colors" title="Następny status">
                        <ArrowRight size={14} className="text-[#f0a500]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
