-- Drop assessment_responses table
DROP TABLE IF EXISTS public.assessment_responses CASCADE;

-- Create new assessments table
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.assessment_sessions(id) ON DELETE CASCADE,
  chat TEXT NOT NULL DEFAULT '',
  qna JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Add "Allow anon" policy for assessments
DROP POLICY IF EXISTS "Allow anon" ON public.assessments;
CREATE POLICY "Allow anon" 
ON public.assessments
FOR ALL 
USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_assessments_session_id ON public.assessments(session_id);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_assessments_updated_at
  BEFORE UPDATE ON public.assessments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

