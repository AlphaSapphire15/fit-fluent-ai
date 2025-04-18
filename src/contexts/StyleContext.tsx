
import React, { createContext, useState, useContext } from "react";

type ToneType = "chill" | "snarky" | "clean" | "poetic";

interface StyleContextType {
  image: File | null;
  setImage: (image: File | null) => void;
  tone: ToneType;
  setTone: (tone: ToneType) => void;
  results: {
    score: number;
    styleCore: string;
    highlights: string[];
    suggestion: string;
  } | null;
  setResults: (results: {
    score: number;
    styleCore: string;
    highlights: string[];
    suggestion: string;
  } | null) => void;
  resetAll: () => void;
}

const StyleContext = createContext<StyleContextType | undefined>(undefined);

export const StyleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [image, setImage] = useState<File | null>(null);
  const [tone, setTone] = useState<ToneType>("clean");
  const [results, setResults] = useState<{
    score: number;
    styleCore: string;
    highlights: string[];
    suggestion: string;
  } | null>(null);

  const resetAll = () => {
    setImage(null);
    setTone("clean");
    setResults(null);
  };

  return (
    <StyleContext.Provider
      value={{
        image,
        setImage,
        tone,
        setTone,
        results,
        setResults,
        resetAll,
      }}
    >
      {children}
    </StyleContext.Provider>
  );
};

export const useStyle = (): StyleContextType => {
  const context = useContext(StyleContext);
  if (context === undefined) {
    throw new Error("useStyle must be used within a StyleProvider");
  }
  return context;
};
