-- Table: micro_apps
CREATE TABLE IF NOT EXISTS micro_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_es TEXT,
  description_en TEXT,
  icon TEXT DEFAULT 'Sparkles',
  form_schema JSONB NOT NULL,
  autofill_presets JSONB DEFAULT '[]',
  prompt_template TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: app_executions
CREATE TABLE IF NOT EXISTS app_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  app_id UUID REFERENCES micro_apps(id) ON DELETE CASCADE NOT NULL,
  inputs JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- RLS
ALTER TABLE micro_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_executions ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can select micro_apps') THEN
    CREATE POLICY "Users can select micro_apps" ON micro_apps FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can select own executions') THEN
    CREATE POLICY "Users can select own executions" ON app_executions FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own executions') THEN
    CREATE POLICY "Users can insert own executions" ON app_executions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own executions') THEN
    CREATE POLICY "Users can update own executions" ON app_executions FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE app_executions;

-- ==========================================
-- CONTROL LAYER (Plans & Access Control)
-- ==========================================

-- Table: plans
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_es TEXT,
  description_en TEXT,
  price_monthly DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: plan_apps (Junction)
CREATE TABLE IF NOT EXISTS plan_apps (
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE NOT NULL,
  app_id UUID REFERENCES micro_apps(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (plan_id, app_id)
);

-- Table: user_app_overrides
CREATE TABLE IF NOT EXISTS user_app_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  app_id UUID REFERENCES micro_apps(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, app_id)
);

-- Update users table to include plan_id
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'plan_id') THEN
    ALTER TABLE public.users ADD COLUMN plan_id UUID REFERENCES plans(id);
  END IF;
END $$;

-- RLS for new tables
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_app_overrides ENABLE ROW LEVEL SECURITY;

-- Policies for plans
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view active plans') THEN
    CREATE POLICY "Anyone can view active plans" ON plans FOR SELECT USING (is_active = true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage plans') THEN
    CREATE POLICY "Admins can manage plans" ON plans FOR ALL USING (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

-- Policies for plan_apps
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view plan_apps') THEN
    CREATE POLICY "Anyone can view plan_apps" ON plan_apps FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage plan_apps') THEN
    CREATE POLICY "Admins can manage plan_apps" ON plan_apps FOR ALL USING (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

-- Policies for user_app_overrides
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own overrides') THEN
    CREATE POLICY "Users can view own overrides" ON user_app_overrides FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage overrides') THEN
    CREATE POLICY "Admins can manage overrides" ON user_app_overrides FOR ALL USING (
      EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

-- Seed initial plans
INSERT INTO plans (slug, name_es, name_en, description_es, description_en, price_monthly, sort_order)
VALUES 
  ('basic', 'Plan Basic', 'Basic Plan', 'Acceso a las herramientas esenciales.', 'Access to essential tools.', 29, 1),
  ('intermediary', 'Plan Intermediary', 'Intermediary Plan', 'Más potencia y límites ampliados.', 'More power and extended limits.', 49, 2),
  ('professional', 'Plan Professional', 'Professional Plan', 'Para usuarios avanzados y profesionales.', 'For advanced and professional users.', 97, 3),
  ('enterprise', 'Plan Enterprise', 'Enterprise Plan', 'Control total y soporte prioritario.', 'Full control and priority support.', 197, 4)
ON CONFLICT (slug) DO NOTHING;

-- Assign Basic plan to users without a plan
UPDATE public.users SET plan_id = (SELECT id FROM plans WHERE slug = 'basic') WHERE plan_id IS NULL;

-- Update trigger function to assign default plan
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_plan_id UUID;
BEGIN
  -- Get the ID of the basic plan
  SELECT id INTO default_plan_id FROM public.plans WHERE slug = 'basic';

  INSERT INTO public.users (id, email, first_name, last_name, plan_id)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    default_plan_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Default app assignments
INSERT INTO plan_apps (plan_id, app_id)
SELECT p.id, m.id 
FROM plans p, micro_apps m
WHERE p.slug IN ('professional', 'enterprise')
ON CONFLICT DO NOTHING;

-- Assign apps to Intermediary plan
INSERT INTO plan_apps (plan_id, app_id)
SELECT p.id, m.id 
FROM plans p, micro_apps m
WHERE p.slug = 'intermediary' AND m.slug IN ('article-gen', 'image-gen')
ON CONFLICT DO NOTHING;

-- Assign 'article-gen' specifically to Basic plan
INSERT INTO plan_apps (plan_id, app_id)
SELECT p.id, m.id 
FROM plans p, micro_apps m
WHERE p.slug = 'basic' AND m.slug = 'article-gen'
ON CONFLICT DO NOTHING;
