
import React from "react";

interface PlanStatus {
  text: string;
  color: string;
}

interface UploadHeaderProps {
  planStatus: PlanStatus;
}

const UploadHeader: React.FC<UploadHeaderProps> = ({ planStatus }) => {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-3xl font-satoshi font-bold mb-2">Upload Your Fit</h1>
      <p className="text-muted-foreground">Let's see what you're wearing today</p>
    </div>
  );
};

export default UploadHeader;
