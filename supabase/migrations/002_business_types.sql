-- Add business_type to companies
ALTER TABLE public.companies
  ADD COLUMN business_type text NOT NULL DEFAULT 'lawn_care'
  CHECK (business_type IN (
    'lawn_care', 'pool_service', 'property_cleaning', 'pressure_washing',
    'pest_control', 'hvac', 'window_cleaning', 'handyman', 'multi_service'
  ));

-- Company services table (owner-customizable)
CREATE TABLE public.company_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  default_price integer NOT NULL DEFAULT 0, -- cents
  category text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.company_services ENABLE ROW LEVEL SECURITY;

-- Owners can manage their company's services
CREATE POLICY "owners can manage company services"
  ON public.company_services FOR ALL
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE owner_id = auth.uid()
    )
  );

-- Clients/crew can read their company's services
CREATE POLICY "members can read company services"
  ON public.company_services FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Index for fast lookups
CREATE INDEX idx_company_services_company ON public.company_services(company_id);
