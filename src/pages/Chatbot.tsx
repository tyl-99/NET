import { useState, useRef, useEffect, FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Loader2, Bot, User, ArrowRight } from "lucide-react";
import { executeLamaticWorkflow, Message } from "@/lib/lamatic";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Chatbot = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Get role from location state
  const locationState = location.state as { role?: string; retainData?: boolean } | undefined;
  const userRole = locationState?.role || "";
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: "You are a helpful assistant." },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change (both user and assistant)
  useEffect(() => {
    if (messages.length > 0 && scrollAreaRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        scrollAreaRef.current?.scrollTo({
          top: scrollAreaRef.current.scrollHeight,
          behavior: "smooth"
        });
      }, 100);
    }
  }, [messages.length]);

  // Scroll to top on mount to prevent browser scroll down
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Initialize chat with greeting on mount
  useEffect(() => {
    console.log('[Chatbot] useEffect triggered, initializing chat...', {
      userRole,
      userId: user?.id,
      currentPath: window.location.pathname,
    });
    
    const initializeChat = async () => {
      setIsInitializing(true);
      try {
        // Get initial greeting
        const initialMessages: Message[] = [
          { role: "system", content: "You are a helpful assistant." },
        ];
        console.log('[Chatbot] Calling executeLamaticWorkflow...');
        const response = await executeLamaticWorkflow(initialMessages, userRole, user?.id);
        console.log('[Chatbot] Received response from Lamatic:', response?.substring(0, 100) + '...');
        
        const assistantMessage: Message = { 
          role: "assistant", 
          content: response 
        };
        
        const newMessages = [...initialMessages, assistantMessage];
        setMessages(newMessages);
        console.log('[Chatbot] Chat initialized successfully');
      } catch (error) {
        console.error("[Chatbot] Error initializing chat:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to initialize chat. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initializeChat();
  }, [toast, userRole]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Pass role as separate key-value in API request
      const response = await executeLamaticWorkflow(newMessages, userRole, user?.id);
      
      const assistantMessage: Message = { 
        role: "assistant", 
        content: response 
      };
      
      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
        variant: "destructive",
      });
      
      // Remove the user message on error so they can retry
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-8 md:px-8">
          <header className="space-y-3 text-balance">
            <p className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-card)]/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              N.E.T. Bot 2.0 Welcome (Agent)
            </p>
            <h1 className="text-4xl font-semibold text-[color:var(--color-ink)] md:text-5xl">
              Welcome to N.E.T. Pre-Screen
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Our friendly assistant will guide you through a brief intake process. This is a non-diagnostic pre-screen to help you understand next steps. Your responses are kept confidential.
            </p>
          </header>

          <Card className="flex-1 flex flex-col border-border/80 shadow-[var(--shadow-card)] min-h-[600px] max-h-[70vh]">
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              <div 
                className="flex-1 p-6 overflow-y-auto overflow-x-hidden chatbot-scrollbar"
                ref={scrollAreaRef}
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'hsl(var(--border)) transparent' }}
              >
                <div className="space-y-6" ref={messagesContainerRef}>
                  {isInitializing ? (
                    <div className="flex gap-4 justify-start">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
                        <Bot className="h-5 w-5 text-[var(--color-primary)]" />
                      </div>
                      <div className="bg-[color:var(--color-card)] border border-[color:var(--color-border)] rounded-[16px] px-4 py-3">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  ) : messages.filter(m => m.role !== "system").length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Bot className="h-12 w-12 text-[var(--color-primary)] mb-4" />
                      <p className="text-muted-foreground">
                        The assistant will greet you shortly. Please wait for the welcome message.
                      </p>
                    </div>
                  ) : (
                    messages
                      .filter((m) => m.role !== "system")
                      .map((message, index) => (
                        <div
                          key={index}
                          className={`flex gap-4 ${
                            message.role === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          {message.role === "assistant" && (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
                              <Bot className="h-5 w-5 text-[var(--color-primary)]" />
                            </div>
                          )}
                          <div
                            className={`max-w-[80%] rounded-[16px] px-4 py-3 ${
                              message.role === "user"
                                ? "bg-[var(--color-primary)] text-white"
                                : "bg-[color:var(--color-card)] border border-[color:var(--color-border)] text-[color:var(--color-ink)]"
                            }`}
                          >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                          </div>
                          {message.role === "user" && (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)]/10">
                              <User className="h-5 w-5 text-[var(--color-accent)]" />
                            </div>
                          )}
                        </div>
                      ))
                  )}
                  {isLoading && (
                    <div className="flex gap-4 justify-start">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
                        <Bot className="h-5 w-5 text-[var(--color-primary)]" />
                      </div>
                      <div className="bg-[color:var(--color-card)] border border-[color:var(--color-border)] rounded-[16px] px-4 py-3">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              
              <div className="border-t border-[color:var(--color-border)] p-4">
                <form onSubmit={handleSend} className="flex gap-3">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your response here..."
                    disabled={isLoading || isInitializing}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading || isInitializing || !input.trim()}
                    size="default"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          {/* Next Button - Below chatbot, aligned right */}
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => {
                // Pass the entire chat context to assessment page via state
                navigate("/assessment", {
                  state: {
                    chatContext: messages,
                    fromChatbot: true
                  }
                });
              }}
              size="lg"
              className="shadow-lg"
            >
              Next
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Chatbot;

