
import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageContainerProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  backTo?: string;
  className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  showBackButton = false,
  backTo = "/",
  className = "",
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background px-4 pb-12 pt-6 md:px-6">
      <div className="mx-auto max-w-md">
        {showBackButton && (
          <button
            onClick={() => navigate(backTo)}
            className="mb-6 flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back
          </button>
        )}
        <div className={className}>{children}</div>
      </div>
    </div>
  );
};

export default PageContainer;
