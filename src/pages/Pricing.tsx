import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Try N.E.T. with basic features",
    features: [
      "3 pre-screen sessions per month",
      "Basic report summaries",
      "No data retention (ephemeral only)",
      "Community support",
    ],
    cta: "Start Free",
    highlighted: false,
  },
  {
    name: "Individual",
    price: "$19.99",
    period: "/month",
    description: "Perfect for parents and adult learners",
    features: [
      "Unlimited pre-screen sessions",
      "Full report exports (PDF/Doc)",
      "Optional 30-day data retention",
      "Access to assistive tools (focus timer, reading assistant)",
      "Priority email support",
    ],
    cta: "Get Started",
    highlighted: true,
  },
  {
    name: "Family/Educator",
    price: "$99",
    period: "/month",
    description: "For families or teachers managing multiple learners",
    features: [
      "Everything in Individual",
      "Up to 5 learner profiles",
      "Full interventions library access",
      "Classroom strategy guides",
      "Peer-validated ratings",
      "Priority support with faster response",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For schools, districts, and clinics",
    features: [
      "Private tenant deployment",
      "SSO (SAML/OIDC)",
      "Business Associate Agreement (BAA/DPA)",
      "Audit logs & compliance reporting",
      "Org dashboard with anonymized analytics",
      "99.9% SLA",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const Pricing = () => {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Navbar />
      
      <main className="flex-1 py-16 md:py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-16 px-6 md:px-8">
          <div className="text-center text-balance max-w-3xl mx-auto space-y-4">
            <h1 className="text-4xl font-semibold md:text-5xl" style={{ color: 'var(--color-ink)' }}>Choose your plan</h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Start with our free tier or unlock advanced features and unlimited access.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier) => (
              <Card
                key={tier.name}
                style={{ 
                  borderColor: tier.highlighted ? 'var(--color-primary)' : 'var(--color-border)',
                  backgroundColor: 'var(--color-card)'
                }}
                className={`relative h-full transition-all duration-[var(--dur-med)] ease-[var(--ease)] hover:-translate-y-1 ${
                  tier.highlighted ? "shadow-[var(--shadow-elevated)]" : "shadow-[var(--shadow-card)]"
                }`}
              >
                {tier.highlighted && (
                  <div 
                    className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full text-xs font-semibold uppercase tracking-[0.24em] text-white px-5 py-1"
                    style={{ 
                      backgroundColor: 'var(--color-primary)', 
                      borderColor: 'var(--color-primary)',
                      border: '1px solid'
                    }}
                  >
                    Most popular
                  </div>
                )}

                <CardHeader className="space-y-4 pb-6">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl" style={{ color: 'var(--color-ink)' }}>{tier.name}</CardTitle>
                    <CardDescription>{tier.description}</CardDescription>
                  </div>
                  <div className="flex items-baseline gap-2" style={{ color: 'var(--color-ink)' }}>
                    <span className="text-4xl font-semibold">{tier.price}</span>
                    {tier.period && <span className="text-sm text-muted-foreground">{tier.period}</span>}
                  </div>
                </CardHeader>

                <CardContent className="flex h-full flex-col gap-6">
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    className="mt-auto w-full"
                    variant={tier.highlighted ? "default" : "outline"}
                  >
                    <Link to={tier.name === "Enterprise" ? "/contact" : "/login"}>{tier.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mx-auto max-w-3xl">
            <Card 
              style={{ 
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-card)'
              }}
              className="shadow-[var(--shadow-card)]"
            >
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-4 text-center" style={{ color: 'var(--color-ink)' }}>All plans include</h3>
                <div className="grid gap-4 text-sm text-muted-foreground md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0" style={{ color: 'var(--color-primary)' }} />
                    <span>HIPAA-aligned privacy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0" style={{ color: 'var(--color-primary)' }} />
                    <span>WCAG 2.2 AA accessibility</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0" style={{ color: 'var(--color-primary)' }} />
                    <span>Mobile-optimized interface</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0" style={{ color: 'var(--color-primary)' }} />
                    <span>Regular updates & improvements</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;