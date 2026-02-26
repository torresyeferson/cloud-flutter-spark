
-- Add location columns to events
ALTER TABLE public.events ADD COLUMN latitude DOUBLE PRECISION;
ALTER TABLE public.events ADD COLUMN longitude DOUBLE PRECISION;
ALTER TABLE public.events ADD COLUMN address TEXT;
