-- GREMPOOL — Migracja 4: ustawienia strony edytowane w panelu (Ustawienia).
-- Uruchom po supabase-migration-3.sql (jednorazowo).

-- Jeden wiersz z danymi firmy, godzinami, komunikatem, trybem DEMO
-- i tekstami strony głównej (JSON). Brakujące pola biorą wartości domyślne z kodu.
CREATE TABLE IF NOT EXISTS public.site_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
INSERT INTO public.site_settings (id, data) VALUES (1, '{}'::jsonb) ON CONFLICT (id) DO NOTHING;

-- Ogłoszenia: opis dla klientów, wyróżnienie na stronie głównej, liczniki.
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS opis TEXT;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS wyrozniony BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS wyswietlenia INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS zapytania INTEGER NOT NULL DEFAULT 0;

-- Liczniki zwiększane atomowo przez API (tylko service role).
CREATE OR REPLACE FUNCTION public.material_viewed(p_code TEXT) RETURNS VOID
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE materials SET wyswietlenia = wyswietlenia + 1 WHERE id_materialu = p_code;
$$;
CREATE OR REPLACE FUNCTION public.material_inquired(p_code TEXT) RETURNS VOID
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE materials SET zapytania = zapytania + 1 WHERE id_materialu = p_code;
$$;
REVOKE ALL ON FUNCTION public.material_viewed(TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.material_inquired(TEXT) FROM PUBLIC, anon, authenticated;

-- Skup złomu: kwity (rejestr skupu) z numeracją KS-RRRR-00001.
CREATE SEQUENCE IF NOT EXISTS public.scrap_purchase_seq;
CREATE TABLE IF NOT EXISTS public.scrap_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numer TEXT UNIQUE,
  data TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sprzedawca_typ TEXT NOT NULL DEFAULT 'osoba' CHECK (sprzedawca_typ IN ('osoba', 'firma')),
  sprzedawca_nazwa TEXT NOT NULL,
  sprzedawca_dokument TEXT,
  sprzedawca_adres TEXT,
  sprzedawca_telefon TEXT,
  sprzedawca_email TEXT,
  nr_rejestracyjny TEXT,
  waga_brutto NUMERIC(10,1),
  waga_tara NUMERIC(10,1),
  pozycje JSONB NOT NULL DEFAULT '[]'::jsonb,
  suma NUMERIC(12,2) NOT NULL DEFAULT 0,
  platnosc TEXT NOT NULL DEFAULT 'gotowka' CHECK (platnosc IN ('gotowka', 'przelew')),
  uwagi TEXT,
  wystawil TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE OR REPLACE FUNCTION public.generate_scrap_purchase_number() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.numer IS NULL THEN
    NEW.numer := 'KS-' || to_char(COALESCE(NEW.data, NOW()), 'YYYY') || '-' || lpad(nextval('scrap_purchase_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS set_scrap_purchase_number ON public.scrap_purchases;
CREATE TRIGGER set_scrap_purchase_number BEFORE INSERT ON public.scrap_purchases
  FOR EACH ROW EXECUTE FUNCTION generate_scrap_purchase_number();
DROP TRIGGER IF EXISTS update_scrap_purchases_updated_at ON public.scrap_purchases;
CREATE TRIGGER update_scrap_purchases_updated_at BEFORE UPDATE ON public.scrap_purchases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE public.scrap_purchases ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS scrap_purchases_data_idx ON public.scrap_purchases (data DESC);

-- Historia zmian cen w cenniku złomu.
CREATE TABLE IF NOT EXISTS public.scrap_price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scrap_price_id UUID REFERENCES public.scrap_prices(id) ON DELETE SET NULL,
  nazwa TEXT NOT NULL,
  cena_stara NUMERIC(10,2),
  cena_nowa NUMERIC(10,2),
  zmienil TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.scrap_price_history ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS scrap_price_history_created_idx ON public.scrap_price_history (created_at DESC);

-- Powiadomienia push w panelu (urządzenia, które je włączyły).
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  login TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Wiadomości e-mail wysłane klientom z panelu (historia odpowiedzi).
CREATE TABLE IF NOT EXISTS public.client_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kind TEXT NOT NULL CHECK (kind IN ('lead', 'message', 'offer', 'receipt')),
  ref_id UUID,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.client_emails ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS client_emails_ref_idx ON public.client_emails (ref_id, created_at DESC);

-- Oferty dla klientów z numeracją OF-RRRR-00001.
CREATE SEQUENCE IF NOT EXISTS public.offer_seq;
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numer TEXT UNIQUE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  klient_nazwa TEXT NOT NULL,
  klient_email TEXT,
  klient_telefon TEXT,
  klient_adres TEXT,
  temat TEXT,
  pozycje JSONB NOT NULL DEFAULT '[]'::jsonb,
  vat TEXT NOT NULL DEFAULT '23' CHECK (vat IN ('zw', '8', '23')),
  suma_netto NUMERIC(12,2) NOT NULL DEFAULT 0,
  suma_brutto NUMERIC(12,2) NOT NULL DEFAULT 0,
  waznosc_dni INTEGER NOT NULL DEFAULT 14,
  uwagi TEXT,
  wystawil TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE OR REPLACE FUNCTION public.generate_offer_number() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.numer IS NULL THEN
    NEW.numer := 'OF-' || to_char(NOW(), 'YYYY') || '-' || lpad(nextval('offer_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS set_offer_number ON public.offers;
CREATE TRIGGER set_offer_number BEFORE INSERT ON public.offers FOR EACH ROW EXECUTE FUNCTION generate_offer_number();
DROP TRIGGER IF EXISTS update_offers_updated_at ON public.offers;
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Statystyki odwiedzin (anonimowe: bez IP, odwiedzający = dzienny hash).
CREATE TABLE IF NOT EXISTS public.page_views (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  path TEXT NOT NULL,
  referrer TEXT,
  device TEXT,
  visitor TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS page_views_created_idx ON public.page_views (created_at DESC);

CREATE OR REPLACE FUNCTION public.page_view_stats(p_days INTEGER)
RETURNS JSON LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH v AS (SELECT * FROM page_views WHERE created_at >= NOW() - make_interval(days => p_days))
  SELECT json_build_object(
    'total', (SELECT count(*) FROM v),
    'visitors', (SELECT count(DISTINCT visitor) FROM v),
    'daily', COALESCE((SELECT json_agg(d ORDER BY d.day) FROM (
        SELECT to_char(date_trunc('day', created_at AT TIME ZONE 'Europe/Warsaw'), 'YYYY-MM-DD') AS day,
               count(*) AS views, count(DISTINCT visitor) AS visitors
        FROM v GROUP BY 1) d), '[]'::json),
    'pages', COALESCE((SELECT json_agg(p) FROM (
        SELECT path, count(*) AS views FROM v GROUP BY path ORDER BY views DESC LIMIT 15) p), '[]'::json),
    'sources', COALESCE((SELECT json_agg(s) FROM (
        SELECT COALESCE(NULLIF(referrer, ''), 'bezpośrednio') AS source, count(*) AS views
        FROM v GROUP BY 1 ORDER BY views DESC LIMIT 10) s), '[]'::json),
    'devices', COALESCE((SELECT json_agg(x) FROM (
        SELECT COALESCE(device, 'inne') AS device, count(*) AS views FROM v GROUP BY 1 ORDER BY views DESC) x), '[]'::json)
  );
$$;
REVOKE ALL ON FUNCTION public.page_view_stats(INTEGER) FROM PUBLIC, anon, authenticated;

-- Dziennik zmian w panelu.
CREATE TABLE IF NOT EXISTS public.audit_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  login TEXT,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS audit_log_created_idx ON public.audit_log (created_at DESC);

-- Hasła zmienione w panelu (skrót scrypt); bez wpisu obowiązuje ADMIN_USERS.
CREATE TABLE IF NOT EXISTS public.admin_users (
  login TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
