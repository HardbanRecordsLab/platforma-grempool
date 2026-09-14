GREMPOOL DIGITAL

D O K U M E N T K O N C E P C Y J N Y · W E R S J A S K O N S O L I D O W A N A

GREMPOOL DIGITAL
Kompleksowa koncepcja systemu
cyfrowego i platformy operacyjnej
Strona internetowa + CRM + wyceny + zlecenia + flota + maszyny + materiały + automatyzacje + analityka. Dokument łączy w jedną spójną całość dwa dotychczasowe materiały koncepcyjne przygotowane dla firmy GREMPOOL („GREMPOOL Digital — Proposal systemu cyfrowego i platformy operacyjnej” oraz „GREMPOOL — Wstępny plan rozwoju strony i systemu cyfrowego”) bez skracania ich treści merytorycznej.

Raszówka, ul. Kolejowa 5a, 59-307 Raszówka · GREMPOOL — Złom · Transport · Usługi

Wersja skonsolidowana 1.0 — dokument koncepcyjny do dalszego doprecyzowania Wrzesień 2026

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 1 z 32

GREMPOOL DIGITAL

Spis treści
CZĘŚĆ I — WIZJA I ZASADY PROJEKTU

Idea projektu — GREMPOOL jako cyfrowy system operacyjny

Zasada architektoniczna

Struktura systemu — mapa modułów

Czego nie budujemy na start

CZĘŚĆ II — WARSTWA PUBLICZNA (TO, CO WIDZI KLIENT)

Struktura publicznej strony

Centrum szybkiej wyceny

CZĘŚĆ III — PANEL GREMPOOL (ZAPLECZE OPERACYJNE)

Panel GREMPOOL — pulpit i leady

CRM i pipeline sprzedażowy

Moduł Zlecenia

Kalendarz operacyjny

Flota i pojazdy

Moduł Maszyn (koparki)

Magazyn i katalog materiałów — „Live Inventory”

Rezerwacja materiału

Plac, magazyn i dostępność

Realizacje i portfolio

Centrum zdjęć

Opinie, reputacja i Google Business Profile

Moduł dokumentów

CZĘŚĆ IV — CENY, SPRZEDAŻ I DOŚWIADCZENIE KLIENTA

Ceny, wyceny i negocjacje

Powiązania usług i cross-selling

Customer Journey

Źródła klientów i analiza utraconych zleceń

Inteligentny asystent kontaktowy

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 2 z 32

GREMPOOL DIGITAL

CZĘŚĆ V — AUTOMATYZACJA I JAKOŚĆ DANYCH

Automatyzacje i integracje

Fact Control

Panel administracyjny i role użytkowników

Bezpieczeństwo, prywatność i odporność systemu

Raporty i analityka

CZĘŚĆ VI — TECHNOLOGIA I WDROŻENIE

Proponowany stack technologiczny

Model danych

PWA zamiast osobnej aplikacji mobilnej

Roadmapa wdrożenia — MVP → V2 → V3

Zakres rezultatów

Szacowany nakład pracy

Co należy ustalić przed rozpoczęciem developmentu

Rekomendacja końcowa

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 3 z 32

GREMPOOL DIGITAL

C Z Ę Ś Ć I

Wizja i zasady projektu
Fundament koncepcji: czym GREMPOOL Digital ma być, jak zbudowana jest jego architektura i czego świadomie nie robimy na początku.

01 Idea projektu — GREMPOOL jako cyfrowy system operacyjny
GREMPOOL łączy kilka naturalnie powiązanych obszarów działalności: skup złomu, odbiór materiału, transport, pracę koparką, rozbiórki, usługi budowlane, sprzedaż materiałów z odzysku oraz serwis klimatyzacji samochodowej. Te działalności naturalnie się ze sobą łączą — skup złomu → odbiór → transport → sprzęt → rozbiórka → odzysk materiałów → sprzedaż materiałów, a do tego dochodzi klimatyzacja jako usługa osobna. Dlatego rozwiązanie nie powinno być projektowane jako „strona internetowa firmy”, tylko jako mały cyfrowy system operacyjny firmy, którego strona internetowa jest tylko częścią publiczną. Tę naturalną zależność usług warto wykorzystać zamiast budować siedem niezależnych podstron.

C E L N A D R Z Ę D N Y Skrócić drogę od zapytania klienta do realizacji zlecenia, ograniczyć ręczne przepisywanie informacji i stworzyć jedno źródło danych o klientach, usługach, pojazdach, maszynach i materiałach.

Co klient zobaczy

nowoczesną stronę WWW

inteligentną, szybką wycenę

formularze dopasowane do rodzaju usługi

aktualny katalog materiałów z odzysku realizacje i dowody wykonanej pracy

łatwy kontakt telefoniczny i formularzowy

Co GREMPOOL otrzyma wewnętrznie

CRM klientów i leadów

rejestr zleceń i statusów

kalendarz operacyjny

moduł floty i maszyn

bazę materiałów i dostępności bibliotekę zdjęć i realizacji

automatyczne powiadomienia

dashboard i raporty

kontrolę faktów przed publikacją

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 4 z 32

GREMPOOL DIGITAL

02 Zasada architektoniczna
Jedno źródło danych, wiele punktów obsługi.

Najważniejszym założeniem jest rozdzielenie danych od prezentacji. Strona, panel pracownika, formularze, katalog materiałów i automatyzacje korzystają z tego samego modelu danych. Dzięki temu aktualizacja informacji w jednym miejscu jest widoczna wszędzie tam, gdzie jest potrzebna.

Obszar Proponowane rozwiązanie

Publiczny portal Strona, usługi, katalog materiałów, realizacje, FAQ, kontakt, szybkie wyceny

Panel GREMPOOL Leady, klienci, zlecenia, kalendarz, flota, maszyny, materiały, zadania

Baza danych Jedno źródło prawdy dla klientów, zleceń, produktów, zasobów i faktów

Automatyzacje Powiadomienia, e-maile, follow-up, raporty i integracje

Analityka Źródła leadów, konwersja, zapytania, porzucone formularze, skuteczność usług

E F E K T Pracownik nie musi szukać informacji w telefonie, SMS-ach, Messengerze, kartkach i arkuszach. Każde zapytanie otrzymuje własny rekord i historię.

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 5 z 32

GREMPOOL DIGITAL

03 Struktura systemu — mapa modułów
Jak poszczególne warstwy systemu łączą się ze sobą.

GREMPOOL DIGITAL ├── PUBLIC WEBSITE ├── ADMIN PANEL │ └── Leady ──────────────────────────┐ │ ├── CRM │ └── Zlecenia │ └────────────────────── SUPABASE ───────────────────────── ├── Database ├── Storage ├── Auth │ ├── Klienci │ ├── Leady │ ├── Zlecenia │ ├── Pojazdy │ ├── Maszyny │ ├── Materiały │ ├── Ceny │ ├── Realizacje │ ├── Opinie │ ├── Dokumenty │ └── Fakty │ └── n8n (automatyzacja) ├── Email ├── SMS ├── WhatsApp ├── Google └── Raporty

Publiczna strona i panel administracyjny współdzielą jedną bazę danych (Supabase/PostgreSQL). Leady zebrane na stronie trafiają wprost do CRM i modułu zleceń. Warstwa automatyzacji (n8n) rozsyła powiadomienia kanałami e-mail, SMS, WhatsApp oraz zasila raporty i integrację z Google — ale nie jest „sercem” systemu: to baza danych GREMPOOL pozostaje jedynym źródłem prawdy.

04 Czego nie budujemy na start
Świadome ograniczenie zakresu na wczesnym etapie.

Na początku potrzebujemy przede wszystkim czegoś, co realnie eliminuje papier, telefony, przepisywanie danych i chaos operacyjny. Dlatego na start świadomie nie budujemy:

aplikacji mobilnej natywnej pełnego ERP skomplikowanego systemu księgowego

własnego systemu GPS własnego systemu płatności AI ustalającego ceny złomu

automatycznych odpowiedzi na wszystko

P R O P O N O WA N A Z A S A D A P R O J E K TO WA Najpierw eliminujemy ręczne czynności, następnie porządkujemy dane, potem automatyzujemy, a dopiero na końcu dokładamy funkcje „efektowne”.

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 6 z 32

GREMPOOL DIGITAL

C Z Ę Ś Ć I I

Warstwa publiczna — to, co widzi klient
Struktura strony internetowej i jej najważniejsze narzędzie: Centrum szybkiej wyceny.

05 Struktura publicznej strony
Zamiast siedmiu niezależnych podstron, treść publiczna jest zorganizowana wokół naturalnych bloków tematycznych, spójnych z rzeczywistym łańcuchem usług GREMPOOL.

Start

kim jesteśmy

główne usługi

szybki kontakt

szybka wycena

Skup złomu

rodzaje złomu

jak działa wycena

odbiór złomu

duże ilości / negocjacje

czego nie przyjmujemy

formularz „Zapytaj o cenę”

Transport

bus krótki

bus długi wywrotka

ciężarówka z plandeką

transport auta (pomoc drogowa)

szybka wycena trasy

Koparki / prace ziemne

maszyny

zakres prac

zdjęcia realizacji wycena

Rozbiórki

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 7 z 32

GREMPOOL DIGITAL

zakres

rozbiórka + segregacja + transport

odzysk materiałów

realizacje formularz zapytania

Materiały z odzysku

stal użytkowa cegła

drzwi

okna

pozostałe materiały

bieżąca dostępność

zapytanie o konkretny materiał

Klimatyzacja

napełnianie

czyszczenie

diagnostyka (jeżeli faktycznie jest wykonywana)

kontakt

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 8 z 32

GREMPOOL DIGITAL

06 Centrum szybkiej wyceny
Jeden punkt wejścia dla najważniejszych usług — najważniejsze narzędzie całej strony.

Zamiast jednego ogólnego formularza „Napisz do nas”, klient od razu wybiera, czego potrzebuje. System pokazuje tylko pytania niezbędne do wykonania szybkiej wyceny — formularz zmienia się automatycznie po wyborze usługi.

Skup złomu Odbiór złomu Transport Koparka Rozbiórka Materiał Klimatyzacja

Obszar Proponowane rozwiązanie

Skup złomu rodzaj materiału, ilość, zdjęcia, lokalizacja, odbiór, telefon

Transport skąd, dokąd, ładunek, masa/gabaryt, termin, dostępność miejsca

Koparka lokalizacja, zakres prac, warunki dojazdu, termin, zdjęcia

Rozbiórka typ obiektu, zakres, lokalizacja, zdjęcia, termin, możliwość oględzin

Materiał nazwa/zdjęcie, wymiar, ilość, transport, kontakt

Klimatyzacja typ pojazdu, usługa, preferowany termin, kontakt

Przykład — złom

Klient podaje: rodzaj złomu, orientacyjną ilość, zdjęcia, lokalizację, czy potrzebuje odbioru, telefon, wiadomość.

System zapisuje to jako: LEAD #2026-00127

Status: Nowe → Do wyceny → Wycena wysłana → Zaakceptowane → W realizacji → Zakończone

To już nie jest formularz kontaktowy — to jest mini-CRM. Każde zgłoszenie automatycznie trafia do CRM jako lead i może zostać przekształcone w zlecenie.

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 9 z 32

GREMPOOL DIGITAL

C Z Ę Ś Ć I I I

Panel GREMPOOL — zaplecze operacyjne
Najważniejsza część całego projektu: miejsce, w którym właściciel i pracownicy faktycznie pracują na co dzień.

07 Panel GREMPOOL — pulpit i leady
Właściciel lub pracownik loguje się i od razu widzi bieżący stan firmy na jednym pulpicie (dashboard):

DASHBOARD Nowe zapytania: 7 Do wyceny: 4 Zaplanowane odbiory: 3 Transporty na dziś: 2 Aktywne zlecenia: 8 Materiały oczekujące na dodanie: 11

Leady / zapytania

Każde zapytanie zapisywane jest jako osobny rekord z pełnym kontekstem:

klient

telefon

usługa

lokalizacja

zdjęcia

opis

termin

status odpowiedzialny pracownik

notatki

historia kontaktu

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 10 z 32

GREMPOOL DIGITAL

08 CRM i pipeline sprzedażowy
Od pierwszego kontaktu do zakończenia zlecenia.

Proponowany pipeline

NOWE DO UZUPEŁNIENIA DO WYCENY WYCENA WYSŁANA NEGOCJACJA

ZAAKCEPTOWANE ZAPLANOWANE W REALIZACJI ZAKOŃCZONE UTRACONE

Karta klienta

dane kontaktowe

historia zapytań

historia zleceń zakupy materiałów

transporty

notatki

źródło pozyskania

zgody i ustawienia kontaktu

WA R TO Ś Ć B I Z N E S O WA GREMPOOL buduje historię relacji z klientem. Powracający klient nie zaczyna każdej rozmowy od zera.

Przykład

KLIENT: Jan Kowalski Historia: 2024 — skup złomu 2025 — transport 2025 — stal użytkowa 2026 — odbiór złomu

System pokazuje: Klient powracający

To pozwala budować bazę klientów zamiast za każdym razem zaczynać rozmowę od zera.

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 11 z 32

GREMPOOL DIGITAL

09 Moduł Zlecenia
Przekazanie zapytania do realizacji bez chaosu.

Po akceptacji wyceny lead może zostać zamieniony w zlecenie z numerem, terminem, lokalizacją, usługą, odpowiedzialną osobą, pojazdem lub maszyną oraz kompletem załączników.

Obszar Proponowane rozwiązanie

Karta zlecenia numer, klient, usługa, lokalizacja, zakres, termin, cena, status

Zasoby przypisanie pojazdu, maszyny, operatora lub pracownika

Zdjęcia przed / w trakcie / po

Notatki ustalenia, uwagi klienta, informacje dla realizatora

Zamknięcie potwierdzenie wykonania, zdjęcia końcowe, możliwość prośby o opinię

Przykład

LEAD → ZLECENIE GRE-2026-00481

Zlecenie zawiera: klienta, miejsce, usługę, termin, pojazd, maszynę, pracownika/operatora, zakres, ustaloną cenę, załączniki, zdjęcia przed, zdjęcia po, status.

To pozwala generować: karty zlecenia / protokoły / potwierdzenia wykonania.

10 Kalendarz operacyjny
Bardzo istotne przy tej skali działalności.

Każde zlecenie można przypisać jednocześnie do pojazdu, pracownika i maszyny — wtedy system pilnuje nie tylko terminów klientów, ale też obłożenia sprzętu.

PONIEDZIAŁEK 08:00 — odbiór złomu — Lubin 10:30 — transport materiału — Legnica 13:00 — koparka — Raszówka 16:00 — klimatyzacja

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 12 z 32

GREMPOOL DIGITAL

11 Flota i pojazdy
Rejestr zasobów oraz ich wykorzystania.

Dla każdego pojazdu system przechowuje parametry, zastosowanie, status i terminy serwisowe. Publicznie można pokazywać tylko wybrane dane handlowe; dane operacyjne pozostają w panelu.

Obszar Proponowane rozwiązanie

Busy krótki / długi, wymiary, ładowność, typ ładunku, zastosowanie

Wywrotka ładowność, objętość, zastosowania, ograniczenia

Ciężarówka z plandeką wymiary, masa, typowe ładunki, obszar

Transport auta zakres usługi pomocy drogowej rozumiany jako transport pojazdu

Terminy przegląd, OC, serwis, inne wewnętrzne przypomnienia

Pojazdy w rejestrze: bus 1, bus 2, wywrotka, ciężarówka, pojazd do transportu aut, koparka itd. Dla każdego z nich: marka/model, numer rejestracyjny, VIN (tylko wewnętrznie), ładowność, wymiary, rodzaj zabudowy, aktualny status, przegląd, OC, serwis, zdjęcia.

Automatyczne przypomnienia

“Przegląd za 14 dni” “OC za 32 dni” “Serwis pojazdu za 500 km”

To jedna z rzeczy, która naprawdę może oszczędzać czas.

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 13 z 32

GREMPOOL DIGITAL

12 Moduł Maszyn (koparki)
Połączenie parametrów sprzętu z ofertą usługową.

Obszar Proponowane rozwiązanie

Maszyna marka/model, masa, szerokość, głębokość, osprzęt

Zakres prac wykopy, niwelacje, korytowanie, przygotowanie terenu, rozbiórki — zgodnie z faktyczną ofertą

Ograniczenia dojazd, podłoże, przewody, przestrzeń manewrowa

Wycena godzina / zakres / zlecenie + dojazd / wywóz, zgodnie z zasadami firmy

Kompleksowość możliwość połączenia z transportem urobku lub materiału

Przykład

KOPARKA #01 model, masa, szerokość, maks. głębokość, osprzęt, łyżki, szybkozłącze, operator, status, przeglądy, zdjęcia

Dzięki temu przy zapytaniu typu „Potrzebuję wykopać fundament 80 cm” system może pomóc dobrać odpowiednią maszynę.

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 14 z 32

GREMPOOL DIGITAL

13 Magazyn i katalog materiałów — „Live Inventory”
Najbardziej dynamiczna i najbardziej potencjalna część oferty.

Asortyment stali użytkowej, cegły, okien, drzwi i innych materiałów z odzysku może zmieniać się szybko. Dlatego zamiast klasycznego, statycznego katalogu produktów rekomendowany jest katalog powiązany na bieżąco z realną bazą magazynową — de facto mini-marketplace materiałów z odzysku GREMPOOL.

Statusy materiału

DOSTĘPNY ZAREZERWOWANY SPRZEDANY UKRYTY DO WERYFIKACJI

Karta materiału

ID materiału

kategoria

nazwa wymiary

długość / ilość

stan

zdjęcia

lokalizacja na placu

cena lub „zapytaj o cenę”

transport

notatki

Przykład

ID: MAT-000184 Kategoria: stal · Typ: profil · Wymiar: 100 × 100 · Długość: 4,2 m · Ilość: 6 szt. Stan: używany · Zdjęcia: 5 · Cena: zapytaj Lokalizacja: plac A / sektor 3 · Status: dostępny

M E C H A N I Z M Przycisk „Zapytaj o ten materiał” tworzy zapytanie z automatycznym przypisaniem konkretnego ID produktu. Klient nie musi opisywać, o który element chodzi — system sam wysyła „zapytanie dotyczące MAT-000184”. To bardzo mocne rozwiązanie.

Licznik dostępności na żywo

Kategoria Pozycje aktualnie dostępne

Stal 18 pozycji

Cegła 7 pozycji

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 15 z 32

GREMPOOL DIGITAL

Kategoria Pozycje aktualnie dostępne

Okna 12 pozycji

Drzwi 9 pozycji

Inne 23 pozycje

Administrator jednym kliknięciem zmienia status Dostępny → Zarezerwowany → Sprzedany, a produkt automatycznie znika z publicznej listy.

14 Rezerwacja materiału
Krok dalej niż samo zapytanie.

“Zarezerwuj materiał”

Klient podaje telefon. System tworzy: REZERWACJA #284 Materiał: MAT-000184 Termin rezerwacji: 24h / 48h / indywidualnie

Pracownik dostaje powiadomienie.

15 Plac, magazyn i dostępność
Cyfrowe odwzorowanie rzeczywistego asortymentu.

System powinien odzwierciedlać realny stan placu, a nie tylko listę produktów na stronie. Administrator może dodawać zdjęcia, oznaczać sektor i zmieniać status bez angażowania programisty.

Obszar Proponowane rozwiązanie

Struktura placu strefy / sektory / lokalizacja materiałów

Szybka aktualizacja telefonem podczas pracy

Rezerwacje czasowe blokowanie materiału

Zapytania bezpośrednie przypisanie do materiału

Wycofanie sprzedany lub niedostępny materiał znika z publicznej listy

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 16 z 32

GREMPOOL DIGITAL

16 Realizacje i portfolio
Pokazywanie dowodów zamiast samych deklaracji.

Każde zakończone zlecenie może zostać oznaczone jako materiał do portfolio. Właściciel decyduje, czy dana realizacja może zostać opublikowana.

Obszar Proponowane rozwiązanie

Realizacja typ usługi, lokalizacja, zakres, opis efektu

Media przed / w trakcie / po, zdjęcia, filmy

Zgoda możliwość wskazania, czy można podać klienta, firmę lub lokalizację

Powiązanie realizacja połączona ze zleceniem i usługą

Publikacja wersja robocza → zatwierdzona → publiczna

W praktyce: pracownik zaznacza „Zlecenie zakończone”, a system pyta „Czy chcesz dodać realizację do portfolio?”. Dodaje zdjęcia przed/w trakcie/po, typ usługi, miejscowość, opis, zakres i użyty sprzęt. Administrator zatwierdza — i gotowe.

17 Centrum zdjęć
Bardzo ważne dla GREMPOOL — jedna wspólna biblioteka.

Złom Transport Koparki Rozbiórki Stal Cegła Okna Drzwi

Klimatyzacja Realizacje

Każde zdjęcie może mieć: kategorię, usługę, zlecenie, materiał, datę, miejsce, zgodę na publikację. To pozwala automatycznie zasilać stronę bez ręcznego powielania plików między modułami.

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 17 z 32

GREMPOOL DIGITAL

18 Opinie, reputacja i Google Business Profile
Wykorzystanie istniejącego zaufania firmy.

Moduł opinii może porządkować źródła opinii, pomagać w wyborze referencji oraz uruchamiać prośbę o ocenę po zakończeniu zlecenia. Odpowiedzi na opinie powinny pozostać pod kontrolą człowieka.

Google Business Profile API umożliwia m.in. odczytywanie opinii, odpowiadanie na nie oraz zarządzanie informacjami o lokalizacji i danymi profilu — warto potraktować tę integrację jako integralną część systemu, a nie osobne narzędzie.

OPINIE ★★★★★ „Bardzo szybki odbiór…” [Odpowiedz]

Nowa opinia → powiadomienie dla właściciela.

Nie zakładamy automatycznego publikowania odpowiedzi bez zatwierdzenia człowieka.

Moduł „Proś o opinię”

Po zakończonym zleceniu pracownik klika „Wyślij prośbę o opinię” — system przygotowuje wiadomość i kieruje klienta do właściwego miejsca. To może być bardzo skuteczne dla lokalnego biznesu.

19 Moduł dokumentów
Nie chodzi o przechowywanie wszystkiego bez ładu.

Pojazdy Ubezpieczenia Przeglądy Maszyny Certyfikaty Umowy Realizacje

Dokumentacja firmy

Dokumenty przechowywane są z odpowiednimi uprawnieniami i powinny być oddzielone od danych publicznych.

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 18 z 32

GREMPOOL DIGITAL

C Z Ę Ś Ć I V

Ceny, sprzedaż i doświadczenie klienta
Jak system wspiera proces wyceny, wykorzystuje powiązania między usługami i prowadzi klienta przez cały cykl współpracy z GREMPOOL.

20 Ceny, wyceny i negocjacje
System ma wspierać proces, ale nie wymyślać cen.

Dla różnych usług można zastosować różne reguły wyceny: cena dnia, ilość, kilometraż, czas pracy, parametry ładunku, dojazd, oględziny, indywidualne ustalenia. System powinien te dane zbierać i prezentować pracownikowi, pozostawiając decyzję osobie uprawnionej.

Z A S A D A AI i automatyzacja nie powinny samodzielnie deklarować cen, jeśli nie istnieje zatwierdzona reguła biznesowa. Mają pomagać zebrać dane i przygotować proces.

Formularze kontekstowe

szybka wycena złomu zamów odbiór złomu wyceń transport zamów koparkę

zapytanie o rozbiórkę zapytanie o materiał klimatyzacja

21 Powiązania usług i cross-selling
Wykorzystanie pełnego wachlarza GREMPOOL.

Naturalną przewagą GREMPOOL jest możliwość obsługi kilku potrzeb w jednym łańcuchu. System powinien to zauważać i ułatwiać pracownikowi proponowanie kolejnego kroku.

Obszar Proponowane rozwiązanie

Rozbiórka rozbiórka → segregacja → złom → transport → odzysk materiałów

Złom skup → odbiór → transport → regularna współpraca

Koparka wykop → załadunek → wywóz → dowóz materiału

Materiały zapytanie → rezerwacja → transport

Klient firmowy jednorazowe zlecenie → stały klient → cykliczna obsługa

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 19 z 32

GREMPOOL DIGITAL

22 Customer Journey
Projektowanie pod rzeczywisty przebieg klienta.

Potrzeba klienta

Wyszukanie GREMPOOL

Pierwszy kontakt Zebranie danych

Wycena / oględziny

Akceptacja

Planowanie

Realizacja

Potwierdzenie wykonania

Opinia / kolejny zakup

Na każdym etapie system powinien odpowiadać na jedno pytanie: co musi wiedzieć pracownik i co musi wiedzieć klient, żeby kolejny krok był możliwy?

23 Źródła klientów i analiza utraconych zleceń
Decyzje oparte na danych, nie intuicji.

Obszar Proponowane rozwiązanie

Źródła leadów Google, polecenia, social media, portale ogłoszeniowe, bezpośredni kontakt, inne

Wartość źródła liczba leadów, liczba zleceń, wartość zleceń

Utracone zlecenia cena, termin, obszar, brak sprzętu, konkurencja, brak kontaktu, inne

Porzucone formularze gdzie użytkownicy przerywają proces

Wnioski które elementy strony i procesu trzeba poprawić

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 20 z 32

GREMPOOL DIGITAL

24 Inteligentny asystent kontaktowy
Nie chatbot AI odpowiadający na wszystko.

Lepszym rozwiązaniem niż „AI chatbot, który odpowiada na wszystko” jest inteligentny asystent kontaktowy, który zbiera dane, a nie wymyśla ceny — to bardzo ważna zasada.

Klient: “Ile płacicie za złom?” System: “Cena zależy od rodzaju i ilości. Prześlij zdjęcie i orientacyjną ilość, a przygotujemy wycenę.”

Klient: “Potrzebuję koparki.” System: “Podaj miejscowość, zakres prac i termin.”

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 21 z 32

GREMPOOL DIGITAL

C Z Ę Ś Ć V

Automatyzacja i jakość danych
Jak system usuwa powtarzalną pracę ręczną, dba o wiarygodność publikowanych informacji i kontroluje dostęp.

25 Automatyzacje i integracje
Usuwanie powtarzalnej pracy ręcznej.

Obszar Proponowane rozwiązanie

Nowy lead CRM + powiadomienie + potwierdzenie klientowi

Zmiana statusu automatyczny follow-up zależnie od procesu

Wycena rejestr wysłania, termin ponownego kontaktu

Zlecenie zakończone prośba o opinię + propozycja dodania realizacji

Nowy materiał publikacja do katalogu po zatwierdzeniu

Terminy floty wewnętrzne przypomnienia o przeglądach / OC / serwisie

Raport miesięczne podsumowanie leadów i zleceń

Przykładowy przebieg

KLIENT WYSYŁA FORMULARZ → CRM tworzy lead → klient dostaje automatyczne potwierdzenie → pracownik dostaje powiadomienie → zdjęcia trafiają do konkretnego zlecenia → lead dostaje status „NOWY”

WYCENA Pracownik zmienia: Do wyceny → Wycena gotowa → system wysyła e-mail, opcjonalnie SMS, zapisuje datę, tworzy historię

ZLECENIE ZAKOŃCZONE → wiadomość do klienta → prośba o opinię → zapis realizacji → możliwość dodania zdjęć do portfolio

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 22 z 32

GREMPOOL DIGITAL

26 Fact Control
Warstwa jakości informacji przed publikacją.

Wszystkie kluczowe twierdzenia na stronie powinny mieć status: potwierdzone, do weryfikacji, wygasłe albo nie publikować. To szczególnie ważne przy parametrach pojazdów, maszyn, godzinach, obszarach działania, cenach, kwalifikacjach i deklaracjach dotyczących oferty.

Obszar Proponowane rozwiązanie

Fakt treść informacji

Źródło dokument / dane firmowe / zdjęcie / osoba potwierdzająca

Data ostatnia weryfikacja

Status potwierdzone / do sprawdzenia / wygasłe / nie publikować

Publikacja czy informacja może trafić na stronę

Przykład: stwierdzenie „firma działa od 2014 roku” nie ląduje na stronie tylko dlatego, że ktoś tak powiedział — wymaga wskazanego źródła i statusu weryfikacji.

R E Z U LTAT Strona może rosnąć bez utraty kontroli nad jakością danych. Zmiana informacji uruchamia ponowną weryfikację zamiast pozostawiać starą treść.

27 Panel administracyjny i role użytkowników
Dostęp tylko do danych potrzebnych danej osobie.

Rola Zakres dostępu

Właściciel pełny dostęp + zatwierdzanie + raporty

Koordynator leady, wycena, zlecenia, kalendarz

Pracownik przypisane zlecenia, zdjęcia, statusy

Magazyn / materiały materiały, stany, zdjęcia, rezerwacje

Redaktor treści publiczne, FAQ, realizacje, katalog

Audyt / faktów zatwierdzanie danych publikowanych (Fact Control)

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 23 z 32

GREMPOOL DIGITAL

28 Bezpieczeństwo, prywatność i odporność systemu
Dane operacyjne nie muszą być publiczne.

oddzielenie panelu od części publicznej

role i uprawnienia

logowanie zmian w danych krytycznych kopie zapasowe

walidacja formularzy i załączników

ochrona antyspamowa

minimalizacja danych osobowych

brak publikacji danych wewnętrznych bez zatwierdzenia

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 24 z 32

GREMPOOL DIGITAL

29 Raporty i analityka
Mierzenie rzeczywistego efektu strony.

Po kilku miesiącach działania system powinien umieć samodzielnie odpowiadać na konkretne pytania biznesowe, osobno dla każdego obszaru działalności.

Obszar Proponowane rozwiązanie

Leady liczba, źródło, usługa, status

Konwersja lead → wycena → zlecenie

Czas reakcji średni czas od zapytania do pierwszej odpowiedzi

Usługi najczęstsze i najbardziej wartościowe

Materiały liczba zapytań i rezerwacji

Utracone najczęstsze powody odpadania

Skup

Ile zapytań?

Ile odbiorów?

Ile zakończonych transakcji?

Średni czas odpowiedzi?

Najczęstsze rodzaje złomu?

Transport

Najczęstsze trasy?

Najczęstszy pojazd?

Liczba zleceń?

Usługi

Która usługa generuje najwięcej leadów?

Która generuje największy przychód?

Która ma najwięcej utraconych zleceń?

Automatyczny raport miesięczny — przykład

GREMPOOL — Raport wrzesień 2026 Zapytania: 143 · Zlecenia: 87 · Nowi klienci: 52 · Powracający: 35 Najpopularniejsza usługa: skup złomu Najczęstsza lokalizacja: … Średni czas odpowiedzi: … Konwersja zapytań → zlecenia: …

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 25 z 32

GREMPOOL DIGITAL

Raport powinien być prosty dla właściciela: kilka kluczowych liczb, trendy i lista spraw wymagających uwagi. Warstwa analityczna śledzi m.in. wejścia, kliknięcia telefonu, rozpoczęte i porzucone formularze oraz zapytania o złom, transport i materiały — bez zbierania zbędnych danych osobowych.

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 26 z 32

GREMPOOL DIGITAL

C Z Ę Ś Ć V I

Technologia i wdrożenie
Proponowany fundament technologiczny, model danych oraz etapowa droga od pierwszej wersji do pełnego systemu.

30 Proponowany stack technologiczny
Nowoczesny, spójny i skalowalny fundament.

Dla tego typu projektu nie rekomendujemy WordPressa z kilkudziesięcioma wtyczkami jako fundamentu. Poniższy stack pozwala utrzymać jeden spójny system bez budowania osobno strony, CRM, katalogu, bazy klientów i panelu pracownika.

Obszar Proponowane rozwiązanie

Frontend Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui + Lucide Icons

Backend / dane Supabase + PostgreSQL

Auth Supabase Auth / role użytkowników

Pliki Supabase Storage

Automatyzacje n8n

Email Resend

Analityka PostHog + dane biznesowe z CRM

Hosting Vercel dla warstwy webowej + infrastruktura danych niezależna od frontendu

Bezpieczeństwo formularzy Cloudflare Turnstile (bez klasycznej, irytującej CAPTCHA)

Mapy Google Maps Platform

PWA panel mobilny jako aplikacja webowa instalowalna na telefonie

Aktualne wydania Next.js są już w linii 16.x (wersja 16.3 została wydana w sierpniu 2026). Supabase daje pełny PostgreSQL oraz zintegrowane Auth, Storage, Realtime i Edge Functions — Edge Functions mogą obsługiwać webhooki i integracje z zewnętrznymi usługami, co jest bardzo dobrym dopasowaniem do GREMPOOL, bo można mieć jeden backend zamiast stawiać osobno: SQL, auth, storage, API, serwer plików i system użytkowników.

Hosting

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 27 z 32

GREMPOOL DIGITAL

Warianty do rozważenia: Vercel albo Cloudflare (Workers / R2). Rekomendowany kierunek startowy to Vercel + Supabase na pierwszej wersji systemu; jeżeli później pojawi się większa presja na koszty lub infrastrukturę, możliwe jest przejście w stronę Cloudflare.

Automatyzacja

GREMPOOL DB = źródło prawdy n8n = automatyzacja

Supabase → n8n → email / SMS / CRM / powiadomienia / raporty

To ważne, żeby nie uzależniać logiki biznesowej od jednego silnika automatyzacji (workflow engine).

Email, mapy, SMS/WhatsApp

Resend — do potwierdzeń, wycen, powiadomień i wiadomości systemowych. Google Maps Platform — do lokalizacji firmy, obszaru działania, tras, lokalizacji zleceń i sprawdzania odległości; nie budujemy od razu pełnego „Ubera dla ciężarówek” — najpierw prosty, użyteczny system. Integrację SMS i WhatsApp warto wdrażać etapami — architektura powinna umożliwiać zmianę dostawcy kanału bez przebudowy całego systemu.

SMS: “Twoje zlecenie zostało potwierdzone.” SMS: “Pracownik GREMPOOL będzie około 14:00.”

WhatsApp — komunikacja z klientami, szczególnie: zdjęcia złomu, zdjęcia miejsca, zdjęcia materiału, lokalizacja.

D L A C Z E G O TA K I S TA C K Pozwala utrzymać jeden spójny system bez budowania osobno strony, CRM, katalogu, bazy klientów i panelu pracownika.

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 28 z 32

GREMPOOL DIGITAL

31 Model danych
Jak łączą się ze sobą poszczególne moduły systemu.

GREMPOOL DIGITAL ├── PUBLIC WEBSITE ├── ADMIN PANEL │ └── LEADS ───────────────┬── CRM │ └── ZLECENIA └──────────────── SUPABASE ───────────────────── ├── DATABASE ├── STORAGE ├── AUTH │ ├── Klienci │ ├── Leady │ ├── Zlecenia │ ├── Pojazdy │ ├── Maszyny │ ├── Materiały │ ├── Ceny │ ├── Realizacje │ ├── Opinie │ ├── Dokumenty │ └── Fakty │ └── n8n ├── Email ├── SMS ├── WhatsApp ├── Google └── Raporty

32 PWA zamiast osobnej aplikacji mobilnej
Panel GREMPOOL jako aplikacja webowa.

Panel GREMPOOL proponujemy zbudować jako PWA (Progressive Web App). Pracownik na telefonie wchodzi pod adres typu grepool.pl/panel i od razu dostaje aplikację — bez konieczności instalowania osobnej aplikacji z App Store lub Google Play.

Zlecenia Dodaj zdjęcie Otwórz lokalizację Zadzwoń Zakończ zlecenie

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 29 z 32

GREMPOOL DIGITAL

33 Roadmapa wdrożenia — MVP → V2 → V3
Budowa etapami, bez przepalania budżetu na funkcje drugorzędne.

Etap 1 — MVP

identyfikacja wizualna i system UI strona WWW

usługi

kontakt

Centrum szybkiej wyceny

CRM leadów

podstawowe zlecenia

panel administracyjny

podstawowy katalog materiałów

Etap 2 — Operations

kalendarz

flota maszyny

rezerwacje materiałów

biblioteka zdjęć

realizacje

opinie

automatyzacje

raporty

Etap 3 — Scale

PWA

rozbudowana analityka

automatyczne follow-upy bardziej zaawansowany katalog

dodatkowe integracje

rozszerzenie API

kolejne moduły zgodne z realnymi potrzebami firmy

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 30 z 32

GREMPOOL DIGITAL

34 Zakres rezultatów
Co finalnie ma działać.

Obszar Proponowane rozwiązanie

Portal publiczny responsywna strona GREMPOOL z usługami, materiałami, realizacjami i kontaktem

Panel operacyjny CRM + zlecenia + kalendarz + zasoby

Baza danych klienci, leady, usługi, materiały, pojazdy, maszyny, realizacje

Automatyzacje powiadomienia i procesy follow-up

Fact Control kontrola danych przed publikacją

Analityka dashboard i podstawowe raportowanie

PWA mobilny dostęp do najważniejszych funkcji

Dokumentacja opis modułów, procesów i podstawowego modelu danych

35 Szacowany nakład pracy
Do doprecyzowania razem z GREMPOOL.

Rzetelny szacunek nakładu pracy (osobodni per moduł oraz łączny czas realizacji MVP, Etapu 2 i Etapu 3) powinien powstać dopiero po zamknięciu listy decyzji z rozdziału 36 — dokładny zakres usług, parametry floty i maszyn, zasady wyceny oraz ostateczna hierarchia funkcji bezpośrednio wpływają na pracochłonność poszczególnych modułów. Rekomendujemy przygotowanie szczegółowego kosztorysu jako osobny, krótki dokument następujący bezpośrednio po zamknięciu kwestionariusza i akceptacji zakresu Etapu 1 (MVP).

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 31 z 32

GREMPOOL DIGITAL

36 Co należy ustalić przed rozpoczęciem developmentu
Lista decyzji, które powinny zostać potwierdzone na podstawie kwestionariusza GREMPOOL.

ostateczna hierarchia usług

dokładny zakres każdej usługi

parametry floty i maszyn zasady wyceny

obszar działania per usługa

zasady negocjacji

zasady odbioru złomu

rzeczywisty model sprzedaży materiałów

statusy i procesy zleceń

osoby i role użytkowników

kanały kontaktu źródła obecnych leadów

materiały wizualne

opinie i realizacje

dane wymagające weryfikacji przed publikacją

D O K U M E N T W E J Ś C I O W Y Szczegółowy kwestionariusz Fact-Driven Discovery dla GREMPOOL (dokument towarzyszący tej koncepcji) powinien być źródłem danych do konfiguracji systemu i tworzenia treści — a nie odwrotnie.

37 Rekomendacja końcowa
GREMPOOL jako spójny ekosystem cyfrowy.

Rekomendowany kierunek to nie „duża strona”, lecz mały, modularny system operacyjny dla firmy. Publiczna strona ma generować wartościowe zapytania, a panel ma zamieniać je w uporządkowane zlecenia. Katalog materiałów ma odzwierciedlać rzeczywistą dostępność, a warstwa Fact Control ma pilnować jakości danych.

Takie podejście pozwala zacząć od prostego MVP i rozwijać rozwiązanie bez wymiany fundamentów. Najpierw procesy, które oszczędzają czas i generują przychód; później funkcje zwiększające automatyzację i skalę.

P R O P O N O WA N A Z A S A D A P R O J E K TO WA Najpierw eliminujemy ręczne czynności, następnie porządkujemy dane, potem automatyzujemy, a dopiero na końcu dokładamy funkcje „efektowne”.

GREMPOOL | ZŁOM · TRANSPORT · USŁUGI

GREMPOOL Digital — Koncepcja systemu cyfrowego Strona 32 z 32