-- Add tags column to journal_entries table
ALTER TABLE public.journal_entries 
ADD COLUMN tags TEXT[] DEFAULT '{}'::TEXT[];