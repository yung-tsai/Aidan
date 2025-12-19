-- Create daily_goals table
CREATE TABLE public.daily_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  target_words INTEGER DEFAULT 500,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id)
);

-- Enable RLS
ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;

-- Allow all operations (matching existing app pattern)
CREATE POLICY "Allow all operations on daily_goals"
ON public.daily_goals
FOR ALL
USING (true)
WITH CHECK (true);