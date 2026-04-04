-- Create the profiles table if it doesn't exist
-- The app code references 'profiles' but the DB was set up with migration 010
-- which only created 'users'. This migration adds the profiles table that the
-- application code expects.

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id uuid REFERENCES public.companies(id),  -- nullable for bootstrap order
  role text NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'crew', 'client')),
  full_name text NOT NULL,
  phone text NOT NULL DEFAULT '',
  avatar_url text,
  email text,
  first_name text,
  last_name text,
  username text UNIQUE,
  is_platform_owner boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "users can read own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "owners can read company profiles"
  ON public.profiles FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "owners can insert company profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);  -- admin client bypasses RLS, but needed for invite flows

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_company ON public.profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username) WHERE username IS NOT NULL;

-- Also ensure company_services table exists (referenced in signup)
CREATE TABLE IF NOT EXISTS public.company_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  default_price integer NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.company_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "owners can manage company services"
  ON public.company_services FOR ALL
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE owner_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_company_services_company ON public.company_services(company_id);
