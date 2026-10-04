import type { Metadata } from "next";
import Navbar from "@/components/public/Navbar";
import Hero from "@/components/public/Hero";
import About from "@/components/public/About";
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
      <About />
      <FeaturedMaterials />

      {/* Image band */}
      <section className="py-20 bg-[#0a0a0a]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto aspect-[21/9] rounded-2xl overflow-hidden border-4 border-[#f5b52c]/20">
            <img
              src="https://images.unsplash.com/photo-1761665698795-ac9df3438b74?auto=format&fit=crop&w=1200&q=80"
              alt="GREMPOOL - koparka na złomowisku"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#f5b52c] to-[#c98f12]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-[#000000] mb-4">
            MASZ ZŁOM? ZADZWOŃ PO WYCENĘ!
          </h2>
          <p className="text-[#000000]/80 mb-8 text-lg">
            Zadzwoń lub napisz do nas, a przygotujemy indywidualną wycenę
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="tel:+48663288533" 
              className="bg-[#000000] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#0a0a0a] transition-colors"
            >
              +48 663 288 533
            </a>
            <a 
              href="/wycena" 
              className="border-2 border-[#000000] text-[#000000] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#000000] hover:text-[#f5b52c] transition-colors"
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
