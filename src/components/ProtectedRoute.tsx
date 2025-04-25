
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import React, { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresSubscription?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresSubscription = true
}) => {
  const { user, hasActiveSubscription, checkSubscriptionStatus } = useAuth();
  const location = useLocation();
  const isDevelopment = import.meta.env.DEV; // Vite's built-in development flag

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user, checkSubscriptionStatus, location.pathname]);

  // Allow access in development mode
  if (isDevelopment) {
    return <>{children}</>;
  }

  if (!user) {
    return <Navigate to={`/login?next=${location.pathname}`} state={{ from: location }} replace />;
  }
  
  if (requiresSubscription && !hasActiveSubscription) {
    return <Navigate to="/pricing" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
