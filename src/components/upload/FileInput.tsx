
import React, { useRef } from "react";

interface FileInputProps {
  onFileChange: (file: File) => void;
}

const FileInput: React.FC<FileInputProps> = ({ onFileChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileChange(file);
    }
  };

  return (
    <input
      type="file"
      ref={fileInputRef}
      onChange={handleFileInputChange}
      accept="image/*"
      className="hidden"
    />
  );
};

export default FileInput;
