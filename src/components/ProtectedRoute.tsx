
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import React, { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresSubscription?: boolean; // New prop to determine if the route requires a subscription
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresSubscription = true // By default, routes require subscription
}) => {
  const { user, hasActiveSubscription, checkSubscriptionStatus } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Refresh subscription status when navigating to protected routes
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user, checkSubscriptionStatus, location.pathname]);

  if (!user) {
    // User is not logged in, redirect to login
    return <Navigate to={`/login?next=${location.pathname}`} state={{ from: location }} replace />;
  }
  
  // If route requires subscription and user doesn't have an active one, redirect to pricing
  if (requiresSubscription && !hasActiveSubscription) {
    return <Navigate to="/pricing" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
