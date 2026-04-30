"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "./Button";
import { Card } from "./Card";
import { listPacientes } from "@/services/paciente.service";
import { Paciente } from "@/types/paciente.types";

type Props = {
  readonly isOpen: boolean;
  readonly onSelect: (pacienteId: string) => void;
  readonly onCancel: () => void;
};

export function PatientSelectModal({ isOpen, onSelect, onCancel }: Props) {
  const [pacientes, setPacientes] = useState<Paciente.Profile[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPacientes();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsSelectOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPacientes = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await listPacientes();
      setPacientes(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar pacientes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedId) {
      onSelect(selectedId);
    }
  };

  if (!isOpen) return null;

  const selectedPaciente = pacientes.find((p) => p.id === selectedId);
  const displayValue = selectedPaciente
    ? selectedPaciente.nome
    : "Selecione...";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <Card title="Selecionar Paciente">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 pt-4">
          {isLoading ? (
            <p className="text-[var(--text)]">Carregando pacientes...</p>
          ) : error ? (
            <p className="text-red-500 text-sm">{error}</p>
          ) : pacientes.length === 0 ? (
            <p className="text-[var(--text)]">Nenhum paciente encontrado</p>
          ) : (
            <div className="relative flex flex-col gap-1" ref={selectRef}>
              <button
                type="button"
                onClick={() => setIsSelectOpen(!isSelectOpen)}
                className="w-full py-1 border-b border-gray-300 bg-transparent text-left outline-none focus:border-[#FF6A00] transition-colors flex justify-between items-center"
              >
                <span className={`text-[16px] ${!selectedId ? 'text-gray-400' : 'text-[var(--text)]'}`}>
                  {displayValue}
                </span>
                
                <svg 
                  className={`w-4 h-4 text-[#FF6A00] transition-transform duration-200 ${isSelectOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isSelectOpen && (
                <div className="absolute top-[100%] left-0 w-full mt-2 bg-white border border-gray-100 rounded-lg shadow-xl max-h-52 overflow-y-auto z-10 custom-scrollbar">
                  <div
                    onClick={() => {
                      setSelectedId("");
                      setIsSelectOpen(false);
                    }}
                    className="px-4 py-3 hover:bg-orange-50 cursor-pointer text-gray-400 text-sm transition-colors"
                  >
                    Selecione...
                  </div>
                  
                  {pacientes.map((paciente) => (
                    <div
                      key={paciente.id}
                      onClick={() => {
                        setSelectedId(paciente.id);
                        setIsSelectOpen(false);
                      }}
                      className={`px-4 py-3 cursor-pointer text-sm flex items-center justify-between transition-colors ${
                        selectedId === paciente.id 
                          ? 'bg-orange-50 text-[#FF6A00] font-medium border-l-2 border-[#FF6A00]' 
                          : 'text-[var(--text)] hover:bg-gray-50'
                      }`}
                    >
                      <span>{paciente.nome}</span>
                      {paciente.rg && (
                        <span className="text-xs text-gray-400 ml-2">RG: {paciente.rg}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          )}
          
          <div className="flex gap-4 justify-center mt-4">
            <Button text="Cancelar" onClick={onCancel} className="px-6 py-2.5 bg-gray-200 text-gray-700" />
            <Button
              text="Iniciar"
              type="submit"
              className="px-6 py-2.5"
              disabled={!selectedId || isLoading}
            />
          </div>
        </form>
      </Card>
    </div>
  );
}