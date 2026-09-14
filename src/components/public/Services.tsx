"use client";

import Link from "next/link";

const services = [
  {
    title: "SKUP ZŁOMU",
    description: "Negocjacje cen przy dużych ilościach",
    href: "/uslugi/skup-zlomu",
    image: "https://images.unsplash.com/photo-1761665698795-ac9df3438b74?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "TRANSPORT",
    description: "Busy i ciężarówki z HDS",
    href: "/uslugi/transport",
    image: "https://images.unsplash.com/photo-1682033239272-6b60b828a9a2?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "USŁUGI KOPARKĄ",
    description: "Wywóz, niwelacje, rozbiórki",
    href: "/uslugi/koparki",
    image: "https://images.unsplash.com/photo-1764448726225-12da63f109e6?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "MATERIAŁY BUDOWLANE",
    description: "Cegła, cement, kruszywa, piasek, kostka brukowa",
    href: "/uslugi/materialy",
    image: "https://images.unsplash.com/photo-1711989691538-4c1aac2c4279?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "KLIMATYZACJA AUT",
    description: "Napełnianie, czyszczenie w autach",
    href: "/uslugi/klimatyzacja",
    image: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?auto=format&fit=crop&w=600&q=80",
  },
];

export default function Services() {
  return (
    <section className="py-20 bg-[#0f1419]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-center mb-16">
          NASZE <span className="text-[#f0a500]">USŁUGI</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {services.map((service) => (
            <Link
              key={service.title}
              href={service.href}
              className="card-hover group relative rounded-xl overflow-hidden border border-[#2a3a4a] aspect-[3/4]"
            >
              <img
                src={service.image}
                alt={service.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419] via-[#0f1419]/60 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="font-montserrat font-semibold text-sm mb-1 text-white">
                  {service.title}
                </h3>
                <p className="text-[#b8c5d6] text-xs">
                  {service.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
