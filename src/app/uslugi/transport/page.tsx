import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { Truck, Phone, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function TransportPage() {
  const vehicles = [
    { name: "Bus krótki", capacity: "do 1.5 tony", use: "Przesyłki, małe ładunki" },
    { name: "Bus długi", capacity: "do 3 ton", use: "Większe ładunki, meble" },
    { name: "Wywrotka", capacity: "do 10 ton", use: "Materiały sypkie, złom" },
    { name: "Ciężarówka z plandeką", capacity: "do 24 ton", use: "Duże ładunki, transport daleki" },
    { name: "Transport aut", capacity: "Pomoc drogowa", use: "Laweta, transport pojazdów" },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero */}
      <section className="py-20 bg-[#0f1419]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-[#f0a500]/10 flex items-center justify-center">
                  <Truck className="text-[#f0a500] size-6" />
                </div>
                <span className="text-[#f0a500] font-semibold">USŁUGA</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-6">
                <span className="text-[#f0a500]">TRANSPORT</span>
              </h1>
              <p className="text-[#b8c5d6] text-lg mb-8">
                Transportujemy ładunki各行各yd - od małych po duże gabaryty. 
                Dysponujemy własną flotą pojazdów przystosowanych do różnych typów ładunków.
              </p>
              <div className="flex gap-4">
                <a href="tel:+48123456789" className="btn-primary px-6 py-3 rounded-lg font-semibold text-[#0f1419] flex items-center gap-2">
                  <Phone size={20} /> ZADZWOŃ
                </a>
                <Link href="/wycena" className="px-6 py-3 rounded-lg font-semibold border-2 border-[#f0a500] text-[#f0a500] hover:bg-[#f0a500] hover:text-[#0f1419] transition-all">
                  WYCENA TRASY
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden border-4 border-[#f0a500]/20">
                <img src="https://images.unsplash.com/photo-1682033239272-6b60b828a9a2?auto=format&fit=crop&w=1200&q=80" alt="Transport" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vehicles */}
      <section className="py-16 bg-[#1a2332]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-montserrat font-bold text-center mb-12">
            NASZA <span className="text-[#f0a500]">FLOTA</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div key={vehicle.name} className="bg-[#0f1419] p-6 rounded-xl border border-[#2a3a4a]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-[#f0a500]/10 flex items-center justify-center">
                    <Truck className="text-[#f0a500] size-6" />
                  </div>
                  <div>
                    <h3 className="font-montserrat font-bold">{vehicle.name}</h3>
                    <p className="text-sm text-[#f0a500]">{vehicle.capacity}</p>
                  </div>
                </div>
                <p className="text-[#b8c5d6] text-sm">{vehicle.use}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 bg-[#0f1419]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-montserrat font-bold text-center mb-12">
            JAK <span className="text-[#f0a500]">ZAMÓWIĆ</span> TRANSPORT?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f0a500] text-[#0f1419] flex items-center justify-center text-2xl font-bold">1</div>
              <h3 className="font-montserrat font-bold mb-2">Kontakt</h3>
              <p className="text-sm text-[#b8c5d6]">Zadzwoń lub wypełnij formularz</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f0a500] text-[#0f1419] flex items-center justify-center text-2xl font-bold">2</div>
              <h3 className="font-montserrat font-bold mb-2">Wycena</h3>
              <p className="text-sm text-[#b8c5d6]">Podaj trasę i ładunek</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f0a500] text-[#0f1419] flex items-center justify-center text-2xl font-bold">3</div>
              <h3 className="font-montserrat font-bold mb-2">Transport</h3>
              <p className="text-sm text-[#b8c5d6]">Odbiór i dowóz ładunku</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f0a500] text-[#0f1419] flex items-center justify-center text-2xl font-bold">4</div>
              <h3 className="font-montserrat font-bold mb-2">Płatność</h3>
              <p className="text-sm text-[#b8c5d6]">Gotówka lub przelew</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#f0a500] to-[#d4940a]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-montserrat font-bold text-[#0f1419] mb-4">
            POTRZEBUJESZ TRANSPORTU?
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
