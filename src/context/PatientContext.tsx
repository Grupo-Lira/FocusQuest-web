"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface PatientContextType {
  selectedPacienteId: string;
  setSelectedPacienteId: (id: string) => void;
  clearSelectedPaciente: () => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [selectedPacienteId, setSelectedPacienteId] = useState<string>("");

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
