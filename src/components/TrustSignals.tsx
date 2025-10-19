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
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="rounded-[20px] border border-[color:var(--color-border)] bg-[color:var(--color-card)]/75 p-5 shadow-[var(--shadow-card)] sm:p-6">
          <ul
            className="-mx-1.5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pl-1.5 pr-[env(safe-area-inset-right)] md:mx-0 md:grid md:snap-none md:overflow-visible md:px-0 md:pb-0 md:grid-cols-3"
            role="list"
            aria-label="Reassurance points about privacy and accessibility"
          >
            {signals.map((signal) => (
              <li
                key={signal.title}
                className="flex min-w-[75%] snap-start flex-col gap-3 rounded-[16px] bg-[color:var(--color-bg)]/60 p-5 shadow-sm md:min-w-0"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
                  <signal.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted-foreground">{signal.title}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{signal.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default TrustSignals;
