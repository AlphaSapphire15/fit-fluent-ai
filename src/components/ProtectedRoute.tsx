import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import React from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, session } = useAuth();
  const location = useLocation();

  // We need to check both user and session potentially, depending on auth flow timing.
  // If session is definitely loaded and user is null, they are not logged in.
  // A simple check for `user` might suffice if the AuthProvider ensures user state is settled before rendering routes.
  // Let's assume for now checking `user` is sufficient after initial loading.
  // A more robust check might involve a loading state from useAuth.

  if (!user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute; 