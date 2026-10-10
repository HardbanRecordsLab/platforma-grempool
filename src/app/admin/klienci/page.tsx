"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Loader2, Building2, User, X } from "lucide-react";
import ClientForm from "@/components/admin/ClientForm";
import { emptyClientForm, type ClientForm as ClientFormData, type ClientOverview } from "@/lib/clients";
import { formatKg, formatPln } from "@/lib/scrap-purchases";

type Filter = "all" | "osoba" | "firma";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Wszyscy" },
  { id: "osoba", label: "Osoby prywatne" },
  { id: "firma", label: "Firmy" },
];

export default function ClientsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [clients, setClients] = useState<ClientOverview[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // The list follows the search box, with a short delay while typing.
  useEffect(() => {
    let stale = false;
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (filter !== "all") params.set("typ", filter);
      fetch(`/api/clients?${params}`, { cache: "no-store" })
        .then(async (res) => {
          const body = await res.json();
          if (!res.ok) throw new Error(body.error ?? "Nie udało się wczytać klientów");
          if (!stale) {
            setClients(body);
            setError(null);
          }
        })
        .catch((err) => !stale && setError(err instanceof Error ? err.message : "Nie udało się wczytać klientów"));
    }, 250);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [query, filter, reloadKey]);

  const create = async (form: ClientFormData): Promise<string | null> => {
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return body.error ?? "Nie udało się zapisać klienta";
    setAdding(false);
    setReloadKey((k) => k + 1);
    return null;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-montserrat font-bold">Klienci</h1>
          <p className="text-sm text-[#e8dfcc] mt-1">
            Kartoteka stałych sprzedających, odbiorców dostaw i klientów. Każdy zapisany kwit sam dopisuje klienta albo
            odświeża jego dane.
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="btn-primary px-4 py-2.5 rounded-lg text-sm font-semibold text-black flex items-center gap-2"
        >
          <Plus size={16} /> Dodaj klienta
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#e8dfcc] size-4" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Szukaj: nazwisko, firma, telefon, dokument, NIP…"
            className="w-full bg-[#0a0a0a] border border-[#5c4716] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-[#f5b52c]"
          />
        </div>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-full text-sm border ${filter === f.id ? "bg-[#f5b52c] border-[#f5b52c] text-black font-semibold" : "border-[#5c4716] text-[#e8dfcc] hover:border-[#f5b52c]"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-4 text-sm">{error}</div>}

      {clients === null ? (
        <div className="bg-[#0a0a0a] p-12 rounded-xl border border-[#5c4716] text-center text-[#e8dfcc] flex items-center justify-center gap-3">
          <Loader2 className="animate-spin" size={18} /> Wczytywanie...
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-[#0a0a0a] p-12 rounded-xl border border-[#5c4716] text-center text-[#e8dfcc]">
          {query || filter !== "all"
            ? "Nikt nie pasuje do wyszukiwania."
            : "Kartoteka jest pusta. Klienci pojawią się tu sami po pierwszym kwicie skupu albo dodasz ich ręcznie."}
        </div>
      ) : (
        <div className="bg-[#0a0a0a] rounded-xl border border-[#5c4716] overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[#e8dfcc] border-b border-[#5c4716]">
              <tr>
                {["Klient", "Kontakt", "Skup", "Dostawy", "Ostatnio"].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#5c4716]/50">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/klienci/${c.id}`} className="flex items-start gap-2.5 group">
                      {c.typ === "firma" ? (
                        <Building2 size={16} className="text-[#f5b52c] mt-0.5 shrink-0" />
                      ) : (
                        <User size={16} className="text-[#f5b52c] mt-0.5 shrink-0" />
                      )}
                      <span>
                        <span className="font-semibold text-white group-hover:text-[#f5b52c] transition-colors">{c.nazwa}</span>
                        {c.adres && <span className="block text-xs text-[#e8dfcc]/60">{c.adres}</span>}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-[#e8dfcc]">
                    {c.telefon || "—"}
                    {c.email && <span className="block text-xs text-[#e8dfcc]/60">{c.email}</span>}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {c.receipts > 0 ? (
                      <>
                        {c.receipts} kw. · {formatKg(c.kg)}
                        <span className="block text-xs text-[#e8dfcc]/60">{formatPln(c.value)}</span>
                      </>
                    ) : (
                      <span className="text-[#e8dfcc]/40">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{c.deliveries > 0 ? c.deliveries : <span className="text-[#e8dfcc]/40">—</span>}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-[#e8dfcc]">
                    {c.last_activity ? new Date(c.last_activity).toLocaleDateString("pl-PL") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-[#e8dfcc]/60 mt-3">Klientów: {clients?.length ?? "…"}</p>

      {adding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#0a0a0a] border border-[#5c4716] rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[#5c4716]">
              <h2 className="text-xl font-montserrat font-bold">Nowy klient</h2>
              <button onClick={() => setAdding(false)} className="text-[#e8dfcc] hover:text-white" aria-label="Zamknij">
                <X size={22} />
              </button>
            </div>
            <div className="p-5">
              <ClientForm initial={emptyClientForm} submitLabel="Dodaj klienta" onSubmit={create} onCancel={() => setAdding(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
