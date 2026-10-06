"use client";

import { useEffect, useState } from "react";
import type { ScrapPrice } from "@/types";
import { formatScrapPrice, getActiveScrapPrices } from "@/lib/scrap-prices-store";

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
  if (!loaded) return <div className="h-11 bg-[#0a0a0a] border-y border-[#5c4716]" />;

  // "Gruby" on its own means nothing in a scrolling strip, so steel grades get their group name.
  const label = (p: ScrapPrice) => (p.grupa === "stalowy" ? `Złom stalowy ${p.nazwa.toLowerCase()}` : p.nazwa);
  const items = prices.map((p) => `${label(p)} — ${formatScrapPrice(p)}`);
  const track = [...items, ...items];

  return (
    <div className="relative bg-[#0a0a0a] border-y border-[#5c4716] overflow-hidden py-3">
      <div className="ticker-track flex items-center gap-10 w-max">
        {track.map((text, i) => (
          <span key={i} className="flex items-center gap-2 text-sm font-semibold whitespace-nowrap">
            <span className="text-[#f5b52c]">●</span>
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
