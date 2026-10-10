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

-- RODO: dowód potwierdzenia polityki prywatności w zapytaniach i wiadomościach.
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS zgoda_rodo_at TIMESTAMPTZ;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS zgoda_rodo_wersja TEXT;
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS zgoda_rodo_at TIMESTAMPTZ;
ALTER TABLE public.contact_messages ADD COLUMN IF NOT EXISTS zgoda_rodo_wersja TEXT;

-- Wyświetlenia ogłoszeń: jeden odwiedzający raz dziennie, bez zapisu w przeglądarce.
CREATE TABLE IF NOT EXISTS public.material_view_log (
  code TEXT NOT NULL,
  visitor TEXT NOT NULL,
  day DATE NOT NULL DEFAULT (NOW() AT TIME ZONE 'Europe/Warsaw')::date,
  PRIMARY KEY (code, visitor, day)
);
ALTER TABLE public.material_view_log ENABLE ROW LEVEL SECURITY;
DROP FUNCTION IF EXISTS public.material_viewed(TEXT);
CREATE OR REPLACE FUNCTION public.material_viewed(p_code TEXT, p_visitor TEXT) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inserted INTEGER;
BEGIN
  INSERT INTO material_view_log (code, visitor) VALUES (p_code, p_visitor) ON CONFLICT DO NOTHING;
  GET DIAGNOSTICS inserted = ROW_COUNT;
  IF inserted > 0 THEN
    UPDATE materials SET wyswietlenia = wyswietlenia + 1 WHERE id_materialu = p_code;
  END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.material_viewed(TEXT, TEXT) FROM PUBLIC, anon, authenticated;

-- Zestawienia skupu za dowolny okres (opcjonalnie tylko osoby prywatne albo tylko firmy).
drop function if exists public.scrap_summary(timestamptz, timestamptz, text);

create or replace function public.scrap_summary(p_from timestamptz, p_to timestamptz, p_bucket text, p_type text default null)
returns json language sql stable security definer set search_path = public as $$
  with base as (
    select * from scrap_purchases where data >= p_from and data < p_to
  ),
  base_items as (
    select b.id, b.data, b.sprzedawca_typ, b.sprzedawca_nazwa, e->>'nazwa' as nazwa, e->>'kod_odpadu' as kod,
           (e->>'waga_kg')::numeric as kg, (e->>'wartosc')::numeric as value
    from base b, jsonb_array_elements(b.pozycje) e
  ),
  p as (select * from base where p_type is null or sprzedawca_typ = p_type),
  items as (select * from base_items where p_type is null or sprzedawca_typ = p_type),
  bucket as (
    select case when p_bucket in ('day', 'week', 'month') then p_bucket else 'day' end as unit
  )
  select json_build_object(
    'receipts', (select count(*) from p),
    'kg', coalesce((select sum(kg) from items), 0),
    'value', coalesce((select sum(suma) from p), 0),
    'by_seller_type', coalesce((select json_agg(t order by t.typ) from (
        select b.sprzedawca_typ as typ, count(*) as receipts, sum(b.suma) as value,
               coalesce((select sum(i.kg) from base_items i where i.sprzedawca_typ = b.sprzedawca_typ), 0) as kg
        from base b group by b.sprzedawca_typ) t), '[]'::json),
    'by_material', coalesce((select json_agg(m order by m.kg desc) from (
        select nazwa as name, min(kod) as code, sum(kg) as kg, sum(value) as value, count(distinct id) as receipts
        from items group by nazwa) m), '[]'::json),
    'by_code', coalesce((select json_agg(c order by c.kg desc) from (
        select kod as code, sum(kg) as kg, sum(value) as value from items group by kod) c), '[]'::json),
    'by_payment', coalesce((select json_agg(x) from (
        select platnosc, count(*) as receipts, sum(suma) as value from p group by platnosc) x), '[]'::json),
    'buckets', coalesce((select json_agg(b order by b.bucket) from (
        select to_char(date_trunc((select unit from bucket), data at time zone 'Europe/Warsaw'), 'YYYY-MM-DD') as bucket,
               count(distinct id) as receipts, sum(kg) as kg, sum(value) as value
        from items group by 1) b), '[]'::json),
    'top_sellers', coalesce((select json_agg(s) from (
        select lower(sprzedawca_nazwa) as key, min(sprzedawca_nazwa) as name, count(distinct id) as receipts,
               sum(kg) as kg, sum(value) as value
        from items group by 1 order by sum(value) desc limit 10) s), '[]'::json)
  );
$$;
revoke all on function public.scrap_summary(timestamptz, timestamptz, text, text) from public, anon, authenticated;

-- Kwity w formie formularza przyjęcia odpadów metali (FPO): źródło pochodzenia i potwierdzenie sprawdzenia dokumentu.
ALTER TABLE public.scrap_purchases ADD COLUMN IF NOT EXISTS zrodlo_pochodzenia TEXT;
ALTER TABLE public.scrap_purchases ADD COLUMN IF NOT EXISTS dokument_zweryfikowany BOOLEAN NOT NULL DEFAULT FALSE;

-- Sprzedaż / dostawy złomu do hut i innych odbiorców (numeracja DZ-RRRR-00001).
CREATE SEQUENCE IF NOT EXISTS public.scrap_delivery_seq;
CREATE TABLE IF NOT EXISTS public.scrap_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numer TEXT UNIQUE,
  data TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  odbiorca_nazwa TEXT NOT NULL,
  odbiorca_nip TEXT,
  odbiorca_adres TEXT,
  odbiorca_bdo TEXT,
  nr_zamowienia TEXT,
  nr_rejestracyjny TEXT,
  przewoznik TEXT,
  waga_brutto NUMERIC(10,1),
  waga_tara NUMERIC(10,1),
  pozycje JSONB NOT NULL DEFAULT '[]'::jsonb,
  suma NUMERIC(12,2) NOT NULL DEFAULT 0,
  oswiadczenie_czystosci BOOLEAN NOT NULL DEFAULT FALSE,
  uwagi TEXT,
  wystawil TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE OR REPLACE FUNCTION public.generate_scrap_delivery_number() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.numer IS NULL THEN
    NEW.numer := 'DZ-' || to_char(COALESCE(NEW.data, NOW()) AT TIME ZONE 'Europe/Warsaw', 'YYYY') || '-' || lpad(nextval('scrap_delivery_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS set_scrap_delivery_number ON public.scrap_deliveries;
CREATE TRIGGER set_scrap_delivery_number BEFORE INSERT ON public.scrap_deliveries FOR EACH ROW EXECUTE FUNCTION generate_scrap_delivery_number();
DROP TRIGGER IF EXISTS update_scrap_deliveries_updated_at ON public.scrap_deliveries;
CREATE TRIGGER update_scrap_deliveries_updated_at BEFORE UPDATE ON public.scrap_deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
ALTER TABLE public.scrap_deliveries ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS scrap_deliveries_data_idx ON public.scrap_deliveries (data DESC);

-- Kartoteka klientów: stali sprzedający złomu, odbiorcy dostaw i klienci zapytań.
-- The table existed from the first CRM schema but was never used (empty).
-- Reshape it into the customer register.
do $$
declare c text;
begin
  if (select count(*) from public.clients) > 0 then
    raise exception 'clients is not empty, refusing to reshape it';
  end if;
  for c in
    select column_name from information_schema.columns
    where table_schema = 'public' and table_name = 'clients'
      and column_name not in ('id', 'telefon', 'email', 'adres', 'uwagi', 'created_at', 'updated_at', 'typ', 'nazwa', 'dokument', 'dokument_norm', 'bdo')
  loop
    execute format('alter table public.clients drop column %I', c);
  end loop;
end $$;

alter table public.clients add column if not exists typ text not null default 'osoba';
alter table public.clients add column if not exists nazwa text not null default '';
alter table public.clients add column if not exists dokument text;
alter table public.clients add column if not exists dokument_norm text;
alter table public.clients add column if not exists bdo text;
alter table public.clients alter column nazwa drop default;
alter table public.clients alter column telefon drop not null;
alter table public.clients drop constraint if exists clients_typ_check;
alter table public.clients add constraint clients_typ_check check (typ in ('osoba', 'firma'));

create unique index if not exists clients_typ_dokument_idx on public.clients (typ, dokument_norm) where dokument_norm is not null;
create index if not exists clients_nazwa_idx on public.clients (lower(nazwa));
alter table public.clients enable row level security;
drop trigger if exists update_clients_updated_at on public.clients;
create trigger update_clients_updated_at before update on public.clients for each row execute function update_updated_at_column();

alter table public.scrap_purchases add column if not exists client_id uuid references public.clients(id) on delete set null;
alter table public.scrap_deliveries add column if not exists client_id uuid references public.clients(id) on delete set null;
alter table public.offers add column if not exists client_id uuid references public.clients(id) on delete set null;
create index if not exists scrap_purchases_client_idx on public.scrap_purchases (client_id);
create index if not exists scrap_deliveries_client_idx on public.scrap_deliveries (client_id);

create or replace function public.clients_overview(p_q text default null, p_typ text default null)
returns json language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(r order by r.last_activity desc nulls last, lower(r.nazwa)), '[]'::json) from (
    select c.id, c.typ, c.nazwa, c.dokument, c.adres, c.telefon, c.email, c.bdo, c.uwagi, c.created_at,
           coalesce(p.receipts, 0) as receipts, coalesce(p.kg, 0) as kg, coalesce(p.value, 0) as value,
           coalesce(d.deliveries, 0) as deliveries,
           greatest(p.last_at, d.last_at, o.last_at) as last_activity
    from clients c
    left join (
      select client_id, count(*) as receipts, sum(suma) as value, max(data) as last_at,
             sum((select coalesce(sum((e->>'waga_kg')::numeric), 0) from jsonb_array_elements(pozycje) e)) as kg
      from scrap_purchases where client_id is not null group by client_id
    ) p on p.client_id = c.id
    left join (
      select client_id, count(*) as deliveries, max(data) as last_at
      from scrap_deliveries where client_id is not null group by client_id
    ) d on d.client_id = c.id
    left join (
      select client_id, max(created_at) as last_at from offers where client_id is not null group by client_id
    ) o on o.client_id = c.id
    where (p_typ is null or c.typ = p_typ)
      and (coalesce(p_q, '') = '' or c.nazwa ilike '%' || p_q || '%' or c.dokument ilike '%' || p_q || '%'
           or c.telefon ilike '%' || p_q || '%' or c.email ilike '%' || p_q || '%' or c.adres ilike '%' || p_q || '%'
           or (length(regexp_replace(p_q, '[^A-Za-z0-9]', '', 'g')) >= 3
               and c.dokument_norm like '%' || upper(regexp_replace(p_q, '[^A-Za-z0-9]', '', 'g')) || '%'))
  ) r;
$$;
revoke all on function public.clients_overview(text, text) from public, anon, authenticated;
