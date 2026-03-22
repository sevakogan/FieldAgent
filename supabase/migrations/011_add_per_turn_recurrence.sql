-- Add 'per_turn' to address_services recurrence check constraint
ALTER TABLE public.address_services DROP CONSTRAINT IF EXISTS address_services_recurrence_check;
ALTER TABLE public.address_services ADD CONSTRAINT address_services_recurrence_check 
  CHECK (recurrence IN ('one_time', 'weekly', 'biweekly', 'monthly', 'per_turn'));
