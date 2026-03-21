-- Update quotes table to support line items, titles, and richer quote data
-- This migration adds columns required by the quotes management UI

-- Add new columns
alter table public.quotes add column if not exists title text;
alter table public.quotes add column if not exists description text;
alter table public.quotes add column if not exists line_items jsonb;
alter table public.quotes add column if not exists subtotal numeric default 0;
alter table public.quotes add column if not exists tax_amount numeric default 0;
alter table public.quotes add column if not exists valid_until date;
alter table public.quotes add column if not exists sent_at timestamptz;
alter table public.quotes add column if not exists service_type_id uuid references public.service_types;

-- Make address_id optional (quotes may not always have an address)
alter table public.quotes alter column address_id drop not null;

-- Migrate existing data: copy services → line_items, notes → description, expires_at → valid_until
update public.quotes
set line_items = services,
    description = notes,
    valid_until = (expires_at at time zone 'UTC')::date
where line_items is null and services is not null;
