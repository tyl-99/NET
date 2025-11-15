import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Clock, ShieldAlert, Volume2, BookOpen } from "lucide-react";
import { Message as ChatMessage, executeAssessmentWorkflow } from "@/lib/lamatic";
import { useAuth } from "@/contexts/AuthContext";
import { createAssessmentSession, createAssessment, updateAssessmentQNA, updateAssessmentSessionStatus, saveAssessmentResult, getAssessmentBySessionId, getActiveAssessmentSession, updateAssessmentAnalysis } from "@/lib/session";


interface Message {
  id: string;
  sender: "guide" | "user";
  text: string;
  timestamp: string;
}

const prompts = [
  "Tell us about the learning wins and friction you notice most often.",
  "When does support seem to help, and what still feels tough?",
  "Are there any sensory, focus, or emotional cues we should keep in mind?",
  "Share any accommodations or strategies that already work well.",
  "What goal would feel like progress after today?",
];

const Assessment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [readingMode, setReadingMode] = useState(false);
  const [assessmentData, setAssessmentData] = useState<{
    status: "ongoing" | "done";
    chat: string;
    assessment: Array<{ question: string; answer: string }>;
  }>({
    status: "ongoing",
    chat: "",
    assessment: []
  });
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [assessmentSessionId, setAssessmentSessionId] = useState<string | null>(null);
  const { user } = useAuth();

  const locationState = location.state as { role?: string; chatContext?: ChatMessage[]; fromChatbot?: boolean } | undefined;
  const role = locationState?.role ?? "guest";
  const chatContext = locationState?.chatContext;
  const fromChatbot = locationState?.fromChatbot ?? false;

  // Function to fetch next question from API
  const fetchNextQuestion = useCallback(async (data: typeof assessmentData) => {
    // Prevent multiple simultaneous API calls
    if (isFetchingRef.current) {
      console.log("Already fetching question, skipping duplicate call");
      return;
    }
    
    isFetchingRef.current = true;
    setIsLoadingQuestion(true);
    try {
      const response = await executeAssessmentWorkflow(data);
      console.log("Assessment API response:", response);
      
      // Check if assessment is done and save analysis
      const isDone = response?.done === "True" || response?.done === true || response?.done === "true";
      if (isDone && response?.analysis && assessmentSessionId) {
        console.log("Assessment completed! Saving analysis:", response.analysis);
        await updateAssessmentAnalysis(assessmentSessionId, response.analysis);
      }
      
      // Extract question from response - handle nested follow_up_questions structure
      let nextQuestion = "";
      
      // Handle nested structure: response.follow_up_questions.follow_up_questions
      if (response?.follow_up_questions) {
        // Check if it's nested: { follow_up_questions: { follow_up_questions: "..." } }
        if (response.follow_up_questions?.follow_up_questions) {
          const nested = response.follow_up_questions.follow_up_questions;
          if (typeof nested === "string") {
            // Check if it contains markdown code blocks
            let followUpStr = nested.trim();
            
            // Remove markdown code block markers
            if (followUpStr.startsWith("```json")) {
              followUpStr = followUpStr.replace(/^```json\s*/, "").replace(/\s*```$/, "");
            } else if (followUpStr.startsWith("```")) {
              followUpStr = followUpStr.replace(/^```\s*/, "").replace(/\s*```$/, "");
            }
            
            // Try to parse as JSON
            try {
              const parsed = JSON.parse(followUpStr.trim());
              if (parsed?.follow_up_questions) {
                if (Array.isArray(parsed.follow_up_questions)) {
                  // Only take the FIRST question from array
                  nextQuestion = parsed.follow_up_questions[0] || "";
                } else if (typeof parsed.follow_up_questions === "string") {
                  // If it's a string, check if it contains multiple questions (separated by newlines)
                  const lines = parsed.follow_up_questions.split('\n').filter(line => line.trim());
                  nextQuestion = lines[0] || parsed.follow_up_questions;
                }
              } else {
                // If not JSON with follow_up_questions, check if string has multiple lines
                const lines = followUpStr.split('\n').filter(line => line.trim());
                nextQuestion = lines[0] || followUpStr;
              }
            } catch {
              // If parsing fails, check if string has multiple questions (separated by newlines)
              const lines = followUpStr.split('\n').filter(line => line.trim());
              nextQuestion = lines[0] || followUpStr;
            }
          } else if (Array.isArray(nested)) {
            // Only take the FIRST question from array
            nextQuestion = nested[0] || "";
          } else {
            // Convert to string and take first line if multiple
            const nestedStr = String(nested);
            const lines = nestedStr.split('\n').filter(line => line.trim());
            nextQuestion = lines[0] || nestedStr;
          }
        }
        // Handle direct follow_up_questions (array or string)
        else if (Array.isArray(response.follow_up_questions)) {
          nextQuestion = response.follow_up_questions[0] || "";
        } else if (typeof response.follow_up_questions === "string") {
          let followUpStr = response.follow_up_questions.trim();
          
          // Remove markdown code block markers
          if (followUpStr.startsWith("```json")) {
            followUpStr = followUpStr.replace(/^```json\s*/, "").replace(/\s*```$/, "");
          } else if (followUpStr.startsWith("```")) {
            followUpStr = followUpStr.replace(/^```\s*/, "").replace(/\s*```$/, "");
          }
          
          // Try to parse as JSON
          try {
            const parsed = JSON.parse(followUpStr.trim());
            if (parsed?.follow_up_questions) {
              if (Array.isArray(parsed.follow_up_questions)) {
                nextQuestion = parsed.follow_up_questions[0] || "";
              } else if (typeof parsed.follow_up_questions === "string") {
                nextQuestion = parsed.follow_up_questions;
              }
            } else {
              nextQuestion = followUpStr;
            }
          } catch {
            nextQuestion = followUpStr;
          }
        }
      } else if (response?.question) {
        nextQuestion = response.question;
      } else if (response?.questions) {
        if (Array.isArray(response.questions)) {
          nextQuestion = response.questions[0] || "";
        } else if (typeof response.questions === "string") {
          nextQuestion = response.questions;
        }
      } else if (typeof response === "string") {
        nextQuestion = response;
      } else if (response?.output) {
        nextQuestion = typeof response.output === "string" ? response.output : JSON.stringify(response.output);
      }
      
      if (nextQuestion) {
        // Add question to messages (append, don't replace) - use unique ID
        setMessages((prev) => {
          // Check if we already have this question to avoid duplicates
          const questionExists = prev.some(m => m.sender === "guide" && m.text === nextQuestion);
          if (questionExists) {
            return prev;
          }
          return [
            ...prev,
            {
              id: `prompt-${Date.now()}-${crypto.randomUUID()}`,
              sender: "guide",
              text: nextQuestion,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ];
        });
      } else {
        // Fallback to default prompt - use unique ID
        setMessages((prev) => {
          const fallbackText = prompts[data.assessment.length] || "Thank you for your response.";
          const questionExists = prev.some(m => m.sender === "guide" && m.text === fallbackText);
          if (questionExists) {
            return prev;
          }
          return [
            ...prev,
            {
              id: `prompt-${Date.now()}-${crypto.randomUUID()}`,
              sender: "guide",
              text: fallbackText,
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
          ];
        });
      }
    } catch (error) {
      console.error("Error fetching assessment question:", error);
      // Fallback to default prompts - use unique ID
      setMessages((prev) => {
        const fallbackText = prompts[data.assessment.length] || "Thank you for your response.";
        const questionExists = prev.some(m => m.sender === "guide" && m.text === fallbackText);
        if (questionExists) {
          return prev;
        }
        return [
          ...prev,
          {
            id: `prompt-${Date.now()}-${crypto.randomUUID()}`,
            sender: "guide",
            text: fallbackText,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ];
      });
    } finally {
      setIsLoadingQuestion(false);
      isFetchingRef.current = false;
    }
  }, [assessmentSessionId]); // Include assessmentSessionId to access it in the callback

  // Track if initialization has been done to prevent re-initialization on tab switch
  const initializationRef = useRef(false);
  // Track if we're currently fetching to prevent multiple simultaneous calls
  const isFetchingRef = useRef(false);
  // Track if we're currently creating a session to prevent duplicates
  const isCreatingSessionRef = useRef(false);

  // Initialize assessment when chat context is received or resuming existing session
  useEffect(() => {
    // Prevent re-initialization if already done - set IMMEDIATELY to prevent race conditions
    if (initializationRef.current) return;
    initializationRef.current = true; // Set synchronously BEFORE async operations
    
    const initializeAssessment = async () => {
      // Check if resuming existing session
      const locationState = location.state as { 
        role?: string; 
        chatContext?: ChatMessage[]; 
        fromChatbot?: boolean;
        existingSession?: boolean;
        existingQNA?: Array<{ question: string; answer: string }>;
      } | undefined;
      
      const existingSession = locationState?.existingSession;
      const existingQNA = locationState?.existingQNA;
      
      if (existingSession && user?.id) {
        // Resuming existing session - get active session
        const activeSession = await getActiveAssessmentSession(user.id);
        if (activeSession) {
          setAssessmentSessionId(activeSession.id);
          
          // Get assessment data
          const assessment = await getAssessmentBySessionId(activeSession.id);
          if (assessment) {
            // Convert chat string back to messages
            const chatLines = assessment.chat.split("\n\n");
            const chatMessages: ChatMessage[] = [];
            
            chatLines.forEach((line: string) => {
              if (line.startsWith("User:")) {
                chatMessages.push({ role: "user", content: line.replace("User: ", "") });
              } else if (line.startsWith("Assistant:")) {
                chatMessages.push({ role: "assistant", content: line.replace("Assistant: ", "") });
              }
            });
            
            // Set chat context
            const chatString = assessment.chat;
            const qna = existingQNA || assessment.qna || [];
            
            // Restore messages from QNA
            const restoredMessages: Message[] = [];
            qna.forEach((item, index) => {
              restoredMessages.push({
                id: `prompt-${index}-restored`,
                sender: "guide",
                text: item.question,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              });
              restoredMessages.push({
                id: `answer-${index}-restored`,
                sender: "user",
                text: item.answer,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              });
            });
            
            setMessages(restoredMessages);
            
            // Initialize assessment data
            const initialData = {
              status: qna.length >= 5 ? "done" as const : "ongoing" as const,
              chat: chatString,
              assessment: qna
            };
            
            setAssessmentData(initialData);
            
            // If not complete, fetch next question
            if (qna.length < 5) {
              setIsLoadingQuestion(true);
              fetchNextQuestion(initialData);
            } else {
              setIsComplete(true);
            }
            
            initializationRef.current = true;
            return;
          }
        }
      }
      
      if (fromChatbot && chatContext && chatContext.length > 0) {
        // Print chatbot conversation to console
        console.log("=== CHATBOT CONVERSATION ===");
        console.log("Full conversation context:", chatContext);
        console.log("Number of messages:", chatContext.length);
        console.log("Messages breakdown:");
        chatContext.forEach((msg, index) => {
          console.log(`[${index + 1}] ${msg.role.toUpperCase()}:`, msg.content);
        });
        console.log("===========================");
        
        // Convert chat messages to string format
        const chatString = chatContext
          .filter(msg => msg.role !== "system")
          .map(msg => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
          .join("\n\n");
        
        // Check if we already have a session ID in state (prevent duplicates)
        if (assessmentSessionId) {
          console.log("Session ID already set in state, skipping session creation:", assessmentSessionId);
          // Get the existing session and assessment
          const existingSession = await getActiveAssessmentSession(user?.id || null);
          if (existingSession && existingSession.id === assessmentSessionId) {
            const existingAssessment = await getAssessmentBySessionId(existingSession.id);
            if (existingAssessment && existingAssessment.qna && existingAssessment.qna.length > 0) {
              // Restore existing data
              const restoredMessages: Message[] = [];
              existingAssessment.qna.forEach((item, index) => {
                restoredMessages.push({
                  id: `prompt-${index}-restored`,
                  sender: "guide",
                  text: item.question,
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                });
                restoredMessages.push({
                  id: `answer-${index}-restored`,
                  sender: "user",
                  text: item.answer,
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                });
              });
              setMessages(restoredMessages);
              setAssessmentData({
                status: existingAssessment.qna.length >= 5 ? "done" as const : "ongoing" as const,
                chat: existingAssessment.chat || chatString,
                assessment: existingAssessment.qna
              });
              if (existingAssessment.qna.length < 5) {
                setIsLoadingQuestion(true);
                fetchNextQuestion({
                  status: "ongoing" as const,
                  chat: existingAssessment.chat || chatString,
                  assessment: existingAssessment.qna
                });
              } else {
                setIsComplete(true);
              }
              return; // Exit early
            }
          }
        }
        
        // Check if there's already an active session before creating a new one
        let session = await getActiveAssessmentSession(user?.id || null);
        
        if (!session) {
          // Prevent concurrent session creation
          if (isCreatingSessionRef.current) {
            console.log("Session creation already in progress, skipping duplicate");
            return;
          }
          
          isCreatingSessionRef.current = true;
          try {
            // Only create a new session if there isn't an active one
            session = await createAssessmentSession(user?.id || null);
            if (session) {
              console.log("Created new assessment session:", session.id);
              setAssessmentSessionId(session.id); // Set immediately to prevent duplicates
              
              // Create assessment with chat (once)
              const assessment = await createAssessment(session.id, chatString);
              if (assessment) {
                console.log("Created assessment:", assessment.id);
              }
            }
          } finally {
            isCreatingSessionRef.current = false;
          }
        } else {
          console.log("Using existing active assessment session:", session.id);
          setAssessmentSessionId(session.id); // Set immediately to prevent duplicates
          
          // If session exists, check if assessment exists and has QNA
          const existingAssessment = await getAssessmentBySessionId(session.id);
          if (existingAssessment) {
            console.log("Using existing assessment:", existingAssessment.id);
            
            // If assessment has QNA, restore it instead of starting fresh
            if (existingAssessment.qna && existingAssessment.qna.length > 0) {
              console.log("Restoring existing assessment with QNA:", existingAssessment.qna.length, "questions answered");
              
              // Restore messages from QNA
              const restoredMessages: Message[] = [];
              existingAssessment.qna.forEach((item, index) => {
                restoredMessages.push({
                  id: `prompt-${index}-restored`,
                  sender: "guide",
                  text: item.question,
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                });
                restoredMessages.push({
                  id: `answer-${index}-restored`,
                  sender: "user",
                  text: item.answer,
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                });
              });
              
              setMessages(restoredMessages);
              
              // Initialize assessment data with existing QNA
              const initialData = {
                status: existingAssessment.qna.length >= 5 ? "done" as const : "ongoing" as const,
                chat: existingAssessment.chat || chatString,
                assessment: existingAssessment.qna
              };
              
              setAssessmentData(initialData);
              
              // If not complete, fetch next question
              if (existingAssessment.qna.length < 5) {
                setIsLoadingQuestion(true);
                fetchNextQuestion(initialData);
              } else {
                setIsComplete(true);
              }
              
              return; // Exit early, don't create new assessment
            }
          }
          
          // If no assessment exists, create it
          if (!existingAssessment) {
            const assessment = await createAssessment(session.id, chatString);
            if (assessment) {
              console.log("Created assessment for existing session:", assessment.id);
            }
          }
        }
        
        // Only initialize fresh if we didn't restore existing data above
        if (session && !messages.length) {
          // Initialize assessment data
          const initialData = {
            status: "ongoing" as const,
            chat: chatString,
            assessment: [] as Array<{ question: string; answer: string }>
          };
          
          setAssessmentData(initialData);
          
          // Log initial assessment data
          console.log("=== INITIAL ASSESSMENT DATA ===");
          console.log("Status: ongoing");
          console.log("Chat:", chatString.substring(0, 100) + "...");
          console.log("Assessment: [] (empty)");
          console.log("Full data:", JSON.stringify(initialData, null, 2));
          console.log("==============================");
          
          // Set loading state for initial question
          setIsLoadingQuestion(true);
          
          // Send initial API request to get first question
          fetchNextQuestion(initialData);
        }
      } else {
        // No chat context, use default prompts - use unique ID
        setMessages([
          {
            id: `prompt-${Date.now()}-${crypto.randomUUID()}`,
            sender: "guide",
            text: prompts[0],
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    };

    initializeAssessment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromChatbot, chatContext, fetchNextQuestion, user]); // Don't include assessmentSessionId to prevent loops

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const answeredCount = useMemo(() => messages.filter((message) => message.sender === "user").length, [messages]);
  // Progress based on 5 questions for assessment
  const totalQuestions = fromChatbot ? 5 : prompts.length;
  const progress = Math.min((answeredCount / totalQuestions) * 100, 100);
  const estimatedRemaining = Math.max(0, 15 - answeredCount * 3);

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    
    // Get current question from messages (get the LAST guide message, which is the most recent question)
    const guideMessages = messages.filter(m => m.sender === "guide");
    const currentQuestion = guideMessages[guideMessages.length - 1]?.text || "";
    
    // Add user answer to messages
    addMessage({ id: crypto.randomUUID(), sender: "user", text: trimmed, timestamp });
    setInput("");

    // Update assessment data with new Q&A
    const answerCount = answeredCount + 1;
    const updatedAssessment = [
      ...assessmentData.assessment,
      { question: currentQuestion, answer: trimmed }
    ];
    
    // Determine status: "ongoing" if less than 5 answers, "done" after 5th answer
    const newStatus: "ongoing" | "done" = answerCount < 5 ? "ongoing" : "done";
    const dbStatus: "in_progress" | "completed" = answerCount < 5 ? "in_progress" : "completed";
    
    // Update QNA in database and update session status/timestamp
    if (assessmentSessionId) {
      // Update assessment QNA (each time user answers)
      await updateAssessmentQNA(assessmentSessionId, updatedAssessment);
      // Update session status and updated_at timestamp after each answer
      await updateAssessmentSessionStatus(assessmentSessionId, dbStatus);
    }
    
    const updatedData = {
      ...assessmentData,
      status: newStatus,
      assessment: updatedAssessment
    };
    
    setAssessmentData(updatedData);
    
    // Log the assessment data being sent
    console.log("=== SENDING ASSESSMENT DATA ===");
    console.log("Status:", newStatus);
    console.log("Answer count:", answerCount);
    console.log("Assessment data:", JSON.stringify(updatedData, null, 2));
    console.log("===============================");
    
    // Send API request with updated data
    if (newStatus === "ongoing") {
      // Still ongoing, fetch next question
      setIsTyping(true);
      try {
        await fetchNextQuestion(updatedData);
      } catch (error) {
        console.error("Error fetching next question:", error);
      } finally {
        setIsTyping(false);
      }
    } else {
      // Done after 5th answer - send final request
      setIsTyping(true);
      try {
        const finalResult = await executeAssessmentWorkflow(updatedData);
        
        // Check if done and save analysis
        const isDone = finalResult?.done === "True" || finalResult?.done === true || finalResult?.done === "true";
        if (isDone && finalResult?.analysis && assessmentSessionId) {
          console.log("Assessment completed! Saving analysis:", finalResult.analysis);
          await updateAssessmentAnalysis(assessmentSessionId, finalResult.analysis);
        }
        
        // Save assessment result (session already updated to completed above)
        if (assessmentSessionId) {
          await saveAssessmentResult(
            assessmentSessionId,
            finalResult || updatedData,
            null // recommendations can be added later
          );
        }
        
        setIsComplete(true);
        addMessage({
          id: "closing",
          sender: "guide",
          text: "Thank you. Ready to see the summary?",
          timestamp,
        });
      } catch (error) {
        console.error("Error sending final assessment:", error);
        
        // Session already marked as completed above, no need to update again
        
        setIsComplete(true);
        addMessage({
          id: "closing",
          sender: "guide",
          text: "Thank you. Ready to see the summary?",
          timestamp,
        });
      } finally {
        setIsTyping(false);
      }
    }
  };

  const messageTextClass = readingMode ? "text-base leading-8" : "text-sm leading-relaxed";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 md:px-8 lg:grid-cols-[minmax(0,_1fr)_320px]">
          <section className="flex flex-col rounded-[20px] border border-[color:var(--color-border)] bg-[color:var(--color-card)]/95 shadow-[var(--shadow-card)]">
            <header className="flex flex-col gap-4 border-b border-[color:var(--color-border)]/80 px-6 py-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">Calm conversational pre-screen</p>
                <p className="text-lg text-[color:var(--color-ink)]">We’ll guide you one question at a time.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-[color:var(--color-border)] px-3 py-2 text-sm text-muted-foreground">
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                  Read-aloud ready
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="reading-mode" checked={readingMode} onCheckedChange={setReadingMode} />
                  <label htmlFor="reading-mode" className="text-sm text-muted-foreground">
                    Reading mode
                  </label>
                </div>
              </div>
            </header>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6" aria-live="polite">
              {messages.map((message) => (
                <div key={message.id} className="flex flex-col gap-1">
                  <div
                    className={`max-w-[min(100%,_36rem)] rounded-[18px] px-5 py-4 shadow-sm line-clamp-6 ${
                      message.sender === "guide"
                        ? "bg-primary/10 text-foreground"
                        : "self-end bg-secondary text-secondary-foreground"
                    } ${messageTextClass}`}
                  >
                    {message.text}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {message.sender === "guide" ? "N.E.T. Guide" : "You"} • {message.timestamp}
                  </span>
                </div>
              ))}

              {(isLoadingQuestion || isTyping) && (
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-3/5 rounded-full" />
                    <Skeleton className="h-3 w-1/3 rounded-full" />
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border/80 bg-muted/40 px-6 py-5">
              {!isComplete ? (
                <form
                  className="space-y-4"
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleSend();
                  }}
                >
                  <label htmlFor="response" className="text-sm font-medium text-muted-foreground">
                    Your response
                  </label>
                  <Textarea
                    id="response"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Type up to 4–5 sentences. You can pause and resume anytime."
                    className={`min-h-[160px] resize-none ${readingMode ? "text-base leading-8" : "text-sm"}`}
                  />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">Plain language is welcome. Bullet points work too.</p>
                  <Button type="submit" disabled={isTyping || isLoadingQuestion}>
                    Send and continue
                  </Button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col gap-4">
                  <Card className="border-primary/30 bg-primary/5">
                    <CardContent className="space-y-2 p-4">
                      <p className="text-sm font-semibold text-primary">Nicely done.</p>
                      <p className="text-sm text-muted-foreground">
                        We gathered enough to build your role-ready summary. Review it now or export it later.
                      </p>
                    </CardContent>
                  </Card>
                  <Button onClick={() => navigate("/results", { state: { role } })}>
                    View my calm results
                  </Button>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-5">
            <Card className="border-[color:var(--color-border)]">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Session card</CardTitle>
                  <Badge variant="outline" className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.3em]">
                    {role.replace(/-/g, " ")}
                  </Badge>
                </div>
                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Not medical advice</p>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">Progress</span>
                    <span className="text-muted-foreground">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" aria-label="Progress" />
                </div>
                <div className="flex items-center gap-3 rounded-[12px] border border-border/80 bg-card px-4 py-3 text-sm">
                  <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-foreground">About {estimatedRemaining} minutes left</p>
                    <p className="text-xs text-muted-foreground">Average pace—go slower if you need.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-[12px] border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
                  <ShieldAlert className="h-4 w-4 text-warning" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-warning">Not medical advice</p>
                    <p className="text-xs text-muted-foreground">
                      If you or someone else is in crisis, contact local emergency services or a crisis hotline immediately.
                    </p>
                  </div>
                </div>
                <div className="rounded-[12px] border border-border/80 bg-muted/40 p-4 text-xs text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Accessibility toggles:</strong> text size, high contrast, dyslexia-friendly font, and read-aloud live under the profile icon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Assessment;
