
import React from "react";
import { Loader } from "lucide-react";

const LoadingOverlay = () => {
  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center text-white">
      <Loader className="w-8 h-8 animate-spin mb-4" />
      <p className="text-lg font-medium">Analyzing your fit...</p>
      <p className="text-sm text-white/80 mt-2">This will take a few seconds</p>
    </div>
  );
};

export default LoadingOverlay;
