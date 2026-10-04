import type { Metadata } from "next";
import Navbar from "@/components/public/Navbar";
import Hero from "@/components/public/Hero";
import Services from "@/components/public/Services";
import FeaturedMaterials from "@/components/public/FeaturedMaterials";
import Footer from "@/components/public/Footer";

export const metadata: Metadata = {
  title: "GREMPOOL - Skup Złomu, Transport, Usługi Koparką | Legnicko-Głogowskie",
  description:
    "Skup złomu, transport, usługi koparką, rozbiórki, waga najazdowa 50 ton, materiały budowlane z odzysku. Solidnie. Terminowo. Na lata. Region legnicko-głogowski.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Services />
      <FeaturedMaterials />

      {/* Image band */}
      <section className="py-20 bg-[#141210]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto aspect-[21/9] rounded-2xl overflow-hidden border-4 border-[#d4a24a]/20">
            <img
              src="https://images.unsplash.com/photo-1761665698795-ac9df3438b74?auto=format&fit=crop&w=1200&q=80"
              alt="GREMPOOL - koparka na złomowisku"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#d4a24a] to-[#a97c2b]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-[#0b0b0a] mb-4">
            MASZ ZŁOM? ZADZWOŃ PO WYCENĘ!
          </h2>
          <p className="text-[#0b0b0a]/80 mb-8 text-lg">
            Zadzwoń lub napisz do nas, a przygotujemy indywidualną wycenę
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="tel:+48663288533" 
              className="bg-[#0b0b0a] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#141210] transition-colors"
            >
              +48 663 288 533
            </a>
            <a 
              href="/wycena" 
              className="border-2 border-[#0b0b0a] text-[#0b0b0a] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#0b0b0a] hover:text-[#d4a24a] transition-colors"
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
