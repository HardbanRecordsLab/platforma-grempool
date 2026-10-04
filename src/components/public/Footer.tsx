"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Globe } from "lucide-react";
import type { SocialChannel } from "@/types";
import { getActiveSocialChannels } from "@/lib/social-channels-store";
import { BUSINESS } from "@/lib/site";

export default function Footer() {
  const [channels, setChannels] = useState<SocialChannel[]>([]);

  useEffect(() => {
    getActiveSocialChannels().then(setChannels).catch(() => setChannels([]));
  }, []);

  return (
    <footer className="bg-[#141210] border-t border-[#352c1d]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Info */}
          <div>
            <Link href="/" className="flex items-center mb-4">
              <img src="/assets/logo-grempool.png" alt="GREMPOOL — Złom, Transport, Usługi" className="h-28 w-auto" />
            </Link>
            <p className="text-[#c3b9a7] text-sm mb-4">
              Twój partner w transporcie, rozbiórkach i usługach.
            </p>
            {channels.length > 0 && (
              <div className="flex gap-4">
                {channels.map((channel) => (
                  <a
                    key={channel.id}
                    href={channel.url}
                    target="_blank"
                    rel="noreferrer"
                    title={channel.nazwa}
                    className="text-[#c3b9a7] hover:text-[#d4a24a] transition-colors"
                  >
                    <Globe size={20} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Services */}
          <div>
            <h4 className="font-montserrat font-semibold mb-4">USŁUGI</h4>
            <ul className="space-y-2 text-[#c3b9a7] text-sm">
              <li><Link href="/uslugi/skup-zlomu" className="hover:text-[#d4a24a] transition-colors">Skup Złomu</Link></li>
              <li><Link href="/uslugi/transport" className="hover:text-[#d4a24a] transition-colors">Transport</Link></li>
              <li><Link href="/uslugi/koparki" className="hover:text-[#d4a24a] transition-colors">Usługi Koparką</Link></li>
              <li><Link href="/uslugi/rozbiorki" className="hover:text-[#d4a24a] transition-colors">Rozbiórki</Link></li>
              <li><Link href="/uslugi/waga-najazdowa" className="hover:text-[#d4a24a] transition-colors">Waga Najazdowa 50 t</Link></li>
              <li><Link href="/uslugi/materialy" className="hover:text-[#d4a24a] transition-colors">Materiały Budowlane</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-montserrat font-semibold mb-4">NAWIGACJA</h4>
            <ul className="space-y-2 text-[#c3b9a7] text-sm">
              <li><Link href="/" className="hover:text-[#d4a24a] transition-colors">Strona Główna</Link></li>
              <li><Link href="/wycena" className="hover:text-[#d4a24a] transition-colors">Szybka Wycena</Link></li>
              <li><Link href="/kontakt" className="hover:text-[#d4a24a] transition-colors">Kontakt</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-montserrat font-semibold mb-4">KONTAKT</h4>
            <ul className="space-y-3 text-[#c3b9a7] text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="text-[#d4a24a] size-5 shrink-0" />
                <span>ul. Kolejowa 5a<br />59-307 Raszówka</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-[#d4a24a] size-5 shrink-0" />
                <a href="tel:+48663288533" className="hover:text-[#d4a24a] transition-colors">
                  +48 663 288 533
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-[#d4a24a] size-5 shrink-0" />
                <a href={`mailto:${BUSINESS.email}`} className="hover:text-[#d4a24a] transition-colors">
                  {BUSINESS.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#352c1d] mt-8 pt-8 text-center text-[#c3b9a7] text-sm space-y-1">
          <p>GREMPOOL Maria Muczyńska &middot; NIP 692-11-91-050 &middot; REGON 022118090</p>
          <p>&copy; {new Date().getFullYear()} GREMPOOL. Wszelkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  );
}
