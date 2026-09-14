import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { Recycle, Phone, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function SkupZlomuPage() {
  const materials = [
    "Stal węglowa",
    "Stal nierdzewna",
    "Żeliwo",
    "Miedź",
    "Aluminium",
    "Ołów",
    "Cynk",
    "Brąz",
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
      <section className="relative py-20 bg-[#0f1419]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
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
                <a href="tel:+48123456789" className="btn-primary px-6 py-3 rounded-lg font-semibold text-[#0f1419] flex items-center gap-2">
                  <Phone size={20} /> ZADZWOŃ
                </a>
                <Link href="/wycena" className="px-6 py-3 rounded-lg font-semibold border-2 border-[#f0a500] text-[#f0a500] hover:bg-[#f0a500] hover:text-[#0f1419] transition-all">
                  SZYBKA WYCENA
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden border-4 border-[#f0a500]/20">
                <img src="https://images.unsplash.com/photo-1761665698795-ac9df3438b74?auto=format&fit=crop&w=1200&q=80" alt="Skup złomu" className="w-full h-full object-cover" />
              </div>
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
              <div key={material} className="bg-[#0f1419] p-4 rounded-xl border border-[#2a3a4a] text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#f0a500]/10 flex items-center justify-center">
                  <Recycle className="text-[#f0a500] size-6" />
                </div>
                <span className="text-sm font-semibold">{material}</span>
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
            <a href="tel:+48123456789" className="bg-[#0f1419] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#1a2332] transition-colors flex items-center gap-2">
              <Phone size={20} /> +48 123 456 789
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
