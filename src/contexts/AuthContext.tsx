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
      setIsLoadingCheckout(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
<<<<<<< HEAD
      async (event, session) => {
        console.log("Auth state changed", event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          const urlParams = new URLSearchParams(window.location.search);
          const nextPath = urlParams.get('next');
          const plan = urlParams.get('plan') as "one-time" | "subscription" | null;
          
          if (nextPath === 'payment' && plan) {
            console.log("Signed in with next=payment, initiating checkout for plan:", plan);
            await initiateCheckout(plan);
          } else {
            console.log("Signed in, default redirect to /upload");
            navigate('/upload');
=======
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Get the plan/next params from the current URL (not after-redirect)
        const urlParams = new URLSearchParams(window.location.search);
        const nextPath = urlParams.get('next');
        const plan = urlParams.get('plan');

        if (event === 'SIGNED_IN') {
          if (nextPath === "payment" && plan) {
            // Always redirect to pricing section if coming from payment plan
            navigate(`/?plan=${plan}#pricing`, { replace: true });
            toast({
              title: "Account created!",
              description: "Please choose your plan to continue.",
            });
          } else {
            // Default: go to upload page if NOT coming from a plan-driven signup
            navigate('/upload', { replace: true });
>>>>>>> a762419d882a1dd0e8e821f0abc765b999b7f044
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
  }, [navigate, location]);

  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/upload`
      }
    });
  };

  const loginWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
<<<<<<< HEAD
=======
    // Navigation is handled by onAuthStateChange
>>>>>>> a762419d882a1dd0e8e821f0abc765b999b7f044
  };

  const signup = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`
      }
    });

    if (error) throw error;
<<<<<<< HEAD
    
=======

>>>>>>> a762419d882a1dd0e8e821f0abc765b999b7f044
    if (data?.user && !data?.session) {
      toast({
        title: "Account created!",
        description: "Check your email to confirm your account.",
      });
    } else if (data?.session) {
      toast({
        title: "Success!",
        description: "Your account has been created.",
      });
    }
    // Navigation is handled by onAuthStateChange
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
