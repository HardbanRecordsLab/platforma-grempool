import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GREMPOOL - Złom | Transport | Usługi",
  description: "Skup złomu, transport, usługi koparką, rozbiórki, materiały budowlane, klimatyzacja aut. Solidnie. Terminowo. Na lata.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="min-h-screen bg-[#0f1419] text-white font-sans">
        {children}
      </body>
    </html>
  );
}
