-- Create chatbot sessions table
CREATE TABLE IF NOT EXISTS public.chatbot_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chatbot_sessions ENABLE ROW LEVEL SECURITY;

-- Chatbot sessions policies
CREATE POLICY "Users can view their own chatbot sessions"
  ON public.chatbot_sessions FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create their own chatbot sessions"
  ON public.chatbot_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own chatbot sessions"
  ON public.chatbot_sessions FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Add chat_messages column to assessment_sessions for storing chatbot conversation
ALTER TABLE public.assessment_sessions 
ADD COLUMN IF NOT EXISTS chat_messages JSONB DEFAULT '[]'::jsonb;

-- Add assessment_questions column to store questions from API
ALTER TABLE public.assessment_sessions 
ADD COLUMN IF NOT EXISTS assessment_questions JSONB DEFAULT '[]'::jsonb;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_chatbot_sessions_user_id ON public.chatbot_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_sessions_status ON public.chatbot_sessions(status);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_user_id ON public.assessment_sessions(user_id);

