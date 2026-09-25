"use client";

import { useEffect, useState } from "react";
import { Gavel, Loader2, ExternalLink, RefreshCw, Info } from "lucide-react";
import type { TenderMatch } from "@/lib/tenders";

export default function PrzetargiPage() {
  const [tenders, setTenders] = useState<TenderMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tenders", { cache: "no-store" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Nie udało się pobrać przetargów");
      setTenders(body);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się pobrać przetargów");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-montserrat font-bold">Przetargi publiczne</h1>
          <p className="text-sm text-[#b8c5d6] mt-1">
            Ogłoszenia z oficjalnego systemu e-Zamówienia (BZP) z woj. dolnośląskiego i lubuskiego, z ostatnich 14
            dni, dopasowane do słów: złom, rozbiórka, wyburzenie, demontaż, odpady, wywóz, gruz, recykling.
          </p>
        </div>
        <button
          onClick={refresh}
          className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold text-[#0f1419] flex items-center gap-2 shrink-0"
        >
          <RefreshCw size={16} /> Odśwież
        </button>
      </div>

      <div className="bg-[#1a2332] border border-[#2a3a4a] rounded-xl p-4 mb-6 flex gap-3 text-sm text-[#b8c5d6]">
        <Info size={18} className="text-[#f0a500] shrink-0 mt-0.5" />
        <div>
          <p className="mb-2">
            To lista tylko z przetargów publicznych (BZP) — mają oficjalne, otwarte API. Licytacje komornicze i
            drobniejsze przetargi gmin (poniżej progu BZP) nie mają takiego API, więc nie da się ich tu automatycznie
            zbierać bez łamania regulaminów tamtych stron. Zamiast tego:
          </p>
          <ul className="space-y-1">
            <li>
              <a
                href="https://licytacje.komornik.pl/wyszukiwarka-licytacji?mainCategory=MOVABLE&province=dolno%C5%9Bl%C4%85skie"
                target="_blank"
                rel="noreferrer"
                className="text-[#f0a500] hover:underline inline-flex items-center gap-1"
              >
                Licytacje komornicze — ruchomości, woj. dolnośląskie <ExternalLink size={12} />
              </a>
            </li>
            <li>
              <a
                href="https://atlasprzetargow.pl/"
                target="_blank"
                rel="noreferrer"
                className="text-[#f0a500] hover:underline inline-flex items-center gap-1"
              >
                Atlasprzetargow.pl — darmowe powiadomienia mailowe o przetargach <ExternalLink size={12} />
              </a>
            </li>
          </ul>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="bg-[#1a2332] p-12 rounded-xl border border-[#2a3a4a] text-center text-[#b8c5d6] flex items-center justify-center gap-3">
          <Loader2 className="animate-spin" size={18} /> Wczytywanie przetargów...
        </div>
      ) : tenders.length === 0 ? (
        <div className="bg-[#1a2332] p-12 rounded-xl border border-[#2a3a4a] text-center text-[#b8c5d6]">
          Brak pasujących przetargów w ostatnich 14 dniach.
        </div>
      ) : (
        <div className="space-y-3">
          {tenders.map((t) => (
            <a
              key={t.id}
              href={t.url}
              target="_blank"
              rel="noreferrer"
              className="block bg-[#1a2332] p-5 rounded-xl border border-[#2a3a4a] hover:border-[#f0a500]/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Gavel size={14} className="text-[#f0a500]" />
                    <span className="text-xs text-[#b8c5d6]">
                      {t.organizacja} &middot; {t.miasto}, {t.wojewodztwo}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-1">{t.tytul}</h3>
                  <div className="text-xs text-[#b8c5d6]">
                    Publikacja: {new Date(t.dataPublikacji).toLocaleDateString("pl-PL")}
                    {t.terminOfert && ` · Termin ofert: ${new Date(t.terminOfert).toLocaleDateString("pl-PL")}`}
                  </div>
                </div>
                <ExternalLink size={16} className="text-[#b8c5d6] shrink-0" />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
