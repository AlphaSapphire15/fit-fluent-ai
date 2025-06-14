
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePaymentSuccess } from '@/hooks/usePaymentSuccess';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';

export const usePaymentHandler = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isRefreshingPlan, handlePaymentSuccess } = usePaymentSuccess(user?.id);

  // Handle payment success detection
  useEffect(() => {
    // If user is not logged in, redirect to login with return path
    if (!user) {
      navigate("/login?next=/upload");
      return;
    }

    const sessionId = searchParams.get("session_id");
    const paymentSuccess = searchParams.get("payment_success");

    // Handle payment success
    if (sessionId && paymentSuccess) {
      handlePaymentSuccess({ sessionId, paymentSuccess });
    }
  }, [user, navigate, searchParams, handlePaymentSuccess]);

  // Auto-refresh functionality
  useAutoRefresh(user?.id);

  return { isRefreshingPlan };
};
