import { BadgeCheck, Shield, Info } from "lucide-react";

const signals = [
  {
    icon: Shield,
    title: "HIPAA-aligned mindset",
    description: "Your session is encrypted and retention stays off unless you opt in.",
  },
  {
    icon: BadgeCheck,
    title: "WCAG 2.2 AA",
    description: "High-contrast defaults, tap-friendly targets, and assistive toggles built-in.",
  },
  {
    icon: Info,
    title: "Not medical advice",
    description: "We provide gentle guidance—not a diagnosis. Crisis resources are always visible.",
  },
];

const TrustSignals = () => {
  return (
    <section className="py-14">
      <div className="max-w-5xl mx-auto px-6 md:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {signals.map((signal) => (
            <div
              key={signal.title}
              className="flex flex-col gap-3 rounded-[12px] border border-border bg-white/80 p-5 shadow-[var(--shadow-card)]"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                <signal.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground/90">
                  {signal.title}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">{signal.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSignals;
