
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PageContainer from '@/components/PageContainer';
import { Loader2 } from 'lucide-react';

const InitiateCheckout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { initiateCheckout, user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const plan = searchParams.get('plan') as "one-time" | "subscription" | null;

  useEffect(() => {
    const startCheckout = async () => {
      if (!user) {
        console.log("User not loaded yet, waiting...");
        return;
      }

      if (!plan) {
        console.warn("No plan specified, redirecting to pricing");
        navigate('/#pricing');
        return;
      }

      try {
        console.log(`Initiating checkout for plan: ${plan}`);
        await initiateCheckout(plan);
        // Note: The initiateCheckout function handles redirection to Stripe
        // If we reach here, something went wrong but didn't throw an error
        setError("Checkout process started but no redirect occurred. Please try again.");
      } catch (err: any) {
        console.error("Checkout initiation error:", err);
        setError(err.message || "Failed to start checkout. Please try again.");
        // After a delay, redirect to pricing
        setTimeout(() => navigate('/#pricing'), 3000);
      }
    };

    startCheckout();
  }, [plan, navigate, initiateCheckout, user]);

  return (
    <PageContainer>
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        {error ? (
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-semibold text-red-500">Checkout Error</h1>
            <p className="text-muted-foreground">{error}</p>
            <p className="text-sm">Redirecting you to the pricing page...</p>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-semibold mb-4">Setting up your payment...</h1>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">You'll be redirected to complete your purchase shortly.</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default InitiateCheckout;
