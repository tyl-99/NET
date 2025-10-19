import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useThemePreference, useDyslexiaPreference } from "@/hooks/useThemePreference";
import type { ThemeName } from "@/hooks/useThemePreference";
import { isAuthenticated } from "@/lib/auth";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, setTheme } = useThemePreference();
  const { dyslexiaEnabled, setDyslexiaEnabled } = useDyslexiaPreference();

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

  const themeOptions: ReadonlyArray<{ label: string; value: ThemeName }> = [
    { label: "Calm teal", value: "calm" },
    { label: "Midnight sand", value: "midnight" },
  ];

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <nav className="sticky top-0 z-50 border-b border-[color:var(--color-border)]/80 bg-[color:var(--color-bg)]/90 backdrop-blur supports-[backdrop-filter]:bg-[color:var(--color-bg)]/75">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 md:px-8">
        <Link to="/" className="flex items-center gap-3 focus-ring">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-base font-semibold uppercase tracking-[0.14em] text-white shadow-[var(--shadow-card)]">
            N
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-[color:var(--color-ink)]">N.E.T.</span>
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Neurodiverse pre-screen</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden flex-1 items-center justify-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors duration-150 ease-out hover:text-[color:var(--color-ink)] focus-ring"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <div className="flex items-center gap-2">
            <Select value={theme} onValueChange={(value) => setTheme(value as ThemeName)}>
              <SelectTrigger className="w-[160px] rounded-[12px] border-[color:var(--color-border)] bg-[color:var(--color-card)] text-sm focus-ring">
                <SelectValue aria-label="Select visual theme" placeholder="Theme" />
              </SelectTrigger>
              <SelectContent align="end" sideOffset={8} className="rounded-[12px] border-[color:var(--color-border)] bg-[color:var(--color-card)] shadow-[var(--shadow-card)]">
                {themeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="rounded-[10px] text-sm">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="dyslexia-toggle"
              checked={dyslexiaEnabled}
              onCheckedChange={setDyslexiaEnabled}
              aria-label="Toggle dyslexia-friendly font"
            />
            <label htmlFor="dyslexia-toggle" className="text-xs font-medium text-muted-foreground">
              Dyslexia-friendly
            </label>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={handleSignIn}
            className="rounded-full bg-[#FFE55A] px-6 font-semibold text-[#1F1F1F] shadow-[var(--shadow-card)] hover:bg-[#FFE55A]/90"
          >
            Sign In
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={handleStartAssessment}
            className="rounded-full px-7 shadow-[var(--shadow-card)]"
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
          className="md:hidden border-t border-[color:var(--color-border)]/80 bg-[color:var(--color-bg)]/95 px-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-6 shadow-[var(--shadow-card)]"
        >
          <div className="space-y-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block rounded-[14px] border border-transparent px-4 py-3 text-base font-medium text-muted-foreground transition-colors duration-150 ease-out hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-card)] hover:text-[color:var(--color-ink)] focus-ring"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="space-y-4 rounded-[16px] border border-[color:var(--color-border)] bg-[color:var(--color-card)] p-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-[color:var(--color-ink)]">Visual theme</p>
                <Select value={theme} onValueChange={(value) => setTheme(value as ThemeName)}>
                  <SelectTrigger className="rounded-[12px] border-[color:var(--color-border)] bg-[color:var(--color-card)] focus-ring">
                    <SelectValue aria-label="Select visual theme" placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent align="end" sideOffset={8} className="rounded-[12px] border-[color:var(--color-border)] bg-[color:var(--color-card)] shadow-[var(--shadow-card)]">
                    {themeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="rounded-[10px] text-sm">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-[12px] bg-[color:var(--color-border)]/40 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[color:var(--color-ink)]">Dyslexia-friendly font</p>
                  <p className="text-xs text-muted-foreground">Switch to Atkinson Hyperlegible</p>
                </div>
                <Switch checked={dyslexiaEnabled} onCheckedChange={setDyslexiaEnabled} aria-label="Toggle dyslexia-friendly font" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="w-full rounded-full bg-[#FFE55A] font-semibold text-[#1F1F1F] shadow-sm hover:bg-[#FFE55A]/90"
                onClick={() => {
                  setIsOpen(false);
                  handleSignIn();
                }}
              >
                Sign In
              </Button>
              <Button
                type="button"
                size="lg"
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
  );
};

export default Navbar;