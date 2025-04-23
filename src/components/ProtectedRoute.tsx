
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import React from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user tries to access /upload or similar protected features without a plan,
  // redirect to pricing
  if (location.pathname === "/upload") {
    // TODO: Add proper subscription check here once implemented
    // For now, always redirect to pricing if they try to access upload
    return <Navigate to="/pricing" replace />;
  }

  return children;
};

export default ProtectedRoute;
