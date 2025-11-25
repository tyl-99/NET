/**
 * Session management for chatbot and assessment
 * Uses Supabase for storage - no backend needed!
 */

import { supabase } from "@/integrations/supabase/client";
import { Message } from "./lamatic";

export interface ChatbotSession {
  id: string;
  user_id: string | null;
  session_data: {
    messages: Message[];
    currentStep?: string;
  };
  status: "active" | "completed" | "abandoned";
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssessmentSession {
  id: string;
  user_id: string | null;
  status: "in_progress" | "completed" | "abandoned";
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Assessment {
  id: string;
  session_id: string;
  chat: string;
  qna: Array<{ question: string; answer: string }>;
  assessment_analysis: any | null; // JSONB - stores analysis results
  created_at: string;
  updated_at: string;
}

export interface AssessmentResult {
  id: string;
  session_id: string;
  result_data: any; // JSONB
  recommendations: any | null; // JSONB
  created_at: string;
  updated_at: string;
}

/**
 * Get active chatbot session by ID (refreshes from database)
 */
export async function getChatbotSession(sessionId: string): Promise<ChatbotSession | null> {
  try {
    const { data, error } = await supabase
      .from("chatbot_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error) {
      console.error("Error getting chatbot session:", error);
      return null;
    }

    return data as ChatbotSession;
  } catch (error) {
    console.error("Error in getChatbotSession:", error);
    return null;
  }
}

/**
 * Create or get active chatbot session
 */
export async function getOrCreateChatbotSession(userId: string | null = null): Promise<ChatbotSession | null> {
  try {
    // Try to get active session for user (or anonymous)
    let query = supabase
      .from("chatbot_sessions")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1);

    // Handle null userId properly
    if (userId === null) {
      query = query.is("user_id", null);
    } else {
      query = query.eq("user_id", userId);
    }

    const { data: existingSessions, error: fetchError } = await query;

    // Check if we found an existing active session
    if (existingSessions && existingSessions.length > 0 && !fetchError) {
      return existingSessions[0] as ChatbotSession;
    }

    // Create new session
    const insertData: any = {
      session_data: { messages: [] },
      status: "active",
    };

    // Only include user_id if it's not null (for anonymous users)
    if (userId !== null) {
      insertData.user_id = userId;
    }

    const { data: newSession, error: createError } = await supabase
      .from("chatbot_sessions")
      .insert(insertData)
      .select()
      .single();

    if (createError) {
      console.error("Error creating chatbot session:", createError);
      console.error("Create error details:", JSON.stringify(createError, null, 2));
      return null;
    }

    return newSession as ChatbotSession;
  } catch (error) {
    console.error("Error in getOrCreateChatbotSession:", error);
    console.error("Error details:", error instanceof Error ? error.message : JSON.stringify(error, null, 2));
    return null;
  }
}

/**
 * Update chatbot session with messages
 */
export async function updateChatbotSession(
  sessionId: string,
  messages: Message[]
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("chatbot_sessions")
      .update({
        session_data: { messages },
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (error) {
      console.error("Error updating chatbot session:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updateChatbotSession:", error);
    return false;
  }
}

/**
 * Complete chatbot session
 */
export async function completeChatbotSession(sessionId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("chatbot_sessions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (error) {
      console.error("Error completing chatbot session:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in completeChatbotSession:", error);
    return false;
  }
}

/**
 * Create assessment session
 */
export async function createAssessmentSession(
  userId: string | null = null
): Promise<AssessmentSession | null> {
  try {
    const { data: session, error } = await supabase
      .from("assessment_sessions")
      .insert({
        user_id: userId,
        status: "in_progress",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating assessment session:", error);
      return null;
    }

    return session as AssessmentSession;
  } catch (error) {
    console.error("Error in createAssessmentSession:", error);
    return null;
  }
}

/**
 * Create assessment with chat (called once when starting assessment)
 */
export async function createAssessment(
  sessionId: string,
  chat: string
): Promise<Assessment | null> {
  try {
    const { data, error } = await supabase
      .from("assessments")
      .insert({
        session_id: sessionId,
        chat: chat,
        qna: [],
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating assessment:", error);
      return null;
    }

    return data as Assessment;
  } catch (error) {
    console.error("Error in createAssessment:", error);
    return null;
  }
}

/**
 * Update assessment QNA (called each time user answers)
 */
export async function updateAssessmentQNA(
  sessionId: string,
  qna: Array<{ question: string; answer: string }>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("assessments")
      .update({
        qna: qna as any,
        updated_at: new Date().toISOString(),
      })
      .eq("session_id", sessionId);

    if (error) {
      console.error("Error updating assessment QNA:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updateAssessmentQNA:", error);
    return false;
  }
}

/**
 * Update assessment analysis
 */
export async function updateAssessmentAnalysis(
  sessionId: string,
  analysis: any
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("assessments")
      .update({
        assessment_analysis: analysis,
        updated_at: new Date().toISOString(),
      })
      .eq("session_id", sessionId);

    if (error) {
      console.error("Error updating assessment analysis:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updateAssessmentAnalysis:", error);
    return false;
  }
}

/**
 * Get assessment by session ID
 */
export async function getAssessmentBySessionId(sessionId: string): Promise<Assessment | null> {
  try {
    const { data, error } = await supabase
      .from("assessments")
      .select("*")
      .eq("session_id", sessionId)
      .single();

    if (error) {
      console.error("Error getting assessment:", error);
      return null;
    }

    return data as Assessment;
  } catch (error) {
    console.error("Error in getAssessmentBySessionId:", error);
    return null;
  }
}

/**
 * Get active assessment session for user
 */
export async function getActiveAssessmentSession(userId: string | null): Promise<AssessmentSession | null> {
  console.log('[getActiveAssessmentSession] Called with userId:', userId);
  
  if (!userId) {
    console.log('[getActiveAssessmentSession] No userId provided, returning null');
    return null;
  }
  
  try {
    console.log('[getActiveAssessmentSession] Checking for valid session...');
    // Ensure we have a valid session for authenticated requests
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('[getActiveAssessmentSession] Session check result:', {
      hasSession: !!session,
      hasError: !!sessionError,
      userId: session?.user?.id,
      sessionError: sessionError ? {
        message: sessionError.message,
        status: sessionError.status,
      } : null,
    });
    
    if (!session) {
      console.warn("[getActiveAssessmentSession] No active session found for authenticated request");
    }
    
    console.log('[getActiveAssessmentSession] Querying assessment_sessions table...');
    const { data, error } = await supabase
      .from("assessment_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "in_progress")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    console.log('[getActiveAssessmentSession] Query result:', {
      hasData: !!data,
      hasError: !!error,
      dataId: data?.id,
      error: error ? {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      } : null,
    });

    if (error) {
      console.error("[getActiveAssessmentSession] Error fetching active assessment session:", error);
      console.error("[getActiveAssessmentSession] Error details:", JSON.stringify(error, null, 2));
      // No active session found
      return null;
    }

    console.log('[getActiveAssessmentSession] Successfully retrieved session:', data?.id);
    return data as AssessmentSession;
  } catch (error) {
    console.error("[getActiveAssessmentSession] Exception in getActiveAssessmentSession:", error);
    console.error("[getActiveAssessmentSession] Error stack:", error instanceof Error ? error.stack : 'No stack');
    return null;
  }
}

/**
 * Update assessment session status
 */
export async function updateAssessmentSessionStatus(
  sessionId: string,
  status: "in_progress" | "completed" | "abandoned"
): Promise<boolean> {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "completed") {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("assessment_sessions")
      .update(updateData)
      .eq("id", sessionId);

    if (error) {
      console.error("Error updating assessment session status:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updateAssessmentSessionStatus:", error);
    return false;
  }
}

/**
 * Save assessment result
 */
export async function saveAssessmentResult(
  sessionId: string,
  resultData: any,
  recommendations?: any
): Promise<AssessmentResult | null> {
  try {
    const { data, error } = await supabase
      .from("assessment_results")
      .insert({
        session_id: sessionId,
        result_data: resultData,
        recommendations: recommendations || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving assessment result:", error);
      return null;
    }

    return data as AssessmentResult;
  } catch (error) {
    console.error("Error in saveAssessmentResult:", error);
    return null;
  }
}

/**
 * Get assessment session by ID
 */
export async function getAssessmentSession(sessionId: string): Promise<AssessmentSession | null> {
  try {
    const { data, error } = await supabase
      .from("assessment_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error) {
      console.error("Error getting assessment session:", error);
      return null;
    }

    return data as AssessmentSession;
  } catch (error) {
    console.error("Error in getAssessmentSession:", error);
    return null;
  }
}

/**
 * Update assessment session
 */
export async function updateAssessmentSession(
  sessionId: string,
  updates: Partial<AssessmentSession>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("assessment_sessions")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId);

    if (error) {
      console.error("Error updating assessment session:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updateAssessmentSession:", error);
    return false;
  }
}

/**
 * Get user's recent sessions
 */
export async function getUserSessions(userId: string | null) {
  if (!userId) return { chatbot: [], assessment: [] };

  try {
    const [chatbotSessions, assessmentSessions] = await Promise.all([
      supabase
        .from("chatbot_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("assessment_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    return {
      chatbot: chatbotSessions.data || [],
      assessment: assessmentSessions.data || [],
    };
  } catch (error) {
    console.error("Error getting user sessions:", error);
    return { chatbot: [], assessment: [] };
  }
}

