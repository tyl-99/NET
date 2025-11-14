import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Users, GraduationCap, User, Stethoscope, Check, ArrowRight, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";


const roles = [
  {
    id: "parent",
    icon: Users,
    title: "Parent or caregiver",
    description: "Spot patterns at home and gather language for school conversations.",
  },
  {
    id: "teacher",
    icon: GraduationCap,
    title: "Teacher or school",
    description: "Map what you observe to 504-ready accommodations in minutes.",
  },
  {
    id: "adult",
    icon: User,
    title: "Adult self-check",
    description: "Reflect on your own learning and save notes for future care teams.",
  },
  {
    id: "clinician",
    icon: Stethoscope,
    title: "Clinician intake",
    description: "Pre-load an intake with structured context and safety reminders.",
  },
];

const steps = [
  { id: "role", label: "Choose your role" },
  { id: "consent", label: "Review consent" },
  { id: "start", label: "Begin pre-screen" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [consents, setConsents] = useState({
    privacy: false,
    nonDiagnostic: false,
    adult: false,
  });
  const [retainData, setRetainData] = useState(false);

  const allConsentsChecked = consents.privacy && consents.nonDiagnostic && consents.adult;

  const stepMeta = useMemo(() => {
    return steps.map((step, index) => {
      if (index === 0) {
        return { ...step, completed: Boolean(selectedRole) };
      }
      if (index === 1) {
        return { ...step, completed: allConsentsChecked };
      }
      return { ...step, completed: false };
    });
  }, [selectedRole, allConsentsChecked]);

  const activeIndex = stepMeta.findIndex((step) => !step.completed);
  const currentIndex = activeIndex === -1 ? stepMeta.length - 1 : activeIndex;
  const completionPercent = Math.min(
    100,
    Math.round(
      (((selectedRole ? 1 : 0) + (allConsentsChecked ? 1 : 0) + (selectedRole && allConsentsChecked ? 1 : 0)) /
        steps.length) *
        100,
    ),
  );

  const handleContinue = () => {
    if (!selectedRole) {
      toast.error("Select the role that fits you best.");
      return;
    }
    if (!allConsentsChecked) {
      toast.error("Please accept the required consent statements.");
      return;
    }

    toast.success("We will keep it calm and clear.");
    navigate("/assessment", { state: { role: selectedRole, retainData } });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 py-16">
        <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 md:px-8">
          <header className="space-y-5 text-balance">
            <p className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-card)]/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Onboarding
            </p>
            <h1 className="text-4xl font-semibold text-[color:var(--color-ink)] md:text-5xl">
              First, let us tailor the pre-screen to you.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
              These quick steps help us set the right tone, language, and resources. You can pause anytime and nothing is saved unless you choose.
            </p>
          </header>

          <section aria-label="Progress" className="rounded-[20px] border border-[color:var(--color-border)] bg-[color:var(--color-card)]/90 p-6 shadow-[var(--shadow-card)]">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                <BarChart3 className="h-5 w-5 text-[var(--color-primary)]" aria-hidden="true" />
                {completionPercent}% complete
              </div>
              <Progress value={completionPercent} className="h-2" />
            </div>
            <ol className="grid gap-4 md:grid-cols-3">
              {stepMeta.map((step, index) => {
                const isActive = currentIndex === index;
                const isComplete = step.completed && index !== stepMeta.length - 1;

                return (
                  <li
                    key={step.id}
                    className="rounded-[16px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)]/70 p-4"
                    aria-current={isActive ? "step" : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                          isComplete
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                            : isActive
                            ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                            : "border-[color:var(--color-border)] text-muted-foreground"
                        }`}
                      >
                        {isComplete ? <Check className="h-5 w-5" aria-hidden="true" /> : index + 1}
                      </span>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-[color:var(--color-ink)]">{step.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {index === 0 && "Pick who is completing this session."}
                          {index === 1 && "Review the privacy guardrails in plain language."}
                          {index === 2 && "Start the calm, 15-minute conversation."}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <div className="space-y-10">
            <Card className="border-border/80">
              <CardHeader className="space-y-2">
                <CardTitle>Who are you completing this for?</CardTitle>
                <CardDescription>Choose the role that best matches your context. We will tailor examples and tone.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {roles.map((role) => {
                  const isSelected = selectedRole === role.id;

                  return (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`flex h-full flex-col items-start gap-4 rounded-[16px] border-2 p-5 text-left transition-all focus-ring ${
                        isSelected
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 shadow-[var(--shadow-card)]"
                          : "border-[color:var(--color-border)] bg-[color:var(--color-card)] hover:border-[var(--color-primary)]/50"
                      }`}
                      aria-pressed={isSelected}
                    >
                      <role.icon
                        className={`h-7 w-7 ${isSelected ? "text-[var(--color-primary)]" : "text-muted-foreground"}`}
                        aria-hidden="true"
                      />
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-foreground">{role.title}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{role.description}</p>
                      </div>
                      <span className="mt-auto text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Tap to choose
                      </span>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-border/80">
              <CardHeader>
                <CardTitle>Consent in plain language</CardTitle>
                <CardDescription>We honour your agency and privacy. Please confirm the statements below.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-sm leading-relaxed text-muted-foreground">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Checkbox
                      id="privacy"
                      checked={consents.privacy}
                      onCheckedChange={(checked) => setConsents((prev) => ({ ...prev, privacy: Boolean(checked) }))}
                      className="mt-1"
                    />
                    <label htmlFor="privacy" className="cursor-pointer text-left">
                      I understand that my responses stay on this device unless I export or opt into temporary retention.
                    </label>
                  </li>
                  <li className="flex items-start gap-3">
                    <Checkbox
                      id="nonDiagnostic"
                      checked={consents.nonDiagnostic}
                      onCheckedChange={(checked) => setConsents((prev) => ({ ...prev, nonDiagnostic: Boolean(checked) }))}
                      className="mt-1"
                    />
                    <label htmlFor="nonDiagnostic" className="cursor-pointer text-left">
                      I know this is a non-diagnostic pre-screen and does not replace professional evaluation.
                    </label>
                  </li>
                  <li className="flex items-start gap-3">
                    <Checkbox
                      id="adult"
                      checked={consents.adult}
                      onCheckedChange={(checked) => setConsents((prev) => ({ ...prev, adult: Boolean(checked) }))}
                      className="mt-1"
                    />
                    <label htmlFor="adult" className="cursor-pointer text-left">
                      I confirm I am 18+ or have consent from a guardian if I am screening for a minor.
                    </label>
                  </li>
                </ul>

                <div className="flex flex-col gap-3 rounded-[16px] border border-dashed border-[var(--color-primary)]/40 bg-[var(--color-primary)]/8 px-4 py-4 text-sm text-[color:var(--color-ink)] md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium">Session retention</p>
                    <p className="text-muted-foreground">
                      Keep a secure copy for 30 days (OFF by default). Turn on only if you need to return later.
                    </p>
                  </div>
                  <Switch checked={retainData} onCheckedChange={setRetainData} aria-label="Toggle data retention" />
                </div>

                <p className="text-xs text-muted-foreground">
                  Questions? Read our <a href="/privacy" className="text-primary underline-offset-2 hover:underline">Privacy commitments</a> or contact support@net-prescreen.com.
                </p>
              </CardContent>
            </Card>

            <div className="flex flex-col items-start justify-between gap-6 rounded-[20px] border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-6 shadow-[var(--shadow-card)] md:flex-row md:items-center">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">Ready when you are</p>
                <p className="text-lg text-[color:var(--color-ink)]">The pre-screen takes about 15 minutes, and you can pause anytime.</p>
              </div>
              <Button size="lg" className="min-w-[200px]" onClick={handleContinue}>
                Start calm session
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Onboarding;
