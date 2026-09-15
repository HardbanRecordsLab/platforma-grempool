"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { Camera, MapPin, Calendar, Wrench, Truck, Recycle, Filter, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Realizacja } from "@/types";
import { SERVICE_LABELS } from "@/lib/supabase";
import { getPublicRealizations } from "@/lib/realizations-store";

const serviceIcons: Record<string, React.ElementType> = {
  rozbiorki: Wrench,
  koparki: Wrench,
  transport: Truck,
  skup_zlomu: Recycle,
  materialy: Recycle,
  klimatyzacja: Wrench,
};

export default function RealizacjeClient() {
  const [realizations, setRealizations] = useState<Realizacja[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Wszystkie");
  const services = ["Wszystkie", ...Object.keys(SERVICE_LABELS)];

  useEffect(() => {
    getPublicRealizations()
      .then(setRealizations)
      .catch(() => setRealizations([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "Wszystkie" ? realizations : realizations.filter((r) => r.usluga === filter);

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative py-28 overflow-hidden">
        <div
          className="absolute inset-0 hero-bg"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1776594974675-b21647efe342?auto=format&fit=crop&w=1600&q=80')" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(15,20,25,0.85) 0%, rgba(15,20,25,0.92) 100%)" }} />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-4">
            NASZE <span className="text-[#f0a500]">REALIZACJE</span>
          </h1>
          <p className="text-[#b8c5d6] text-lg max-w-2xl mx-auto">
            Sprawdź nasze dotychczasowe realizacje. Pokazujemy dowody zamiast samych deklaracji.
          </p>
        </div>
      </section>

      {/* Filter */}
      <section className="py-8 bg-[#1a2332] sticky top-20 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            <Filter className="text-[#b8c5d6] size-5 shrink-0" />
            {services.map((service) => (
              <button
                key={service}
                onClick={() => setFilter(service)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                  filter === service
                    ? "bg-[#f0a500] text-[#0f1419]"
                    : "bg-[#2a3a4a] text-[#b8c5d6] hover:bg-[#f0a500]/20"
                }`}
              >
                {service === "Wszystkie" ? "Wszystkie" : SERVICE_LABELS[service]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 bg-[#0f1419]">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center text-[#b8c5d6] flex items-center justify-center gap-3 py-16">
              <Loader2 className="animate-spin" size={20} /> Wczytywanie...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-[#b8c5d6] py-16">
              Brak opublikowanych realizacji w tej kategorii. Sprawdź wkrótce ponownie.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((realization) => {
                const ServiceIcon = serviceIcons[realization.usluga] || Wrench;
                const allPhotos = [
                  ...(realization.zdjecia_po ?? []),
                  ...(realization.zdjecia_w_trakcie ?? []),
                  ...(realization.zdjecia_przed ?? []),
                ];
                const cover = allPhotos[0];

                return (
                  <div
                    key={realization.id}
                    className="bg-[#1a2332] rounded-xl border border-[#2a3a4a] overflow-hidden hover:border-[#f0a500]/30 transition-colors"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-[#0f1419]">
                      {cover ? (
                        <img src={cover} alt={realization.zakres} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ServiceIcon className="text-[#2a3a4a] size-10" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#f0a500] text-[#0f1419] flex items-center gap-1">
                          <ServiceIcon size={12} />
                          {SERVICE_LABELS[realization.usluga] ?? realization.usluga}
                        </span>
                      </div>
                      {allPhotos.length > 1 && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-1 rounded text-xs bg-black/50 text-white flex items-center gap-1">
                            <Camera size={12} />
                            {allPhotos.length}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="font-montserrat font-bold text-lg mb-2">{realization.zakres}</h3>
                      {realization.opis && <p className="text-[#b8c5d6] text-sm mb-4 line-clamp-2">{realization.opis}</p>}

                      <div className="flex items-center gap-4 text-xs text-[#b8c5d6]">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-[#f0a500]" />
                          {realization.lokalizacja}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-[#f0a500]" />
                          {realization.data_realizacji}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#f0a500] to-[#d4940a]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-montserrat font-bold text-[#0f1419] mb-4">
            CHCESZ REALIZACJĘ PODOBNĄ DO NASZYCH?
          </h2>
          <p className="text-[#0f1419]/80 mb-8">Skontaktuj się z nami, a przygotujemy indywidualną ofertę</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:+48123456789" className="bg-[#0f1419] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#1a2332] transition-colors">
              +48 123 456 789
            </a>
            <Link href="/wycena" className="bg-white text-[#f0a500] px-8 py-4 rounded-lg font-semibold hover:bg-[#b8c5d6] transition-colors">
              ZAMÓW WYCENĘ
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
