"use client";

import { useEffect, useState } from "react";
import type { ScrapPrice } from "@/types";
import { getActiveScrapPrices } from "@/lib/scrap-prices-store";

export default function ScrapPriceTicker() {
  const [prices, setPrices] = useState<ScrapPrice[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getActiveScrapPrices()
      .then(setPrices)
      .catch(() => setPrices([]))
      .finally(() => setLoaded(true));
  }, []);

  if (loaded && prices.length === 0) return null;
  if (!loaded) return <div className="h-11 bg-[#1a2332] border-y border-[#2a3a4a]" />;

  const items = prices.map((p) => `${p.nazwa} — od ${p.cena_od.toFixed(2)} ${p.jednostka}`);
  const track = [...items, ...items];

  return (
    <div className="relative bg-[#1a2332] border-y border-[#2a3a4a] overflow-hidden py-3">
      <div className="ticker-track flex items-center gap-10 w-max">
        {track.map((text, i) => (
          <span key={i} className="flex items-center gap-2 text-sm font-semibold whitespace-nowrap">
            <span className="text-[#f0a500]">●</span>
            <span className="text-white">{text}</span>
          </span>
        ))}
      </div>

      <style jsx>{`
        .ticker-track {
          animation: ticker-scroll 35s linear infinite;
        }
        @keyframes ticker-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
