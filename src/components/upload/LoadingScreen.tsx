
import React from "react";
import PageContainer from "@/components/PageContainer";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading..." 
}) => {
  return (
    <PageContainer>
      <div className="flex justify-center items-center h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-neonBlue mx-auto"></div>
          <p className="text-muted-foreground">{message}</p>
        </div>
      </div>
    </PageContainer>
  );
};

export default LoadingScreen;
