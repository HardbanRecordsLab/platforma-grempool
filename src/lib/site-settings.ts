import { BUSINESS } from "@/lib/site";

// Settings the owner edits in the admin panel (Ustawienia). Stored as one
// JSON row in the site_settings table; anything missing there falls back to
// the defaults below, so a fresh database still renders the full site.

export interface TimeSlot {
  opens: string;
  closes: string;
}

export const SERVICE_PAGES = [
  { slug: "skup-zlomu", label: "Skup złomu", hasItems: true },
  { slug: "transport", label: "Transport", hasItems: false },
  { slug: "koparki", label: "Usługi koparką", hasItems: true },
  { slug: "rozbiorki", label: "Rozbiórki", hasItems: true },
  { slug: "waga-najazdowa", label: "Waga najazdowa", hasItems: false },
] as const;

export type ServicePageSlug = (typeof SERVICE_PAGES)[number]["slug"];

export interface ServicePageTexts {
  intro: string;
  items: string[];
  ctaTitle: string;
}

export interface SiteSettings {
  phone: string;
  email: string;
  streetAddress: string;
  postalCode: string;
  addressLocality: string;
  hours: {
    weekdays: TimeSlot | null;
    saturday: TimeSlot | null;
    sunday: TimeSlot | null;
  };
  announcement: {
    enabled: boolean;
    text: string;
    link: string;
  };
  demoListings: boolean;
  hero: {
    title: string;
    subtitle: string;
    benefits: string[];
    image: string;
    badgeValue: string;
    badgeLabel: string;
  };
  about: {
    paragraphs: string[];
  };
  services: Record<ServicePageSlug, ServicePageTexts>;
}

export const SITE_SETTINGS_TAG = "site-settings";

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  phone: BUSINESS.phoneDisplay,
  email: BUSINESS.email,
  streetAddress: BUSINESS.streetAddress,
  postalCode: BUSINESS.postalCode,
  addressLocality: BUSINESS.addressLocality,
  hours: {
    weekdays: { opens: "08:00", closes: "16:00" },
    saturday: { opens: "08:00", closes: "14:00" },
    sunday: null,
  },
  announcement: { enabled: false, text: "", link: "" },
  demoListings: true,
  hero: {
    title: "SKUP ZŁOMU",
    subtitle: "NA NAJWYŻSZYM POZIOMIE",
    benefits: ["Uczciwe ceny", "Własny transport", "Terminowa realizacja", "Kompleksowa obsługa"],
    image: "https://images.unsplash.com/photo-1764448726225-12da63f109e6?auto=format&fit=crop&w=1600&q=80",
    badgeValue: "10+ LAT",
    badgeLabel: "doświadczenia w branży",
  },
  about: {
    paragraphs: [
      "GREMPOOL Maria Muczyńska działa w Raszówce na Dolnym Śląsku od 2013 roku. Zaczynaliśmy od skupu złomu, a z czasem rozszerzyliśmy działalność o transport, prace koparką, rozbiórki, sprzedaż materiałów budowlanych z odzysku oraz usługi brukarsko-tynkarskie. Nasza firma jest zweryfikowana w rejestrze GUS i figuruje w ewidencji działalności gospodarczej pod numerem NIP 692-11-91-050.",
      "Obsługujemy głównie okolice Lubina, Legnicy, Głogowa i Polkowic, ale dojeżdżamy też dalej na terenie Dolnego Śląska. Mamy własny tabor pojazdów i sprzęt do prac ziemnych, więc odbiór, transport i realizację zlecenia załatwiamy sami, bez pośredników. Materiały z rozbiórek segregujemy i sprzedajemy dalej, a każde zlecenie wyceniamy indywidualnie - bez ukrytych kosztów i niespodzianek w trakcie pracy.",
    ],
  },
  services: {
    "skup-zlomu": {
      intro: "Skupujemy wszystkie rodzaje złomu stalowego i metali kolorowych. Oferujemy atrakcyjne ceny, szybki odbiór i profesjonalną obsługę.",
      items: ["Atrakcyjne ceny skupu", "Szybka wycena na podstawie zdjęć", "Własny transport - odbiór od klienta", "Negocjacje cen przy dużych ilościach", "Profesjonalna obsługa", "Elastyczne terminy odbioru"],
      ctaTitle: "MASZ ZŁOM? WYCENIMY GO!",
    },
    "transport": {
      intro: "Transportujemy ładunki różnego rodzaju - od małych po duże gabaryty. Dysponujemy własną flotą pojazdów przystosowanych do różnych typów ładunków.",
      items: [],
      ctaTitle: "POTRZEBUJESZ TRANSPORTU?",
    },
    "koparki": {
      intro: "Profesjonalne usługi koparką i koparko-ładowarką. Wykopy, niwelacje, rozbiórki i prace ziemne na najwyższym poziomie. Działamy na terenie Dolnego Śląska.",
      items: ["Wykopy fundamentowe", "Niwelacje terenu", "Korytowanie", "Przygotowanie terenu pod budowę", "Rozbiórki", "Wykop pod przyłącza", "Prace melioracyjne", "Zaplecze budowy"],
      ctaTitle: "POTRZEBUJESZ KOPARKI?",
    },
    "rozbiorki": {
      intro: "Kompleksowe rozbiórki budynków i obiektów z segregacją materiałów. Zapewniamy bezpieczeństwo, terminowość i dbałość o środowisko.",
      items: ["Wyburzanie budynków", "Rozbiórki częściowe", "Demontaż konstrukcji stalowych", "Rozbiórki fundamentów", "Demontaż dachów i więźby", "Usuwanie ścian i stropów", "Rozbiórki altan i garaży", "Przygotowanie terenu pod nową budowę"],
      ctaTitle: "POTRZEBUJESZ ROZBIÓRKI?",
    },
    "waga-najazdowa": {
      intro: "Na naszym placu przy ul. Kolejowej 5a w Raszówce stoi waga najazdowa o nośności 50 ton. Każdą dostawę ważymy na miejscu, przy kliencie - dzięki temu rozliczenie opiera się na rzeczywistej masie ładunku, a nie na szacunkach.",
      items: [],
      ctaTitle: "PRZYJEDŹ Z ŁADUNKIEM - ZWAŻYMY I ROZLICZYMY",
    },
  },
};

const str = (value: unknown, fallback: string, max = 2000) =>
  typeof value === "string" ? value.trim().slice(0, max) : fallback;

const bool = (value: unknown, fallback: boolean) => (typeof value === "boolean" ? value : fallback);

const strList = (value: unknown, fallback: string[], maxItems = 10) =>
  Array.isArray(value)
    ? value
        .filter((v): v is string => typeof v === "string")
        .map((v) => v.trim().slice(0, 2000))
        .filter(Boolean)
        .slice(0, maxItems)
    : fallback;

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

const slot = (value: unknown, fallback: TimeSlot | null): TimeSlot | null => {
  if (value === null) return null;
  if (!value || typeof value !== "object") return fallback;
  const { opens, closes } = value as Record<string, unknown>;
  return typeof opens === "string" && typeof closes === "string" && TIME.test(opens) && TIME.test(closes)
    ? { opens, closes }
    : fallback;
};

const obj = (value: unknown) => (value && typeof value === "object" ? (value as Record<string, unknown>) : {});

// Builds complete, valid settings from whatever is stored (or sent by the
// admin form): unknown keys are dropped, wrong types fall back to defaults.
export function normalizeSiteSettings(input: unknown): SiteSettings {
  const d = DEFAULT_SITE_SETTINGS;
  const raw = obj(input);
  const hours = obj(raw.hours);
  const announcement = obj(raw.announcement);
  const hero = obj(raw.hero);
  const about = obj(raw.about);
  const services = obj(raw.services);
  return {
    phone: str(raw.phone, d.phone, 40) || d.phone,
    email: str(raw.email, d.email, 120) || d.email,
    streetAddress: str(raw.streetAddress, d.streetAddress, 120) || d.streetAddress,
    postalCode: str(raw.postalCode, d.postalCode, 12) || d.postalCode,
    addressLocality: str(raw.addressLocality, d.addressLocality, 80) || d.addressLocality,
    hours: {
      weekdays: slot(hours.weekdays, d.hours.weekdays),
      saturday: slot(hours.saturday, d.hours.saturday),
      sunday: slot(hours.sunday, d.hours.sunday),
    },
    announcement: {
      enabled: bool(announcement.enabled, d.announcement.enabled),
      text: str(announcement.text, d.announcement.text, 200),
      link: str(announcement.link, d.announcement.link, 300),
    },
    demoListings: bool(raw.demoListings, d.demoListings),
    hero: {
      title: str(hero.title, d.hero.title, 60) || d.hero.title,
      subtitle: str(hero.subtitle, d.hero.subtitle, 80),
      benefits: strList(hero.benefits, d.hero.benefits, 6),
      image: str(hero.image, d.hero.image, 500) || d.hero.image,
      badgeValue: str(hero.badgeValue, d.hero.badgeValue, 20),
      badgeLabel: str(hero.badgeLabel, d.hero.badgeLabel, 60),
    },
    about: {
      paragraphs: strList(about.paragraphs, d.about.paragraphs, 6),
    },
    services: Object.fromEntries(
      SERVICE_PAGES.map(({ slug }) => {
        const raw = obj(services[slug]);
        const def = d.services[slug];
        return [
          slug,
          {
            intro: str(raw.intro, def.intro, 1000) || def.intro,
            items: strList(raw.items, def.items, 12),
            ctaTitle: str(raw.ctaTitle, def.ctaTitle, 100) || def.ctaTitle,
          },
        ];
      })
    ) as Record<ServicePageSlug, ServicePageTexts>,
  };
}

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

const shortTime = (time: string) => time.replace(/^0/, "");

// ["Pon–Pt: 8:00–16:00", "Sob: 8:00–14:00", "Ndz: nieczynne"]
export function hoursLines(settings: SiteSettings): { label: string; value: string }[] {
  const fmt = (s: TimeSlot | null) => (s ? `${shortTime(s.opens)}–${shortTime(s.closes)}` : "nieczynne");
  return [
    { label: "Poniedziałek – Piątek", value: fmt(settings.hours.weekdays) },
    { label: "Sobota", value: fmt(settings.hours.saturday) },
    { label: "Niedziela", value: fmt(settings.hours.sunday) },
  ];
}

export function openingHoursSpecification(settings: SiteSettings) {
  const days: [string[], TimeSlot | null][] = [
    [["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], settings.hours.weekdays],
    [["Saturday"], settings.hours.saturday],
    [["Sunday"], settings.hours.sunday],
  ];
  return days
    .filter(([, s]) => s)
    .map(([dayOfWeek, s]) => ({ "@type": "OpeningHoursSpecification", dayOfWeek, opens: s!.opens, closes: s!.closes }));
}
