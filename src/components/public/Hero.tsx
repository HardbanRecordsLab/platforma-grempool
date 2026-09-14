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
            <p className="text-[#f0a500] font-montserrat font-semibold tracking-wide text-sm md:text-base mb-3">
              TWÓJ PARTNER W TRANSPORCIE, ZŁOMIE I USŁUGACH
            </p>
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
          </div>

          <div className="w-full lg:w-auto lg:shrink-0">
            <ScrapPriceSidebar />
          </div>
        </div>
      </div>
    </section>
  );
}
