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
