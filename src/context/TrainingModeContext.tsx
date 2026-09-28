"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "focusquest.trainingMode";

type TrainingModeContextValue = {
  isTrainingMode: boolean;
  setIsTrainingMode: (value: boolean) => void;
};

const TrainingModeContext = createContext<TrainingModeContextValue | undefined>(undefined);

export function TrainingModeProvider({ children }: { children: React.ReactNode }) {
  const [isTrainingMode, setIsTrainingMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(STORAGE_KEY) === "true";
  });

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, String(isTrainingMode));
  }, [isTrainingMode]);

  const value = useMemo(() => ({ isTrainingMode, setIsTrainingMode }), [isTrainingMode]);

  return <TrainingModeContext.Provider value={value}>{children}</TrainingModeContext.Provider>;
}

export function useTrainingMode() {
  const context = useContext(TrainingModeContext);
  if (!context) throw new Error("useTrainingMode must be used within a TrainingModeProvider");
  return context;
}
