
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
    // Send user to login with the intended destination as 'next' parameter
    return <Navigate to={`/login?next=${location.pathname}`} state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
