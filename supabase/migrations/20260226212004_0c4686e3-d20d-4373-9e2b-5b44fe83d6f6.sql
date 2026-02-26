
-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('cultural', 'deportivo', 'cívico', 'político', 'social', 'empresarial')),
  institution TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can view events"
  ON public.events FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their events"
  ON public.events FOR UPDATE
  USING (auth.uid() = created_by);

-- Add event_id to check_ins (optional link)
ALTER TABLE public.check_ins ADD COLUMN event_id UUID REFERENCES public.events(id);
