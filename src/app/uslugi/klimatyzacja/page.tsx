import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { Snowflake, Phone, ArrowRight, CheckCircle2, Thermometer, Wind, Wrench } from "lucide-react";
import Link from "next/link";

const gallery = [
  "https://images.unsplash.com/photo-1742445134000-339f7e711477?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1560024253-0a0dd047818e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1656958258484-7ee6452cfd92?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1750800668889-aa4c851bd7a8?auto=format&fit=crop&w=800&q=80",
];

export default function KlimatyzacjaPage() {
  const services = [
    { icon: Thermometer, title: "Napełnianie klimatyzacji", desc: "Profesjonalne napełnianie układu chłodniczego czynnikiem R134a lub R1234yf" },
    { icon: Wind, title: "Czyszczenie klimatyzacji", desc: "Ozonowanie i czyszczenie układu, usuwanie nieprzyjemnych zapachów" },
    { icon: Wrench, title: "Diagnostyka", desc: "Kompleksowa diagnostyka układu klimatyzacji, wykrywanie nieszczelności" },
  ];

  const vehicleTypes = [
    "Samochody osobowe",
    "Samochody dostawcze",
    "Ciężarówki",
    "Maszyny budowlane",
  ];

  const benefits = [
    "Szybka obsługa - do 60 minut",
    "Czynnik R134a i R1234yf",
    "Gwarancja na usługę",
    "Przystępne ceny",
    "Dojazd do klienta",
    "Profesjonalny sprzęt",
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero */}
      <section className="relative py-32 overflow-hidden">
        <div
          className="absolute inset-0 hero-bg"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=1600&q=80')" }}
        />
        <div className="absolute inset-0 gradient-overlay" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-[#f0a500]/10 flex items-center justify-center">
                <Snowflake className="text-[#f0a500] size-6" />
              </div>
              <span className="text-[#f0a500] font-semibold">USŁUGA</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-6">
              KLIMATYZACJA <span className="text-[#f0a500]">AUT</span>
            </h1>
            <p className="text-[#b8c5d6] text-lg mb-8">
              Napełnianie, czyszczenie i diagnostyka klimatyzacji w samochodach osobowych,
              dostawczych i ciężarowych. Zapewniamy komfort jazdy przez cały rok.
            </p>
            <div className="flex gap-4">
              <a href="tel:+48123456789" className="btn-primary px-6 py-3 rounded-lg font-semibold text-[#0f1419] flex items-center gap-2">
                <Phone size={20} /> ZADZWOŃ
              </a>
              <Link href="/wycena" className="px-6 py-3 rounded-lg font-semibold border-2 border-[#f0a500] text-[#f0a500] hover:bg-[#f0a500] hover:text-[#0f1419] transition-all">
                UMÓW WIZYTĘ
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-[#1a2332]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-montserrat font-bold text-center mb-12">
            NASZE <span className="text-[#f0a500]">USŁUGI</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => (
              <div key={service.title} className="bg-[#0f1419] p-8 rounded-xl border border-[#2a3a4a] text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f0a500]/10 flex items-center justify-center">
                  <service.icon className="text-[#f0a500] size-8" />
                </div>
                <h3 className="font-montserrat font-bold text-lg mb-3">{service.title}</h3>
                <p className="text-[#b8c5d6] text-sm">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicle Types & Benefits */}
      <section className="py-16 bg-[#0f1419]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-montserrat font-bold mb-8">
                OBSŁUGIWANE <span className="text-[#f0a500]">POJAZDY</span>
              </h2>
              <div className="space-y-3">
                {vehicleTypes.map((type) => (
                  <div key={type} className="flex items-center gap-3 p-4 bg-[#1a2332] rounded-lg">
                    <CheckCircle2 className="text-[#f0a500] size-5 shrink-0" />
                    <span>{type}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-montserrat font-bold mb-8">
                DLACZEGO <span className="text-[#f0a500]">MY</span>?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3 p-4 bg-[#1a2332] rounded-lg">
                    <CheckCircle2 className="text-[#f0a500] size-5 shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 bg-[#1a2332]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-montserrat font-bold text-center mb-12">
            JAK <span className="text-[#f0a500]">DZIAŁA</span> KLIMATYZACJA?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f0a500] text-[#0f1419] flex items-center justify-center text-2xl font-bold">1</div>
              <h3 className="font-montserrat font-bold mb-2">Diagnostyka</h3>
              <p className="text-sm text-[#b8c5d6]">Sprawdzenie stanu układu</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f0a500] text-[#0f1419] flex items-center justify-center text-2xl font-bold">2</div>
              <h3 className="font-montserrat font-bold mb-2">Czyszczenie</h3>
              <p className="text-sm text-[#b8c5d6]">Ozonowanie i dezynfekcja</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f0a500] text-[#0f1419] flex items-center justify-center text-2xl font-bold">3</div>
              <h3 className="font-montserrat font-bold mb-2">Napełnianie</h3>
              <p className="text-sm text-[#b8c5d6]">Uzupełnienie czynnika chłodzącego</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f0a500] text-[#0f1419] flex items-center justify-center text-2xl font-bold">4</div>
              <h3 className="font-montserrat font-bold mb-2">Testowanie</h3>
              <p className="text-sm text-[#b8c5d6]">Weryfikacja poprawności działania</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 bg-[#0f1419]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-montserrat font-bold text-center mb-12">
            NASZ <span className="text-[#f0a500]">WARSZTAT</span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {gallery.map((src, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden border border-[#2a3a4a]">
                <img src={src} alt="Klimatyzacja — realizacje" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#f0a500] to-[#d4940a]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-montserrat font-bold text-[#0f1419] mb-4">
            POTRZEBUJESZ KLIMATYZACJI?
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:+48123456789" className="bg-[#0f1419] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#1a2332] transition-colors flex items-center gap-2">
              <Phone size={20} /> +48 123 456 789
            </a>
            <Link href="/wycena" className="bg-white text-[#f0a500] px-8 py-4 rounded-lg font-semibold hover:bg-[#b8c5d6] transition-colors flex items-center gap-2">
              UMÓW WIZYTĘ <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
