import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const SERVICE_LABELS: Record<string, string> = {
  skup_zlomu: 'Skup Złomu',
  transport: 'Transport',
  koparki: 'Usługi Koparką',
  rozbiorki: 'Rozbiórki',
  materialy: 'Materiały Budowlane',
  klimatyzacja: 'Klimatyzacja Aut'
};

export const STATUS_LABELS: Record<string, string> = {
  nowy: 'Nowe',
  do_uzupelnienia: 'Do uzupełnienia',
  do_wyceny: 'Do wyceny',
  wycena_wyslana: 'Wycena wysłana',
  negocjacja: 'Negocjacja',
  zaakceptowane: 'Zaakceptowane',
  zaplanowane: 'Zaplanowane',
  w_realizacji: 'W realizacji',
  zakonczone: 'Zakończone',
  utracone: 'Utracone'
};

export const MATERIAL_STATUS_LABELS: Record<string, string> = {
  dostepny: 'Dostępny',
  zarezerwowany: 'Zarezerwowany',
  sprzedany: 'Sprzedany',
  ukryty: 'Ukryty',
  do_weryfikacji: 'Do weryfikacji'
};

export type LeadStatus = keyof typeof STATUS_LABELS;
export type ServiceType = keyof typeof SERVICE_LABELS;
export type MaterialStatus = keyof typeof MATERIAL_STATUS_LABELS;

export interface Lead {
  id: string;
  numer: string;
  client_id?: string;
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
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  numer: string;
  lead_id?: string;
  client_id?: string;
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
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  nazwa: string;
  typ: string;
  marka: string;
  model: string;
  rejestracja: string;
  ladownosc: number;
  wymiary: string;
  status: string;
  przeglad?: string;
  oc?: string;
  serwis?: string;
  created_at: string;
}

export interface Machine {
  id: string;
  nazwa: string;
  typ: string;
  marka: string;
  model: string;
  masa: number;
  szerokosc: number;
  glebokosc: number;
  osprzet: string[];
  status: string;
  operator?: string;
  created_at: string;
}

export interface Material {
  id: string;
  id_materialu: string;
  kategoria: string;
  nazwa: string;
  wymiary: string;
  dlugosc?: number;
  ilosc: number;
  stan: string;
  zdjecia?: string[];
  lokalizacja: string;
  cena?: number;
  status: MaterialStatus;
  notatki?: string;
  created_at: string;
  updated_at: string;
}

export interface Realization {
  id: string;
  order_id?: string;
  usluga: ServiceType;
  lokalizacja: string;
  zakres: string;
  opis: string;
  zdjecia_przed: string[];
  zdjecia_w_trakcie: string[];
  zdjecia_po: string[];
  data_realizacji: string;
  zgoda_publikacja: boolean;
  status: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  imie: string;
  nazwisko: string;
  rola: string;
  created_at: string;
}