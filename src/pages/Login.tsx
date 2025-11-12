import { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { isAuthenticated, setAuthenticated } from "@/lib/auth";

type LocationState = {
  from?: string;
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;
  const redirectPath = state?.from ?? "/assessment";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(redirectPath, { replace: true });
    }
  }, [navigate, redirectPath]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password to continue.");
      return;
    }

    setError("");
    setAuthenticated(true);

    navigate(redirectPath, { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-12 px-6 py-16 md:flex-row md:items-start md:justify-between md:px-8">
          <div className="max-w-md space-y-6 text-balance">
            <p className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-card)]/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Secure login
            </p>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold text-[color:var(--color-ink)] md:text-5xl">Welcome back.</h1>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Log in to continue the calm, guided pre-screen. We use email sign-in so you stay in control of your data and can return any time.
              </p>
            </div>
            <div className="rounded-[20px] border border-[color:var(--color-border)] bg-[color:var(--color-card)]/80 p-5 text-sm leading-relaxed text-muted-foreground shadow-[var(--shadow-card)]">
              <p className="font-semibold text-[color:var(--color-ink)]">Privacy-first promise</p>
              <p className="mt-2">
                We do not share your information without consent. Data retention defaults to off unless you opt in later.
              </p>
            </div>
          </div>

          <div className="w-full max-w-md">
            <Card className="border-border/80 shadow-[var(--shadow-card)]">
              <CardHeader className="space-y-2 text-center">
                <CardTitle>Sign in to N.E.T.</CardTitle>
                <CardDescription>Use the email you started your pre-screen with to pick up where you left off.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>We only keep you signed in on this browser.</span>
                    <button type="button" className="font-medium text-[var(--color-primary)] hover:underline focus-ring">
                      Forgot password?
                    </button>
                  </div>
                  {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                  <Button type="submit" size="lg" className="w-full">
                    {redirectPath === "/onboarding"
                      ? "Continue to onboarding"
                      : redirectPath === "/assessment"
                      ? "Continue to assessment"
                      : "Continue"}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 text-center text-sm text-muted-foreground">
                <p>
                  New here? <span className="font-medium text-[color:var(--color-ink)]">Create an account during onboarding.</span>
                </p>
                <p className="text-xs">
                  Having trouble? Email <a className="text-[var(--color-primary)] underline-offset-4 hover:underline" href="mailto:support@net-prescreen.com">support@net-prescreen.com</a>.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
