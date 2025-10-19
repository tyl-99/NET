import { BookOpenCheck, ClipboardList, Sparkles } from "lucide-react";

const steps = [
  {
    title: "Warm, guided prompts",
    description: "Answer one question at a time in conversational language. Pause anytime—your progress stays on this device.",
    illustration: (
      <div className="flex h-24 items-center justify-center rounded-[12px] bg-gradient-to-br from-primary/10 to-accent/10">
        <Sparkles className="h-8 w-8 text-primary" aria-hidden="true" />
      </div>
    ),
  },
  {
    title: "Session card keeps you oriented",
    description: "See remaining time, percentage complete, and a safety reminder without breaking focus.",
    illustration: (
      <div className="flex h-24 items-center justify-center rounded-[12px] bg-gradient-to-br from-white via-primary/10 to-white">
        <ClipboardList className="h-8 w-8 text-primary" aria-hidden="true" />
      </div>
    ),
  },
  {
    title: "Shareable, role-ready notes",
    description: "Caregiver, teacher, and clinician views translate insights into actions. Export a PDF or copy accommodations instantly.",
    illustration: (
      <div className="flex h-24 items-center justify-center rounded-[12px] bg-gradient-to-br from-accent/15 to-primary/10">
        <BookOpenCheck className="h-8 w-8 text-accent" aria-hidden="true" />
      </div>
    ),
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center text-balance">
          <h2 className="text-3xl font-semibold text-[color:var(--color-ink)] md:text-4xl">How N.E.T. feels in practice</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Designed for cognitive ease: calm pacing, predictable steps, and friendly microcopy that keeps everyone oriented.
          </p>
        </div>
        <ul
          className="-mx-1.5 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 pl-1.5 pr-[env(safe-area-inset-right)] md:mx-0 md:grid md:snap-none md:overflow-visible md:px-0 md:pb-0 md:grid-cols-3"
          role="list"
          aria-label="Overview of the assessment experience"
        >
          {steps.map((step) => (
            <li key={step.title} className="min-w-[78%] snap-start md:min-w-0">
              <article className="flex h-full flex-col gap-6 rounded-[16px] border border-[color:var(--color-border)] bg-[color:var(--color-card)]/90 p-6 shadow-[var(--shadow-card)] transition-transform duration-200 ease-out hover:-translate-y-1">
                {step.illustration}
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-[color:var(--color-ink)]">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default HowItWorks;
