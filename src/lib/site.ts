export const SITE_NAME = "GREMPOOL";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const BUSINESS = {
  name: "GREMPOOL",
  legalName: "GREMPOOL",
  description:
    "Skup złomu, transport, usługi koparką, rozbiórki, materiały budowlane z odzysku i klimatyzacja aut w regionie legnicko-głogowskim.",
  phone: "+48123456789",
  phoneDisplay: "+48 123 456 789",
  email: "grempool@proton.me",
  streetAddress: "ul. Kolejowa 5a",
  postalCode: "59-307",
  addressLocality: "Raszówka",
  addressRegion: "dolnośląskie",
  addressCountry: "PL",
  areaServed: ["Raszówka", "Głogów", "Legnica", "Lubin", "Polkowice", "Chocianów"],
  openingHours: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "07:00", closes: "17:00" },
    { days: ["Saturday"], opens: "08:00", closes: "14:00" },
  ],
};
