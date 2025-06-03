import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserPlan } from "@/hooks/useUserPlan";
import React from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresCredits?: boolean; // Some routes like upload require credits/subscription
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresCredits = false 
}) => {
  const { user } = useAuth();
  const { hasAccess, loading } = useUserPlan();
  const location = useLocation();

  // If user is not authenticated, send to login
  if (!user) {
    return <Navigate to={`/login?next=${location.pathname}`} state={{ from: location }} replace />;
  }

  // Show loading while checking plan status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neonBlue"></div>
      </div>
    );
  }

  // If route requires credits and user doesn't have access, redirect to pricing
  if (requiresCredits && !hasAccess()) {
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
