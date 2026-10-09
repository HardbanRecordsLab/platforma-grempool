"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tags, Phone } from "lucide-react";
import type { ScrapPrice } from "@/types";
import { SCRAP_GROUPS, formatScrapPrice, getActiveScrapPrices } from "@/lib/scrap-prices-store";
import { telHref } from "@/lib/site-settings";
import { useSiteSettings } from "@/components/SiteSettingsProvider";

export default function ScrapPriceSidebar() {
  const site = useSiteSettings();
  const [prices, setPrices] = useState<ScrapPrice[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getActiveScrapPrices()
      .then(setPrices)
      .catch(() => setPrices([]))
      .finally(() => setLoaded(true));
  }, []);

  if (loaded && prices.length === 0) return null;

  // Date of the most recent change to any active price.
  const latest = prices.reduce<string | null>((max, p) => (!max || p.zaktualizowane > max ? p.zaktualizowane : max), null);
  const updatedAt = latest ? new Date(latest).toLocaleDateString("pl-PL") : null;

  const groups = SCRAP_GROUPS.map((group) => ({
    ...group,
    items: prices.filter((p) => p.grupa === group.value),
  })).filter((group) => group.items.length > 0);

  return (
    <aside className="bg-[#0a0a0a] border border-[#5c4716] rounded-2xl p-6 w-full lg:w-80 shrink-0">
      <div className="flex items-center gap-2 mb-5">
        <Tags className="text-[#f5b52c] size-5" />
        <h3 className="font-montserrat font-bold">CENNIK ZŁOMU</h3>
      </div>

      <div className="space-y-5 mb-5">
        {groups.map((group) => (
          <section key={group.value}>
            <h4 className="text-[#f5b52c] text-xs font-bold tracking-widest uppercase mb-2">{group.label}</h4>
            <ul className="space-y-2">
              {group.items.map((price) => (
                <li
                  key={price.id}
                  className="flex items-center justify-between text-sm border-b border-[#5c4716] pb-2 last:border-0 last:pb-0"
                >
                  <span className="text-[#e8dfcc]">{price.nazwa}</span>
                  <span className="text-white font-bold whitespace-nowrap ml-3">{formatScrapPrice(price)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-[#f5b52c]/90 bg-[#f5b52c]/10 border border-[#f5b52c]/30 rounded-md px-2.5 py-1.5">
              {group.note}
            </p>
          </section>
        ))}
      </div>

      {updatedAt && (
        <p className="text-xs text-white mb-1">
          Ceny aktualne na dzień <strong>{updatedAt}</strong>
        </p>
      )}
      <p className="text-xs text-[#e8dfcc]/70 mb-4">
        Ceny orientacyjne — ostateczna wycena po weryfikacji rodzaju i ilości materiału.
      </p>

      <div className="flex flex-col gap-2">
        <a href={telHref(site.phone)} className="flex items-center justify-center gap-2 btn-primary py-2.5 rounded-lg text-sm font-semibold text-[#000000]">
          <Phone size={16} /> {site.phone}
        </a>
        <Link href="/wycena" className="text-center py-2.5 rounded-lg text-sm font-semibold border border-[#5c4716] text-[#e8dfcc] hover:text-white transition-colors">
          Wyślij zapytanie
        </Link>
      </div>
    </aside>
  );
}
