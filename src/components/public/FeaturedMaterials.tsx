"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Package, ArrowRight, MapPin, Phone, Ruler, Layers, ShieldCheck, Clock } from "lucide-react";
import type { Material } from "@/types";
import { MATERIAL_CATEGORIES, MATERIAL_CONDITIONS, getAvailableMaterials } from "@/lib/materials-store";
import { BUSINESS, DEMO_LISTINGS } from "@/lib/site";
import DemoListingsNotice from "./DemoListingsNotice";

const LIMIT = 8;

const categoryLabel = (value: Material["kategoria"]) =>
  MATERIAL_CATEGORIES.find((c) => c.value === value)?.label ?? value;

const conditionLabel = (value: Material["stan"]) =>
  MATERIAL_CONDITIONS.find((c) => c.value === value)?.label ?? value;

function addedAgo(date?: string) {
  if (!date) return null;
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
  if (Number.isNaN(days) || days < 0) return null;
  if (days === 0) return "dodano dziś";
  if (days === 1) return "dodano wczoraj";
  return `dodano ${days} dni temu`;
}

export default function FeaturedMaterials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>("all");

  useEffect(() => {
    getAvailableMaterials()
      .then(setMaterials)
      .catch(() => setMaterials([]))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(
    () =>
      MATERIAL_CATEGORIES.map((c) => ({ ...c, count: materials.filter((m) => m.kategoria === c.value).length })).filter(
        (c) => c.count > 0
      ),
    [materials]
  );

  const visible = useMemo(
    () => (category === "all" ? materials : materials.filter((m) => m.kategoria === category)).slice(0, LIMIT),
    [materials, category]
  );

  return (
    <section className="py-20 bg-[#0a0a0a] border-b border-[#5c4716]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <img src="/assets/logo-grempool-sygnet.png" alt="GREMPOOL" className="h-14 md:h-16 w-auto shrink-0" />
            <div>
              <span className="text-[#f5b52c] font-semibold text-xs tracking-[0.2em]">TABLICA OGŁOSZEŃ GREMPOOL</span>
              <h2 className="text-3xl md:text-4xl font-montserrat font-bold mt-1">
                MATERIAŁY <span className="text-[#f5b52c]">DOSTĘPNE TERAZ</span>
              </h2>
              <p className="text-sm text-[#e8dfcc] mt-2">
                {materials.length} {DEMO_LISTINGS ? "przykładowych" : "aktywnych"} ogłoszeń &middot; odbiór osobisty w Raszówce lub dowóz naszym transportem
              </p>
            </div>
          </div>
          <Link
            href="/uslugi/materialy"
            className="inline-flex items-center gap-2 border-2 border-[#f5b52c] text-[#f5b52c] hover:bg-[#f5b52c] hover:text-black px-6 py-3 rounded-md font-semibold text-sm tracking-wide transition-colors self-start lg:self-auto"
          >
            WSZYSTKIE OGŁOSZENIA <ArrowRight size={16} />
          </Link>
        </div>

        <DemoListingsNotice />

        {counts.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                category === "all"
                  ? "bg-[#f5b52c] text-black border-[#f5b52c]"
                  : "border-[#5c4716] text-[#e8dfcc] hover:border-[#f5b52c] hover:text-white"
              }`}
            >
              Wszystkie ({materials.length})
            </button>
            {counts.map((c) => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                  category === c.value
                    ? "bg-[#f5b52c] text-black border-[#f5b52c]"
                    : "border-[#5c4716] text-[#e8dfcc] hover:border-[#f5b52c] hover:text-white"
                }`}
              >
                {c.label} ({c.count})
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-96 rounded-xl border border-[#5c4716] bg-black animate-pulse" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="bg-black p-12 rounded-xl border border-[#5c4716] text-center text-[#e8dfcc]">
            Katalog materiałów jest właśnie aktualizowany. Zadzwoń — być może mamy to, czego szukasz.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visible.map((item) => {
              const ago = addedAgo(item.utworzone);
              return (
                <article
                  key={item.id}
                  className="group flex flex-col bg-black rounded-xl border border-[#5c4716] overflow-hidden hover:border-[#f5b52c] hover:-translate-y-1 hover:shadow-[0_12px_40px_-12px_rgba(245,181,44,0.35)] transition-all"
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
                        <Package className="text-[#5c4716] size-12" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/75 border border-[#f5b52c]/50 text-[#f5b52c] text-[11px] font-bold tracking-wide uppercase">
                      {categoryLabel(item.kategoria)}
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
                    <img
                      src="/assets/logo-grempool-sygnet.png"
                      alt=""
                      aria-hidden
                      className="absolute bottom-2 right-3 h-6 w-auto opacity-80"
                    />
                    {item.zdjecia && item.zdjecia.length > 1 && (
                      <span className="absolute bottom-3 left-3 text-[11px] text-white/90 font-semibold">
                        {item.zdjecia.length} zdjęć
                      </span>
                    )}
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

                    <dl className="space-y-1.5 text-xs text-[#e8dfcc] mb-4">
                      {item.wymiary && (
                        <div className="flex items-center gap-2">
                          <Ruler size={13} className="text-[#f5b52c] shrink-0" />
                          <dt className="sr-only">Wymiary</dt>
                          <dd className="truncate">{item.wymiary}</dd>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Layers size={13} className="text-[#f5b52c] shrink-0" />
                        <dt className="sr-only">Ilość</dt>
                        <dd>{item.ilosc} szt.</dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={13} className="text-[#f5b52c] shrink-0" />
                        <dt className="sr-only">Stan</dt>
                        <dd>Stan: {conditionLabel(item.stan)}</dd>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className="text-[#f5b52c] shrink-0" />
                        <dt className="sr-only">Lokalizacja</dt>
                        <dd className="truncate">Raszówka{item.lokalizacja ? ` · ${item.lokalizacja}` : ""}</dd>
                      </div>
                    </dl>

                    <div className="mt-auto pt-4 border-t border-[#5c4716]">
                      <div className="text-2xl font-montserrat font-bold text-[#f5b52c] mb-3">
                        {item.cena ? (
                          <>
                            {item.cena.toFixed(2)} <span className="text-sm">zł</span>
                          </>
                        ) : (
                          <span className="text-base">Cena do uzgodnienia</span>
                        )}
                      </div>
                      <div className="flex gap-2">
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
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
