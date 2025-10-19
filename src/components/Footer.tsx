import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#101418] text-white/90">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-bold">
                N
              </div>
              <div>
                <p className="text-lg font-semibold text-white">N.E.T.</p>
                <p className="text-xs uppercase tracking-[0.18em] text-white/60">Neurodiverse pre-screen</p>
              </div>
            </div>
            <p className="text-sm text-white/70">
              Calm, trustworthy screening for families, educators, adults, and clinicians. Privacy-first, non-diagnostic, and
              WCAG 2.2 AA aligned.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">Explore</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link to="/about" className="transition-colors hover:text-white">
                  How it works
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="transition-colors hover:text-white">
                  For schools &amp; clinics
                </Link>
              </li>
              <li>
                <Link to="/onboarding" className="transition-colors hover:text-white">
                  Start pre-screen
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">Privacy &amp; consent</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link to="/privacy" className="transition-colors hover:text-white">
                  Privacy commitments
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="transition-colors hover:text-white">
                  Consent language
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="transition-colors hover:text-white">
                  Accessibility statement
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4 rounded-[16px] border border-white/10 bg-white/5 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">Need support?</h3>
            <p className="text-sm text-white/70">
              Email <a href="mailto:support@net-prescreen.com" className="text-white underline-offset-2 hover:underline">support@net-prescreen.com</a> for help.
            </p>
            <div className="space-y-2 text-sm text-white/70">
              <p className="font-medium text-white">Crisis resources</p>
              <p>United States: Call or text <span className="font-semibold text-white">988</span>.</p>
              <p>Canada: Talk Suicide Canada <span className="font-semibold text-white">1-833-456-4566</span>.</p>
              <p>Elsewhere: Contact local emergency services.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} N.E.T. All rights reserved. This tool offers guidance, not a medical diagnosis.</p>
          <p>Data retention defaults to OFF. You decide when to export or delete.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;