-- Add assessment_analysis JSONB column to assessments table
ALTER TABLE public.assessments 
ADD COLUMN IF NOT EXISTS assessment_analysis JSONB DEFAULT NULL;

-- Add comment to describe the column
COMMENT ON COLUMN public.assessments.assessment_analysis IS 'Stores analysis results and insights from the assessment in JSON format';

