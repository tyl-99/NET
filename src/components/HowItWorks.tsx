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
    <section className="py-24">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground">How N.E.T. feels in practice</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Designed for cognitive ease: calm pacing, predictable steps, and friendly microcopy that keeps everyone oriented.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.title}
              className="flex flex-col gap-6 rounded-[12px] border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-transform duration-200 hover:-translate-y-1"
            >
              {step.illustration}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-card-foreground">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
