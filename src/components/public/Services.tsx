"use client";

import Link from "next/link";
import { Truck, Anchor, Wrench, Package, Snowflake, Recycle } from "lucide-react";

const services = [
  {
    icon: Recycle,
    title: "SKUP ZŁOMU",
    description: "Negocjacje cen przy dużych ilościach",
    href: "/uslugi/skup-zlomu",
  },
  {
    icon: Truck,
    title: "TRANSPORT",
    description: "Busy i ciężarówki z HDS",
    href: "/uslugi/transport",
  },
  {
    icon: Anchor,
    title: "USŁUGI KOPARKĄ",
    description: "Wywóz, niwelacje, rozbiórki",
    href: "/uslugi/koparki",
  },
  {
    icon: Package,
    title: "MATERIAŁY BUDOWLANE",
    description: "Cegła, cement, kruszywa, piasek, kostka brukowa",
    href: "/uslugi/materialy",
  },
  {
    icon: Snowflake,
    title: "KLIMATYZACJA AUT",
    description: "Napełnianie, czyszczenie w autach",
    href: "/uslugi/klimatyzacja",
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
              className="card-hover bg-[#1a2332] p-6 rounded-xl border border-[#2a3a4a] text-center group"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f0a500]/10 flex items-center justify-center group-hover:bg-[#f0a500]/20 transition-colors">
                <service.icon className="text-[#f0a500] size-8" />
              </div>
              <h3 className="font-montserrat font-semibold text-sm mb-2">
                {service.title}
              </h3>
              <p className="text-[#b8c5d6] text-xs">
                {service.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
