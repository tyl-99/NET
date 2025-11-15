-- Create students table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- RLS Policies for students
-- Allow all authenticated users to view students
CREATE POLICY "Users can view students"
  ON public.students FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow all authenticated users to insert students
CREATE POLICY "Users can create students"
  ON public.students FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow all authenticated users to update students
CREATE POLICY "Users can update students"
  ON public.students FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Allow all authenticated users to delete students
CREATE POLICY "Users can delete students"
  ON public.students FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create index for faster lookups by name
CREATE INDEX IF NOT EXISTS idx_students_name ON public.students(name);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

