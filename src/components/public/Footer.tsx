"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Globe } from "lucide-react";
import type { SocialChannel } from "@/types";
import { getActiveSocialChannels } from "@/lib/social-channels-store";
import { telHref } from "@/lib/site-settings";
import { useSiteSettings } from "@/components/SiteSettingsProvider";

export default function Footer() {
  const site = useSiteSettings();
  const [channels, setChannels] = useState<SocialChannel[]>([]);

  useEffect(() => {
    getActiveSocialChannels().then(setChannels).catch(() => setChannels([]));
  }, []);

  return (
    <footer className="bg-[#0a0a0a] border-t border-[#5c4716]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Info */}
          <div>
            <Link href="/" className="flex items-center mb-4">
              <img src="/assets/logo-grempool.png" alt="GREMPOOL — Złom, Transport, Usługi" className="h-28 w-auto" />
            </Link>
            <p className="text-[#e8dfcc] text-sm mb-4">
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
                    className="text-[#e8dfcc] hover:text-[#f5b52c] transition-colors"
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
            <ul className="space-y-2 text-[#e8dfcc] text-sm">
              <li><Link href="/uslugi/skup-zlomu" className="hover:text-[#f5b52c] transition-colors">Skup Złomu</Link></li>
              <li><Link href="/uslugi/transport" className="hover:text-[#f5b52c] transition-colors">Transport</Link></li>
              <li><Link href="/uslugi/koparki" className="hover:text-[#f5b52c] transition-colors">Usługi Koparką</Link></li>
              <li><Link href="/uslugi/rozbiorki" className="hover:text-[#f5b52c] transition-colors">Rozbiórki</Link></li>
              <li><Link href="/uslugi/waga-najazdowa" className="hover:text-[#f5b52c] transition-colors">Waga Najazdowa 50 t</Link></li>
              <li><Link href="/ogloszenia" className="hover:text-[#f5b52c] transition-colors">Ogłoszenia</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-montserrat font-semibold mb-4">NAWIGACJA</h4>
            <ul className="space-y-2 text-[#e8dfcc] text-sm">
              <li><Link href="/" className="hover:text-[#f5b52c] transition-colors">Strona Główna</Link></li>
              <li><Link href="/wycena" className="hover:text-[#f5b52c] transition-colors">Szybka Wycena</Link></li>
              <li><Link href="/kontakt" className="hover:text-[#f5b52c] transition-colors">Kontakt</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-montserrat font-semibold mb-4">KONTAKT</h4>
            <ul className="space-y-3 text-[#e8dfcc] text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="text-[#f5b52c] size-5 shrink-0" />
                <span>{site.streetAddress}<br />{site.postalCode} {site.addressLocality}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-[#f5b52c] size-5 shrink-0" />
                <a href={telHref(site.phone)} className="hover:text-[#f5b52c] transition-colors">
                  {site.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-[#f5b52c] size-5 shrink-0" />
                <a href={`mailto:${site.email}`} className="hover:text-[#f5b52c] transition-colors">
                  {site.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#5c4716] mt-8 pt-8 text-center text-[#e8dfcc] text-sm space-y-1">
          <p>GREMPOOL Maria Muczyńska &middot; NIP 692-11-91-050 &middot; REGON 022118090</p>
          <p>&copy; {new Date().getFullYear()} GREMPOOL. Wszelkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  );
}
