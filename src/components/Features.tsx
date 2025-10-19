import { Users, GraduationCap, Stethoscope, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const roles = [
  {
    icon: Users,
    title: "Parents & Caregivers",
    description: "Get early guidance and home strategies in plain language, with no medical jargon.",
  },
  {
    icon: GraduationCap,
    title: "Teachers & Schools",
    description: "Access classroom accommodations, documentation tools, and 504-plan starters instantly.",
  },
  {
    icon: User,
    title: "Adults Self-Screening",
    description: "Explore your learning profile confidentially and discover supportive resources.",
  },
  {
    icon: Stethoscope,
    title: "Clinicians",
    description: "Streamline intake with structured pre-screen data and observation summaries.",
  },
];

const Features = () => {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl rounded-[28px] border border-[color:var(--color-border)] bg-[var(--gradient-subtle)] px-4 py-14 shadow-[var(--shadow-card)] sm:px-6 md:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center text-balance">
          <h2 className="text-3xl font-semibold text-[color:var(--color-ink)] md:text-4xl">
            Built for everyone in the learning journey
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Whether you're a parent, educator, adult learner, or clinician—N.E.T. provides role-specific insights and calm, actionable next steps.
          </p>
        </div>

        <ul
          className="-mx-1.5 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 pl-1.5 pr-[env(safe-area-inset-right)] md:mx-0 md:grid md:snap-none md:overflow-visible md:px-0 md:pb-0 md:grid-cols-2 lg:grid-cols-4"
          role="list"
          aria-label="Audience segments supported by N.E.T."
        >
          {roles.map((role) => (
            <li key={role.title} className="min-w-[78%] snap-start md:min-w-0">
              <Card className="group h-full border-transparent bg-[color:var(--color-card)]/90 transition-all duration-200 ease-out hover:-translate-y-1 hover:border-[color:var(--color-primary)]/40 hover:shadow-[var(--shadow-elevated)]" role="group" aria-label={role.title}>
                <CardContent className="flex h-full flex-col gap-5 p-6">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/12 flex items-center justify-center text-[var(--color-primary)]">
                    <role.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-[color:var(--color-ink)]">{role.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{role.description}</p>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground group-hover:text-[var(--color-primary)]">
                    Tailored view
                  </span>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Features;