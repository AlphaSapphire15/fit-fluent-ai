
import { useState, useRef } from "react";

export const useUploadState = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const resetState = () => {
    setPreview(null);
    setCurrentFile(null);
    setIsSubmitting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
      setDialogMessage("Please upload a supported image format (JPG, PNG, GIF, or WebP).");
      setShowDialog(true);
      return;
    }

    setCurrentFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const openFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return {
    fileInputRef,
    preview,
    currentFile,
    isSubmitting,
    setIsSubmitting,
    showDialog,
    setShowDialog,
    dialogMessage,
    setDialogMessage,
    resetState,
    handleFile,
    openFileInput
  };
};
