"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  ArrowRight,
  MapPin,
  Phone,
  Ruler,
  Layers,
  ShieldCheck,
  Clock,
  Search,
  LayoutGrid,
  Megaphone,
} from "lucide-react";
import type { Material } from "@/types";
import { MATERIAL_CONDITIONS, getAvailableMaterials } from "@/lib/materials-store";
import { LISTING_CATEGORIES, categoryOf } from "@/lib/listing-categories";
import { BUSINESS, DEMO_LISTINGS } from "@/lib/site";
import DemoListingsNotice from "./DemoListingsNotice";

const LIMIT = 7;

type Sort = "newest" | "price_asc" | "price_desc";

const conditionLabel = (value: Material["stan"]) =>
  MATERIAL_CONDITIONS.find((c) => c.value === value)?.label ?? value;

function addedAgo(date?: string) {
  if (!date) return null;
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
  if (Number.isNaN(days) || days < 0) return null;
  if (days === 0) return "dziś";
  if (days === 1) return "wczoraj";
  return `${days} dni temu`;
}

export default function FeaturedMaterials() {
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

  const visible = useMemo(() => {
    const list = category === "all" ? [...materials] : materials.filter((m) => m.kategoria === category);
    if (sort === "price_asc") list.sort((a, b) => (a.cena ?? Infinity) - (b.cena ?? Infinity));
    else if (sort === "price_desc") list.sort((a, b) => (b.cena ?? -1) - (a.cena ?? -1));
    else list.sort((a, b) => (b.utworzone ?? "").localeCompare(a.utworzone ?? ""));
    return list.slice(0, LIMIT);
  }, [materials, category, sort]);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category !== "all") params.set("kat", category);
    router.push(`/uslugi/materialy${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <section className="relative py-20 bg-[#0a0a0a] border-b border-[#5c4716] overflow-hidden">
      <div className="pointer-events-none absolute -top-40 right-0 w-[520px] h-[520px] rounded-full bg-[#f5b52c]/5 blur-3xl" />

      <div className="relative container mx-auto px-4">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-end mb-10">
          <div className="flex items-center gap-5">
            <img src="/assets/logo-grempool-sygnet.png" alt="GREMPOOL" className="h-16 md:h-20 w-auto shrink-0" />
            <div>
              <span className="text-[#f5b52c] font-semibold text-xs tracking-[0.25em]">GREMPOOL &middot; GIEŁDA</span>
              <h2 className="text-3xl md:text-5xl font-montserrat font-bold mt-1 leading-none">
                TABLICA <span className="text-[#f5b52c]">OGŁOSZEŃ</span>
              </h2>
              <p className="text-sm text-[#e8dfcc] mt-3 max-w-xl">
                Materiały z odzysku i rozbiórek prosto z naszego placu w Raszówce. Odbiór osobisty albo dowóz
                naszym transportem.
              </p>
            </div>
          </div>

          <div className="flex gap-6 lg:gap-8">
            <div>
              <div className="text-3xl font-montserrat font-bold text-[#f5b52c] leading-none">{materials.length}</div>
              <div className="text-xs text-[#e8dfcc] mt-1">{DEMO_LISTINGS ? "ogłoszeń przykładowych" : "aktywnych ogłoszeń"}</div>
            </div>
            <div className="w-px bg-[#5c4716]" />
            <div>
              <div className="text-3xl font-montserrat font-bold text-[#f5b52c] leading-none">{tabs.length}</div>
              <div className="text-xs text-[#e8dfcc] mt-1">kategorii</div>
            </div>
          </div>
        </div>

        <DemoListingsNotice />

        {/* Toolbar */}
        <div className="rounded-xl border border-[#5c4716] bg-black p-3 mb-8">
          <form onSubmit={search} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#f5b52c] size-5" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Czego szukasz? np. stal, cegła rozbiórkowa, okna..."
                className="w-full bg-[#0a0a0a] border border-[#5c4716] focus:border-[#f5b52c] outline-none rounded-lg pl-12 pr-4 py-3 text-white placeholder:text-[#e8dfcc]/50"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="bg-[#0a0a0a] border border-[#5c4716] rounded-lg px-4 py-3 text-sm text-white"
            >
              <option value="newest">Najnowsze</option>
              <option value="price_asc">Cena: od najniższej</option>
              <option value="price_desc">Cena: od najwyższej</option>
            </select>
            <button type="submit" className="btn-primary px-8 py-3 rounded-lg font-semibold text-black">
              Szukaj
            </button>
          </form>

          {tabs.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              <button
                onClick={() => setCategory("all")}
                className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                  category === "all"
                    ? "bg-[#f5b52c] text-black border-[#f5b52c]"
                    : "border-[#5c4716] text-[#e8dfcc] hover:border-[#f5b52c] hover:text-white"
                }`}
              >
                <LayoutGrid size={16} /> Wszystkie
                <span className="opacity-70">{materials.length}</span>
              </button>
              {tabs.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setCategory(c.value)}
                  className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                    category === c.value
                      ? "bg-[#f5b52c] text-black border-[#f5b52c]"
                      : "border-[#5c4716] text-[#e8dfcc] hover:border-[#f5b52c] hover:text-white"
                  }`}
                >
                  <c.icon size={16} /> {c.label}
                  <span className="opacity-70">{c.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[420px] rounded-xl border border-[#5c4716] bg-black animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visible.map((item) => {
              const cat = categoryOf(item.kategoria);
              const CatIcon = cat?.icon ?? Package;
              const ago = addedAgo(item.utworzone);
              return (
                <article
                  key={item.id}
                  className="group flex flex-col bg-black rounded-xl border border-[#5c4716] overflow-hidden hover:border-[#f5b52c] hover:-translate-y-1 hover:shadow-[0_16px_48px_-16px_rgba(245,181,44,0.45)] transition-all"
                >
                  <div className="relative aspect-[4/3] bg-[#0a0a0a] overflow-hidden">
                    {item.zdjecia && item.zdjecia.length > 0 ? (
                      <img
                        src={item.zdjecia[0]}
                        alt={item.nazwa}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <CatIcon className="text-[#5c4716] size-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30" />
                    <span className="absolute top-3 left-3 max-w-[58%] flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/75 border border-[#f5b52c]/50 text-[#f5b52c] text-[11px] font-bold tracking-wide uppercase">
                      <CatIcon size={12} className="shrink-0" /> <span className="truncate">{cat?.label ?? item.kategoria}</span>
                    </span>
                    {DEMO_LISTINGS ? (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-[#f5b52c] text-black text-[11px] font-bold">
                        PRZYKŁAD
                      </span>
                    ) : (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-emerald-500/90 text-black text-[11px] font-bold">
                        DOSTĘPNY
                      </span>
                    )}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <span className="text-xl font-montserrat font-bold text-white drop-shadow">
                        {item.cena ? (
                          <>
                            {item.cena.toFixed(2)} <span className="text-sm text-[#f5b52c]">zł</span>
                          </>
                        ) : (
                          <span className="text-sm text-[#f5b52c]">Cena do uzgodnienia</span>
                        )}
                      </span>
                      <img src="/assets/logo-grempool-sygnet.png" alt="" aria-hidden className="h-6 w-auto opacity-80" />
                    </div>
                  </div>

                  <div className="flex flex-col flex-1 p-5">
                    <div className="flex items-center justify-between text-[11px] text-[#e8dfcc]/70 mb-2">
                      <span className="font-mono text-[#f5b52c]">{item.id_materialu}</span>
                      {ago && (
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {ago}
                        </span>
                      )}
                    </div>

                    <h3 className="font-montserrat font-bold text-white leading-snug mb-3 line-clamp-2 min-h-[2.75rem]">
                      {item.nazwa}
                    </h3>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-[#e8dfcc] mb-4">
                      {item.wymiary && (
                        <span className="col-span-2 flex items-center gap-2 truncate">
                          <Ruler size={13} className="text-[#f5b52c] shrink-0" /> {item.wymiary}
                        </span>
                      )}
                      <span className="flex items-center gap-2">
                        <Layers size={13} className="text-[#f5b52c] shrink-0" /> {item.ilosc} szt.
                      </span>
                      <span className="flex items-center gap-2">
                        <ShieldCheck size={13} className="text-[#f5b52c] shrink-0" /> {conditionLabel(item.stan)}
                      </span>
                      <span className="col-span-2 flex items-center gap-2 truncate">
                        <MapPin size={13} className="text-[#f5b52c] shrink-0" /> Raszówka
                        {item.lokalizacja ? ` · ${item.lokalizacja}` : ""}
                      </span>
                    </div>

                    <div className="mt-auto flex gap-2">
                      <Link
                        href={`/wycena?material=${encodeURIComponent(item.id_materialu)}&nazwa=${encodeURIComponent(item.nazwa)}`}
                        className="flex-1 text-center btn-primary py-2.5 rounded-md text-sm font-semibold text-black"
                      >
                        Zapytaj o ofertę
                      </Link>
                      <a
                        href={`tel:${BUSINESS.phone}`}
                        aria-label="Zadzwoń"
                        className="px-3 flex items-center justify-center rounded-md border border-[#5c4716] text-[#f5b52c] hover:border-[#f5b52c]"
                      >
                        <Phone size={16} />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}

            {/* Sell-to-us tile */}
            <div className="flex flex-col justify-between rounded-xl border-2 border-dashed border-[#f5b52c]/60 bg-gradient-to-br from-[#f5b52c]/15 to-transparent p-6">
              <div>
                <Megaphone className="text-[#f5b52c] size-10 mb-4" strokeWidth={1.5} />
                <h3 className="font-montserrat font-bold text-xl text-white mb-2">Masz coś na sprzedaż?</h3>
                <p className="text-sm text-[#e8dfcc]">
                  Skupujemy złom, materiały z rozbiórek, maszyny i sprzęt. Wycenimy szybko i odbierzemy własnym
                  transportem.
                </p>
              </div>
              <div className="space-y-2 mt-6">
                <Link
                  href="/wycena"
                  className="block text-center btn-primary py-2.5 rounded-md text-sm font-semibold text-black"
                >
                  Zgłoś do wyceny
                </Link>
                <a
                  href={`tel:${BUSINESS.phone}`}
                  className="block text-center py-2.5 rounded-md text-sm font-semibold border border-[#f5b52c] text-[#f5b52c] hover:bg-[#f5b52c] hover:text-black transition-colors"
                >
                  {BUSINESS.phoneDisplay}
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center mt-10">
          <Link
            href="/uslugi/materialy"
            className="inline-flex items-center gap-2 border-2 border-[#f5b52c] text-[#f5b52c] hover:bg-[#f5b52c] hover:text-black px-8 py-3 rounded-md font-semibold text-sm tracking-wide transition-colors"
          >
            ZOBACZ WSZYSTKIE OGŁOSZENIA ({materials.length}) <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
