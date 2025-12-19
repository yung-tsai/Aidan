-- Add unique constraint on session_id for daily_goals to enable upsert
ALTER TABLE public.daily_goals ADD CONSTRAINT daily_goals_session_id_unique UNIQUE (session_id);