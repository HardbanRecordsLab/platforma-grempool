import type { Metadata } from "next";
import UslugiClient from "./UslugiClient";

export const metadata: Metadata = {
  title: "Nasze Usługi - Złom, Transport, Koparki, Rozbiórki, Materiały",
  description:
    "Kompleksowe rozwiązania w branży złomowej, transportowej i budowlanej: skup złomu, transport, usługi koparką, rozbiórki, materiały budowlane, klimatyzacja aut.",
  alternates: { canonical: "/uslugi" },
};

export default function UslugiPage() {
  return <UslugiClient />;
}
