
import { useEffect } from 'react';
import { useUserPlan } from '@/hooks/useUserPlan';

export const useAutoRefresh = (userId: string | undefined) => {
  const { refreshPlanStatus } = useUserPlan();

  useEffect(() => {
    if (!userId) return;
    
    // Immediate refresh on mount
    refreshPlanStatus();
    
    const interval = setInterval(() => {
      console.log("Auto-refreshing plan status");
      refreshPlanStatus();
    }, 15000); // Every 15 seconds instead of 30

    return () => clearInterval(interval);
  }, [userId, refreshPlanStatus]);
};
