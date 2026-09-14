"use client";

import { useState } from "react";
import Navbar from "@/components/public/Footer";
import Footer from "@/components/public/Footer";
import { Camera, MapPin, Calendar, Wrench, Truck, Recycle, Filter } from "lucide-react";
import Link from "next/link";

const realizations = [
  {
    id: 1,
    title: "Rozbiórka hali magazynowej",
    service: "Rozbiórki",
    location: "Głogów",
    date: "2026-08-15",
    description: "Kompleksowa rozbiórka hali magazynowej o powierzchni 2000 m² z segregacją materiałów.",
    images: ["/assets/hero-bg.jpg", "/assets/hero-bg.jpg", "/assets/hero-bg.jpg"],
  },
  {
    id: 2,
    title: "Wykop fundamentów pod dom",
    service: "Koparki",
    location: "Lubin",
    date: "2026-07-20",
    description: "Wykop pod fundamenty domu jednorodzinnego z niwelacją terenu.",
    images: ["/assets/hero-bg.jpg", "/assets/hero-bg.jpg"],
  },
  {
    id: 3,
    title: "Transport złomu z fabryki",
    service: "Transport",
    location: "Legnica",
    date: "2026-07-10",
    description: "Transport 15 ton złomu stalowego z opuszczonej fabryki.",
    images: ["/assets/hero-bg.jpg"],
  },
  {
    id: 4,
    title: "Skup złomu - rozbiórka maszyn",
    service: "Skup złomu",
    location: "Raszówka",
    date: "2026-06-25",
    description: "Skup i demontaż starych maszyn przemysłowych z odzyskiem materiałów.",
    images: ["/assets/hero-bg.jpg", "/assets/hero-bg.jpg"],
  },
  {
    id: 5,
    title: "Niwelacja terenu pod parking",
    service: "Koparki",
    location: "Polkowice",
    date: "2026-06-15",
    description: "Niwelacja i utwardzenie terenu pod budowę parkingu na 50 samochodów.",
    images: ["/assets/hero-bg.jpg"],
  },
  {
    id: 6,
    title: "Dostawa materiałów budowlanych",
    service: "Materiały",
    location: "Chocianów",
    date: "2026-05-30",
    description: "Dostawa cegły rozbiórkowej i stali użytkowej na budowę.",
    images: ["/assets/hero-bg.jpg", "/assets/hero-bg.jpg"],
  },
];

const serviceIcons: Record<string, React.ElementType> = {
  "Rozbiórki": Wrench,
  "Koparki": Wrench,
  "Transport": Truck,
  "Skup złomu": Recycle,
  "Materiały": Recycle,
};

export default function RealizacjePage() {
  const [filter, setFilter] = useState("Wszystkie");
  const services = ["Wszystkie", "Rozbiórki", "Koparki", "Transport", "Skup złomu", "Materiały"];

  const filtered = filter === "Wszystkie" 
    ? realizations 
    : realizations.filter(r => r.service === filter);

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero */}
      <section className="py-20 bg-[#0f1419]">
        <div className="container mx-auto px-4 text-center">
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
                {service}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 bg-[#0f1419]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((realization) => {
              const ServiceIcon = serviceIcons[realization.service] || Wrench;
              
              return (
                <div key={realization.id} className="bg-[#1a2332] rounded-xl border border-[#2a3a4a] overflow-hidden hover:border-[#f0a500]/30 transition-colors">
                  {/* Image */}
                  <div className="relative h-48">
                    <img 
                      src={realization.images[0]} 
                      alt={realization.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#f0a500] text-[#0f1419] flex items-center gap-1">
                        <ServiceIcon size={12} />
                        {realization.service}
                      </span>
                    </div>
                    {realization.images.length > 1 && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 rounded text-xs bg-black/50 text-white flex items-center gap-1">
                          <Camera size={12} />
                          {realization.images.length}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-montserrat font-bold text-lg mb-2">{realization.title}</h3>
                    <p className="text-[#b8c5d6] text-sm mb-4 line-clamp-2">{realization.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-[#b8c5d6]">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-[#f0a500]" />
                        {realization.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-[#f0a500]" />
                        {realization.date}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
