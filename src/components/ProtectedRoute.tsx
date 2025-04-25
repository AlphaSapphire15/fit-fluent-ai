
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import React, { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const isDevelopment = import.meta.env.DEV;
  const [isAdmin, setIsAdmin] = React.useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const { data, error } = await supabase
          .rpc('is_admin');
        
        if (!error && data) {
          setIsAdmin(data);
        }
      }
    };

    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user, checkSubscriptionStatus]);

  // Allow access in development mode or if user is admin
  if (isDevelopment || isAdmin) {
    return <>{children}</>;
  }

  if (!user) {
    // Store the attempted path to redirect back after login
    return <Navigate to={`/login?next=${location.pathname}`} state={{ from: location }} replace />;
  }
  
  // Only check subscription if the route requires it
  if (requiresSubscription && !hasActiveSubscription) {
    return <Navigate to="/pricing" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
