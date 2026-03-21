-- Add review text and company response columns to job_ratings
alter table public.job_ratings add column if not exists review text;
alter table public.job_ratings add column if not exists response text;
