import type { Metadata } from "next";
import OgloszeniaClient from "./OgloszeniaClient";

export const metadata: Metadata = {
  title: "Ogłoszenia - Materiały z Rozbiórek, Maszyny i Sprzęt",
  description:
    "Giełda GREMPOOL: stal użytkowa, cegła, okna, drzwi, kruszywa, drewno, maszyny i sprzęt z placu w Raszówce. Odbiór osobisty lub dowóz na Dolnym Śląsku.",
  alternates: { canonical: "/ogloszenia" },
};

export default function OgloszeniaPage() {
  return <OgloszeniaClient />;
}
