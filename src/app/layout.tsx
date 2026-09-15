import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_URL, BUSINESS } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase-admin";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "GREMPOOL - Skup Złomu, Transport, Usługi Koparką | Legnicko-Głogowskie",
    template: "%s | GREMPOOL",
  },
  description: BUSINESS.description,
  keywords: [
    "skup złomu",
    "transport",
    "usługi koparką",
    "rozbiórki",
    "materiały budowlane z odzysku",
    "klimatyzacja samochodowa",
    "Raszówka",
    "Głogów",
    "Legnica",
    "Lubin",
  ],
  authors: [{ name: SITE_NAME }],
  openGraph: {
    type: "website",
    locale: "pl_PL",
    siteName: SITE_NAME,
    title: "GREMPOOL - Złom | Transport | Usługi",
    description: BUSINESS.description,
    url: SITE_URL,
    images: [{ url: "/assets/logo.png", width: 1254, height: 1254, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary",
    title: "GREMPOOL - Złom | Transport | Usługi",
    description: BUSINESS.description,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/assets/logo.png",
  },
  robots: {
    index: true,
    follow: true,
  },
};

async function getSocialUrls(): Promise<string[]> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("social_channels")
      .select("url")
      .eq("aktywny", true);
    return (data ?? []).map((row) => row.url).filter(Boolean);
  } catch {
    return [];
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const socialUrls = await getSocialUrls();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#business`,
    name: BUSINESS.name,
    description: BUSINESS.description,
    url: SITE_URL,
    image: `${SITE_URL}/assets/logo.png`,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.streetAddress,
      postalCode: BUSINESS.postalCode,
      addressLocality: BUSINESS.addressLocality,
      addressRegion: BUSINESS.addressRegion,
      addressCountry: BUSINESS.addressCountry,
    },
    areaServed: BUSINESS.areaServed.map((name) => ({ "@type": "City", name })),
    openingHoursSpecification: BUSINESS.openingHours.map((spec) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: spec.days,
      opens: spec.opens,
      closes: spec.closes,
    })),
    ...(socialUrls.length > 0 ? { sameAs: socialUrls } : {}),
  };

  return (
    <html lang="pl" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="min-h-screen bg-[#0f1419] text-white font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
