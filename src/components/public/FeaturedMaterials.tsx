"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ArrowRight } from "lucide-react";
import type { Material } from "@/types";
import { MATERIAL_CATEGORIES, getAvailableMaterials } from "@/lib/materials-store";

const categoryLabel = (value: Material["kategoria"]) =>
  MATERIAL_CATEGORIES.find((c) => c.value === value)?.label ?? value;

export default function FeaturedMaterials() {
  const [materials, setMaterials] = useState<Material[]>([]);

  useEffect(() => {
    getAvailableMaterials()
      .then((data) => setMaterials(data.slice(0, 6)))
      .catch(() => setMaterials([]));
  }, []);

  return (
    <section className="py-20 bg-[#141210]">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-[#d4a24a] font-semibold text-sm">SKLEP GREMPOOL</span>
            <h2 className="text-3xl md:text-4xl font-montserrat font-bold mt-2">
              MATERIAŁY <span className="text-[#d4a24a]">DOSTĘPNE TERAZ</span>
            </h2>
          </div>
          <Link
            href="/uslugi/materialy"
            className="flex items-center gap-2 text-[#d4a24a] font-semibold hover:gap-3 transition-all"
          >
            Zobacz cały sklep <ArrowRight size={18} />
          </Link>
        </div>

        {materials.length === 0 ? (
          <div className="bg-[#0b0b0a] p-12 rounded-xl border border-[#352c1d] text-center text-[#c3b9a7]">
            Katalog materiałów jest właśnie aktualizowany. Zajrzyj wkrótce.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((item) => (
              <div key={item.id} className="card-hover bg-[#0b0b0a] rounded-xl border border-[#352c1d] overflow-hidden">
                <div className="aspect-video bg-[#141210] flex items-center justify-center overflow-hidden">
                  {item.zdjecia && item.zdjecia.length > 0 ? (
                    <img src={item.zdjecia[0]} alt={item.nazwa} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="text-[#352c1d] size-10" />
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[#d4a24a] text-xs">{item.id_materialu}</span>
                    <span className="text-xs text-[#c3b9a7]">{categoryLabel(item.kategoria)}</span>
                  </div>
                  <h3 className="font-semibold mb-3">{item.nazwa}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[#d4a24a] font-bold">
                      {item.cena ? `${item.cena.toFixed(2)} zł` : "Zapytaj o cenę"}
                    </span>
                    <Link
                      href={`/wycena?material=${encodeURIComponent(item.id_materialu)}&nazwa=${encodeURIComponent(item.nazwa)}`}
                      className="text-sm font-semibold text-[#c3b9a7] hover:text-[#d4a24a] transition-colors"
                    >
                      Zapytaj →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
