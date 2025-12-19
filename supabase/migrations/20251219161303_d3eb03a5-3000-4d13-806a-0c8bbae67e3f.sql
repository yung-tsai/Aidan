-- Create achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  threshold INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Allow all to read achievements (public data)
CREATE POLICY "Anyone can read achievements"
ON public.achievements FOR SELECT
USING (true);

-- Seed achievements
INSERT INTO public.achievements (key, name, description, icon, threshold) VALUES
  ('FIRST_LOG', 'First Log', 'Created your first journal entry', '◆', 1),
  ('WEEK_STREAK', 'Week Warrior', '7 consecutive days of entries', '★', 7),
  ('MONTH_STREAK', 'Monthly Master', '30 consecutive days', '♦', 30),
  ('CENTURY', 'Centurion', 'Reached 100 total entries', '◈', 100),
  ('WORDSMITH', 'Wordsmith', 'Wrote 1000+ words in one entry', '✎', 1000),
  ('NIGHT_OWL', 'Night Owl', 'Entry created after midnight', '◐', 1),
  ('EARLY_BIRD', 'Early Bird', 'Entry created before 6am', '◑', 1),
  ('TAG_MASTER', 'Tag Master', 'Used 10+ unique tags', '▣', 10),
  ('PURGE_RITUAL', 'Purge Ritual', 'Performed your first purge', '◎', 1),
  ('FIFTY_ENTRIES', 'Half Century', 'Reached 50 total entries', '⬢', 50),
  ('TEN_ENTRIES', 'Getting Started', 'Reached 10 total entries', '▲', 10);

-- Create user_achievements table
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  achievement_key TEXT REFERENCES public.achievements(key) NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  progress INTEGER DEFAULT 0,
  UNIQUE(session_id, achievement_key)
);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Allow all operations (no auth in this app)
CREATE POLICY "Allow all operations on user_achievements"
ON public.user_achievements FOR ALL
USING (true)
WITH CHECK (true);