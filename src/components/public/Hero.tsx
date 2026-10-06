import Link from "next/link";
import { CheckCircle2, Recycle, Truck, HardHat, Scale, Boxes } from "lucide-react";

const benefits = ["Uczciwe ceny", "Własny transport", "Terminowa realizacja", "Kompleksowa obsługa"];

const strip = [
  { icon: Recycle, title: "SKUP ZŁOMU", description: "Negocjacje cen przy dużych ilościach", href: "/uslugi/skup-zlomu" },
  { icon: Truck, title: "TRANSPORT", description: "Busy i ciężarówki z HDS", href: "/uslugi/transport" },
  { icon: HardHat, title: "USŁUGI KOPARKĄ", description: "Wywóz, niwelacje, rozbiórki", href: "/uslugi/koparki" },
  { icon: Scale, title: "WAGA NAJAZDOWA 50 T", description: "Ważenie złomu i materiałów na miejscu", href: "/uslugi/waga-najazdowa" },
  { icon: Boxes, title: "MATERIAŁY BUDOWLANE", description: "Cegła, cement, kruszywa, piasek, kostka brukowa", href: "/ogloszenia" },
];

export default function Hero() {
  return (
    <section className="relative bg-[#000000] overflow-hidden">
      <div className="absolute inset-y-0 right-0 w-full lg:w-[64%]">
        <img
          src="https://images.unsplash.com/photo-1764448726225-12da63f109e6?auto=format&fit=crop&w=1600&q=80"
          alt="Koparka z kruszarką podczas rozbiórki"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#000] via-[#000]/20 to-transparent lg:via-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#000] to-transparent" />
      </div>
      <div className="pointer-events-none absolute top-[-15%] left-[52%] h-[140%] w-px rotate-[32deg] bg-gradient-to-b from-transparent via-[#f5b52c] to-transparent" />

      <div className="relative container mx-auto px-4 pt-16 pb-12 min-h-[560px] md:min-h-[620px] flex flex-col">
        <div className="max-w-xl">
          <h1 className="font-montserrat font-bold leading-tight mb-6">
            <span className="block text-white text-4xl md:text-5xl">SKUP ZŁOMU</span>
            <span className="block text-[#f5b52c] text-2xl md:text-3xl mt-2 tracking-wide">
              NA NAJWYŻSZYM POZIOMIE
            </span>
          </h1>

          <ul className="space-y-3 mb-10">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 text-[#e8dfcc]">
                <CheckCircle2 className="text-[#f5b52c] size-5 shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-5">
            <Link
              href="/wycena"
              className="border-2 border-[#f5b52c] text-[#f5b52c] hover:bg-[#f5b52c] hover:text-[#000000] px-8 py-4 rounded-md font-semibold tracking-wide transition-colors"
            >
              SPRAWDŹ OFERTĘ
            </Link>
            <div className="border border-[#f5b52c]/40 px-4 py-2 rounded-md text-xs text-[#e8dfcc] leading-snug">
              <span className="block text-[#f5b52c] font-bold text-lg">10+ LAT</span>
              doświadczenia w branży
            </div>
          </div>
        </div>

        <div className="mt-auto pt-16">
          <div className="border border-[#f5b52c]/40 rounded-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-[#f5b52c]/25 bg-[#000000]/80 backdrop-blur-sm">
            {strip.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group flex flex-col items-center text-center gap-3 px-5 py-7 hover:bg-[#f5b52c]/5 transition-colors"
              >
                <item.icon className="text-[#f5b52c] size-9" strokeWidth={1.5} />
                <span className="text-[#f5b52c] font-montserrat font-bold text-sm tracking-wide">{item.title}</span>
                <span className="text-xs text-[#e8dfcc] leading-snug">{item.description}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
