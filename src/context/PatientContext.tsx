"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface PatientContextType {
  selectedPacienteId: string;
  setSelectedPacienteId: (id: string) => void;
  clearSelectedPaciente: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [selectedPacienteId, setSelectedPacienteId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("selectedPacienteId");
      return saved || "";
    }
    return "";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (selectedPacienteId) {
        localStorage.setItem("selectedPacienteId", selectedPacienteId);
      } else {
        localStorage.removeItem("selectedPacienteId");
      }
    }
  }, [selectedPacienteId]);

  const clearSelectedPaciente = () => {
    setSelectedPacienteId("");
  };

  return (
    <PatientContext.Provider
      value={{
        selectedPacienteId,
        setSelectedPacienteId,
        clearSelectedPaciente,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error("usePatient must be used within a PatientProvider");
  }
  return context;
}
