import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAuthenticated } from "@/lib/auth";
import SkipToContentLink from "./SkipToContentLink";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
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

  const navLinks = [
    { label: "How It Works", href: "/about" },
    { label: "Pricing", href: "/pricing" },
    { label: "Privacy", href: "/privacy" },
  ];

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <SkipToContentLink />
      <nav className="sticky top-0 z-50 border-b border-[color:var(--color-border)]/80 bg-[color:var(--color-bg)]/90 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--color-bg)]/75">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 md:px-8">
          <Link to="/" className="flex items-center gap-3 focus-ring">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-base font-semibold uppercase tracking-[0.14em] text-white shadow-[var(--shadow-card)]">
              N
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-[color:var(--color-ink)]">N.E.T.</span>
              <span className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">NeuroEducationalTesting</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden flex-1 items-center justify-center md:flex">
            <ul className="flex items-center gap-8">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm font-medium text-muted-foreground transition-colors duration-150 ease-out hover:text-[color:var(--color-ink)] focus-ring whitespace-nowrap"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSignIn}
              className="rounded-full px-5 font-semibold"
            >
              Sign In
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleStartAssessment}
              className="rounded-full px-6 shadow-[var(--shadow-card)]"
            >
              Start Assessment
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-transparent bg-[color:var(--color-card)] shadow-sm text-[color:var(--color-ink)] transition-colors duration-150 focus-ring md:hidden"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            aria-label="Primary"
            className="md:hidden border-t border-[color:var(--color-border)]/80 bg-[color:var(--color-bg)]/95 px-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-6 shadow-[var(--shadow-card)]"
          >
            <div className="space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block rounded-[14px] border border-transparent px-4 py-3 text-base font-medium text-muted-foreground transition-colors duration-150 ease-out hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-card)] hover:text-[color:var(--color-ink)] focus-ring whitespace-nowrap"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full rounded-full font-semibold"
                  onClick={() => {
                    setIsOpen(false);
                    handleSignIn();
                  }}
                >
                  Sign In
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="w-full rounded-full shadow-sm"
                  onClick={() => {
                    setIsOpen(false);
                    handleStartAssessment();
                  }}
                >
                  Start Assessment
                </Button>
              </div>
            </div>
          </div>
        )}
        </nav>
      </>
    );
};

export default Navbar;
