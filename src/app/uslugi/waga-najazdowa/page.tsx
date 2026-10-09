import type { Metadata } from "next";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { Scale, Phone, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { telHref } from "@/lib/site-settings";
import { getSiteSettings } from "@/lib/site-settings-server";

export const metadata: Metadata = {
  title: "Waga Najazdowa 50 Ton - Ważenie Złomu i Materiałów | Raszówka",
  description:
    "Waga najazdowa o nośności 50 ton na naszym placu w Raszówce. Ważymy złom, kruszywa i materiały z rozbiórek - rozliczenie zawsze od rzeczywistej masy ładunku.",
  alternates: { canonical: "/uslugi/waga-najazdowa" },
};

const gallery = [
  "https://images.unsplash.com/photo-1682033239272-6b60b828a9a2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1761665698795-ac9df3438b74?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1746349086423-06ea6b4d73f7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1711989691538-4c1aac2c4279?auto=format&fit=crop&w=800&q=80",
];

export default async function WagaNajazdowaPage() {
  const site = await getSiteSettings();
  const weighed = [
    { title: "Złom stalowy i metale", desc: "Ważenie przy skupie - cenę liczymy od rzeczywistej masy dostawy" },
    { title: "Kruszywa i materiały sypkie", desc: "Piasek, żwir, kamień, ziemia - kontrola masy przy załadunku i rozładunku" },
    { title: "Materiały z rozbiórek", desc: "Gruz, stal konstrukcyjna i elementy do dalszej odsprzedaży" },
    { title: "Pojazdy ciężarowe", desc: "Busy, wywrotki i zestawy - ważenie całego pojazdu z ładunkiem" },
  ];

  const steps = [
    { n: "1", title: "Wjazd na wagę", desc: "Pojazd z ładunkiem wjeżdża na platformę" },
    { n: "2", title: "Masa brutto", desc: "Odczyt masy całego pojazdu z ładunkiem" },
    { n: "3", title: "Rozładunek", desc: "Towar trafia na nasz plac" },
    { n: "4", title: "Masa netto", desc: "Ponowne ważenie i rozliczenie różnicy" },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative py-32 overflow-hidden">
        <div
          className="absolute inset-0 hero-bg"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1682033239272-6b60b828a9a2?auto=format&fit=crop&w=1600&q=80')" }}
        />
        <div className="absolute inset-0 gradient-overlay" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-[#f5b52c]/10 flex items-center justify-center">
                <Scale className="text-[#f5b52c] size-6" />
              </div>
              <span className="text-[#f5b52c] font-semibold">USŁUGA</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-montserrat font-bold mb-6">
              WAGA NAJAZDOWA <span className="text-[#f5b52c] whitespace-nowrap">50 TON</span>
            </h1>
            <p className="text-[#e8dfcc] text-lg mb-8">
              Na naszym placu przy ul. Kolejowej 5a w Raszówce stoi waga najazdowa o nośności 50 ton.
              Każdą dostawę ważymy na miejscu, przy kliencie - dzięki temu rozliczenie opiera się na
              rzeczywistej masie ładunku, a nie na szacunkach.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href={telHref(site.phone)} className="btn-primary px-6 py-3 rounded-lg font-semibold text-[#000000] flex items-center gap-2">
                <Phone size={20} /> ZADZWOŃ
              </a>
              <Link href="/wycena" className="btn-outline-gold px-6 py-3 rounded-lg font-semibold">
                UMÓW WAŻENIE
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Parameters */}
      <section className="py-16 bg-[#0a0a0a]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#000000] p-8 rounded-xl gold-frame text-center">
              <div className="text-4xl font-montserrat font-bold text-[#f5b52c] mb-2">50 t</div>
              <p className="text-[#e8dfcc] text-sm">Nośność wagi - obsłużymy zestaw z pełnym ładunkiem</p>
            </div>
            <div className="bg-[#000000] p-8 rounded-xl gold-frame text-center">
              <div className="text-4xl font-montserrat font-bold text-[#f5b52c] mb-2">Na miejscu</div>
              <p className="text-[#e8dfcc] text-sm">Ważenie na naszym placu w Raszówce, bez szukania obcej wagi</p>
            </div>
            <div className="bg-[#000000] p-8 rounded-xl gold-frame text-center">
              <div className="text-4xl font-montserrat font-bold text-[#f5b52c] mb-2">Przy kliencie</div>
              <p className="text-[#e8dfcc] text-sm">Odczyt masy widzisz razem z nami - bez niedomówień</p>
            </div>
          </div>
        </div>
      </section>

      {/* What we weigh */}
      <section className="py-16 bg-[#000000]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-montserrat font-bold text-center mb-12">
            CO <span className="text-[#f5b52c]">WAŻYMY</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {weighed.map((item) => (
              <div key={item.title} className="bg-[#1a1613] p-6 rounded-xl border border-[#5c4716] flex items-start gap-4">
                <CheckCircle2 className="text-[#f5b52c] size-6 shrink-0 mt-1" />
                <div>
                  <h3 className="font-montserrat font-bold mb-1">{item.title}</h3>
                  <p className="text-[#e8dfcc] text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-[#0a0a0a]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-montserrat font-bold text-center mb-12">
            JAK WYGLĄDA <span className="text-[#f5b52c]">WAŻENIE</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.n} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f5b52c] text-[#000000] flex items-center justify-center text-2xl font-bold">
                  {step.n}
                </div>
                <h3 className="font-montserrat font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-[#e8dfcc]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 bg-[#000000]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-montserrat font-bold text-center mb-12">
            NASZ <span className="text-[#f5b52c]">PLAC</span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {gallery.map((src, i) => (
              <div key={i} className="group aspect-square rounded-xl overflow-hidden border border-[#5c4716]">
                <img
                  src={src}
                  alt="Waga najazdowa - plac GREMPOOL"
                  className="img-brand w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#f5b52c] to-[#c98f12]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-montserrat font-bold text-[#000000] mb-4">
            PRZYJEDŹ Z ŁADUNKIEM - ZWAŻYMY I ROZLICZYMY
          </h2>
          <p className="text-[#000000]/80 mb-8">
            {site.streetAddress}, {site.postalCode} {site.addressLocality}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={telHref(site.phone)} className="bg-[#000000] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#0a0a0a] transition-colors flex items-center gap-2">
              <Phone size={20} /> {site.phone}
            </a>
            <Link href="/uslugi/skup-zlomu" className="border-2 border-[#000000] text-[#000000] px-8 py-4 rounded-lg font-semibold hover:bg-[#000000] hover:text-[#f5b52c] transition-colors flex items-center gap-2">
              SKUP ZŁOMU <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
