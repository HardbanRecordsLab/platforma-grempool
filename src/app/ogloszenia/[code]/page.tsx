import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight, MapPin, Package, Phone, Clock, Eye } from "lucide-react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { ListingCard } from "@/components/public/ListingCards";
import { getPublicMaterial, getSimilarMaterials } from "@/lib/materials-server";
import { getSiteSettings } from "@/lib/site-settings-server";
import { telHref } from "@/lib/site-settings";
import { categoryOf } from "@/lib/listing-categories";
import { addedAgo, conditionLabel, formatPrice, inquiryHref } from "@/lib/listing-format";
import ListingGallery from "./ListingGallery";
import ViewCounter from "./ViewCounter";

// Stock, prices and statuses change from the admin panel at any time.
export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const item = await getPublicMaterial(code);
  if (!item) return { title: "Ogłoszenie nie istnieje" };
  const price = item.cena ? `${formatPrice(item.cena)} zł` : "cena do uzgodnienia";
  const description =
    item.opis?.slice(0, 155) ??
    `${item.nazwa} — ${conditionLabel(item.stan).toLowerCase()}, ${item.ilosc} szt., ${price}. Odbiór w Raszówce lub dowóz.`;
  return {
    title: `${item.nazwa} — ${price}`,
    description,
    alternates: { canonical: `/ogloszenia/${item.id_materialu}` },
    openGraph: {
      title: item.nazwa,
      description,
      images: item.zdjecia?.[0] ? [{ url: item.zdjecia[0] }] : undefined,
    },
  };
}

export default async function ListingPage({ params }: Props) {
  const { code } = await params;
  const [item, site] = await Promise.all([getPublicMaterial(code), getSiteSettings()]);
  if (!item) notFound();

  const similar = await getSimilarMaterials(item);
  const category = categoryOf(item.kategoria);
  const CategoryIcon = category?.icon ?? Package;
  const sold = item.status === "sprzedany";
  const reserved = item.status === "zarezerwowany";
  const ago = addedAgo(item.utworzone);

  const specs = [
    { label: "Kategoria", value: category?.label ?? item.kategoria },
    { label: "Stan", value: conditionLabel(item.stan) },
    { label: "Ilość", value: `${item.ilosc} szt.` },
    { label: "Wymiary", value: item.wymiary || "—" },
    ...(item.dlugosc ? [{ label: "Długość", value: `${item.dlugosc} m` }] : []),
    { label: "Odbiór", value: `${site.addressLocality} (plac firmy) lub dowóz` },
  ];

  return (
    <main className="min-h-screen bg-[#050505]">
      <Navbar />
      {!sold && <ViewCounter code={item.id_materialu} />}

      <section className="container mx-auto px-4 pt-8 pb-16">
        <nav aria-label="Ścieżka" className="flex flex-wrap items-center gap-1.5 text-xs text-[#e8dfcc]/60 mb-8">
          <Link href="/" className="hover:text-white transition-colors">
            Strona główna
          </Link>
          <ChevronRight size={12} />
          <Link href="/ogloszenia" className="hover:text-white transition-colors">
            Ogłoszenia
          </Link>
          <ChevronRight size={12} />
          <Link href={`/ogloszenia?kat=${item.kategoria}`} className="hover:text-white transition-colors">
            {category?.label ?? item.kategoria}
          </Link>
          <ChevronRight size={12} />
          <span className="text-[#f5b52c] truncate max-w-[50vw]">{item.nazwa}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-8 lg:gap-12">
          <ListingGallery photos={item.zdjecia ?? []} alt={item.nazwa} />

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#f5b52c]/40 text-xs font-semibold text-[#f5b52c]">
                <CategoryIcon size={13} /> {category?.label ?? item.kategoria}
              </span>
              {sold && (
                <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-white">SPRZEDANE</span>
              )}
              {reserved && (
                <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-xs font-bold text-yellow-300">
                  ZAREZERWOWANE
                </span>
              )}
              {site.demoListings && (
                <span className="px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold tracking-[0.15em] text-white/80">
                  DEMO
                </span>
              )}
            </div>

            <h1 className="font-montserrat font-bold text-3xl md:text-4xl text-white leading-tight mb-3">{item.nazwa}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#e8dfcc]/60 mb-6">
              <span className="font-mono">{item.id_materialu}</span>
              {ago && (
                <span className="flex items-center gap-1">
                  <Clock size={12} /> dodano {ago}
                </span>
              )}
              {item.wyswietlenia > 0 && (
                <span className="flex items-center gap-1">
                  <Eye size={12} /> {item.wyswietlenia} wyświetleń
                </span>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 mb-6">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#e8dfcc]/50 mb-2">Cena</div>
              {item.cena ? (
                <div className="font-montserrat font-bold text-4xl text-white leading-none">
                  {formatPrice(item.cena)}
                  <span className="ml-1.5 text-lg font-semibold text-[#f5b52c]">zł</span>
                </div>
              ) : (
                <div className="text-xl font-semibold text-[#f5b52c]">Cena do uzgodnienia</div>
              )}

              {sold ? (
                <p className="mt-5 text-sm text-[#e8dfcc]">
                  Ten towar został już sprzedany. Zadzwoń — często mamy podobne materiały na placu.
                </p>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <Link
                    href={inquiryHref(item)}
                    className="flex-1 btn-primary inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold text-black"
                  >
                    Zapytaj o ofertę <ArrowRight size={16} />
                  </Link>
                  <a
                    href={telHref(site.phone)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold border border-white/25 text-white hover:border-[#f5b52c] hover:text-[#f5b52c] transition-colors"
                  >
                    <Phone size={16} /> {site.phone}
                  </a>
                </div>
              )}
            </div>

            <dl className="rounded-2xl border border-white/10 divide-y divide-white/10 mb-6">
              {specs.map((spec) => (
                <div key={spec.label} className="flex justify-between gap-4 px-5 py-3 text-sm">
                  <dt className="text-[#e8dfcc]/70">{spec.label}</dt>
                  <dd className="text-white text-right">{spec.value}</dd>
                </div>
              ))}
            </dl>

            {item.opis && (
              <div className="mb-6">
                <h2 className="font-montserrat font-bold text-lg mb-3">Opis</h2>
                <p className="text-[#e8dfcc] leading-relaxed whitespace-pre-line">{item.opis}</p>
              </div>
            )}

            <p className="flex items-start gap-2 text-sm text-[#e8dfcc]/70">
              <MapPin size={16} className="text-[#f5b52c] shrink-0 mt-0.5" />
              {site.streetAddress}, {site.postalCode} {site.addressLocality}. Odbiór osobisty po wcześniejszym telefonie
              albo dowóz naszym transportem.
            </p>
          </div>
        </div>

        {similar.length > 0 && (
          <div className="mt-20">
            <div className="flex items-end justify-between gap-4 mb-6">
              <h2 className="font-montserrat font-bold text-2xl md:text-3xl">
                Podobne <span className="text-[#f5b52c]">ogłoszenia</span>
              </h2>
              <Link
                href={`/ogloszenia?kat=${item.kategoria}`}
                className="text-sm text-[#f5b52c] hover:underline underline-offset-4 whitespace-nowrap"
              >
                Wszystkie z kategorii →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {similar.map((m) => (
                <ListingCard key={m.id} item={m} />
              ))}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
