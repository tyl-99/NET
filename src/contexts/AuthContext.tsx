import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Handle OAuth callback - check for hash fragments or query params
    const handleAuthCallback = async () => {
      // Check hash fragments (Supabase OAuth uses hash)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      // Also check query params (some OAuth flows use query)
      const searchParams = new URLSearchParams(window.location.search);
      const queryAccessToken = searchParams.get('access_token');
      const queryRefreshToken = searchParams.get('refresh_token');
      
      const token = accessToken || queryAccessToken;
      const refresh = refreshToken || queryRefreshToken;
      
      if (token && refresh) {
        setIsProcessingOAuth(true);
        setLoading(true);
        try {
          console.log('Processing OAuth callback...');
          // Set the session first
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: token,
            refresh_token: refresh,
          });
          
          if (error) {
            console.error('Error setting session:', error);
            setIsProcessingOAuth(false);
            setLoading(false);
            // Redirect to login on error
            navigate("/login", { replace: true });
            return;
          }
          
          if (session) {
            console.log('OAuth session set successfully');
            setSession(session);
            setUser(session.user);
            setIsProcessingOAuth(false);
            setLoading(false);
            
            // Clear hash/query params and redirect to onboarding
            window.history.replaceState(null, '', '/onboarding');
            navigate("/onboarding", { replace: true });
            return;
          }
        } catch (error) {
          console.error('Error handling OAuth callback:', error);
          setIsProcessingOAuth(false);
          setLoading(false);
          navigate("/login", { replace: true });
        }
        return; // Exit early if we processed OAuth
      }
      
      // If we're on a remote URL (like Amplify) but have a session, redirect to onboarding
      if (window.location.hostname.includes('amplifyapp.com') || 
          window.location.hostname.includes('amazonaws.com') ||
          window.location.hostname.includes('railway.app')) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            // Redirect to onboarding using current domain
            navigate("/onboarding", { replace: true });
          }
        });
      }
    };

    handleAuthCallback();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Always redirect to onboarding after successful login (any method)
        if (event === 'SIGNED_IN' && session) {
          const currentPath = window.location.pathname;
          if (currentPath === '/' || currentPath === '/login') {
            // Small delay to ensure URL is cleaned up
            setTimeout(() => {
              navigate("/onboarding", { replace: true });
            }, 100);
          }
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    navigate("/login");
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
