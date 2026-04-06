-- Add onboarding_completed flag to profiles table
-- New signups default to false; existing users default to true (already onboarded)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

-- Mark all existing profiles as onboarded so they aren't forced through the flow
UPDATE public.profiles SET onboarding_completed = true WHERE onboarding_completed = false;

-- Also add sms_opt_in to profiles for 10DLC compliance tracking
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS sms_opt_in boolean NOT NULL DEFAULT false;
