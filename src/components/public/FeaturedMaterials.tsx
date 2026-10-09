"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Search, LayoutGrid, Truck } from "lucide-react";
import type { Material } from "@/types";
import { getAvailableMaterials } from "@/lib/materials-store";
import { LISTING_CATEGORIES } from "@/lib/listing-categories";
import DemoListingsNotice from "./DemoListingsNotice";
import { FeaturedCard, ListingCard, SellBanner } from "./ListingCards";
import { useSiteSettings } from "@/components/SiteSettingsProvider";

// One featured listing plus six regular cards fills the 4-column layout:
// the featured card takes 2x2, four cards sit beside it, two more below
// next to the "sell to us" banner.
const LIMIT = 7;

type Sort = "newest" | "price_asc" | "price_desc";

export default function FeaturedMaterials() {
  const site = useSiteSettings();
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [query, setQuery] = useState("");

  useEffect(() => {
    getAvailableMaterials()
      .then(setMaterials)
      .catch(() => setMaterials([]))
      .finally(() => setLoading(false));
  }, []);

  const tabs = useMemo(
    () =>
      LISTING_CATEGORIES.map((c) => ({ ...c, count: materials.filter((m) => m.kategoria === c.value).length })).filter(
        (c) => c.count > 0
      ),
    [materials]
  );

  const { featured, rest } = useMemo(() => {
    const list = category === "all" ? [...materials] : materials.filter((m) => m.kategoria === category);
    if (sort === "price_asc") list.sort((a, b) => (a.cena ?? Infinity) - (b.cena ?? Infinity));
    else if (sort === "price_desc") list.sort((a, b) => (b.cena ?? -1) - (a.cena ?? -1));
    else list.sort((a, b) => (b.utworzone ?? "").localeCompare(a.utworzone ?? ""));
    const shown = list.slice(0, LIMIT);
    // The featured slot needs a photo to look right.
    const index = shown.findIndex((m) => m.zdjecia && m.zdjecia.length > 0);
    if (index === -1 || shown.length < 3) return { featured: null, rest: shown };
    return { featured: shown[index], rest: shown.filter((_, i) => i !== index) };
  }, [materials, category, sort]);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category !== "all") params.set("kat", category);
    router.push(`/ogloszenia${params.toString() ? `?${params}` : ""}`);
  };

  const chipClass = (active: boolean) =>
    `flex items-center gap-2 whitespace-nowrap pl-3.5 pr-2 py-1.5 rounded-full text-sm font-medium border transition-colors ${
      active
        ? "bg-[#f5b52c] text-black border-[#f5b52c]"
        : "border-white/10 bg-white/[0.03] text-[#e8dfcc] hover:border-[#f5b52c]/60 hover:text-white"
    }`;

  const countClass = (active: boolean) =>
    `min-w-6 px-1.5 py-0.5 rounded-full text-[11px] font-bold text-center ${
      active ? "bg-black/15 text-black" : "bg-white/10 text-[#e8dfcc]"
    }`;

  return (
    <section className="relative py-24 bg-[#050505] overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f5b52c]/60 to-transparent" />
      <div className="pointer-events-none absolute -top-48 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-[#f5b52c]/[0.06] blur-3xl" />

      <div className="relative container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-10 bg-[#f5b52c]" />
              <span className="text-[#f5b52c] text-xs font-bold tracking-[0.3em] uppercase">Giełda GREMPOOL</span>
            </div>
            <h2 className="font-montserrat font-bold text-4xl md:text-6xl leading-[0.95] tracking-tight">
              Tablica <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffd36b] to-[#f5b52c]">ogłoszeń</span>
            </h2>
            <p className="mt-5 text-[#e8dfcc] text-base md:text-lg">
              Materiały z rozbiórek, maszyny i sprzęt prosto z naszego placu w Raszówce. Odbiór osobisty albo dowóz
              naszym transportem.
            </p>
          </div>

          <dl className="grid grid-cols-3 rounded-2xl border border-white/10 bg-white/[0.02] divide-x divide-white/10">
            {[
              { value: materials.length || "—", label: site.demoListings ? "ogłoszeń (demo)" : "ogłoszeń" },
              { value: tabs.length || "—", label: "kategorii" },
              { value: <Truck size={26} className="text-[#f5b52c]" />, label: "dowóz w regionie" },
            ].map((stat) => (
              <div key={stat.label} className="px-5 md:px-7 py-4 text-center">
                <dd className="font-montserrat font-bold text-3xl text-white leading-none h-8 flex items-center justify-center">
                  {stat.value}
                </dd>
                <dt className="mt-2 text-[11px] uppercase tracking-[0.15em] text-[#e8dfcc]/60 whitespace-nowrap">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>

        {/* Toolbar */}
        <div className="mb-10">
          <form
            onSubmit={search}
            className="flex flex-col md:flex-row md:items-center gap-2 p-2 rounded-2xl md:rounded-full border border-white/10 bg-[#0d0d0d] shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)] focus-within:border-[#f5b52c]/50 transition-colors"
          >
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#f5b52c] size-5" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Czego szukasz? np. stal, cegła rozbiórkowa, koparka..."
                className="w-full bg-transparent outline-none pl-14 pr-4 py-3.5 text-white placeholder:text-[#e8dfcc]/40"
              />
            </div>
            <span className="hidden md:block w-px h-8 bg-white/10" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              aria-label="Sortowanie"
              className="bg-transparent md:bg-transparent rounded-xl px-4 py-3 text-sm text-white outline-none cursor-pointer [&>option]:bg-[#0d0d0d]"
            >
              <option value="newest">Najnowsze</option>
              <option value="price_asc">Cena rosnąco</option>
              <option value="price_desc">Cena malejąco</option>
            </select>
            <button
              type="submit"
              className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl md:rounded-full font-bold text-sm text-black"
            >
              Szukaj <ArrowRight size={16} />
            </button>
          </form>

          {tabs.length > 0 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1 [scrollbar-width:none]">
              <button onClick={() => setCategory("all")} className={chipClass(category === "all")}>
                <LayoutGrid size={15} /> Wszystkie <span className={countClass(category === "all")}>{materials.length}</span>
              </button>
              {tabs.map((c) => (
                <button key={c.value} onClick={() => setCategory(c.value)} className={chipClass(category === c.value)}>
                  <c.icon size={15} /> {c.label} <span className={countClass(category === c.value)}>{c.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <DemoListingsNotice />

        {/* Listings */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="sm:col-span-2 lg:row-span-2 min-h-[460px] rounded-2xl bg-white/[0.03] animate-pulse" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[400px] rounded-2xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : featured === null && rest.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-12 text-center text-[#e8dfcc]">
            Brak ogłoszeń w tej kategorii. Zadzwoń — być może mamy coś, czego jeszcze nie wystawiliśmy.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured && <FeaturedCard item={featured} />}
            {rest.map((item) => (
              <ListingCard key={item.id} item={item} />
            ))}
            <SellBanner />
          </div>
        )}

        <div className="flex flex-col items-center gap-3 mt-12">
          <Link
            href="/ogloszenia"
            className="group inline-flex items-center gap-3 pl-8 pr-2 py-2 rounded-full border border-[#f5b52c]/60 text-white hover:bg-[#f5b52c] hover:text-black font-semibold text-sm tracking-wide transition-colors"
          >
            Zobacz wszystkie ogłoszenia
            <span className="w-9 h-9 flex items-center justify-center rounded-full bg-[#f5b52c] text-black group-hover:bg-black group-hover:text-[#f5b52c] transition-colors">
              <ArrowRight size={16} />
            </span>
          </Link>
          <span className="text-xs text-[#e8dfcc]/50">
            {materials.length} ogłoszeń · aktualizowane na bieżąco z placu w Raszówce
          </span>
        </div>
      </div>
    </section>
  );
}
