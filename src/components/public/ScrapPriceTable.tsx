"use client";

import { useEffect, useState } from "react";
import { Tags, Loader2 } from "lucide-react";
import type { ScrapPrice } from "@/types";
import { getActiveScrapPrices } from "@/lib/scrap-prices-store";

export default function ScrapPriceTable() {
  const [prices, setPrices] = useState<ScrapPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveScrapPrices()
      .then(setPrices)
      .catch(() => setPrices([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && prices.length === 0) return null;

  return (
    <section className="py-16 bg-[#0f1419]">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 justify-center mb-3">
          <Tags className="text-[#f0a500] size-6" />
          <h2 className="text-3xl font-montserrat font-bold">
            CENNIK <span className="text-[#f0a500]">SKUPU ZŁOMU</span>
          </h2>
        </div>
        <p className="text-[#b8c5d6] text-center max-w-xl mx-auto mb-10">
          Ceny orientacyjne, aktualizowane na bieżąco. Ostateczna wycena zależy od rodzaju, ilości i stanu materiału.
        </p>

        {loading ? (
          <div className="flex items-center justify-center gap-3 text-[#b8c5d6] py-8">
            <Loader2 className="animate-spin" size={18} /> Wczytywanie cennika...
          </div>
        ) : (
          <div className="max-w-2xl mx-auto bg-[#1a2332] border border-[#2a3a4a] rounded-2xl overflow-hidden">
            {prices.map((price, i) => (
              <div
                key={price.id}
                className={`flex items-center justify-between px-6 py-4 ${i % 2 === 1 ? "bg-[#0f1419]/40" : ""} ${
                  i > 0 ? "border-t border-[#2a3a4a]" : ""
                }`}
              >
                <span className="font-semibold">{price.nazwa}</span>
                <span className="text-[#f0a500] font-bold whitespace-nowrap">
                  od {price.cena_od.toFixed(2)} {price.jednostka}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
