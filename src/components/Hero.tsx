import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Eye, Info } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated } from "@/lib/auth";

const trustChips = [
  { label: "HIPAA-aligned mindset", icon: ShieldCheck },
  { label: "WCAG 2.2 AA", icon: Eye },
  { label: "Not medical advice", icon: Info },
];

const Hero = () => {
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate("/login");
  };

  const handleStartAssessment = () => {
    if (isAuthenticated()) {
      navigate("/assessment");
      return;
    }

    navigate("/login", { state: { from: "/assessment" } });
  };

  return (
    <section className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(25,154,142,0.22),_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(59,76,202,0.18),_transparent_60%)]" />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-14 px-4 py-20 sm:px-6 sm:py-24 md:px-8 lg:flex-row lg:items-center lg:gap-20 lg:py-28">
        <div className="max-w-2xl space-y-10">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-card)]/80 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground shadow-[var(--shadow-card)]">
            Calm, modern pre-screen
          </div>
          <div className="space-y-6 text-balance">
            <h1 className="text-3xl font-semibold text-[color:var(--color-ink)] sm:text-4xl md:text-5xl">
              Quick, caring pre-screening—no diagnosis, just clarity.
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              N.E.T. guides parents, educators, adults, and clinicians through a supportive conversation that surfaces patterns,
              accommodations, and next steps—all with privacy control in your hands.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {trustChips.map((chip) => (
              <span
                key={chip.label}
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-card)]/90 px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground shadow-sm"
              >
                <chip.icon className="h-4 w-4 text-[var(--color-primary)]" aria-hidden="true" />
                {chip.label}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              type="button"
              size="lg"
              variant="ghost"
              onClick={handleSignIn}
              className="rounded-full bg-[#FFE55A] px-7 text-base font-semibold text-[#1F1F1F] shadow-[var(--shadow-card)] hover:bg-[#FFE55A]/90"
            >
              Sign In
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={handleStartAssessment}
              className="rounded-full px-8 text-base"
            >
              Start Assessment
            </Button>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors duration-150 ease-out hover:text-[var(--color-primary)] focus-ring"
            >
              See how N.E.T. supports teams <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <aside className="relative w-full max-w-md rounded-[24px] border border-[color:var(--color-border)] bg-[color:var(--color-card)]/90 p-6 shadow-[var(--shadow-card)] backdrop-blur sm:p-8">
          <div className="absolute inset-x-6 -top-3 h-6 rounded-full bg-[var(--color-primary)]/20 blur-2xl" aria-hidden="true" />
          <div className="space-y-6">
            <header className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">What to expect</p>
              <p className="text-lg leading-relaxed text-[color:var(--color-ink)]">
                Answer a few thoughtful prompts, see your estimated time to finish, and receive role-ready summaries you can share.
              </p>
            </header>
            <div className="grid gap-4">
              <div className="rounded-[18px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)]/70 p-4 shadow-sm">
                <p className="text-sm font-semibold text-[color:var(--color-ink)]">Stay in control</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Session data retention defaults to OFF. Opt in for 30 days only when you choose to.
                </p>
              </div>
              <div className="rounded-[18px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)]/70 p-4 shadow-sm">
                <p className="text-sm font-semibold text-[color:var(--color-ink)]">Accessibility first</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Reading mode, dyslexia-friendly fonts, and high-contrast toggles stay close at hand.
                </p>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-12 bottom-10 hidden h-24 w-24 rounded-full border border-dashed border-[var(--color-primary)]/30 lg:block" aria-hidden="true" />
          <div className="pointer-events-none absolute -left-10 top-6 hidden h-32 w-32 rounded-full bg-[var(--color-primary)]/10 blur-3xl lg:block" aria-hidden="true" />
        </aside>
      </div>
    </section>
  );
};

export default Hero;
