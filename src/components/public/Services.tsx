"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import type { CustomService } from "@/types";
import { getActiveCustomServices } from "@/lib/custom-services-store";

const coreServices = [
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
    title: "WAGA NAJAZDOWA 50 T",
    description: "Ważenie złomu i materiałów na miejscu",
    href: "/uslugi/waga-najazdowa",
    image: "https://images.unsplash.com/photo-1746349086423-06ea6b4d73f7?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "MATERIAŁY BUDOWLANE",
    description: "Cegła, cement, kruszywa, piasek, kostka brukowa",
    href: "/ogloszenia",
    image: "https://images.unsplash.com/photo-1711989691538-4c1aac2c4279?auto=format&fit=crop&w=600&q=80",
  },
];

export default function Services() {
  const [extraServices, setExtraServices] = useState<CustomService[]>([]);

  useEffect(() => {
    getActiveCustomServices().then(setExtraServices).catch(() => setExtraServices([]));
  }, []);

  return (
    <section className="py-20 bg-[#000000]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-montserrat font-bold text-center mb-16">
          NASZE <span className="text-[#f5b52c]">USŁUGI</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreServices.map((service) => (
            <Link
              key={service.title}
              href={service.href}
              className="card-hover group relative rounded-xl overflow-hidden border border-[#5c4716] aspect-[3/4]"
            >
              <img
                src={service.image}
                alt={service.title}
                className="img-brand absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/60 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="font-montserrat font-semibold text-sm mb-1 text-white">
                  {service.title}
                </h3>
                <p className="text-[#e8dfcc] text-xs">
                  {service.description}
                </p>
              </div>
            </Link>
          ))}

          {extraServices.map((service) => (
            <Link
              key={service.id}
              href={service.href || "/wycena"}
              className="card-hover group relative rounded-xl overflow-hidden border border-[#5c4716] aspect-[3/4]"
            >
              {service.zdjecie ? (
                <img
                  src={service.zdjecie}
                  alt={service.nazwa}
                  className="img-brand absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 bg-[#0a0a0a] flex items-center justify-center">
                  <Package className="text-[#5c4716] size-10" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/60 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <h3 className="font-montserrat font-semibold text-sm mb-1 text-white">
                  {service.nazwa.toUpperCase()}
                </h3>
                {service.opis && <p className="text-[#e8dfcc] text-xs">{service.opis}</p>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
