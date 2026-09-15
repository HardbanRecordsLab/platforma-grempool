import type { Metadata } from "next";
import KontaktClient from "./KontaktClient";

export const metadata: Metadata = {
  title: "Kontakt - Zadzwoń lub Napisz",
  description:
    "Skontaktuj się z GREMPOOL: ul. Kolejowa 5a, 59-307 Raszówka. Telefon, email i formularz kontaktowy. Poniedziałek-Piątek 7:00-17:00, Sobota 8:00-14:00.",
  alternates: { canonical: "/kontakt" },
};

export default function KontaktPage() {
  return <KontaktClient />;
}
