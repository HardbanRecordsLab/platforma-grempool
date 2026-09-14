import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { Recycle, Truck, Anchor, Wrench, Package, Snowflake, Phone, ArrowRight } from "lucide-react";
import Link from "next/link";

const services = [
  {
    icon: Recycle,
    title: "SKUP ZŁOMU",
    description: "Skupujemy wszystkie rodzaje złomu stalowego i metali kolorowych. Oferujemy atrakcyjne ceny i szybki odbiór.",
    features: ["Stal', 'Metale kolorowe", "Duże ilości", "Negocjacje cen", "Własny transport"],
    href: "/uslugi/skup-zlomu",
  },
  {
    icon: Truck,
    title: "TRANSPORT",
    description: "Transportujemy ładunki各行各yd - od małych po duże gabaryty. Busy, ciężarówki z HDS.",
    features: ["Busy krótkie i długie", "Ciężarówki z HDS", "Wywrotki", "Transport aut"],
    href: "/uslugi/transport",
  },
  {
    icon: Anchor,
    title: "USŁUGI KOPARKĄ",
    description: "Profesjonalne usługi koparką - wykopy, niwelacje, rozbiórki i prace ziemne.",
    features: ["Wykopy fundamentowe", "Niwelacje terenu", "Rozbiórki", "Prace ziemne"],
    href: "/uslugi/koparki",
  },
  {
    icon: Wrench,
    title: "ROZBIÓRKI",
    description: "Kompleksowe rozbiórki budynków i obiektów z segregacją materiałów.",
    features: ["Budynki", "Garaże", "Altany", "Segregacja materiałów"],
    href: "/uslugi/rozbiorki",
  },
  {
    icon: Package,
    title: "MATERIAŁY BUDOWLANE",
    description: "Sprzedaż materiałów z odzysku - stal, cegła, okna, drzwi i więcej.",
    features: ["Stal użytkowa", "Cegła", "Okna i drzwi", "Kostka brukowa"],
    href: "/uslugi/materialy",
  },
  {
    icon: Snowflake,
    title: "KLIMATYZACJA AUT",
    description: "Napełnianie, czyszczenie i diagnostyka klimatyzacji w samochodach.",
    features: ["Napełnianie", "Czyszczenie", "Diagnostyka", "Wszystkie typy aut"],
    href: "/uslugi/klimatyzacja",
  },
];

export default function UslugiPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero */}
      <section className="py-20 bg-[#0f1419]">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-4">
            NASZE <span className="text-[#f0a500]">USŁUGI</span>
          </h1>
          <p className="text-[#b8c5d6] text-lg max-w-2xl mx-auto">
            Kompleksowe rozwiązania w branży złomowej, transportowej i budowlanej. 
            Wybierz interesującą Cię usługę i dowiedz się więcej.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 bg-[#1a2332]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Link
                key={service.title}
                href={service.href}
                className="card-hover bg-[#0f1419] p-8 rounded-2xl border border-[#2a3a4a] group"
              >
                <div className="w-16 h-16 mb-6 rounded-xl bg-[#f0a500]/10 flex items-center justify-center group-hover:bg-[#f0a500]/20 transition-colors">
                  <service.icon className="text-[#f0a500] size-8" />
                </div>
                <h2 className="text-xl font-montserrat font-bold mb-3">
                  {service.title}
                </h2>
                <p className="text-[#b8c5d6] text-sm mb-6">
                  {service.description}
                </p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-[#b8c5d6]">
                      <div className="w-1.5 h-1.5 bg-[#f0a500] rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 text-[#f0a500] font-semibold text-sm group-hover:gap-4 transition-all">
                  Dowiedz się więcej <ArrowRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#f0a500] to-[#d4940a]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-montserrat font-bold text-[#0f1419] mb-4">
            POTRZEBUJESZ WYCENY?
          </h2>
          <p className="text-[#0f1419]/80 mb-8">
            Skontaktuj się z nami lub wypełnij formularz szybkiej wyceny
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:+48123456789" className="bg-[#0f1419] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#1a2332] transition-colors flex items-center gap-2">
              <Phone size={20} /> +48 123 456 789
            </a>
            <Link href="/wycena" className="bg-white text-[#f0a500] px-8 py-4 rounded-lg font-semibold hover:bg-[#b8c5d6] transition-colors">
              SZYBKA WYCENA
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
