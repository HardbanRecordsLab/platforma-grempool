import type { Metadata } from "next";
import RealizacjeClient from "./RealizacjeClient";

export const metadata: Metadata = {
  title: "Realizacje - Zobacz Nasze Wykonane Prace",
  description:
    "Portfolio wykonanych prac GREMPOOL: rozbiórki, prace koparką, transport, skup złomu. Zdjęcia przed, w trakcie i po realizacji.",
  alternates: { canonical: "/realizacje" },
};

export default function RealizacjePage() {
  return <RealizacjeClient />;
}
