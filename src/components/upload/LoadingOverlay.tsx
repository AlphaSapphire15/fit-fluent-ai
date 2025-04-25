
import React from "react";
import { Loader } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const LoadingOverlay = () => {
  const [progress, setProgress] = React.useState(0);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(10);
    }, 100);
    
    const timer2 = setTimeout(() => {
      setProgress(30);
    }, 500);
    
    const timer3 = setTimeout(() => {
      setProgress(60);
    }, 1500);
    
    const timer4 = setTimeout(() => {
      setProgress(80);
    }, 3000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);
  
  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center text-white p-6">
      <Loader className="w-8 h-8 animate-spin mb-4" />
      <p className="text-lg font-medium mb-2">Analyzing your fit...</p>
      <p className="text-sm text-white/80 mb-4">This will take a few seconds</p>
      <div className="w-full max-w-[200px]">
        <Progress value={progress} className="h-2 bg-gray-700" />
      </div>
    </div>
  );
};

export default LoadingOverlay;
