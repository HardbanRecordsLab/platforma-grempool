import type { Metadata } from "next";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import ScrapPriceSidebar from "@/components/public/ScrapPriceSidebar";
import ScrapCalculator from "@/components/public/ScrapCalculator";
import { Recycle, Phone, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { telHref } from "@/lib/site-settings";
import { getSiteSettings } from "@/lib/site-settings-server";

export const metadata: Metadata = {
  title: "Skup Złomu - Stal, Metale Kolorowe, Odbiór Własnym Transportem",
  description:
    "Skupujemy wszystkie rodzaje złomu stalowego i metali kolorowych. Atrakcyjne ceny, szybki odbiór, własny transport. Aktualny cennik złomu.",
  alternates: { canonical: "/uslugi/skup-zlomu" },
};

const gallery = [
  "https://images.unsplash.com/photo-1578483006555-aa8ab7bb01e2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1671362935207-d9abfc5b9509?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1702196665517-9d3670421443?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1679996287979-166522b96c39?auto=format&fit=crop&w=800&q=80",
];

export default async function SkupZlomuPage() {
  const site = await getSiteSettings();
  const materials = [
    { name: "Stal węglowa", image: "https://images.unsplash.com/photo-1763771420303-0f11ccf613d1?auto=format&fit=crop&w=400&q=80" },
    { name: "Stal nierdzewna", image: "https://images.unsplash.com/photo-1538474705339-e87de81450e8?auto=format&fit=crop&w=400&q=80" },
    { name: "Żeliwo", image: "https://images.unsplash.com/photo-1693092180995-ae2b4d8083f9?auto=format&fit=crop&w=400&q=80" },
    { name: "Miedź", image: "https://images.unsplash.com/photo-1546229738-ed21fb6e3158?auto=format&fit=crop&w=400&q=80" },
    { name: "Aluminium", image: "https://images.unsplash.com/photo-1485211177140-aa3b17a0c7b6?auto=format&fit=crop&w=400&q=80" },
    { name: "Ołów", image: "https://images.unsplash.com/photo-1679996287979-166522b96c39?auto=format&fit=crop&w=400&q=80" },
    { name: "Cynk", image: "https://images.unsplash.com/photo-1578483006555-aa8ab7bb01e2?auto=format&fit=crop&w=400&q=80" },
    { name: "Brąz", image: "https://images.unsplash.com/photo-1702196665517-9d3670421443?auto=format&fit=crop&w=400&q=80" },
  ];

  const benefits = [
    "Atrakcyjne ceny skupu",
    "Szybka wycena na podstawie zdjęć",
    "Własny transport - odbiór od klienta",
    "Negocjacje cen przy dużych ilościach",
    "Profesjonalna obsługa",
    "Elastyczne terminy odbioru",
  ];

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative py-32 overflow-hidden">
        <div
          className="absolute inset-0 hero-bg"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1761665698795-ac9df3438b74?auto=format&fit=crop&w=1600&q=80')" }}
        />
        <div className="absolute inset-0 gradient-overlay" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-[#f5b52c]/10 flex items-center justify-center">
                  <Recycle className="text-[#f5b52c] size-6" />
                </div>
                <span className="text-[#f5b52c] font-semibold">USŁUGA</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-6">
                SKUP <span className="text-[#f5b52c]">ZŁOMU</span>
              </h1>
              <p className="text-[#e8dfcc] text-lg mb-8">
                Skupujemy wszystkie rodzaje złomu stalowego i metali kolorowych.
                Oferujemy atrakcyjne ceny, szybki odbiór i profesjonalną obsługę.
              </p>
              <div className="flex gap-4">
                <a href={telHref(site.phone)} className="btn-primary px-6 py-3 rounded-lg font-semibold text-[#000000] flex items-center gap-2">
                  <Phone size={20} /> ZADZWOŃ
                </a>
                <Link href="/wycena" className="px-6 py-3 rounded-lg font-semibold border-2 border-[#f5b52c] text-[#f5b52c] hover:bg-[#f5b52c] hover:text-[#000000] transition-all">
                  SZYBKA WYCENA
                </Link>
              </div>
            </div>

            <div className="w-full lg:w-auto lg:shrink-0">
              <ScrapPriceSidebar />
            </div>
          </div>
        </div>
      </section>

      <ScrapCalculator />

      {/* Materials */}
      <section className="py-16 bg-[#0a0a0a]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-montserrat font-bold text-center mb-12">
            CO <span className="text-[#f5b52c]">SKUPUJEMY</span>?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {materials.map((material) => (
              <div key={material.name} className="bg-[#000000] rounded-xl border border-[#5c4716] text-center overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <img src={material.image} alt={material.name} className="w-full h-full object-cover" />
                </div>
                <span className="block py-3 text-sm font-semibold">{material.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 bg-[#000000]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-montserrat font-bold text-center mb-12">
            NASZA <span className="text-[#f5b52c]">PRACA</span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {gallery.map((src, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden border border-[#5c4716]">
                <img src={src} alt="Skup złomu — realizacje" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-[#000000]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-montserrat font-bold mb-8">
                DLACZEGO <span className="text-[#f5b52c]">MY</span>?
              </h2>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="text-[#f5b52c] size-5 shrink-0 mt-0.5" />
                    <span className="text-[#e8dfcc]">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-[#5c4716]">
              <h3 className="text-xl font-montserrat font-bold mb-6">JAK TO DZIAŁA?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#f5b52c] text-[#000000] flex items-center justify-center font-bold shrink-0">1</div>
                  <div>
                    <h4 className="font-semibold mb-1">Kontakt</h4>
                    <p className="text-sm text-[#e8dfcc]">Zadzwoń lub wypełnij formularz wyceny</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#f5b52c] text-[#000000] flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                    <h4 className="font-semibold mb-1">Wycena</h4>
                    <p className="text-sm text-[#e8dfcc]">Przygotujemy indywidualną wycenę</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#f5b52c] text-[#000000] flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                    <h4 className="font-semibold mb-1">Odbiór</h4>
                    <p className="text-sm text-[#e8dfcc]">Odbierzemy złom własnym transportem</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#f5b52c] text-[#000000] flex items-center justify-center font-bold shrink-0">4</div>
                  <div>
                    <h4 className="font-semibold mb-1">Płatność</h4>
                    <p className="text-sm text-[#e8dfcc]">Szybka płatność gotówką lub przelewem</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#f5b52c] to-[#c98f12]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-montserrat font-bold text-[#000000] mb-4">
            MASZ ZŁOM? WYCENIMY GO!
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={telHref(site.phone)} className="bg-[#000000] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#0a0a0a] transition-colors flex items-center gap-2">
              <Phone size={20} /> {site.phone}
            </a>
            <Link href="/wycena" className="border-2 border-[#000000] text-[#000000] px-8 py-4 rounded-lg font-semibold hover:bg-[#000000] hover:text-[#f5b52c] transition-colors flex items-center gap-2">
              WYCENA ONLINE <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
