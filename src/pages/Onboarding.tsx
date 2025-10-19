import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Users, GraduationCap, User, Stethoscope, Check, ArrowRight } from "lucide-react";
import { toast } from "sonner";

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
        <div className="max-w-4xl mx-auto px-6 md:px-8 space-y-12">
          <header className="space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">Onboarding</p>
            <h1 className="text-4xl font-semibold text-foreground">First, let us tailor the pre-screen to you.</h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              These quick steps help us set the right tone, language, and resources. You can pause anytime and nothing is saved
              unless you choose.
            </p>
          </header>

          <section aria-label="Progress" className="rounded-[16px] border border-border bg-card/80 p-6 shadow-[var(--shadow-card)]">
            <ol className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {stepMeta.map((step, index) => {
                const isActive = currentIndex === index;
                const isComplete = step.completed && index !== stepMeta.length - 1;

                return (
                  <li key={step.id} className="flex flex-col gap-2 md:flex-1">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                          isComplete
                            ? "border-primary bg-primary text-primary-foreground"
                            : isActive
                            ? "border-accent text-accent"
                            : "border-border text-muted-foreground"
                        }`}
                        aria-current={isActive ? "step" : undefined}
                      >
                        {isComplete ? <Check className="h-5 w-5" aria-hidden="true" /> : index + 1}
                      </span>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">{step.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {index === 0 && "Pick who is completing this session."}
                          {index === 1 && "Review the privacy guardrails in plain language."}
                          {index === 2 && "Start the calm, 15-minute conversation."}
                        </p>
                      </div>
                    </div>
                    {index < stepMeta.length - 1 && (
                      <div className="hidden md:block h-0.5 w-full rounded-full bg-muted" aria-hidden="true" />
                    )}
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
                      className={`flex h-full flex-col items-start gap-4 rounded-[12px] border-2 p-5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 ${
                        isSelected ? "border-primary bg-primary/10 shadow-[var(--shadow-card)]" : "border-border hover:border-primary/50"
                      }`}
                      aria-pressed={isSelected}
                    >
                      <role.icon className={`h-7 w-7 ${isSelected ? "text-primary" : "text-muted-foreground"}`} aria-hidden="true" />
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

                <div className="flex items-center justify-between gap-6 rounded-[12px] border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm text-foreground">
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

            <div className="flex flex-col items-start justify-between gap-6 rounded-[16px] border border-border bg-card p-6 shadow-[var(--shadow-card)] md:flex-row md:items-center">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground">Ready when you are</p>
                <p className="text-lg text-foreground">The pre-screen takes about 15 minutes, and you can pause anytime.</p>
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
