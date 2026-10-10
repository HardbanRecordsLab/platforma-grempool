import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { BUSINESS } from "@/lib/site";
import { getSiteSettings } from "@/lib/site-settings-server";
import { telHref } from "@/lib/site-settings";
import { PRIVACY_POLICY_PATH, PRIVACY_POLICY_UPDATED } from "@/lib/privacy";

export const metadata: Metadata = {
  title: "Polityka prywatności",
  description:
    "Jakie dane osobowe zbiera GREMPOOL, w jakim celu, jak długo je przechowuje i jakie prawa przysługują osobom, których dane dotyczą.",
  alternates: { canonical: PRIVACY_POLICY_PATH },
};

// NOTE: this is a legal text. The facts (what data is collected, which
// providers are used, retention periods) match how the site works today and
// should be re-read together with the code whenever either changes. Bump
// PRIVACY_POLICY_VERSION in src/lib/privacy.ts when the text changes.

const SECTIONS = [
  { id: "administrator", title: "Kto jest administratorem Twoich danych" },
  { id: "dane", title: "Jakie dane przetwarzamy i dlaczego" },
  { id: "zdjecia", title: "Zdjęcia dołączane do zapytań" },
  { id: "odbiorcy", title: "Komu przekazujemy dane" },
  { id: "cookies", title: "Pliki cookies i pamięć przeglądarki" },
  { id: "prawa", title: "Twoje prawa" },
  { id: "dobrowolnosc", title: "Czy musisz podawać dane" },
  { id: "bezpieczenstwo", title: "Jak chronimy dane" },
  { id: "zmiany", title: "Zmiany polityki" },
] as const;

interface Purpose {
  title: string;
  data: string;
  goal: string;
  basis: string;
  time: string;
}

const PURPOSES: Purpose[] = [
  {
    title: "Formularz „Wycena” (zapytanie o usługę lub towar)",
    data: "imię i nazwisko, telefon, e-mail (jeśli go podasz), lokalizacja, opis zlecenia, preferowany termin, zdjęcia (jeśli je dodasz), numer ogłoszenia, jeśli pytasz o konkretny towar",
    goal: "odpowiedź na zapytanie, przygotowanie wyceny, ustalenie szczegółów realizacji",
    basis:
      "art. 6 ust. 1 lit. b RODO (działania podejmowane na Twoje żądanie przed zawarciem umowy) oraz lit. f (nasz uzasadniony interes: obsługa zapytań i obrona przed ewentualnymi roszczeniami)",
    time:
      "do zakończenia obsługi zapytania, a następnie przez czas, w którym można dochodzić roszczeń (do 3 lat); jeśli dojdzie do realizacji zlecenia — do upływu terminów wynikających z przepisów podatkowych i rachunkowych",
  },
  {
    title: "Formularz kontaktowy",
    data: "imię, nazwisko, e-mail, telefon (jeśli go podasz), temat i treść wiadomości",
    goal: "odpowiedź na Twoją wiadomość",
    basis: "art. 6 ust. 1 lit. f RODO (nasz uzasadniony interes: komunikacja z osobami, które się z nami kontaktują)",
    time: "do zakończenia sprawy, a następnie do 3 lat (okres, w którym można dochodzić roszczeń)",
  },
  {
    title: "Kontakt telefoniczny lub e-mailowy",
    data: "numer telefonu lub adres e-mail, treść rozmowy lub wiadomości w zakresie, w jakim ją zapisujemy",
    goal: "obsługa Twojej sprawy",
    basis: "art. 6 ust. 1 lit. b lub f RODO",
    time: "do zakończenia sprawy, a następnie do 3 lat",
  },
  {
    title: "Skup złomu (kwit skupu)",
    data: "imię i nazwisko lub nazwa firmy, adres, numer dokumentu tożsamości lub NIP, źródło pochodzenia złomu, telefon i e-mail (jeśli je podasz), numer rejestracyjny pojazdu, rodzaj i waga towaru, kwota, forma płatności",
    goal: "udokumentowanie zakupu i rozliczenie transakcji, prowadzenie ewidencji i spełnienie obowiązków podatkowych oraz związanych z gospodarką odpadami",
    basis: "art. 6 ust. 1 lit. c RODO (obowiązek prawny ciążący na administratorze) oraz lit. b (wykonanie umowy)",
    time: "przez okres wymagany przepisami, zwykle 5 lat licząc od końca roku, w którym dokonano zakupu",
  },
  {
    title: "Kartoteka klientów (stali sprzedający i odbiorcy)",
    data: "imię i nazwisko lub nazwa firmy, numer dokumentu tożsamości lub NIP, adres, telefon, e-mail, numer BDO (firmy), historia współpracy z nami (kwity skupu, dostawy, oferty, zapytania) oraz nasze notatki",
    goal: "sprawniejsza obsługa osób i firm, które współpracują z nami wielokrotnie: podpowiadanie danych na kolejnych dokumentach, historia współpracy, kontakt w sprawie zleceń",
    basis:
      "art. 6 ust. 1 lit. f RODO (nasz uzasadniony interes: sprawna obsługa stałych klientów i prowadzenie dokumentacji); w zakresie danych z kwitów skupu także lit. c",
    time:
      "przez czas współpracy, a po jej zakończeniu przez okres wymagany przepisami (zwykle 5 lat dla dokumentów skupu); kartę klienta usuniemy wcześniej na Twoje żądanie, z wyjątkiem dokumentów, które musimy zachować z mocy prawa",
  },
  {
    title: "Statystyki odwiedzin strony",
    data: "adres odwiedzonej podstrony, serwis, z którego przyszedłeś (jeśli jest znany), rodzaj urządzenia (telefon, tablet, komputer) oraz jednokierunkowy skrót utworzony z adresu IP, przeglądarki i daty",
    goal: "sprawdzenie, które podstrony są oglądane, oraz policzenie unikalnych odwiedzin w ciągu dnia",
    basis: "art. 6 ust. 1 lit. f RODO (nasz uzasadniony interes: rozumienie, z czego korzystają odwiedzający, i ulepszanie strony)",
    time: "statystyki — 13 miesięcy; skróty służące do liczenia wyświetleń ogłoszeń — 3 dni",
  },
  {
    title: "Działanie i bezpieczeństwo strony",
    data: "dzienniki serwera u dostawcy hostingu (m.in. adres IP, czas i adres żądania)",
    goal: "zapewnienie działania strony, wykrywanie nadużyć i ataków",
    basis: "art. 6 ust. 1 lit. f RODO (nasz uzasadniony interes: bezpieczeństwo strony)",
    time: "zgodnie z ustawieniami dostawcy hostingu, zwykle do kilku dni lub tygodni",
  },
];

interface Recipient {
  name: string;
  role: string;
}

const RECIPIENTS: Recipient[] = [
  { name: "Vercel Inc.", role: "hosting strony i panelu administracyjnego" },
  { name: "Supabase", role: "baza danych (serwery w Unii Europejskiej, Frankfurt nad Menem)" },
  { name: "Cloudflare, Inc.", role: "przechowywanie zdjęć dołączanych do zapytań oraz obsługa domeny" },
  { name: "Resend", role: "wysyłka wiadomości e-mail (powiadomienia dla nas i odpowiedzi do klientów)" },
  { name: "Google", role: "wyłącznie jeśli klikniesz „Pokaż mapę” na stronie Kontakt" },
  { name: "Biuro rachunkowe i doradcy", role: "w zakresie niezbędnym do rozliczeń i obsługi prawnej" },
  { name: "Organy publiczne", role: "gdy obowiązek ich udostępnienia wynika z przepisów prawa" },
];

function Section({ id, n, title, children }: { id: string; n: number; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 mb-12">
      <h2 className="font-montserrat font-bold text-2xl text-white mb-4">
        <span className="text-[#f5b52c]">{n}.</span> {title}
      </h2>
      <div className="space-y-4 text-[#e8dfcc] leading-relaxed">{children}</div>
    </section>
  );
}

export default async function PrivacyPolicyPage() {
  const site = await getSiteSettings();

  return (
    <main className="min-h-screen bg-[#050505]">
      <Navbar />

      <article className="container mx-auto px-4 py-14 max-w-3xl">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-10 bg-[#f5b52c]" />
            <span className="text-[#f5b52c] text-xs font-bold tracking-[0.3em] uppercase">Ochrona danych</span>
          </div>
          <h1 className="font-montserrat font-bold text-4xl md:text-5xl text-white leading-tight mb-4">
            Polityka <span className="text-[#f5b52c]">prywatności</span>
          </h1>
          <p className="text-[#e8dfcc] leading-relaxed">
            Wyjaśniamy, jakie dane osobowe zbieramy, po co, jak długo je przechowujemy i jakie masz prawa. Staramy się
            pisać prostym językiem. Obowiązuje od {PRIVACY_POLICY_UPDATED}.
          </p>
        </header>

        <nav aria-label="Spis treści" className="mb-12 rounded-2xl border border-white/10 bg-[#0d0d0d] p-5">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#e8dfcc]/60 mb-3">Spis treści</div>
          <ol className="grid gap-1.5 sm:grid-cols-2 text-sm">
            {SECTIONS.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-[#e8dfcc] hover:text-[#f5b52c] transition-colors">
                  <span className="text-[#f5b52c]">{i + 1}.</span> {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <Section id="administrator" n={1} title={SECTIONS[0].title}>
          <p>
            Administratorem danych osobowych jest <strong className="text-white">{BUSINESS.legalName}</strong>, prowadząca
            działalność pod firmą GREMPOOL, {site.streetAddress}, {site.postalCode} {site.addressLocality}, NIP{" "}
            {BUSINESS.taxId.replace(/^(\d{3})(\d{2})(\d{2})(\d{3})$/, "$1-$2-$3-$4")}, REGON {BUSINESS.regon}.
          </p>
          <p>
            We wszystkich sprawach dotyczących danych osobowych możesz się z nami skontaktować pod adresem e-mail{" "}
            <a href={`mailto:${site.email}`} className="text-[#f5b52c] underline underline-offset-2">
              {site.email}
            </a>{" "}
            lub telefonicznie:{" "}
            <a href={telHref(site.phone)} className="text-[#f5b52c] underline underline-offset-2">
              {site.phone}
            </a>
            . Nie wyznaczyliśmy inspektora ochrony danych, ponieważ nie jest to w naszym przypadku wymagane — sprawy
            kieruj bezpośrednio do nas.
          </p>
        </Section>

        <Section id="dane" n={2} title={SECTIONS[1].title}>
          <p>Poniżej opisujemy każdą sytuację, w której dostajemy Twoje dane.</p>
          <div className="space-y-4 pt-2">
            {PURPOSES.map((p) => (
              <div key={p.title} className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-5">
                <h3 className="font-montserrat font-semibold text-white mb-3">{p.title}</h3>
                <dl className="space-y-2.5 text-sm">
                  {[
                    ["Jakie dane", p.data],
                    ["W jakim celu", p.goal],
                    ["Podstawa prawna", p.basis],
                    ["Jak długo", p.time],
                  ].map(([label, value]) => (
                    <div key={label} className="grid sm:grid-cols-[130px_1fr] gap-x-4">
                      <dt className="text-[#f5b52c] font-semibold">{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
          <p>
            Przy formularzach prosimy o potwierdzenie, że zapoznałeś(-aś) się z tą polityką. To potwierdzenie ma
            charakter informacyjny i nie jest zgodą będącą podstawą przetwarzania — podstawy prawne podaliśmy powyżej.
            Zapisujemy jednak, kiedy je złożyłeś(-aś) i do której wersji polityki się odnosiło.
          </p>
        </Section>

        <Section id="zdjecia" n={3} title={SECTIONS[2].title}>
          <p>
            Zdjęcia dołączone do zapytania służą wyłącznie do przygotowania wyceny. Prosimy, by nie fotografować osób
            ani tablic rejestracyjnych, jeśli nie jest to potrzebne do wyceny. Adresy plików są losowe i nigdzie ich nie
            publikujemy. Gdy usuwamy zapytanie, usuwamy również dołączone do niego zdjęcia.
          </p>
        </Section>

        <Section id="odbiorcy" n={4} title={SECTIONS[3].title}>
          <p>
            Dane przekazujemy tylko tym podmiotom, które pomagają nam prowadzić stronę i firmę, na podstawie umów
            powierzenia lub w zakresie wynikającym z przepisów:
          </p>
          <ul className="space-y-2">
            {RECIPIENTS.map((r) => (
              <li key={r.name} className="flex gap-3">
                <span className="text-[#f5b52c] shrink-0">•</span>
                <span>
                  <strong className="text-white">{r.name}</strong> — {r.role}
                </span>
              </li>
            ))}
          </ul>
          <p>
            Nie sprzedajemy danych i nie przekazujemy ich do celów reklamowych. Część dostawców (m.in. Vercel,
            Cloudflare, Resend) ma siedzibę w Stanach Zjednoczonych, więc Twoje dane mogą trafić poza Europejski Obszar
            Gospodarczy. W takim przypadku dostawcy opierają przekazanie na mechanizmach przewidzianych w RODO — decyzji
            Komisji Europejskiej o odpowiednim stopniu ochrony (Data Privacy Framework) albo standardowych klauzulach
            umownych. Informacje o zastosowanych zabezpieczeniach przekażemy na Twoją prośbę.
          </p>
        </Section>

        <Section id="cookies" n={5} title={SECTIONS[4].title}>
          <ul className="space-y-2">
            <li className="flex gap-3">
              <span className="text-[#f5b52c] shrink-0">•</span>
              <span>
                <strong className="text-white">Strona publiczna nie zapisuje w Twojej przeglądarce ciasteczek ani innych
                danych.</strong>{" "}
                Nie używamy Google Analytics, pikseli reklamowych ani narzędzi śledzących. Statystyki odwiedzin liczymy
                po stronie serwera w sposób opisany w punkcie 2.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#f5b52c] shrink-0">•</span>
              <span>
                <strong className="text-white">Panel administracyjny</strong> (dla pracowników) używa jednego ciasteczka
                sesyjnego, niezbędnego do logowania. Odwiedzający stronę nigdy go nie otrzymują.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#f5b52c] shrink-0">•</span>
              <span>
                <strong className="text-white">Mapa dojazdu</strong> na stronie Kontakt ładuje się dopiero po kliknięciu
                „Pokaż mapę”. Wtedy Google może zapisać własne ciasteczka i otrzymać Twój adres IP — zasady opisuje
                polityka prywatności Google.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#f5b52c] shrink-0">•</span>
              <span>
                <strong className="text-white">Zdjęcia ilustracyjne.</strong> Niektóre zdjęcia na stronie są ładowane z
                serwisu Unsplash, który przy ich pobraniu widzi Twój adres IP (jak każdy serwer, z którego przeglądarka
                pobiera plik).
              </span>
            </li>
          </ul>
        </Section>

        <Section id="prawa" n={6} title={SECTIONS[5].title}>
          <p>Zgodnie z RODO masz prawo do:</p>
          <ul className="space-y-1.5">
            {[
              "dostępu do swoich danych i otrzymania ich kopii,",
              "sprostowania danych, które są nieprawidłowe lub niepełne,",
              "usunięcia danych („prawo do bycia zapomnianym”), jeśli nie musimy ich przechowywać z mocy prawa,",
              "ograniczenia przetwarzania,",
              "przenoszenia danych, w przypadkach przewidzianych w przepisach,",
              "sprzeciwu wobec przetwarzania opartego na naszym uzasadnionym interesie — z przyczyn związanych z Twoją szczególną sytuacją.",
            ].map((t) => (
              <li key={t} className="flex gap-3">
                <span className="text-[#f5b52c] shrink-0">•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <p>
            Aby skorzystać z tych praw, napisz lub zadzwoń (dane w punkcie 1). Odpowiemy bez zbędnej zwłoki, najpóźniej
            w ciągu miesiąca. Możemy poprosić o potwierdzenie tożsamości, żeby dane nie trafiły do niewłaściwej osoby.
            Danych, które musimy przechowywać na podstawie przepisów (np. kwitów skupu), nie możemy usunąć przed upływem
            wymaganego okresu.
          </p>
          <p>
            Masz też prawo wnieść skargę do organu nadzorczego: Prezesa Urzędu Ochrony Danych Osobowych, ul. Stawki 2,
            00-193 Warszawa,{" "}
            <a href="https://uodo.gov.pl" target="_blank" rel="noopener noreferrer" className="text-[#f5b52c] underline underline-offset-2">
              uodo.gov.pl
            </a>
            .
          </p>
        </Section>

        <Section id="dobrowolnosc" n={7} title={SECTIONS[6].title}>
          <p>
            Podanie danych w formularzach jest dobrowolne, ale pola oznaczone gwiazdką są potrzebne, żebyśmy mogli
            odpowiedzieć na zapytanie. Przy skupie złomu od osób fizycznych podanie danych identyfikujących jest
            wymagane przepisami — bez nich nie możemy dokonać zakupu.
          </p>
          <p>Nie podejmujemy wobec Ciebie decyzji w sposób zautomatyzowany i nie tworzymy Twojego profilu.</p>
        </Section>

        <Section id="bezpieczenstwo" n={8} title={SECTIONS[7].title}>
          <p>
            Połączenie ze stroną jest szyfrowane (HTTPS). Dane są zapisane w bazie danych w Unii Europejskiej, a dostęp do
            panelu, w którym je przeglądamy, mają wyłącznie upoważnione osoby, chronione indywidualnymi hasłami; ich
            działania w panelu są rejestrowane.
          </p>
        </Section>

        <Section id="zmiany" n={9} title={SECTIONS[8].title}>
          <p>
            Politykę możemy zmieniać, np. gdy zmieni się sposób działania strony lub przepisy. Aktualna wersja jest zawsze
            pod adresem{" "}
            <Link href={PRIVACY_POLICY_PATH} className="text-[#f5b52c] underline underline-offset-2">
              grempool.pl{PRIVACY_POLICY_PATH}
            </Link>
            , a data jej obowiązywania — na górze tej strony.
          </p>
        </Section>
      </article>

      <Footer />
    </main>
  );
}
