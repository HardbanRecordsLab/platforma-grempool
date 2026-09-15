import type { Metadata } from "next";
import MaterialyClient from "./MaterialyClient";

export const metadata: Metadata = {
  title: "Materiały Budowlane z Odzysku - Stal, Cegła, Okna, Drzwi",
  description:
    "Sklep z materiałami budowlanymi z odzysku: stal użytkowa, cegła, okna, drzwi, kostka brukowa. Aktualna dostępność z naszego placu.",
  alternates: { canonical: "/uslugi/materialy" },
};

export default function MaterialyPage() {
  return <MaterialyClient />;
}
