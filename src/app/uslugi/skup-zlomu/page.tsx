import type { Metadata } from "next";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import ScrapPriceTicker from "@/components/public/ScrapPriceTicker";
import ScrapPriceSidebar from "@/components/public/ScrapPriceSidebar";
import { Recycle, Phone, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

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

export default function SkupZlomuPage() {
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
      <ScrapPriceTicker />

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
                <div className="w-12 h-12 rounded-lg bg-[#f0a500]/10 flex items-center justify-center">
                  <Recycle className="text-[#f0a500] size-6" />
                </div>
                <span className="text-[#f0a500] font-semibold">USŁUGA</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-6">
                SKUP <span className="text-[#f0a500]">ZŁOMU</span>
              </h1>
              <p className="text-[#b8c5d6] text-lg mb-8">
                Skupujemy wszystkie rodzaje złomu stalowego i metali kolorowych.
                Oferujemy atrakcyjne ceny, szybki odbiór i profesjonalną obsługę.
              </p>
              <div className="flex gap-4">
                <a href="tel:+48663288533" className="btn-primary px-6 py-3 rounded-lg font-semibold text-[#0f1419] flex items-center gap-2">
                  <Phone size={20} /> ZADZWOŃ
                </a>
                <Link href="/wycena" className="px-6 py-3 rounded-lg font-semibold border-2 border-[#f0a500] text-[#f0a500] hover:bg-[#f0a500] hover:text-[#0f1419] transition-all">
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

      {/* Materials */}
      <section className="py-16 bg-[#1a2332]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-montserrat font-bold text-center mb-12">
            CO <span className="text-[#f0a500]">SKUPUJEMY</span>?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {materials.map((material) => (
              <div key={material.name} className="bg-[#0f1419] rounded-xl border border-[#2a3a4a] text-center overflow-hidden">
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
      <section className="py-16 bg-[#0f1419]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-montserrat font-bold text-center mb-12">
            NASZA <span className="text-[#f0a500]">PRACA</span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {gallery.map((src, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden border border-[#2a3a4a]">
                <img src={src} alt="Skup złomu — realizacje" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-[#0f1419]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-montserrat font-bold mb-8">
                DLACZEGO <span className="text-[#f0a500]">MY</span>?
              </h2>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="text-[#f0a500] size-5 shrink-0 mt-0.5" />
                    <span className="text-[#b8c5d6]">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#1a2332] p-8 rounded-2xl border border-[#2a3a4a]">
              <h3 className="text-xl font-montserrat font-bold mb-6">JAK TO DZIAŁA?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#f0a500] text-[#0f1419] flex items-center justify-center font-bold shrink-0">1</div>
                  <div>
                    <h4 className="font-semibold mb-1">Kontakt</h4>
                    <p className="text-sm text-[#b8c5d6]">Zadzwoń lub wypełnij formularz wyceny</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#f0a500] text-[#0f1419] flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                    <h4 className="font-semibold mb-1">Wycena</h4>
                    <p className="text-sm text-[#b8c5d6]">Przygotujemy indywidualną wycenę</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#f0a500] text-[#0f1419] flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                    <h4 className="font-semibold mb-1">Odbiór</h4>
                    <p className="text-sm text-[#b8c5d6]">Odbierzemy złom własnym transportem</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#f0a500] text-[#0f1419] flex items-center justify-center font-bold shrink-0">4</div>
                  <div>
                    <h4 className="font-semibold mb-1">Płatność</h4>
                    <p className="text-sm text-[#b8c5d6]">Szybka płatność gotówką lub przelewem</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#f0a500] to-[#d4940a]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-montserrat font-bold text-[#0f1419] mb-4">
            MASZ ZŁOM? WYCENIMY GO!
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:+48663288533" className="bg-[#0f1419] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#1a2332] transition-colors flex items-center gap-2">
              <Phone size={20} /> +48 663 288 533
            </a>
            <Link href="/wycena" className="bg-white text-[#f0a500] px-8 py-4 rounded-lg font-semibold hover:bg-[#b8c5d6] transition-colors flex items-center gap-2">
              WYCENA ONLINE <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
