"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import type { Lead } from "@/types";
import { SERVICE_LABELS } from "@/lib/supabase";
import { getLeads } from "@/lib/leads-store";

export default function NotificationBell() {
  const [newLeads, setNewLeads] = useState<Lead[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const refresh = () => {
    getLeads()
      .then((leads) => {
        const fresh = leads
          .filter((l) => l.status === "nowy")
          .sort((a, b) => new Date(b.data_kontaktu).getTime() - new Date(a.data_kontaktu).getTime());
        setNewLeads(fresh);
      })
      .catch(() => setNewLeads([]));
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg hover:bg-[#5c4716] transition-colors text-[#e8dfcc]"
        title="Powiadomienia"
      >
        <Bell size={20} />
        {newLeads.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#f5b52c] text-[#000000] text-[10px] font-bold flex items-center justify-center">
            {newLeads.length > 9 ? "9+" : newLeads.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-80 bg-[#0a0a0a] border border-[#5c4716] rounded-xl shadow-xl z-[60] overflow-hidden">
          <div className="p-4 border-b border-[#5c4716] flex items-center justify-between">
            <h3 className="font-semibold text-sm">Nowe zapytania</h3>
            {newLeads.length > 0 && (
              <span className="text-xs text-[#f5b52c] font-semibold">{newLeads.length}</span>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {newLeads.length === 0 ? (
              <p className="p-4 text-sm text-[#e8dfcc]">Brak nowych zapytań.</p>
            ) : (
              newLeads.slice(0, 6).map((lead) => (
                <Link
                  key={lead.id}
                  href="/admin/crm"
                  onClick={() => setOpen(false)}
                  className="block p-3 border-b border-[#5c4716] last:border-0 hover:bg-[#000000] transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-[#f5b52c]">{lead.numer}</span>
                    <span className="text-[10px] text-[#e8dfcc]">
                      {new Date(lead.data_kontaktu).toLocaleDateString("pl-PL")}
                    </span>
                  </div>
                  <div className="text-sm font-semibold">{lead.klient_imie} {lead.klient_nazwisko}</div>
                  <div className="text-xs text-[#e8dfcc]">{SERVICE_LABELS[lead.usluga] ?? lead.usluga} — {lead.lokalizacja}</div>
                </Link>
              ))
            )}
          </div>
          <Link
            href="/admin/crm"
            onClick={() => setOpen(false)}
            className="block p-3 text-center text-sm font-semibold text-[#f5b52c] hover:bg-[#000000] transition-colors"
          >
            Zobacz wszystkie w CRM →
          </Link>
        </div>
      )}
    </div>
  );
}
