-- Update assessment_responses: rename question_id to question_value
ALTER TABLE public.assessment_responses 
RENAME COLUMN question_id TO question_value;

-- Remove chat_messages column if it exists (we pass chat via state, not database)
ALTER TABLE public.assessment_sessions 
DROP COLUMN IF EXISTS chat_messages;

-- Remove assessment_questions column if it exists (not needed)
ALTER TABLE public.assessment_sessions 
DROP COLUMN IF EXISTS assessment_questions;

-- Ensure foreign key constraints are correct
-- assessment_sessions.user_id -> profiles.id (should already exist)
-- assessment_responses.session_id -> assessment_sessions.id (should already exist)
-- assessment_results.session_id -> assessment_sessions.id (should already exist)

-- Add RLS policies for assessment_responses
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist, then create new ones
DROP POLICY IF EXISTS "Users can view their own assessment responses" ON public.assessment_responses;
DROP POLICY IF EXISTS "Users can create their own assessment responses" ON public.assessment_responses;
DROP POLICY IF EXISTS "Users can update their own assessment responses" ON public.assessment_responses;

CREATE POLICY "Users can view their own assessment responses"
  ON public.assessment_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.assessment_sessions
      WHERE assessment_sessions.id = assessment_responses.session_id
      AND assessment_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own assessment responses"
  ON public.assessment_responses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assessment_sessions
      WHERE assessment_sessions.id = assessment_responses.session_id
      AND assessment_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own assessment responses"
  ON public.assessment_responses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.assessment_sessions
      WHERE assessment_sessions.id = assessment_responses.session_id
      AND assessment_sessions.user_id = auth.uid()
    )
  );

-- Add RLS policies for assessment_results
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist, then create new ones
DROP POLICY IF EXISTS "Users can view their own assessment results" ON public.assessment_results;
DROP POLICY IF EXISTS "Users can create their own assessment results" ON public.assessment_results;
DROP POLICY IF EXISTS "Users can update their own assessment results" ON public.assessment_results;

CREATE POLICY "Users can view their own assessment results"
  ON public.assessment_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.assessment_sessions
      WHERE assessment_sessions.id = assessment_results.session_id
      AND assessment_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own assessment results"
  ON public.assessment_results FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assessment_sessions
      WHERE assessment_sessions.id = assessment_results.session_id
      AND assessment_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own assessment results"
  ON public.assessment_results FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.assessment_sessions
      WHERE assessment_sessions.id = assessment_results.session_id
      AND assessment_sessions.user_id = auth.uid()
    )
  );

