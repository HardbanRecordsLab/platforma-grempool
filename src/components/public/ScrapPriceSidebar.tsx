"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tags, Phone } from "lucide-react";
import type { ScrapPrice } from "@/types";
import { getActiveScrapPrices } from "@/lib/scrap-prices-store";

export default function ScrapPriceSidebar() {
  const [prices, setPrices] = useState<ScrapPrice[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getActiveScrapPrices()
      .then(setPrices)
      .catch(() => setPrices([]))
      .finally(() => setLoaded(true));
  }, []);

  if (loaded && prices.length === 0) return null;

  return (
    <aside className="bg-[#1a2332] border border-[#2a3a4a] rounded-2xl p-6 w-full lg:max-w-xs shrink-0">
      <div className="flex items-center gap-2 mb-4">
        <Tags className="text-[#f0a500] size-5" />
        <h3 className="font-montserrat font-bold">CENNIK ZŁOMU</h3>
      </div>

      <ul className="space-y-3 mb-4">
        {prices.map((price) => (
          <li key={price.id} className="flex items-center justify-between text-sm border-b border-[#2a3a4a] pb-3 last:border-0 last:pb-0">
            <span className="text-[#b8c5d6]">{price.nazwa}</span>
            <span className="text-[#f0a500] font-bold whitespace-nowrap ml-3">
              od {price.cena_od.toFixed(2)} {price.jednostka}
            </span>
          </li>
        ))}
      </ul>

      <p className="text-xs text-[#b8c5d6]/70 mb-4">
        Ceny orientacyjne — ostateczna wycena po weryfikacji rodzaju i ilości materiału.
      </p>

      <div className="flex flex-col gap-2">
        <a href="tel:+48123456789" className="flex items-center justify-center gap-2 btn-primary py-2.5 rounded-lg text-sm font-semibold text-[#0f1419]">
          <Phone size={16} /> +48 123 456 789
        </a>
        <Link href="/wycena" className="text-center py-2.5 rounded-lg text-sm font-semibold border border-[#2a3a4a] text-[#b8c5d6] hover:text-white transition-colors">
          Wyślij zapytanie
        </Link>
      </div>
    </aside>
  );
}
