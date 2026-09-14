-- GREMPOOL Database Schema
-- Uruchom w Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUMS
-- =============================================
CREATE TYPE lead_status AS ENUM (
  'nowy', 'do_uzupelnienia', 'do_wyceny', 'wycena_wyslana',
  'negocjacja', 'zaakceptowane', 'zaplanowane', 'w_realizacji',
  'zakonczone', 'utracone'
);

CREATE TYPE service_type AS ENUM (
  'skup_zlomu', 'transport', 'koparki', 'rozbiorki', 'materialy', 'klimatyzacja'
);

CREATE TYPE material_status AS ENUM (
  'dostepny', 'zarezerwowany', 'sprzedany', 'ukryty', 'do_weryfikacji'
);

CREATE TYPE material_category AS ENUM (
  'stal', 'cegla', 'okna', 'drzwi', 'inne'
);

CREATE TYPE user_role AS ENUM (
  'wlasciciel', 'koordynator', 'pracownik', 'magazyn', 'redaktor', 'audyt'
);

CREATE TYPE vehicle_type AS ENUM (
  'bus_krotki', 'bus_dlugi', 'wywrotka', 'ciezarowka', 'transport_aut'
);

CREATE TYPE vehicle_status AS ENUM (
  'dostepny', 'w_trakcie', 'przeglad', 'serwis'
);

CREATE TYPE machine_type AS ENUM (
  'koparka', 'koparkoladowarka', 'waldor'
);

CREATE TYPE machine_status AS ENUM (
  'dostepna', 'w_trakcie', 'przeglad', 'serwis'
);

CREATE TYPE fakt_status AS ENUM (
  'potwierdzone', 'do_sprawdzenia', 'wygasle', 'nie_publikowac'
);

CREATE TYPE realizacja_status AS ENUM (
  'robocza', 'zatwierdzona', 'publiczna'
);

-- =============================================
-- TABLES
-- =============================================

-- Users (extends auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  imie TEXT NOT NULL,
  nazwisko TEXT NOT NULL,
  rola user_role NOT NULL DEFAULT 'pracownik',
  telefon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  imie TEXT NOT NULL,
  nazwisko TEXT NOT NULL,
  firma TEXT,
  telefon TEXT NOT NULL,
  email TEXT,
  adres TEXT,
  miasto TEXT,
  kod_pocztowy TEXT,
  nip TEXT,
  uwagi TEXT,
  źródło TEXT,
  zgoda_marketing BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numer TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  klient_imie TEXT NOT NULL,
  klient_nazwisko TEXT NOT NULL,
  klient_telefon TEXT NOT NULL,
  klient_email TEXT,
  usluga service_type NOT NULL,
  lokalizacja TEXT NOT NULL,
  opis TEXT,
  zdjecia TEXT[] DEFAULT '{}',
  status lead_status NOT NULL DEFAULT 'nowy',
  data_kontaktu TIMESTAMPTZ DEFAULT NOW(),
  data_ostatniego_kontaktu TIMESTAMPTZ,
  przypisany_pracownik UUID REFERENCES public.users(id) ON DELETE SET NULL,
  notatki TEXT,
  wartosc_wyceny NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders (Zlecenia)
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numer TEXT UNIQUE NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  usluga service_type NOT NULL,
  lokalizacja TEXT NOT NULL,
  zakres TEXT,
  termin TIMESTAMPTZ NOT NULL,
  cena NUMERIC(12,2) DEFAULT 0,
  status lead_status NOT NULL DEFAULT 'zaplanowane',
  pojazd_id UUID,
  maszyna_id UUID,
  pracownik UUID REFERENCES public.users(id) ON DELETE SET NULL,
  notatki TEXT,
  zdjecia_przed TEXT[] DEFAULT '{}',
  zdjecia_po TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nazwa TEXT NOT NULL,
  typ vehicle_type NOT NULL,
  marka TEXT,
  model TEXT,
  rejestracja TEXT UNIQUE,
  ladownosc NUMERIC(8,2),
  wymiary TEXT,
  status vehicle_status NOT NULL DEFAULT 'dostepny',
  przeglad DATE,
  oc DATE,
  serwis DATE,
  vin TEXT,
  zdjecia TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Machines
CREATE TABLE public.machines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nazwa TEXT NOT NULL,
  typ machine_type NOT NULL,
  marka TEXT,
  model TEXT,
  masa NUMERIC(8,2),
  szerokosc NUMERIC(6,2),
  glebokosc NUMERIC(6,2),
  osprzet TEXT[] DEFAULT '{}',
  status machine_status NOT NULL DEFAULT 'dostepna',
  operator UUID REFERENCES public.users(id) ON DELETE SET NULL,
  last_inspection DATE,
  next_inspection DATE,
  zdjecia TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Materials
CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_materialu TEXT UNIQUE NOT NULL,
  kategoria material_category NOT NULL,
  nazwa TEXT NOT NULL,
  wymiary TEXT,
  dlugosc NUMERIC(8,2),
  ilosc INTEGER NOT NULL DEFAULT 1,
  stan TEXT DEFAULT 'uzywany',
  zdjecia TEXT[] DEFAULT '{}',
  lokalizacja TEXT,
  cena NUMERIC(12,2),
  status material_status NOT NULL DEFAULT 'dostepny',
  notatki TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reservations
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numer TEXT UNIQUE NOT NULL,
  material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  klient_telefon TEXT NOT NULL,
  termin_rezerwacji TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'aktywna',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Realizations
CREATE TABLE public.realizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  usluga service_type NOT NULL,
  lokalizacja TEXT NOT NULL,
  zakres TEXT,
  opis TEXT,
  zdjecia_przed TEXT[] DEFAULT '{}',
  zdjecia_w_trakcie TEXT[] DEFAULT '{}',
  zdjecia_po TEXT[] DEFAULT '{}',
  data_realizacji DATE NOT NULL,
  zgoda_publikacja BOOLEAN DEFAULT FALSE,
  zgoda_klient BOOLEAN DEFAULT FALSE,
  zgoda_lokalizacja BOOLEAN DEFAULT FALSE,
  status realizacja_status NOT NULL DEFAULT 'robocza',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photos
CREATE TABLE public.photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kategoria TEXT NOT NULL,
  usluga service_type,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  material_id UUID REFERENCES public.materials(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  opis TEXT,
  data DATE DEFAULT CURRENT_DATE,
  lokalizacja TEXT,
  zgoda_publikacja BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Facts (Fact Control)
CREATE TABLE public.facts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tresc TEXT NOT NULL,
  zrodlo TEXT,
  data_weryfikacji TIMESTAMPTZ DEFAULT NOW(),
  status fakt_status NOT NULL DEFAULT 'do_sprawdzenia',
  publikacja BOOLEAN DEFAULT FALSE,
  potwierdzajacy UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kategoria TEXT NOT NULL,
  nazwa TEXT NOT NULL,
  plik_url TEXT NOT NULL,
  data_waznosci DATE,
  opis TEXT,
  related_type TEXT,
  related_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  gwiazdki INTEGER CHECK (gwiazdki >= 1 AND gwiazdki <= 5),
  tresc TEXT,
  odpowiedz TEXT,
  data_odpowiedzi TIMESTAMPTZ,
  google_review_id TEXT,
  status TEXT DEFAULT 'nowa',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics Events
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL,
  page_url TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_usluga ON public.leads(usluga);
CREATE INDEX idx_leads_data ON public.leads(data_kontaktu DESC);
CREATE INDEX idx_leads_assigned ON public.leads(przypisany_pracownik);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_termin ON public.orders(termin);
CREATE INDEX idx_orders_pojazd ON public.orders(pojazd_id);
CREATE INDEX idx_orders_maszyna ON public.orders(maszyna_id);
CREATE INDEX idx_materials_status ON public.materials(status);
CREATE INDEX idx_materials_kategoria ON public.materials(kategoria);
CREATE INDEX idx_realizations_status ON public.realizations(status);
CREATE INDEX idx_analytics_event ON public.analytics_events(event_name);
CREATE INDEX idx_analytics_created ON public.analytics_events(created_at DESC);

-- =============================================
-- RLS (Row Level Security)
-- =============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.realizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Policies - Users can see their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Policies - Role based access
-- Owner/Admin: full access
-- Coordinator: leads, orders, calendar, vehicles, machines
-- Worker: assigned orders, photos, status updates
-- Warehouse: materials, reservations, photos
-- Editor: public content, FAQ, realizations
-- Auditor: fact verification

-- Leads - Coordinator/Owner/Worker (assigned)
CREATE POLICY "Coordinators can manage leads" ON public.leads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND rola IN ('wlasciciel', 'koordynator')
    )
  );

CREATE POLICY "Workers can view assigned leads" ON public.leads
  FOR SELECT USING (
    przypisany_pracownik = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND rola IN ('wlasciciel', 'koordynator')
    )
  );

-- Orders
CREATE POLICY "Coordinators/Owner manage orders" ON public.orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND rola IN ('wlasciciel', 'koordynator')
    )
  );

CREATE POLICY "Workers view assigned orders" ON public.orders
  FOR SELECT USING (
    pracownik = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND rola IN ('wlasciciel', 'koordynator')
    )
  );

-- Materials - Warehouse/Coordinator/Owner
CREATE POLICY "Warehouse/Coordinator/Owner manage materials" ON public.materials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND rola IN ('wlasciciel', 'koordynator', 'magazyn')
    )
  );

-- Public materials (for website)
CREATE POLICY "Public can view available materials" ON public.materials
  FOR SELECT USING (status = 'dostepny');

-- Realizations - Editor/Coordinator/Owner
CREATE POLICY "Editors manage realizations" ON public.realizations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND rola IN ('wlasciciel', 'koordynator', 'redaktor')
    )
  );

CREATE POLICY "Public can view published realizations" ON public.realizations
  FOR SELECT USING (status = 'publiczna');

-- Photos
CREATE POLICY "Authenticated can manage photos" ON public.photos
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can view public photos" ON public.photos
  FOR SELECT USING (zgoda_publikacja = true);

-- Facts - Auditor/Coordinator/Owner
CREATE POLICY "Auditors manage facts" ON public.facts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND rola IN ('wlasciciel', 'koordynator', 'audyt')
    )
  );

CREATE POLICY "Public can view confirmed facts" ON public.facts
  FOR SELECT USING (status = 'potwierdzone' AND publikacja = true);

-- Vehicles
CREATE POLICY "Coordinators/Owner manage vehicles" ON public.vehicles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND rola IN ('wlasciciel', 'koordynator')
    )
  );

-- Machines
CREATE POLICY "Coordinators/Owner manage machines" ON public.machines
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND rola IN ('wlasciciel', 'koordynator')
    )
  );

-- =============================================
-- TRIGGERS
-- =============================================
-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_machines_updated_at BEFORE UPDATE ON public.machines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON public.materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_realizations_updated_at BEFORE UPDATE ON public.realizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_facts_updated_at BEFORE UPDATE ON public.facts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTIONS
-- =============================================
-- Generate lead number
CREATE OR REPLACE FUNCTION generate_lead_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.numer IS NULL THEN
    NEW.numer := 'GRE-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('lead_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS lead_seq;

CREATE TRIGGER trigger_generate_lead_number
  BEFORE INSERT ON public.leads
  FOR EACH ROW EXECUTE FUNCTION generate_lead_number();

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.numer IS NULL THEN
    NEW.numer := 'GRE-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('order_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS order_seq;

CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Generate material ID
CREATE OR REPLACE FUNCTION generate_material_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id_materialu IS NULL THEN
    NEW.id_materialu := 'MAT-' || LPAD(nextval('material_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS material_seq;

CREATE TRIGGER trigger_generate_material_id
  BEFORE INSERT ON public.materials
  FOR EACH ROW EXECUTE FUNCTION generate_material_id();

-- Generate reservation number
CREATE OR REPLACE FUNCTION generate_reservation_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.numer IS NULL THEN
    NEW.numer := 'REZ-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('reservation_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS reservation_seq;

CREATE TRIGGER trigger_generate_reservation_number
  BEFORE INSERT ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION generate_reservation_number();

-- =============================================
-- STORAGE BUCKETS
-- =============================================
-- Run these in Supabase Storage:
-- 1. Create bucket: 'photos' (public: false)
-- 2. Create bucket: 'documents' (public: false)
-- 3. Create bucket: 'avatars' (public: true)
-- 3. Create bucket: 'public-images' (public: true)

-- Storage policies (run after creating buckets):
-- Photos bucket:
-- CREATE POLICY "Authenticated can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'photos');
-- CREATE POLICY "Authenticated can view own" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'photos');
-- CREATE POLICY "Public can view public photos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'public-images');

-- =============================================
-- SAMPLE DATA (optional)
-- =============================================
-- INSERT INTO public.users (id, email, imie, nazwisko, rola) VALUES
--   ('00000000-0000-0000-0000-000000000001', 'wlasciciel@grempool.pl', 'Właściciel', 'GREMPOOL', 'wlasciciel');