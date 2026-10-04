"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { Package, Phone, ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import type { Material } from "@/types";
import { MATERIAL_CATEGORIES, getAvailableMaterials } from "@/lib/materials-store";

const categoryLabel = (value: Material["kategoria"]) =>
  MATERIAL_CATEGORIES.find((c) => c.value === value)?.label ?? value;

export default function MaterialyClient() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Wszystkie");

  useEffect(() => {
    getAvailableMaterials()
      .then(setMaterials)
      .catch(() => setMaterials([]))
      .finally(() => setLoading(false));
  }, []);

  const categorySummary = useMemo(() => {
    return MATERIAL_CATEGORIES.map((cat) => ({
      ...cat,
      count: materials.filter((m) => m.kategoria === cat.value).length,
    }));
  }, [materials]);

  const filtered = useMemo(() => {
    return materials.filter((m) => {
      const matchesCategory = activeCategory === "Wszystkie" || categoryLabel(m.kategoria) === activeCategory;
      const matchesQuery =
        m.nazwa.toLowerCase().includes(query.toLowerCase()) ||
        m.id_materialu.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [materials, activeCategory, query]);

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative py-32 overflow-hidden">
        <div
          className="absolute inset-0 hero-bg"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1711989691538-4c1aac2c4279?auto=format&fit=crop&w=1600&q=80')" }}
        />
        <div className="absolute inset-0 gradient-overlay" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-[#d4a24a]/10 flex items-center justify-center">
                <Package className="text-[#d4a24a] size-6" />
              </div>
              <span className="text-[#d4a24a] font-semibold">SKLEP</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-6">
              MATERIAŁY <span className="text-[#d4a24a]">Z ODZYSKU</span>
            </h1>
            <p className="text-[#c3b9a7] text-lg mb-8">
              Oferujemy szeroki wybór materiałów budowlanych z odzysku w atrakcyjnych cenach.
              Stal, cegła, okna, drzwi i wiele więcej. Poniżej aktualna dostępność z naszego placu.
            </p>
            <div className="flex gap-4">
              <a href="tel:+48663288533" className="btn-primary px-6 py-3 rounded-lg font-semibold text-[#0b0b0a] flex items-center gap-2">
                <Phone size={20} /> ZADZWOŃ
              </a>
              <Link href="/wycena" className="px-6 py-3 rounded-lg font-semibold border-2 border-[#d4a24a] text-[#d4a24a] hover:bg-[#d4a24a] hover:text-[#0b0b0a] transition-all">
                ZAPYTAJ O MATERIAŁ
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-[#141210]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-montserrat font-bold text-center mb-12">
            KATEGORIE <span className="text-[#d4a24a]">MATERIAŁÓW</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <button
              onClick={() => setActiveCategory("Wszystkie")}
              className={`text-left bg-[#0b0b0a] p-6 rounded-xl border transition-colors ${
                activeCategory === "Wszystkie" ? "border-[#d4a24a]" : "border-[#352c1d] hover:border-[#d4a24a]/50"
              }`}
            >
              <Package className="text-[#d4a24a] size-8 mb-3" />
              <h3 className="font-montserrat font-bold mb-1">Wszystkie</h3>
              <p className="text-[#d4a24a] text-sm">{materials.length} pozycji</p>
            </button>
            {categorySummary.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.label)}
                className={`text-left bg-[#0b0b0a] p-6 rounded-xl border transition-colors ${
                  activeCategory === cat.label ? "border-[#d4a24a]" : "border-[#352c1d] hover:border-[#d4a24a]/50"
                }`}
              >
                <Package className="text-[#d4a24a] size-8 mb-3" />
                <h3 className="font-montserrat font-bold mb-1">{cat.label}</h3>
                <p className="text-[#d4a24a] text-sm">{cat.count} pozycji</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Available Items */}
      <section className="py-16 bg-[#0b0b0a]">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <h2 className="text-3xl font-montserrat font-bold">
              DOSTĘPNE <span className="text-[#d4a24a]">MATERIAŁY</span>
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c3b9a7] size-4" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Szukaj materiałów..."
                className="bg-[#141210] border border-[#352c1d] rounded-lg pl-10 pr-4 py-2 text-sm text-white w-64"
              />
            </div>
          </div>

          {loading ? (
            <div className="bg-[#141210] p-12 rounded-xl border border-[#352c1d] text-center text-[#c3b9a7]">
              Wczytywanie katalogu...
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-[#141210] p-12 rounded-xl border border-[#352c1d] text-center text-[#c3b9a7]">
              Brak materiałów spełniających kryteria. Zadzwoń — być może mamy coś, czego jeszcze nie dodaliśmy do katalogu.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {filtered.map((item) => (
                <div key={item.id} className="bg-[#141210] rounded-xl border border-[#352c1d] hover:border-[#d4a24a]/30 transition-colors overflow-hidden">
                  <div className="aspect-video bg-[#0b0b0a] flex items-center justify-center overflow-hidden">
                    {item.zdjecia && item.zdjecia.length > 0 ? (
                      <img src={item.zdjecia[0]} alt={item.nazwa} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="text-[#352c1d] size-12" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2 gap-1">
                      <span className="font-mono text-[#d4a24a] text-[10px] truncate">{item.id_materialu}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-500/20 text-green-400 shrink-0">
                        Dostępny
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 min-h-[2.5rem]">{item.nazwa}</h3>
                    <div className="space-y-0.5 text-xs text-[#c3b9a7] mb-3">
                      <div className="truncate">Wymiary: <span className="text-white">{item.wymiary}</span></div>
                      <div>Ilość: <span className="text-white">{item.ilosc} szt.</span></div>
                    </div>
                    <div className="text-base font-bold text-[#d4a24a] mb-3">
                      {item.cena ? `${item.cena.toFixed(2)} zł` : "Zapytaj o cenę"}
                    </div>
                    <Link
                      href={`/wycena?material=${encodeURIComponent(item.id_materialu)}&nazwa=${encodeURIComponent(item.nazwa)}`}
                      className="block w-full text-center py-2 rounded-lg bg-[#352c1d] text-xs font-semibold hover:bg-[#d4a24a] hover:text-[#0b0b0a] transition-colors"
                    >
                      Zapytaj
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#d4a24a] to-[#a97c2b]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-montserrat font-bold text-[#0b0b0a] mb-4">
            SZUKASZ KONKRETNEGO MATERIAŁU?
          </h2>
          <p className="text-[#0b0b0a]/80 mb-8">Zadzwoń lub napisz - pomożemy znaleźć to, czego potrzebujesz</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:+48663288533" className="bg-[#0b0b0a] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#141210] transition-colors flex items-center gap-2">
              <Phone size={20} /> +48 663 288 533
            </a>
            <Link href="/wycena" className="border-2 border-[#0b0b0a] text-[#0b0b0a] px-8 py-4 rounded-lg font-semibold hover:bg-[#0b0b0a] hover:text-[#d4a24a] transition-colors flex items-center gap-2">
              NAPISZ DO NAS <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
