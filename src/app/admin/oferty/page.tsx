"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Loader2, Trash2, FileText } from "lucide-react";
import { formatPln, type Offer } from "@/lib/offers";

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/offers", { cache: "no-store" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Nie udało się wczytać ofert");
      setOffers(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się wczytać ofert");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (offer: Offer) => {
    if (!confirm(`Usunąć ofertę ${offer.numer}?`)) return;
    await fetch(`/api/offers/${offer.id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-montserrat font-bold">Oferty</h1>
          <p className="text-sm text-[#e8dfcc] mt-1">
            Wyceny dla klientów z logo — do druku, PDF lub wysłania mailem. Ofertę z zapytania utworzysz w CRM.
          </p>
        </div>
        <Link href="/admin/oferty/nowa" className="btn-primary px-4 py-2.5 rounded-lg text-sm font-semibold text-black flex items-center gap-2">
          <Plus size={16} /> Nowa oferta
        </Link>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-sm">{error}</div>}

      {loading ? (
        <div className="bg-[#0a0a0a] p-12 rounded-xl border border-[#5c4716] text-center text-[#e8dfcc] flex items-center justify-center gap-3">
          <Loader2 className="animate-spin" size={18} /> Wczytywanie...
        </div>
      ) : offers.length === 0 ? (
        <div className="bg-[#0a0a0a] p-12 rounded-xl border border-[#5c4716] text-center text-[#e8dfcc]">
          Brak ofert. Kliknij „Nowa oferta” albo „Przygotuj ofertę” przy zapytaniu w CRM.
        </div>
      ) : (
        <div className="bg-[#0a0a0a] rounded-xl border border-[#5c4716] overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[#e8dfcc] border-b border-[#5c4716]">
              <tr>
                {["Numer", "Data", "Klient", "Temat", "Kwota", ""].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#5c4716]/50">
              {offers.map((o) => (
                <tr key={o.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-[#f5b52c] whitespace-nowrap">
                    <Link href={`/admin/oferty/${o.id}`} className="hover:underline">
                      {o.numer}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(o.created_at).toLocaleDateString("pl-PL")}</td>
                  <td className="px-4 py-3">{o.klient_nazwa}</td>
                  <td className="px-4 py-3 text-[#e8dfcc]">{o.temat ?? "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-semibold">{formatPln(o.suma_brutto)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link href={`/admin/oferty/${o.id}`} className="p-2 rounded-lg hover:bg-[#5c4716]" title="Otwórz">
                        <FileText size={15} className="text-[#e8dfcc]" />
                      </Link>
                      <button onClick={() => remove(o)} className="p-2 rounded-lg hover:bg-[#5c4716]" title="Usuń">
                        <Trash2 size={15} className="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
