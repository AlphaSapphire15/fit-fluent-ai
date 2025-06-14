
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
  const location = useLocation();

  // If user is not authenticated, send to login
  if (!user) {
    return <Navigate to={`/login?next=${location.pathname}`} state={{ from: location }} replace />;
  }

  // For now, just check authentication - let the individual pages handle credit checks
  // This prevents the infinite redirect loop
  return <>{children}</>;
};

export default ProtectedRoute;
