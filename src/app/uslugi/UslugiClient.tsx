"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { Phone, ArrowRight, Package } from "lucide-react";
import Link from "next/link";
import type { CustomService } from "@/types";
import { getActiveCustomServices } from "@/lib/custom-services-store";
import { telHref } from "@/lib/site-settings";
import { useSiteSettings } from "@/components/SiteSettingsProvider";

const services = [
  {
    image: "https://images.unsplash.com/photo-1761665698795-ac9df3438b74?auto=format&fit=crop&w=800&q=80",
    title: "SKUP ZŁOMU",
    description: "Skupujemy wszystkie rodzaje złomu stalowego i metali kolorowych. Oferujemy atrakcyjne ceny i szybki odbiór.",
    features: ["Stal, metale kolorowe", "Duże ilości", "Negocjacje cen", "Własny transport"],
    href: "/uslugi/skup-zlomu",
  },
  {
    image: "https://images.unsplash.com/photo-1682033239272-6b60b828a9a2?auto=format&fit=crop&w=800&q=80",
    title: "TRANSPORT",
    description: "Transportujemy ładunki różnego rodzaju - od małych po duże gabaryty. Busy, ciężarówki z HDS.",
    features: ["Busy krótkie i długie", "Ciężarówki z HDS", "Wywrotki", "Transport aut"],
    href: "/uslugi/transport",
  },
  {
    image: "https://images.unsplash.com/photo-1764448726225-12da63f109e6?auto=format&fit=crop&w=800&q=80",
    title: "USŁUGI KOPARKĄ",
    description: "Profesjonalne usługi koparką - wykopy, niwelacje, rozbiórki i prace ziemne.",
    features: ["Wykopy fundamentowe", "Niwelacje terenu", "Rozbiórki", "Prace ziemne"],
    href: "/uslugi/koparki",
  },
  {
    image: "https://images.unsplash.com/photo-1776594974675-b21647efe342?auto=format&fit=crop&w=800&q=80",
    title: "ROZBIÓRKI",
    description: "Kompleksowe rozbiórki budynków i obiektów z segregacją materiałów.",
    features: ["Budynki", "Garaże", "Altany", "Segregacja materiałów"],
    href: "/uslugi/rozbiorki",
  },
  {
    image: "https://images.unsplash.com/photo-1746349086423-06ea6b4d73f7?auto=format&fit=crop&w=800&q=80",
    title: "WAGA NAJAZDOWA 50 TON",
    description: "Waga najazdowa na naszym placu w Raszówce - ważymy złom, kruszywa i materiały z rozbiórek.",
    features: ["Nośność 50 ton", "Ważenie przy kliencie", "Rozliczenie od masy", "Bez dojazdu do obcej wagi"],
    href: "/uslugi/waga-najazdowa",
  },
  {
    image: "https://images.unsplash.com/photo-1711989691538-4c1aac2c4279?auto=format&fit=crop&w=800&q=80",
    title: "MATERIAŁY BUDOWLANE",
    description: "Sprzedaż materiałów z odzysku - stal, cegła, okna, drzwi i więcej.",
    features: ["Stal użytkowa", "Cegła", "Okna i drzwi", "Kostka brukowa"],
    href: "/ogloszenia",
  },
];

export default function UslugiClient() {
  const site = useSiteSettings();
  const [extraServices, setExtraServices] = useState<CustomService[]>([]);

  useEffect(() => {
    getActiveCustomServices().then(setExtraServices).catch(() => setExtraServices([]));
  }, []);

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative py-28 overflow-hidden">
        <div
          className="absolute inset-0 hero-bg"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1722695694560-f452b0919d3a?auto=format&fit=crop&w=1600&q=80')" }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(11, 11, 10,0.85) 0%, rgba(11, 11, 10,0.92) 100%)" }} />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-4">
            NASZE <span className="text-[#f5b52c]">USŁUGI</span>
          </h1>
          <p className="text-[#e8dfcc] text-lg max-w-2xl mx-auto">
            Kompleksowe rozwiązania w branży złomowej, transportowej i budowlanej.
            Wybierz interesującą Cię usługę i dowiedz się więcej.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-[#0a0a0a]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className="card-hover bg-[#000000] rounded-2xl border border-[#5c4716] overflow-hidden group"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="img-brand w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-8">
                  <h2 className="text-xl font-montserrat font-bold mb-3">
                    {service.title}
                  </h2>
                  <p className="text-[#e8dfcc] text-sm mb-6">
                    {service.description}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-[#e8dfcc]">
                        <div className="w-1.5 h-1.5 bg-[#f5b52c] rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-2 text-[#f5b52c] font-semibold text-sm group-hover:gap-4 transition-all">
                    Dowiedz się więcej <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            ))}

            {extraServices.map((service) => (
              <Link
                key={service.id}
                href={service.href || "/wycena"}
                className="card-hover bg-[#000000] rounded-2xl border border-[#5c4716] overflow-hidden group"
              >
                <div className="aspect-video overflow-hidden">
                  {service.zdjecie ? (
                    <img
                      src={service.zdjecie}
                      alt={service.nazwa}
                      className="img-brand w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center">
                      <Package className="text-[#5c4716] size-10" />
                    </div>
                  )}
                </div>
                <div className="p-8">
                  <h2 className="text-xl font-montserrat font-bold mb-3">
                    {service.nazwa.toUpperCase()}
                  </h2>
                  {service.opis && (
                    <p className="text-[#e8dfcc] text-sm mb-6">
                      {service.opis}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-[#f5b52c] font-semibold text-sm group-hover:gap-4 transition-all">
                    Dowiedz się więcej <ArrowRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#f5b52c] to-[#c98f12]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-montserrat font-bold text-[#000000] mb-4">
            POTRZEBUJESZ WYCENY?
          </h2>
          <p className="text-[#000000]/80 mb-8">
            Skontaktuj się z nami lub wypełnij formularz szybkiej wyceny
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={telHref(site.phone)} className="bg-[#000000] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#0a0a0a] transition-colors flex items-center gap-2">
              <Phone size={20} /> {site.phone}
            </a>
            <Link href="/wycena" className="border-2 border-[#000000] text-[#000000] px-8 py-4 rounded-lg font-semibold hover:bg-[#000000] hover:text-[#f5b52c] transition-colors">
              SZYBKA WYCENA
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
