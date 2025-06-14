
/// <reference types="vite/client" />

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initiateCheckout: (planType: "one-time" | "subscription") => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  const initiateCheckout = async (planType: "one-time" | "subscription") => {
    if (isLoadingCheckout) return;

    setIsLoadingCheckout(true);
    try {
      const priceId = planType === "one-time" 
        ? import.meta.env.VITE_PRICE_ONE_TIME
        : import.meta.env.VITE_PRICE_UNLIMITED;

      console.log("Initiating checkout for plan:", planType, "with priceId:", priceId);

      if (!priceId) {
        console.error("Missing price ID in environment variables");
        toast({
          title: "Configuration Error",
          description: "Missing price information. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { priceId }
      });

      if (error) {
        console.error("Error creating checkout session:", error);
        throw new Error("Failed to create checkout session");
      }

      if (data?.url) {
        console.log("Redirecting to Stripe Checkout URL:", data.url);
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
      
    } catch (error) {
      console.error("Error initiating checkout:", error);
      toast({
        title: "Error",
        description: "There was a problem initiating checkout. Please try again or contact support.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoadingCheckout(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed", event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only handle redirects for specific events, not all state changes
        if (event === 'SIGNED_IN' && pendingRedirect) {
          const redirect = pendingRedirect;
          setPendingRedirect(null);
          
          // Handle post-payment success
          const urlParams = new URLSearchParams(window.location.search);
          const sessionId = urlParams.get('session_id');
          const paymentSuccess = urlParams.get('payment_success');
          
          if (sessionId && paymentSuccess) {
            console.log("Post-payment redirect to upload");
            navigate('/upload', { replace: true });
            return;
          }
          
          // Handle redirects based on the stored pending redirect
          if (redirect === 'pricing') {
            navigate('/pricing', { replace: true });
          } else if (redirect === 'upload') {
            navigate('/upload', { replace: true });
          } else if (redirect && redirect !== '/') {
            navigate(redirect, { replace: true });
          } else {
            // Default: don't redirect, let user stay where they are
            console.log("Signed in, staying on current page");
          }
        } else if (event === 'SIGNED_OUT') {
          navigate('/');
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [navigate, pendingRedirect]);

  const login = async () => {
    // Set pending redirect before initiating login
    const urlParams = new URLSearchParams(window.location.search);
    const nextPath = urlParams.get('next');
    setPendingRedirect(nextPath || 'upload');
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${nextPath || '/upload'}`
      }
    });
  };

  const loginWithEmail = async (email: string, password: string) => {
    // Set pending redirect before login
    const urlParams = new URLSearchParams(window.location.search);
    const nextPath = urlParams.get('next');
    setPendingRedirect(nextPath || 'upload');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
  };

  const signup = async (email: string, password: string) => {
    // For new signups, always redirect to pricing
    setPendingRedirect('pricing');

    const { error, data } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) throw error;

    if (data?.user && data?.session) {
      toast({
        title: "Success!",
        description: "Your account has been created and you're now logged in.",
      });
    } else if (data?.user && !data?.session) {
      toast({
        title: "Account created!",
        description: "Check your email to confirm your account.",
      });
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, session, login, loginWithEmail, signup, logout, initiateCheckout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
