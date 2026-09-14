import Navbar from "@/components/public/Navbar";
import Hero from "@/components/public/Hero";
import Services from "@/components/public/Services";
import FeaturedMaterials from "@/components/public/FeaturedMaterials";
import Footer from "@/components/public/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Services />
      <FeaturedMaterials />

      {/* About Section */}
      <section id="o-nas" className="py-20 bg-[#1a2332]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-6">
                TWÓJ PARTNER W <span className="text-[#f0a500]">TRANSPORCIE</span>,<br />
                ZŁOMIE I USŁUGACH
              </h2>
              <p className="text-[#b8c5d6] mb-6">
                Działamy szybko, rzetelnie i w uczciwy sposób. GREMPOOL to firma z wieloletnim doświadczeniem
                w branży złomowej, transportowej i budowlanej. Naszym celem jest świadczenie usług na najwyższym
                poziomie, z zachowaniem uczciwości i terminowości.
              </p>
              <p className="text-[#b8c5d6] mb-8">
                Oferujemy kompleksowe rozwiązania - od skupu złomu, przez transport, aż po usługi budowlane
                i klimatyzację samochodową. Dzięki własnemu taborowi pojazdów i profesjonalnemu sprzętowi
                jesteśmy w stanie sprostać nawet najbardziej wymagającym zleceniom.
              </p>
              <div className="flex gap-4">
                <a href="tel:+48123456789" className="btn-primary px-6 py-3 rounded-lg font-semibold text-[#0f1419]">
                  ZADZWOŃ
                </a>
                <a href="/wycena" className="px-6 py-3 rounded-lg font-semibold border-2 border-[#f0a500] text-[#f0a500] hover:bg-[#f0a500] hover:text-[#0f1419] transition-all">
                  WYCENA ONLINE
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden border-4 border-[#f0a500]/20">
                <img
                  src="https://images.unsplash.com/photo-1761665698795-ac9df3438b74?auto=format&fit=crop&w=1200&q=80"
                  alt="GREMPOOL - koparka na złomowisku"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-[#f0a500] text-[#0f1419] p-6 rounded-xl font-montserrat font-bold">
                <div className="text-3xl">10+</div>
                <div className="text-sm">LAT DOŚWIADCZENIA</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#f0a500] to-[#d4940a]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-[#0f1419] mb-4">
            MASZ ZŁOM? ZADZWOŃ PO WYCENĘ!
          </h2>
          <p className="text-[#0f1419]/80 mb-8 text-lg">
            Zadzwoń lub napisz do nas, a przygotujemy indywidualną wycenę
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="tel:+48123456789" 
              className="bg-[#0f1419] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#1a2332] transition-colors"
            >
              +48 123 456 789
            </a>
            <a 
              href="/wycena" 
              className="bg-white text-[#f0a500] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#b8c5d6] transition-colors"
            >
              NAPISZ DO NAS →
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
