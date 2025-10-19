import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-[color:var(--color-border)] bg-[color:var(--color-card)]/80">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:px-8">
        <div className="grid gap-10 md:grid-cols-[minmax(0,_1.4fr)_repeat(3,_minmax(0,_1fr))]">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-base font-semibold uppercase tracking-[0.14em] text-white shadow-[var(--shadow-card)]">
                N
              </div>
              <div>
                <p className="text-lg font-semibold text-[color:var(--color-ink)]">N.E.T.</p>
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">Neurodiverse pre-screen</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Calm, trustworthy screening for families, educators, adults, and clinicians. Privacy-first, non-diagnostic, and
              WCAG 2.2 AA aligned.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">Explore</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="transition-colors duration-150 ease-out hover:text-[var(--color-primary)] focus-ring">
                  How it works
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="transition-colors duration-150 ease-out hover:text-[var(--color-primary)] focus-ring">
                  For schools &amp; clinics
                </Link>
              </li>
              <li>
                <Link
                  to="/assessment"
                  className="transition-colors duration-150 ease-out hover:text-[var(--color-primary)] focus-ring"
                >
                  Start assessment
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">Privacy &amp; consent</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/privacy" className="transition-colors duration-150 ease-out hover:text-[var(--color-primary)] focus-ring">
                  Privacy commitments
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="transition-colors duration-150 ease-out hover:text-[var(--color-primary)] focus-ring">
                  Consent language
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="transition-colors duration-150 ease-out hover:text-[var(--color-primary)] focus-ring">
                  Accessibility statement
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4 rounded-[20px] border border-[color:var(--color-border)] bg-[color:var(--color-bg)]/70 p-5 shadow-[var(--shadow-card)]">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">Need support?</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Email <a href="mailto:support@net-prescreen.com" className="text-[var(--color-primary)] underline-offset-4 hover:underline">support@net-prescreen.com</a> for help.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium text-[color:var(--color-ink)]">Crisis resources</p>
              <p>United States: Call or text <span className="font-semibold text-[color:var(--color-ink)]">988</span>.</p>
              <p>Canada: Talk Suicide Canada <span className="font-semibold text-[color:var(--color-ink)]">1-833-456-4566</span>.</p>
              <p>Elsewhere: Contact local emergency services.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-[color:var(--color-border)] pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} N.E.T. All rights reserved. This tool offers guidance, not a medical diagnosis.</p>
          <p>Data retention defaults to OFF. You decide when to export or delete.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;