export type LeadStatus = 
  | 'nowy' 
  | 'do_uzupelnienia' 
  | 'do_wyceny' 
  | 'wycena_wyslana' 
  | 'negocjacja' 
  | 'zaakceptowane' 
  | 'zaplanowane' 
  | 'w_realizacji' 
  | 'zakonczone' 
  | 'utracone';

export type ServiceType = 
  | 'skup_zlomu' 
  | 'transport' 
  | 'koparki' 
  | 'rozbiorki' 
  | 'materialy' 
  | 'klimatyzacja';

export type MaterialStatus = 
  | 'dostepny' 
  | 'zarezerwowany' 
  | 'sprzedany' 
  | 'ukryty' 
  | 'do_weryfikacji';

export interface Lead {
  id: string;
  numer: string;
  klient_imie: string;
  klient_nazwisko: string;
  klient_telefon: string;
  klient_email?: string;
  usluga: ServiceType;
  lokalizacja: string;
  opis: string;
  zdjecia?: string[];
  status: LeadStatus;
  data_kontaktu: string;
  data_ostatniego_kontaktu?: string;
  przypisany_pracownik?: string;
  notatki?: string;
  wartosc_wyceny?: number;
  preferowany_termin?: string;
  utworzone: string;
  zaktualizowane: string;
}

export interface Zlecenie {
  id: string;
  numer: string;
  lead_id?: string;
  klient_id: string;
  usluga: ServiceType;
  lokalizacja: string;
  zakres: string;
  termin: string;
  cena: number;
  status: LeadStatus;
  pojazd_id?: string;
  maszyna_id?: string;
  pracownik?: string;
  notatki?: string;
  zdjecia_przed?: string[];
  zdjecia_po?: string[];
  utworzone: string;
  zaktualizowane: string;
}

export interface Pojazd {
  id: string;
  nazwa: string;
  typ: 'bus_krotki' | 'bus_dlugi' | 'wywrotka' | 'ciezarowka' | 'transport_aut';
  marka: string;
  model: string;
  rejestracja: string;
  ladownosc: number;
  wymiary: string;
  status: 'dostepny' | 'w_trakcie' | 'przeglad' | 'serwis';
  przeglad?: string;
  oc?: string;
  serwis?: string;
  utworzone: string;
}

export interface Maszyna {
  id: string;
  nazwa: string;
  typ: 'koparka' | 'koparkoladowarka' | 'waldor';
  marka: string;
  model: string;
  masa: number;
  szerokosc: number;
  glebokosc: number;
  osprzet: string[];
  status: 'dostepna' | 'w_trakcie' | 'przeglad' | 'serwis';
  operator?: string;
  utworzone: string;
}

export interface Material {
  id: string;
  id_materialu: string;
  kategoria: 'stal' | 'cegla' | 'okna' | 'drzwi' | 'inne';
  nazwa: string;
  wymiary: string;
  dlugosc?: number;
  ilosc: number;
  stan: 'nowy' | 'uzywany' | 'dobry' | 'uszkodzony';
  zdjecia?: string[];
  lokalizacja: string;
  cena?: number;
  status: MaterialStatus;
  notatki?: string;
  utworzone: string;
  zaktualizowane: string;
}

export interface Realizacja {
  id: string;
  zlecenie_id: string;
  usluga: ServiceType;
  lokalizacja: string;
  zakres: string;
  opis: string;
  zdjecia_przed: string[];
  zdjecia_w_trakcie: string[];
  zdjecia_po: string[];
  data_realizacji: string;
  zgoda_publikacja: boolean;
  status: 'robocza' | 'zatwierdzona' | 'publiczna';
  utworzone: string;
}

export interface Fakt {
  id: string;
  tresc: string;
  zrodlo: string;
  data_weryfikacji: string;
  status: 'potwierdzone' | 'do_sprawdzenia' | 'wygasle' | 'nie_publikowac';
  publikacja: boolean;
  utworzone: string;
}

export interface Task {
  id: string;
  tytul: string;
  opis?: string;
  data: string;
  godzina?: string;
  status: 'do_zrobienia' | 'w_trakcie' | 'zrobione';
  utworzone: string;
  zaktualizowane: string;
}

export interface ScrapPrice {
  id: string;
  nazwa: string;
  cena_od: number;
  jednostka: string;
  kolejnosc: number;
  aktywny: boolean;
  utworzone: string;
  zaktualizowane: string;
}

export interface CustomService {
  id: string;
  nazwa: string;
  opis?: string;
  zdjecie?: string;
  href?: string;
  kolejnosc: number;
  aktywny: boolean;
  utworzone: string;
  zaktualizowane: string;
}

export interface SocialChannel {
  id: string;
  platforma: string;
  nazwa: string;
  url: string;
  opis?: string;
  kolejnosc: number;
  aktywny: boolean;
  utworzone: string;
  zaktualizowane: string;
}

export interface User {
  id: string;
  email: string;
  imie: string;
  nazwisko: string;
  rola: 'wlasciciel' | 'koordynator' | 'pracownik' | 'magazyn' | 'redaktor' | 'audyt';
  utworzone: string;
}
