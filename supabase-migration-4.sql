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
