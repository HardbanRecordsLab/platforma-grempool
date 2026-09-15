import type { Metadata } from "next";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { Wrench, Phone, ArrowRight, CheckCircle2, MapPin, Clock } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Usługi Koparką - Wykopy, Niwelacje, Prace Ziemne",
  description:
    "Profesjonalne usługi koparką - wykopy fundamentowe, niwelacje terenu, rozbiórki i prace ziemne. Własny sprzęt i doświadczeni operatorzy.",
  alternates: { canonical: "/uslugi/koparki" },
};

const gallery = [
  "https://images.unsplash.com/photo-1503708928676-1cb796a0891e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1719411606465-5143b163b608?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1494778924281-cce023ab1acb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1751054770504-c69daeec4721?auto=format&fit=crop&w=800&q=80",
];

export default function KoparkiPage() {
  const machines = [
    { name: "Koparka #01", model: "Caterpillar 320D", weight: "22 tony", depth: "6.7m", equipment: ["Łyżka 0.8m³", "Łyżka 1.2m³", "Świder", "Chwytak"] },
    { name: "Koparka #02", model: "Komatsu PC210", weight: "21 tony", depth: "6.5m", equipment: ["Łyżka 0.7m³", "Łyżka 1.0m³"] },
    { name: "Koparko-ładowarka", model: "JCB 3CX", weight: "8.5 tony", depth: "4.5m", equipment: ["Łyżka kop. 0.3m³", "Łyżka ładow. 1.0m³", "Świder"] },
  ];

  const services = [
    "Wykopy fundamentowe",
    "Niwelacje terenu",
    "Korytowanie",
    "Przygotowanie terenu pod budowę",
    "Rozbiórki",
    "Wykop pod przyłącza",
    "Prace melioracyjne",
    "Zaplecze budowy",
  ];

  const process = [
    { step: 1, title: "Kontakt", desc: "Opisz zakres prac i lokalizację" },
    { step: 2, title: "Oględziny", desc: "Wizja lokalna i dobór sprzętu" },
    { step: 3, title: "Wycena", desc: "Przygotowanie kosztorysu" },
    { step: 4, title: "Realizacja", desc: "Wykonanie prac zgodnie z zakresem" },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero */}
      <section className="relative py-32 overflow-hidden">
        <div
          className="absolute inset-0 hero-bg"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1764448726225-12da63f109e6?auto=format&fit=crop&w=1600&q=80')" }}
        />
        <div className="absolute inset-0 gradient-overlay" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-[#f0a500]/10 flex items-center justify-center">
                <Wrench className="text-[#f0a500] size-6" />
              </div>
              <span className="text-[#f0a500] font-semibold">USŁUGA</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-6">
              USŁUGI <span className="text-[#f0a500]">KOPARKĄ</span>
            </h1>
            <p className="text-[#b8c5d6] text-lg mb-8">
              Profesjonalne usługi koparką i koparko-ładowarką. Wykopy, niwelacje, rozbiórki
              i prace ziemne na najwyższym poziomie. Działamy na terenie Dolnego Śląska.
            </p>
            <div className="flex gap-4">
              <a href="tel:+48663288533" className="btn-primary px-6 py-3 rounded-lg font-semibold text-[#0f1419] flex items-center gap-2">
                <Phone size={20} /> ZADZWOŃ
              </a>
              <Link href="/wycena" className="px-6 py-3 rounded-lg font-semibold border-2 border-[#f0a500] text-[#f0a500] hover:bg-[#f0a500] hover:text-[#0f1419] transition-all">
                WYCENA
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Machines */}
      <section className="py-16 bg-[#1a2332]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-montserrat font-bold text-center mb-12">
            NASZY <span className="text-[#f0a500]">SPRZĘT</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {machines.map((machine) => (
              <div key={machine.name} className="bg-[#0f1419] p-6 rounded-xl border border-[#2a3a4a]">
                <div className="w-14 h-14 mb-4 rounded-lg bg-[#f0a500]/10 flex items-center justify-center">
                  <Wrench className="text-[#f0a500] size-7" />
                </div>
                <h3 className="font-montserrat font-bold text-lg mb-1">{machine.name}</h3>
                <p className="text-[#f0a500] text-sm mb-4">{machine.model}</p>
                <div className="space-y-2 text-sm text-[#b8c5d6] mb-4">
                  <div className="flex justify-between">
                    <span>Masa:</span>
                    <span className="text-white">{machine.weight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maks. głębokość:</span>
                    <span className="text-white">{machine.depth}</span>
                  </div>
                </div>
                <div className="text-xs text-[#b8c5d6] mb-2">Osprzęt:</div>
                <div className="flex flex-wrap gap-1">
                  {machine.equipment.map((item) => (
                    <span key={item} className="px-2 py-1 bg-[#2a3a4a] rounded text-xs">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-[#0f1419]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-montserrat font-bold mb-8">
                ZAKRES <span className="text-[#f0a500]">PRAC</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div key={service} className="flex items-center gap-3 p-4 bg-[#1a2332] rounded-lg">
                    <CheckCircle2 className="text-[#f0a500] size-5 shrink-0" />
                    <span className="text-sm">{service}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-montserrat font-bold mb-8">
                JAK <span className="text-[#f0a500]">DZIAŁAMY</span>?
              </h2>
              <div className="space-y-6">
                {process.map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#f0a500] text-[#0f1419] flex items-center justify-center font-bold shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <p className="text-sm text-[#b8c5d6]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 bg-[#0f1419]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-montserrat font-bold text-center mb-12">
            NASZ <span className="text-[#f0a500]">SPRZĘT W AKCJI</span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {gallery.map((src, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden border border-[#2a3a4a]">
                <img src={src} alt="Usługi koparką — realizacje" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#f0a500] to-[#d4940a]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-montserrat font-bold text-[#0f1419] mb-4">
            POTRZEBUJESZ KOPARKI?
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
