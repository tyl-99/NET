import { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type LocationState = {
  from?: string;
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const state = location.state as LocationState | undefined;
  const redirectPath = state?.from ?? "/onboarding";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate(redirectPath, { replace: true });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate(redirectPath, { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, redirectPath]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError("Enter your email and password to continue.");
      setLoading(false);
      return;
    }

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      toast({
        title: "Account created!",
        description: "Welcome to N.E.T. Pre-Screen.",
      });
      // Navigation will be handled by onAuthStateChange
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      // Navigation will be handled by onAuthStateChange
    }
    
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${redirectPath}`,
      },
    });

    if (error) {
      setError(error.message);
      toast({
        title: "Sign-in failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
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
              <h1 className="text-4xl font-semibold text-[color:var(--color-ink)] md:text-5xl">
                {isSignUp ? "Get started." : "Welcome back."}
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {isSignUp 
                  ? "Create an account to begin the calm, guided pre-screen. We use email sign-in so you stay in control of your data."
                  : "Log in to continue the calm, guided pre-screen. We use email sign-in so you stay in control of your data and can return any time."
                }
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
                <CardTitle>{isSignUp ? "Create your N.E.T. account" : "Sign in to N.E.T."}</CardTitle>
                <CardDescription>
                  {isSignUp 
                    ? "Start your journey with a secure account."
                    : "Use the email you started your pre-screen with to pick up where you left off."
                  }
                </CardDescription>
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
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </div>
                  {!isSignUp && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>We only keep you signed in on this browser.</span>
                      <button type="button" className="font-medium text-[var(--color-primary)] hover:underline focus-ring">
                        Forgot password?
                      </button>
                    </div>
                  )}
                  {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                  <Button type="submit" size="lg" className="w-full" disabled={loading}>
                    {loading 
                      ? (isSignUp ? "Creating account..." : "Signing in...") 
                      : isSignUp 
                        ? "Create account" 
                        : redirectPath === "/onboarding"
                          ? "Continue to onboarding"
                          : redirectPath === "/assessment"
                          ? "Continue to assessment"
                          : "Continue"
                    }
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    {loading ? (isSignUp ? "Creating account..." : "Signing in...") : `Sign ${isSignUp ? "up" : "in"} with Google`}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 text-center text-sm text-muted-foreground">
                <p>
                  {isSignUp ? "Already have an account?" : "New here?"}{" "}
                  <button 
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError("");
                    }} 
                    className="font-medium text-[color:var(--color-ink)] hover:underline focus-ring"
                  >
                    {isSignUp ? "Sign in" : "Create an account"}
                  </button>
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
