import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { Package, Phone, ArrowRight, Search, MapPin } from "lucide-react";
import Link from "next/link";

export default function MaterialyPage() {
  const categories = [
    { name: "Stal użytkowa", count: 18, items: ["Profile", "Kątowniki", "Ceowniki", "Blachy", "Pręty"] },
    { name: "Cegła", count: 7, items: ["Cegła rozbiórkowa", "Cegła klinkierowa", "Cegła pełna"] },
    { name: "Okna", count: 12, items: ["Okna PCV", "Okna drewniane", "Okna aluminiowe"] },
    { name: "Drzwi", count: 9, items: ["Drzwi wejściowe", "Drzwi wewnętrzne", "Drzwi stalowe"] },
    { name: "Inne materiały", count: 23, items: ["Kostka brukowa", "Płyty chodnikowe", "Rury", "Kable"] },
  ];

  const sampleItems = [
    { id: "MAT-000184", name: "Profil 100x100", dims: "100×100 mm", length: "4.2 m", qty: 6, price: null, status: "dostepny" },
    { id: "MAT-000185", name: "Cegła rozbiórkowa", dims: "Standard", length: null, qty: 1500, price: 0.80, status: "dostepny" },
    { id: "MAT-000186", name: "Okno PCV 120x150", dims: "120×150 cm", length: null, qty: 8, price: 250, status: "dostepny" },
    { id: "MAT-000187", name: "Drzwi stalowe", dims: "100×210 cm", length: null, qty: 3, price: 450, status: "dostepny" },
    { id: "MAT-000189", name: "Kostka brukowa", dims: "20×10 cm", length: null, qty: 500, price: 12, status: "dostepny" },
    { id: "MAT-000190", name: "Kątownik 60x60", dims: "60×60 mm", length: "6 m", qty: 20, price: null, status: "dostepny" },
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
                  <Package className="text-[#f0a500] size-6" />
                </div>
                <span className="text-[#f0a500] font-semibold">SKLEP</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-6">
                MATERIAŁY <span className="text-[#f0a500]">Z ODZYSKU</span>
              </h1>
              <p className="text-[#b8c5d6] text-lg mb-8">
                Oferujemy szeroki wybór materiałów budowlanych z odzysku w atrakcyjnych cenach. 
                Stal, cegła, okna, drzwi i wiele więcej. Sprawdź aktualną dostępność!
              </p>
              <div className="flex gap-4">
                <a href="tel:+48123456789" className="btn-primary px-6 py-3 rounded-lg font-semibold text-[#0f1419] flex items-center gap-2">
                  <Phone size={20} /> ZADZWOŃ
                </a>
                <Link href="/wycena" className="px-6 py-3 rounded-lg font-semibold border-2 border-[#f0a500] text-[#f0a500] hover:bg-[#f0a500] hover:text-[#0f1419] transition-all">
                  ZAPYTAJ O MATERIAŁ
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden border-4 border-[#f0a500]/20">
                <img src="/assets/hero-bg.jpg" alt="Materiały budowlane" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-[#1a2332]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-montserrat font-bold text-center mb-12">
            KATEGORIE <span className="text-[#f0a500]">MATERIAŁÓW</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <div key={cat.name} className="bg-[#0f1419] p-6 rounded-xl border border-[#2a3a4a] hover:border-[#f0a500]/50 transition-colors cursor-pointer">
                <Package className="text-[#f0a500] size-8 mb-3" />
                <h3 className="font-montserrat font-bold mb-1">{cat.name}</h3>
                <p className="text-[#f0a500] text-sm mb-3">{cat.count} pozycji</p>
                <div className="text-xs text-[#b8c5d6]">
                  {cat.items.slice(0, 3).join(", ")}
                  {cat.items.length > 3 && "..."}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Available Items */}
      <section className="py-16 bg-[#0f1419]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-montserrat font-bold">
              DOSTĘPNE <span className="text-[#f0a500]">MATERIAŁY</span>
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b8c5d6] size-4" />
              <input
                type="text"
                placeholder="Szukaj materiałów..."
                className="bg-[#1a2332] border border-[#2a3a4a] rounded-lg pl-10 pr-4 py-2 text-sm text-white w-64"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleItems.map((item) => (
              <div key={item.id} className="bg-[#1a2332] p-6 rounded-xl border border-[#2a3a4a] hover:border-[#f0a500]/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <span className="font-mono text-[#f0a500] text-xs">{item.id}</span>
                  <span className="px-2 py-1 rounded text-xs font-semibold bg-green-500/20 text-green-400">
                    Dostępny
                  </span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                <div className="space-y-1 text-sm text-[#b8c5d6] mb-4">
                  <div>Wymiary: <span className="text-white">{item.dims}</span></div>
                  {item.length && <div>Długość: <span className="text-white">{item.length}</span></div>}
                  <div>Ilość: <span className="text-white">{item.qty} szt.</span></div>
                </div>
                {item.price && (
                  <div className="text-xl font-bold text-[#f0a500] mb-4">
                    {item.price.toFixed(2)} zł/szt.
                  </div>
                )}
                <Link 
                  href="/wycena" 
                  className="block w-full text-center py-2 rounded-lg bg-[#2a3a4a] text-sm font-semibold hover:bg-[#f0a500] hover:text-[#0f1419] transition-colors"
                >
                  Zapytaj o ten materiał
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#f0a500] to-[#d4940a]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-montserrat font-bold text-[#0f1419] mb-4">
            SZUKASZ KONKRETNEGO MATERIAŁU?
          </h2>
          <p className="text-[#0f1419]/80 mb-8">Zadzwoń lub napisz - pomożemy znaleźć to, czego potrzebujesz</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="tel:+48123456789" className="bg-[#0f1419] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#1a2332] transition-colors flex items-center gap-2">
              <Phone size={20} /> +48 123 456 789
            </a>
            <Link href="/wycena" className="bg-white text-[#f0a500] px-8 py-4 rounded-lg font-semibold hover:bg-[#b8c5d6] transition-colors flex items-center gap-2">
              NAPISZ DO NAS <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
