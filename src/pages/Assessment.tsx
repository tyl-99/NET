import { useEffect, useMemo, useState } from "react";
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
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "prompt-0",
      sender: "guide",
      text: prompts[0],
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [readingMode, setReadingMode] = useState(false);

  const role = (location.state as { role?: string } | undefined)?.role ?? "guest";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const answeredCount = useMemo(() => messages.filter((message) => message.sender === "user").length, [messages]);
  const progress = Math.min((answeredCount / prompts.length) * 100, 100);
  const estimatedRemaining = Math.max(0, 15 - answeredCount * 3);

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    addMessage({ id: crypto.randomUUID(), sender: "user", text: trimmed, timestamp });
    setInput("");

    const nextIndex = answeredCount + 1;

    if (nextIndex >= prompts.length) {
      setIsTyping(false);
      setIsComplete(true);
      addMessage({
        id: "closing",
        sender: "guide",
        text: "Thank you. Ready to see the summary?",
        timestamp,
      });
      return;
    }

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage({
        id: `prompt-${nextIndex}`,
        sender: "guide",
        text: prompts[nextIndex],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    }, 750);
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

              {isTyping && (
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
                    <Button type="submit" disabled={isTyping}>
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
