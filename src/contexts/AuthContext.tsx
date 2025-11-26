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
    console.log('[AuthContext] useEffect triggered');
    
    // Handle OAuth callback - check for hash fragments or query params
    const handleAuthCallback = async () => {
      console.log('[AuthContext] Checking for OAuth callback...');
      console.log('[AuthContext] Current URL:', window.location.href);
      console.log('[AuthContext] Hash:', window.location.hash);
      console.log('[AuthContext] Search:', window.location.search);
      
      // Check hash fragments (Supabase OAuth uses hash)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      console.log('[AuthContext] Hash params:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : null,
      });
      
      // Also check query params (some OAuth flows use query)
      const searchParams = new URLSearchParams(window.location.search);
      const queryAccessToken = searchParams.get('access_token');
      const queryRefreshToken = searchParams.get('refresh_token');
      
      const token = accessToken || queryAccessToken;
      const refresh = refreshToken || queryRefreshToken;
      
      console.log('[AuthContext] Final tokens:', {
        hasToken: !!token,
        hasRefresh: !!refresh,
        tokenSource: accessToken ? 'hash' : queryAccessToken ? 'query' : 'none',
      });
      
      if (token && refresh) {
        setIsProcessingOAuth(true);
        setLoading(true);
        console.log('[AuthContext] Processing OAuth callback...');
        try {
          console.log('[AuthContext] Calling supabase.auth.setSession...');
          // Set the session first
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: token,
            refresh_token: refresh,
          });
          
          console.log('[AuthContext] setSession response:', {
            hasSession: !!session,
            hasError: !!error,
            error: error ? {
              message: error.message,
              status: error.status,
            } : null,
            userId: session?.user?.id,
          });
          
          if (error) {
            console.error('[AuthContext] Error setting session:', error);
            console.error('[AuthContext] Error details:', JSON.stringify(error, null, 2));
            setIsProcessingOAuth(false);
            setLoading(false);
            // Redirect to login on error
            navigate("/login", { replace: true });
            return;
          }
          
          if (session) {
            console.log('[AuthContext] OAuth session set successfully:', {
              userId: session.user.id,
              email: session.user.email,
              expiresAt: session.expires_at,
            });
            setSession(session);
            setUser(session.user);
            setIsProcessingOAuth(false);
            setLoading(false);
            
            // Clear hash/query params and redirect to onboarding
            console.log('[AuthContext] Clearing URL and redirecting to /onboarding');
            window.history.replaceState(null, '', '/onboarding');
            navigate("/onboarding", { replace: true });
            return;
          } else {
            console.warn('[AuthContext] No session returned from setSession');
          }
        } catch (error) {
          console.error('[AuthContext] Exception handling OAuth callback:', error);
          console.error('[AuthContext] Error stack:', error instanceof Error ? error.stack : 'No stack');
          setIsProcessingOAuth(false);
          setLoading(false);
          navigate("/login", { replace: true });
        }
        return; // Exit early if we processed OAuth
      } else {
        console.log('[AuthContext] No OAuth tokens found in URL');
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
    console.log('[AuthContext] Setting up auth state listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[AuthContext] Auth state changed:', {
          event,
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email,
        });
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Always redirect to onboarding after successful login (any method)
        // BUT only if user is on root or login page - don't redirect if already on other pages
        if (event === 'SIGNED_IN' && session) {
          console.log('[AuthContext] SIGNED_IN event detected, checking redirect...');
          const currentPath = window.location.pathname;
          console.log('[AuthContext] Current path:', currentPath);
          // Only redirect if on root or login page - don't interfere with other navigations
          if (currentPath === '/' || currentPath === '/login') {
            console.log('[AuthContext] Redirecting to /onboarding from', currentPath);
            // Small delay to ensure URL is cleaned up
            setTimeout(() => {
              navigate("/onboarding", { replace: true });
            }, 100);
          } else {
            console.log('[AuthContext] User already on', currentPath, '- NOT redirecting to avoid interfering with navigation');
          }
        }
      }
    );

    // Check for existing session
    console.log('[AuthContext] Checking for existing session...');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('[AuthContext] getSession result:', {
        hasSession: !!session,
        hasError: !!error,
        userId: session?.user?.id,
        error: error ? {
          message: error.message,
          status: error.status,
        } : null,
      });
      
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
