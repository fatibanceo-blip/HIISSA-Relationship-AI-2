-- Staging-only least-privilege correction for the NEW incident table.
-- Supabase default table privileges include TRUNCATE and other powers even
-- when code only GRANTs SELECT/INSERT/UPDATE. Remove the extra defaults.
-- EXISTING audit history and Founder approval tables are untouched.
revoke delete, truncate, references, trigger on table public.hiissa_operational_incidents from service_role;
