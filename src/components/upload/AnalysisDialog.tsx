
import React from "react";
import { 
  Dialog,
  DialogContent, 
  DialogTitle, 
  DialogDescription,
  DialogHeader,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AnalysisDialogProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

const AnalysisDialog: React.FC<AnalysisDialogProps> = ({ 
  isOpen, 
  message, 
  onClose 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Analysis Status</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {message || "Error analyzing your image. Please try again."}
        </DialogDescription>
        <DialogFooter>
          <Button onClick={onClose}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AnalysisDialog;
