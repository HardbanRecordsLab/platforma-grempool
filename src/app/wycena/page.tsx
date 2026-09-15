import type { Metadata } from "next";
import WycenaClient from "./WycenaClient";

export const metadata: Metadata = {
  title: "Szybka Wycena - Zapytanie o Usługę w 24 Godziny",
  description:
    "Wypełnij formularz szybkiej wyceny - skup złomu, transport, koparka, rozbiórka, materiały budowlane lub klimatyzacja. Odpowiedź w ciągu 24 godzin.",
  alternates: { canonical: "/wycena" },
};

export default function WycenaPage() {
  return <WycenaClient />;
}
