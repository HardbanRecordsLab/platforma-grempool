-- GREMPOOL — Migracja 3: tabele i zmiany robione wcześniej ręcznie w bazie,
-- nowe działy ogłoszeń oraz grupy w cenniku złomu.
-- Uruchom po supabase-schema.sql i supabase-migration-2.sql (jednorazowo).

-- Operator maszyny to zwykłe imię i nazwisko, nie konto użytkownika
ALTER TABLE public.machines DROP CONSTRAINT IF EXISTS machines_operator_fkey;
ALTER TABLE public.machines ALTER COLUMN operator TYPE TEXT USING operator::text;

-- Nowe działy tablicy ogłoszeń
ALTER TYPE material_category ADD VALUE IF NOT EXISTS 'maszyny';
ALTER TYPE material_category ADD VALUE IF NOT EXISTS 'pojazdy';
ALTER TYPE material_category ADD VALUE IF NOT EXISTS 'narzedzia';
ALTER TYPE material_category ADD VALUE IF NOT EXISTS 'kruszywa';
ALTER TYPE material_category ADD VALUE IF NOT EXISTS 'drewno';

-- Wiadomości z formularza kontaktowego
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  imie TEXT NOT NULL,
  nazwisko TEXT NOT NULL,
  email TEXT NOT NULL,
  telefon TEXT,
  temat TEXT NOT NULL,
  wiadomosc TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'nowa',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dodatkowe kafelki usług zarządzane w panelu
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nazwa TEXT NOT NULL,
  opis TEXT,
  zdjecie TEXT,
  href TEXT,
  kolejnosc INTEGER NOT NULL DEFAULT 0,
  aktywny BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Linki do mediów społecznościowych
CREATE TABLE IF NOT EXISTS public.social_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platforma TEXT NOT NULL,
  nazwa TEXT NOT NULL,
  url TEXT NOT NULL,
  opis TEXT,
  kolejnosc INTEGER NOT NULL DEFAULT 0,
  aktywny BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dostęp wyłącznie przez service role w trasach API
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_channels ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON public.contact_messages;
CREATE TRIGGER update_contact_messages_updated_at BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_social_channels_updated_at ON public.social_channels;
CREATE TRIGGER update_social_channels_updated_at BEFORE UPDATE ON public.social_channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Cennik złomu: podział na złom stalowy i kolorowy
ALTER TABLE public.scrap_prices ADD COLUMN IF NOT EXISTS grupa TEXT NOT NULL DEFAULT 'stalowy';
ALTER TABLE public.scrap_prices DROP CONSTRAINT IF EXISTS scrap_prices_grupa_check;
ALTER TABLE public.scrap_prices ADD CONSTRAINT scrap_prices_grupa_check CHECK (grupa IN ('stalowy', 'kolorowy'));
