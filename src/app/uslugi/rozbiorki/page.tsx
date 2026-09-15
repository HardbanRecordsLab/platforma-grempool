import type { Metadata } from "next";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { Hammer, Phone, ArrowRight, CheckCircle2, Truck, Recycle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Rozbiórki Budynków i Obiektów z Segregacją Materiałów",
  description:
    "Kompleksowe rozbiórki budynków, garaży i altan z segregacją materiałów i odzyskiem złomu. Wyburzanie całkowite i częściowe.",
  alternates: { canonical: "/uslugi/rozbiorki" },
};

const gallery = [
  "https://images.unsplash.com/photo-1758965285803-1cdd3371563b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1777364702593-a975b49659af?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1768056089011-d31299b45d3c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1776594974675-b21647efe342?auto=format&fit=crop&w=800&q=80",
];

export default function RozbiorkiPage() {
  const services = [
    "Wyburzanie budynków",
    "Rozbiórki częściowe",
    "Demontaż konstrukcji stalowych",
    "Rozbiórki fundamentów",
    "Demontaż dachów i więźby",
    "Usuwanie ścian i stropów",
    "Rozbiórki altan i garaży",
    "Przygotowanie terenu pod nową budowę",
  ];

  const advantages = [
    { icon: Hammer, title: "Profesjonalny sprzęt", desc: "Nowoczesne koparki z osprzętem do rozbiórek" },
    { icon: Recycle, title: "Segregacja materiałów", desc: "Odzyskujemy materiały nadające się do ponownego użycia" },
    { icon: Truck, title: "Własny transport", desc: "Kompleksowy wywóz materiałów rozbiórkowych" },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero */}
      <section className="relative py-32 overflow-hidden">
        <div
          className="absolute inset-0 hero-bg"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1776594974675-b21647efe342?auto=format&fit=crop&w=1600&q=80')" }}
        />
        <div className="absolute inset-0 gradient-overlay" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-[#f0a500]/10 flex items-center justify-center">
                <Hammer className="text-[#f0a500] size-6" />
              </div>
              <span className="text-[#f0a500] font-semibold">USŁUGA</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-6">
              <span className="text-[#f0a500]">ROZBIÓRKI</span>
            </h1>
            <p className="text-[#b8c5d6] text-lg mb-8">
              Kompleksowe rozbiórki budynków i obiektów z segregacją materiałów.
              Zapewniamy bezpieczeństwo, terminowość i dbałość o środowisko.
            </p>
            <div className="flex gap-4">
              <a href="tel:+48123456789" className="btn-primary px-6 py-3 rounded-lg font-semibold text-[#0f1419] flex items-center gap-2">
                <Phone size={20} /> ZADZWOŃ
              </a>
              <Link href="/wycena" className="px-6 py-3 rounded-lg font-semibold border-2 border-[#f0a500] text-[#f0a500] hover:bg-[#f0a500] hover:text-[#0f1419] transition-all">
                WYCENA
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-16 bg-[#1a2332]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {advantages.map((adv) => (
              <div key={adv.title} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f0a500]/10 flex items-center justify-center">
                  <adv.icon className="text-[#f0a500] size-8" />
                </div>
                <h3 className="font-montserrat font-bold text-lg mb-2">{adv.title}</h3>
                <p className="text-[#b8c5d6] text-sm">{adv.desc}</p>
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
                CO <span className="text-[#f0a500]">ROBIMY</span>?
              </h2>
              <div className="space-y-3">
                {services.map((service) => (
                  <div key={service} className="flex items-center gap-3 p-4 bg-[#1a2332] rounded-lg">
                    <CheckCircle2 className="text-[#f0a500] size-5 shrink-0" />
                    <span>{service}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-montserrat font-bold mb-8">
                PROCES <span className="text-[#f0a500]">ROZBIÓRKI</span>
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#f0a500] text-[#0f1419] flex items-center justify-center font-bold shrink-0">1</div>
                  <div>
                    <h3 className="font-semibold mb-1">Wizja lokalna</h3>
                    <p className="text-sm text-[#b8c5d6]">Oględziny obiektu i ustalenie zakresu prac</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#f0a500] text-[#0f1419] flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                    <h3 className="font-semibold mb-1">Projekt rozbiórki</h3>
                    <p className="text-sm text-[#b8c5d6]">Przygotowanie harmonogramu i bezpieczeństwa</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#f0a500] text-[#0f1419] flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                    <h3 className="font-semibold mb-1">Rozbiórka</h3>
                    <p className="text-sm text-[#b8c5d6]">Realizacja zgodnie z planem</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#f0a500] text-[#0f1419] flex items-center justify-center font-bold shrink-0">4</div>
                  <div>
                    <h3 className="font-semibold mb-1">Segregacja i wywóz</h3>
                    <p className="text-sm text-[#b8c5d6]">Odzysk materiałów i utylizacja odpadów</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 bg-[#0f1419]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-montserrat font-bold text-center mb-12">
            REALIZACJE <span className="text-[#f0a500]">ROZBIÓREK</span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {gallery.map((src, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden border border-[#2a3a4a]">
                <img src={src} alt="Rozbiórki — realizacje" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#f0a500] to-[#d4940a]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-montserrat font-bold text-[#0f1419] mb-4">
            POTRZEBUJESZ ROZBIÓRKI?
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:+48123456789" className="bg-[#0f1419] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#1a2332] transition-colors flex items-center gap-2">
              <Phone size={20} /> +48 123 456 789
            </a>
            <Link href="/wycena" className="bg-white text-[#f0a500] px-8 py-4 rounded-lg font-semibold hover:bg-[#b8c5d6] transition-colors flex items-center gap-2">
              ZAPYTAJ O WYCENĘ <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
