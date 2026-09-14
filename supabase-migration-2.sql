-- GREMPOOL — Migracja 2: kalendarz (zadania + preferowany termin leada) i cennik złomu
-- Uruchom całość w Supabase SQL Editor (jednorazowo)

-- Kalendarz: preferowany termin realizacji podany przez klienta w zapytaniu
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS preferowany_termin DATE;

-- Kalendarz: zadania dodawane ręcznie przez admina (niepowiązane ze zleceniem)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tytul TEXT NOT NULL,
  opis TEXT,
  data DATE NOT NULL,
  godzina TIME,
  status TEXT NOT NULL DEFAULT 'do_zrobienia',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_data ON public.tasks(data);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Cennik skupu złomu (edytowalny w panelu admina, wyświetlany publicznie)
CREATE TABLE IF NOT EXISTS public.scrap_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nazwa TEXT NOT NULL,
  cena_od NUMERIC(10,2) NOT NULL,
  jednostka TEXT NOT NULL DEFAULT 'zł/kg',
  kolejnosc INTEGER NOT NULL DEFAULT 0,
  aktywny BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scrap_prices_kolejnosc ON public.scrap_prices(kolejnosc);
ALTER TABLE public.scrap_prices ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_scrap_prices_updated_at BEFORE UPDATE ON public.scrap_prices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
