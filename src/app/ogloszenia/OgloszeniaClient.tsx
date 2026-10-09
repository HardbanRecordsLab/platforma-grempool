"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, LayoutGrid, Phone, Search, SlidersHorizontal, Truck, X, ArrowRight } from "lucide-react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import DemoListingsNotice from "@/components/public/DemoListingsNotice";
import { ListingCard } from "@/components/public/ListingCards";
import type { Material } from "@/types";
import { MATERIAL_CONDITIONS, getAvailableMaterials } from "@/lib/materials-store";
import { LISTING_CATEGORIES, categoryOf } from "@/lib/listing-categories";
import { BUSINESS, DEMO_LISTINGS } from "@/lib/site";

const PAGE_SIZE = 12;

type Sort = "newest" | "price_asc" | "price_desc";

// 1 ogłoszenie, 2-4 ogłoszenia (but 12-14 ogłoszeń), otherwise ogłoszeń.
function listingsWord(n: number) {
  if (n === 1) return "ogłoszenie";
  const last = n % 10;
  const lastTwo = n % 100;
  return last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14) ? "ogłoszenia" : "ogłoszeń";
}

export default function OgloszeniaClient() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [conditions, setConditions] = useState<string[]>([]);
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [shown, setShown] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // The homepage search links here with ?q= and ?kat=.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const kat = params.get("kat");
    if (q) setQuery(q);
    if (kat && LISTING_CATEGORIES.some((c) => c.value === kat)) setCategory(kat);
  }, []);

  useEffect(() => {
    getAvailableMaterials()
      .then(setMaterials)
      .catch(() => setMaterials([]))
      .finally(() => setLoading(false));
  }, []);

  // Keep the address shareable: a copied link opens the same filter.
  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category !== "all") params.set("kat", category);
    const url = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
    window.history.replaceState(null, "", url);
  }, [query, category]);

  const categories = useMemo(
    () =>
      LISTING_CATEGORIES.map((c) => ({ ...c, count: materials.filter((m) => m.kategoria === c.value).length })).filter(
        (c) => c.count > 0
      ),
    [materials]
  );

  const conditionOptions = useMemo(
    () => MATERIAL_CONDITIONS.filter((c) => materials.some((m) => m.stan === c.value)),
    [materials]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const from = priceFrom ? Number(priceFrom) : null;
    const to = priceTo ? Number(priceTo) : null;
    const list = materials.filter((m) => {
      if (category !== "all" && m.kategoria !== category) return false;
      if (conditions.length > 0 && !conditions.includes(m.stan)) return false;
      if (from !== null && (m.cena ?? 0) < from) return false;
      if (to !== null && (m.cena === undefined || m.cena === null || m.cena > to)) return false;
      if (!q) return true;
      return [m.nazwa, m.id_materialu, m.wymiary, categoryOf(m.kategoria)?.label]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
    if (sort === "price_asc") list.sort((a, b) => (a.cena ?? Infinity) - (b.cena ?? Infinity));
    else if (sort === "price_desc") list.sort((a, b) => (b.cena ?? -1) - (a.cena ?? -1));
    else list.sort((a, b) => (b.utworzone ?? "").localeCompare(a.utworzone ?? ""));
    return list;
  }, [materials, query, category, conditions, priceFrom, priceTo, sort]);

  const activeFilters = [
    query.trim() && { key: "q", label: `„${query.trim()}”`, clear: () => setQuery("") },
    category !== "all" && {
      key: "kat",
      label: categoryOf(category as Material["kategoria"])?.label ?? category,
      clear: () => setCategory("all"),
    },
    ...conditions.map((c) => ({
      key: `stan-${c}`,
      label: MATERIAL_CONDITIONS.find((o) => o.value === c)?.label ?? c,
      clear: () => setConditions((prev) => prev.filter((v) => v !== c)),
    })),
    (priceFrom || priceTo) && {
      key: "cena",
      label: `Cena ${priceFrom || "0"}–${priceTo || "∞"} zł`,
      clear: () => {
        setPriceFrom("");
        setPriceTo("");
      },
    },
  ].filter(Boolean) as { key: string; label: string; clear: () => void }[];

  const clearAll = () => {
    setQuery("");
    setCategory("all");
    setConditions([]);
    setPriceFrom("");
    setPriceTo("");
  };

  const toggleCondition = (value: string) =>
    setConditions((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));

  const inputClass =
    "w-full bg-black border border-white/10 focus:border-[#f5b52c]/60 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-[#e8dfcc]/40";

  const categoryButton = (active: boolean) =>
    `w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
      active ? "bg-[#f5b52c] text-black font-semibold" : "text-[#e8dfcc] hover:bg-white/5 hover:text-white"
    }`;

  const filters = (
    <div className="space-y-7">
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#e8dfcc]/60 mb-3">Szukaj</h3>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#f5b52c] size-4" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShown(PAGE_SIZE);
            }}
            placeholder="Nazwa, ID, wymiary..."
            className={`${inputClass} pl-10`}
          />
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#e8dfcc]/60 mb-3">Kategorie</h3>
        <div className="space-y-1">
          <button
            onClick={() => {
              setCategory("all");
              setShown(PAGE_SIZE);
            }}
            className={categoryButton(category === "all")}
          >
            <LayoutGrid size={16} /> <span className="flex-1 text-left">Wszystkie</span>
            <span className="text-xs opacity-70">{materials.length}</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => {
                setCategory(c.value);
                setShown(PAGE_SIZE);
              }}
              className={categoryButton(category === c.value)}
            >
              <c.icon size={16} /> <span className="flex-1 text-left">{c.label}</span>
              <span className="text-xs opacity-70">{c.count}</span>
            </button>
          ))}
        </div>
      </div>

      {conditionOptions.length > 0 && (
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#e8dfcc]/60 mb-3">Stan</h3>
          <div className="flex flex-wrap gap-2">
            {conditionOptions.map((c) => {
              const active = conditions.includes(c.value);
              return (
                <button
                  key={c.value}
                  onClick={() => toggleCondition(c.value)}
                  className={`px-3.5 py-1.5 rounded-full text-sm border transition-colors ${
                    active
                      ? "bg-[#f5b52c] border-[#f5b52c] text-black font-semibold"
                      : "border-white/10 text-[#e8dfcc] hover:border-[#f5b52c]/60 hover:text-white"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#e8dfcc]/60 mb-3">Cena (zł)</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            inputMode="decimal"
            value={priceFrom}
            onChange={(e) => setPriceFrom(e.target.value)}
            placeholder="od"
            className={inputClass}
          />
          <span className="text-[#e8dfcc]/40">–</span>
          <input
            type="number"
            min="0"
            inputMode="decimal"
            value={priceTo}
            onChange={(e) => setPriceTo(e.target.value)}
            placeholder="do"
            className={inputClass}
          />
        </div>
      </div>

      {activeFilters.length > 0 && (
        <button
          onClick={clearAll}
          className="w-full py-2.5 rounded-xl border border-white/10 text-sm text-[#e8dfcc] hover:border-[#f5b52c]/60 hover:text-white transition-colors"
        >
          Wyczyść wszystkie filtry
        </button>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-[#050505]">
      <Navbar />

      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/10">
        <img
          src="https://images.unsplash.com/photo-1711989691538-4c1aac2c4279?auto=format&fit=crop&w=1600&q=70"
          alt=""
          aria-hidden
          className="absolute inset-y-0 right-0 w-full lg:w-3/5 h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/95 to-[#050505]/40" />
        <div className="pointer-events-none absolute -top-40 left-0 w-[700px] h-[400px] rounded-full bg-[#f5b52c]/[0.07] blur-3xl" />

        <div className="relative container mx-auto px-4 pt-10 pb-14 md:pt-12 md:pb-16">
          <nav aria-label="Ścieżka" className="flex items-center gap-1.5 text-xs text-[#e8dfcc]/60 mb-10">
            <Link href="/" className="hover:text-white transition-colors">
              Strona główna
            </Link>
            <ChevronRight size={12} />
            <span className="text-[#f5b52c]">Ogłoszenia</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-px w-10 bg-[#f5b52c]" />
                <span className="text-[#f5b52c] text-xs font-bold tracking-[0.3em] uppercase">Giełda GREMPOOL</span>
              </div>
              <h1 className="font-montserrat font-bold text-5xl md:text-7xl leading-[0.95] tracking-tight">
                Ogło
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffd36b] to-[#f5b52c]">szenia</span>
              </h1>
              <p className="mt-5 text-[#e8dfcc] text-base md:text-lg">
                Materiały z rozbiórek, kruszywa, drewno, maszyny i sprzęt z naszego placu w Raszówce. Odbiór osobisty
                albo dowóz naszym transportem na terenie Dolnego Śląska.
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <a
                  href={`tel:${BUSINESS.phone}`}
                  className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-black"
                >
                  <Phone size={16} /> {BUSINESS.phoneDisplay}
                </a>
                <Link
                  href="/wycena"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border border-white/25 text-white hover:border-[#f5b52c] hover:text-[#f5b52c] transition-colors"
                >
                  Zapytaj o materiał <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <dl className="grid grid-cols-3 rounded-2xl border border-white/10 bg-black/50 backdrop-blur-sm divide-x divide-white/10 shrink-0">
              {[
                { value: materials.length || "—", label: DEMO_LISTINGS ? "ogłoszeń (demo)" : "ogłoszeń" },
                { value: categories.length || "—", label: "kategorii" },
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
        </div>
      </section>

      {/* Board */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
          {/* Filters */}
          <aside className="lg:sticky lg:top-6">
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className="lg:hidden w-full flex items-center justify-between px-5 py-3.5 rounded-2xl border border-white/10 bg-[#0d0d0d] text-white font-semibold"
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-[#f5b52c]" /> Filtry
                {activeFilters.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#f5b52c] text-black text-xs">{activeFilters.length}</span>
                )}
              </span>
              <ChevronRight size={18} className={`transition-transform ${filtersOpen ? "rotate-90" : ""}`} />
            </button>
            <div
              className={`${filtersOpen ? "block mt-3" : "hidden"} lg:block rounded-2xl border border-white/10 bg-[#0d0d0d] p-5`}
            >
              {filters}
            </div>

            <div className="hidden lg:block mt-5 rounded-2xl border border-[#f5b52c]/30 bg-gradient-to-br from-[#f5b52c]/10 to-transparent p-5">
              <h3 className="font-montserrat font-bold text-white mb-1.5">Nie widzisz tego, czego szukasz?</h3>
              <p className="text-sm text-[#e8dfcc] mb-4">Nie wszystko jest wystawione. Zadzwoń — sprawdzimy plac.</p>
              <a
                href={`tel:${BUSINESS.phone}`}
                className="flex items-center justify-center gap-2 btn-primary py-2.5 rounded-full text-sm font-bold text-black"
              >
                <Phone size={15} /> {BUSINESS.phoneDisplay}
              </a>
            </div>
          </aside>

          {/* Results */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
              <p className="text-[#e8dfcc]">
                {loading ? (
                  "Wczytywanie ogłoszeń..."
                ) : (
                  <>
                    Znaleziono <span className="font-bold text-white">{filtered.length}</span>{" "}
                    {listingsWord(filtered.length)}
                  </>
                )}
              </p>
              <label className="flex items-center gap-3 text-sm text-[#e8dfcc]">
                Sortuj:
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as Sort)}
                  className="bg-[#0d0d0d] border border-white/10 rounded-full px-4 py-2 text-white outline-none cursor-pointer focus:border-[#f5b52c]/60"
                >
                  <option value="newest">Najnowsze</option>
                  <option value="price_asc">Cena rosnąco</option>
                  <option value="price_desc">Cena malejąco</option>
                </select>
              </label>
            </div>

            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {activeFilters.map((f) => (
                  <button
                    key={f.key}
                    onClick={f.clear}
                    className="inline-flex items-center gap-1.5 pl-3.5 pr-2.5 py-1.5 rounded-full bg-[#f5b52c]/10 border border-[#f5b52c]/40 text-sm text-[#f5b52c] hover:bg-[#f5b52c]/20"
                  >
                    {f.label} <X size={14} />
                  </button>
                ))}
              </div>
            )}

            <DemoListingsNotice />

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-[420px] rounded-2xl bg-white/[0.03] animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-12 text-center">
                <p className="text-white font-semibold mb-2">Brak ogłoszeń spełniających kryteria</p>
                <p className="text-sm text-[#e8dfcc] mb-6">
                  Zmień filtry albo zadzwoń — być może mamy coś, czego jeszcze nie wystawiliśmy.
                </p>
                <button
                  onClick={clearAll}
                  className="px-6 py-2.5 rounded-full border border-[#f5b52c]/60 text-sm text-[#f5b52c] hover:bg-[#f5b52c] hover:text-black transition-colors"
                >
                  Wyczyść filtry
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filtered.slice(0, shown).map((item) => (
                    <ListingCard key={item.id} item={item} />
                  ))}
                </div>
                {shown < filtered.length && (
                  <div className="flex justify-center mt-10">
                    <button
                      onClick={() => setShown((n) => n + PAGE_SIZE)}
                      className="px-8 py-3 rounded-full border border-[#f5b52c]/60 text-sm font-semibold text-white hover:bg-[#f5b52c] hover:text-black transition-colors"
                    >
                      Pokaż więcej ({filtered.length - shown})
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
