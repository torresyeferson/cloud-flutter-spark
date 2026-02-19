
-- Table to store check-in records
CREATE TABLE public.check_ins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  institution TEXT NOT NULL,
  check_in_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  result TEXT NOT NULL CHECK (result IN ('verde', 'amarillo', 'rojo')),
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own check-ins"
  ON public.check_ins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own check-ins"
  ON public.check_ins FOR SELECT
  USING (auth.uid() = user_id);

-- Allow reading aggregated data via a function (public read for ranking)
CREATE POLICY "Anyone authenticated can read check-ins for ranking"
  ON public.check_ins FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Function to get institutional ranking
CREATE OR REPLACE FUNCTION public.get_institution_ranking()
RETURNS TABLE (
  institution TEXT,
  total_checkins BIGINT,
  on_time_checkins BIGINT,
  pct NUMERIC,
  members BIGINT,
  total_points BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    c.institution,
    COUNT(*) as total_checkins,
    COUNT(*) FILTER (WHERE c.result = 'verde') as on_time_checkins,
    ROUND(COUNT(*) FILTER (WHERE c.result = 'verde') * 100.0 / NULLIF(COUNT(*), 0), 0) as pct,
    COUNT(DISTINCT c.user_id) as members,
    COALESCE(SUM(c.points), 0) as total_points
  FROM public.check_ins c
  WHERE c.institution IS NOT NULL AND c.institution != ''
  GROUP BY c.institution
  ORDER BY pct DESC, total_points DESC;
$$;
