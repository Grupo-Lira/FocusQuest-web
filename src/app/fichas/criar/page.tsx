"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Navbar } from "@/components/Navbar";
import { PacienteForm, FormState, INITIAL_FORM_STATE } from "@/components/PacienteForm";
import { useState } from "react";
import { createPaciente } from "@/services/paciente.service";
import { useToast } from "@/context/ToastContext";

export default function CriarFichaPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  const onCancel = () => {
    window.location.href = "/fichas";
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      await createPaciente({
        nome: form.nome,
        rg: form.rg,
        dataNascimento: form.dataNascimento || undefined,
        dataAvaliacao: form.dataAvaliacao || undefined,
        sexo: form.sexo || undefined,
        escolaridade: form.escolaridade || undefined,
        motivoAvaliacao: form.motivoAvaliacao || undefined,
      });

      showSuccess("Paciente criado com sucesso!");
      setTimeout(() => {
        window.location.href = "/fichas";
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao criar paciente";
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden">
      <div className="w-full flex justify-center pt-6 pb-4 shrink-0 z-20">
        <Navbar />
      </div>

      <div className="flex-1 overflow-y-auto w-full flex justify-center px-4 sm:px-8 pt-4 pb-12">
        <div className="bg-white px-12 py-10 rounded-[2rem] shadow-sm flex flex-col w-full max-w-4xl h-fit">
          <PacienteForm
            form={form}
            setForm={setForm}
            onSubmit={onSubmit}
            onCancel={onCancel}
            isLoading={isLoading}
            error={error}
            formId="paciente-form"
            submitButtonText="Adicionar"
          />

          <div className="flex gap-4 justify-end pt-8 w-full">
            <Button
              text="Cancelar"
              onClick={onCancel}
              className="px-6 py-2.5"
              variant="gray"
            />
            <Button
              text={isLoading ? "Adicionando..." : "Adicionar"}
              type="submit"
              form="paciente-form"
              disabled={isLoading}
              isLoading={isLoading}
              className="px-8 py-2.5"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
