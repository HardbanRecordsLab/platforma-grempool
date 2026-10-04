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
    <aside className="bg-[#141210] border border-[#352c1d] rounded-2xl p-6 w-full lg:max-w-xs shrink-0">
      <div className="flex items-center gap-2 mb-4">
        <Tags className="text-[#d4a24a] size-5" />
        <h3 className="font-montserrat font-bold">CENNIK ZŁOMU</h3>
      </div>

      <ul className="space-y-3 mb-4">
        {prices.map((price) => (
          <li key={price.id} className="flex items-center justify-between text-sm border-b border-[#352c1d] pb-3 last:border-0 last:pb-0">
            <span className="text-[#c3b9a7]">{price.nazwa}</span>
            <span className="text-[#d4a24a] font-bold whitespace-nowrap ml-3">
              od {price.cena_od.toFixed(2)} {price.jednostka}
            </span>
          </li>
        ))}
      </ul>

      <p className="text-xs text-[#c3b9a7]/70 mb-4">
        Ceny orientacyjne — ostateczna wycena po weryfikacji rodzaju i ilości materiału.
      </p>

      <div className="flex flex-col gap-2">
        <a href="tel:+48663288533" className="flex items-center justify-center gap-2 btn-primary py-2.5 rounded-lg text-sm font-semibold text-[#0b0b0a]">
          <Phone size={16} /> +48 663 288 533
        </a>
        <Link href="/wycena" className="text-center py-2.5 rounded-lg text-sm font-semibold border border-[#352c1d] text-[#c3b9a7] hover:text-white transition-colors">
          Wyślij zapytanie
        </Link>
      </div>
    </aside>
  );
}
