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
