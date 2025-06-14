
import React from "react";
import DragAndDrop from "./DragAndDrop";
import FeedbackToneSelector from "./FeedbackToneSelector";

interface UploadInterfaceProps {
  preview: string | null;
  isAnalyzing: boolean;
  tone: string;
  setTone: (value: string) => void;
  onFileChange: (file: File) => void;
  openFileInput: () => void;
  onAnalyze: () => void;
  isSubmitting: boolean;
}

const UploadInterface: React.FC<UploadInterfaceProps> = ({
  preview,
  isAnalyzing,
  tone,
  setTone,
  onFileChange,
  openFileInput,
  onAnalyze,
  isSubmitting
}) => {
  return (
    <>
      <DragAndDrop
        preview={preview}
        isAnalyzing={isAnalyzing || isSubmitting}
        onFileChange={onFileChange}
        openFileInput={openFileInput}
        onAnalyze={onAnalyze}
      />
      <div className="my-8">
        <FeedbackToneSelector tone={tone} setTone={setTone} />
      </div>
    </>
  );
};

export default UploadInterface;
