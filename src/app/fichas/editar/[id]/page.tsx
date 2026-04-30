"use client";

import { Button } from "@/components/Button";
import { Navbar } from "@/components/Navbar";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { PacienteForm, FormState, INITIAL_FORM_STATE } from "@/components/PacienteForm";
import { useState, useEffect } from "react";
import { getPaciente, updatePaciente, deletePaciente } from "@/services/paciente.service";
import { useParams, useRouter } from "next/navigation";
import { Loading } from "@/components/Loading";
import { useToast } from "@/context/ToastContext";

export default function EditarFichaPage() {
  const params = useParams();
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSuccess, showError } = useToast();

  const onCancel = () => {
    router.push("/fichas");
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      await updatePaciente(params.id as string, {
        nome: form.nome,
        rg: form.rg || undefined,
        dataNascimento: form.dataNascimento || undefined,
        dataAvaliacao: form.dataAvaliacao || undefined,
        sexo: form.sexo || undefined,
        escolaridade: form.escolaridade || undefined,
        motivoAvaliacao: form.motivoAvaliacao || undefined,
      });

      showSuccess("Paciente atualizado com sucesso!");
      setTimeout(() => {
        router.push("/fichas");
      }, 1000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao atualizar paciente";
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePaciente(params.id as string);
      setIsDeleteModalOpen(false);
      showSuccess("Paciente deletado com sucesso!");
      setTimeout(() => {
        router.push("/fichas");
      }, 1000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao deletar paciente";
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const fetchPaciente = async () => {
      try {
        const response = await getPaciente(params.id as string);
        const paciente = response.data;

        setForm({
          nome: paciente.nome,
          rg: paciente.rg || "",
          dataAvaliacao: "",
          sexo: paciente.sexo || "",
          escolaridade: paciente.escolaridade || "",
          dataNascimento: paciente.dataNascimento || "",
          motivoAvaliacao: paciente.motivoAvaliacao || "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar paciente");
      } finally {
        setLoadingInitial(false);
      }
    };

    if (params.id) {
      fetchPaciente();
    }
  }, [params.id]);

  if (loadingInitial) {
    return <Loading message="Carregando dados do paciente..." />;
  }

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
            formId="edit-paciente-form"
            submitButtonText="Salvar"
            showDeleteButton={true}
            onDelete={() => setIsDeleteModalOpen(true)}
            isDeleting={isDeleting}
          />

          <div className="flex gap-4 justify-end pt-8 w-full">
            <Button
              text="Cancelar"
              onClick={onCancel}
              className="px-6 py-2.5"
              variant="gray"
            />
            <Button
              text={isLoading ? "Salvando..." : "Salvar"}
              type="submit"
              form="edit-paciente-form"
              disabled={isLoading}
              isLoading={isLoading}
              className="px-8 py-2.5"
            />
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        patientName={form.nome}
        isLoading={isDeleting}
      />
    </div>
  );
}
