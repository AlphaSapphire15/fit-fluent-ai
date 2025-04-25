
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import React, { useEffect, useState } from "react";
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      setIsCheckingAdmin(true);
      if (user) {
        try {
          const { data, error } = await supabase
            .rpc('is_admin');
          
          if (!error && data) {
            console.log("Admin status:", data);
            setIsAdmin(data);
          } else if (error) {
            console.error("Error checking admin status:", error);
          }
        } catch (err) {
          console.error("Exception checking admin status:", err);
        }
      }
      setIsCheckingAdmin(false);
    };

    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (user) {
      checkSubscriptionStatus();
    }
  }, [user, checkSubscriptionStatus]);

  // Show loading state while checking admin status
  if (user && isCheckingAdmin) {
    return <div className="flex justify-center items-center min-h-screen">Checking access...</div>;
  }

  // Allow access in development mode or if user is admin
  if (isDevelopment || isAdmin) {
    console.log("Access granted: Development mode or admin user");
    return <>{children}</>;
  }

  if (!user) {
    // Store the attempted path to redirect back after login
    return <Navigate to={`/login?next=${location.pathname}`} state={{ from: location }} replace />;
  }
  
  // Only check subscription if the route requires it
  if (requiresSubscription && !hasActiveSubscription) {
    console.log("Access denied: Subscription required");
    return <Navigate to="/pricing" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
