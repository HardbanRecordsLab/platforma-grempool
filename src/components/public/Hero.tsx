"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import ScrapPriceSidebar from "./ScrapPriceSidebar";

export default function Hero() {
  const benefits = [
    "Atrakcyjne ceny",
    "Szybka wycena",
    "Profesjonalna obsługa",
    "Własny transport",
  ];

  return (
    <section className="relative min-h-[80vh] flex items-center">
      {/* Background */}
      <div 
        className="absolute inset-0 hero-bg"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1722695694560-f452b0919d3a?auto=format&fit=crop&w=1600&q=80')",
        }}
      />
      <div className="absolute inset-0 gradient-overlay" />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 py-20">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-montserrat font-bold mb-4">
              <span className="text-white">SKUP ZŁOMU</span>
              <br />
              <span className="text-[#f0a500]">I METALI</span>
            </h1>

            <p className="text-xl text-[#b8c5d6] mb-8 tracking-wide">
              SOLIDNIE. TERMINOWO. NA LATA.
            </p>

            <ul className="space-y-3 mb-10">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-[#b8c5d6]">
                  <CheckCircle2 className="text-[#f0a500] size-5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/wycena"
                className="btn-primary px-8 py-4 rounded-lg font-semibold text-[#0f1419] text-lg"
              >
                SKUP ZŁOMU
              </Link>
              <Link
                href="/uslugi"
                className="px-8 py-4 rounded-lg font-semibold border-2 border-[#f0a500] text-[#f0a500] hover:bg-[#f0a500] hover:text-[#0f1419] transition-all"
              >
                NASZE USŁUGI
              </Link>
            </div>

            <div className="mt-12 pt-10 border-t border-white/10">
              <h2 className="text-2xl md:text-3xl font-montserrat font-bold mb-5">
                TWÓJ PARTNER W <span className="text-[#f0a500]">TRANSPORCIE</span>,<br />
                ZŁOMIE I USŁUGACH
              </h2>
              <p className="text-[#b8c5d6] mb-4">
                Działamy szybko, rzetelnie i w uczciwy sposób. GREMPOOL Maria Muczyńska to firma działająca
                od 2013 roku w branży złomowej, transportowej i budowlanej. Naszym celem jest świadczenie usług
                na najwyższym poziomie, z zachowaniem uczciwości i terminowości.
              </p>
              <p className="text-[#b8c5d6] mb-8">
                Oferujemy kompleksowe rozwiązania - od skupu złomu, przez transport, aż po usługi budowlane
                i klimatyzację samochodową. Dzięki własnemu taborowi pojazdów i profesjonalnemu sprzętowi
                jesteśmy w stanie sprostać nawet najbardziej wymagającym zleceniom.
              </p>
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex gap-4">
                  <a href="tel:+48663288533" className="btn-primary px-6 py-3 rounded-lg font-semibold text-[#0f1419]">
                    ZADZWOŃ
                  </a>
                  <Link href="/wycena" className="px-6 py-3 rounded-lg font-semibold border-2 border-[#f0a500] text-[#f0a500] hover:bg-[#f0a500] hover:text-[#0f1419] transition-all">
                    WYCENA ONLINE
                  </Link>
                </div>
                <div className="bg-[#f0a500] text-[#0f1419] px-5 py-3 rounded-xl font-montserrat font-bold leading-none">
                  <div className="text-2xl">10+</div>
                  <div className="text-xs whitespace-nowrap">LAT DOŚWIADCZENIA</div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-auto lg:shrink-0">
            <ScrapPriceSidebar />
          </div>
        </div>
      </div>
    </section>
  );
}
