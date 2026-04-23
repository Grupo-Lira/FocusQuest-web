"use client";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { FormInput } from "@/components/FormInput";
import { RadioGroup } from "@/components/RadioGroup";
import { Navbar } from "@/components/Navbar";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { useState, useEffect } from "react";
import { PenIcon, PlusIcon } from "lucide-react";
import { getPaciente, updatePaciente, deletePaciente } from "@/services/paciente.service";
import { useParams, useRouter } from "next/navigation";

type FormState = {
  nome: string;
  dataAvaliacao: string;
  sexo: "M" | "F" | "";
  escolaridade: string;
  dataNascimento: string;
  motivoAvaliacao: string;
};

const INITIAL_FORM_STATE: FormState = {
  nome: "",
  dataAvaliacao: "",
  sexo: "",
  escolaridade: "",
  dataNascimento: "",
  motivoAvaliacao: "",
};

export default function EditarFichaPage() {
  const params = useParams();
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const applyDateMask = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  };

  const onChangeField = (field: keyof FormState) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      if (field === "dataAvaliacao" || field === "dataNascimento") {
        setForm((prev) => ({ ...prev, [field]: applyDateMask(value) }));
      } else {
        setForm((prev) => ({ ...prev, [field]: value }));
      }
    };
  };

  const onCancel = () => {
    router.push("/fichas");
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await updatePaciente(params.id as string, {
        nome: form.nome,
        data_nascimento: form.dataNascimento || undefined,
        sexo: form.sexo || undefined,
        escolaridade: form.escolaridade || undefined,
        observacoes: form.motivoAvaliacao || undefined,
      });

      router.push("/fichas");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar paciente");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePaciente(params.id as string);
      setIsDeleteModalOpen(false);
      router.push("/fichas");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao deletar paciente");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const fetchPaciente = async () => {
      try {
        const response = await getPaciente(params.id as string);
        const paciente = response.data;

        const formatDate = (dateString?: string) => {
          if (!dateString) return "";
          try {
            const date = new Date(dateString);
            return date.toLocaleDateString("pt-BR");
          } catch {
            return "";
          }
        };

        setForm({
          nome: paciente.nome,
          dataAvaliacao: "",
          sexo: paciente.sexo || "",
          escolaridade: paciente.escolaridade || "",
          dataNascimento: formatDate(paciente.dataNascimento),
          motivoAvaliacao: paciente.observacoes || "",
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
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-[var(--text)]">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen overflow-hidden">
      <div className="flex justify-center mt-6 top-0 mb-6 fixed">
        <Navbar />
      </div>
      <div className="flex flex-col items-center justify-center h-screen overflow-hidden  w-[100%]">
        <div className="mt-20 h-full w-full flex flex-col items-center justify-center pb-8">
          <div className="bg-white px-12 py-10 rounded-[2rem] shadow-sm flex flex-col w-full max-w-4xl max-h-[calc(100vh-120px)] overflow-y-auto">
            <form
              id="paciente-form"
              onSubmit={onSubmit}
              className="flex flex-col gap-8 w-full"
            >
              <div className="flex justify-between">
                <div className="flex items-start gap-6">
                  <button
                    type="button"
                    className="w-[100px] h-[100px] flex-shrink-0 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
                  >
                    <PlusIcon size={24} />
                  </button>

                  <div className="flex flex-col gap-3 mt-2 w-full">
                    <div className="flex items-center gap-3 border-b border-transparent focus-within:border-gray-200 pb-1 w-max">
                      <input
                        type="text"
                        name="nome"
                        value={form.nome}
                        onChange={onChangeField("nome")}
                        placeholder="Editar nome"
                        className="text-2xl font-orbitron text-[var(--primary)] font-semibold bg-transparent outline-none placeholder:text-[var(--primary)] w-auto"
                      />
                      <PenIcon color="var(--primary)" />
                    </div>

                    <div className="flex items-center gap-2 text-[var(--text)]">
                      <span className="text-lg">Data da Avaliação:</span>
                      <div className="flex items-center gap-2 border-b border-transparent focus-within:border-gray-200 pb-1">
                        <input
                          type="text"
                          name="dataAvaliacao"
                          value={form.dataAvaliacao}
                          onChange={onChangeField("dataAvaliacao")}
                          placeholder="DD/MM/AAAA"
                          className="font-bold text-lg bg-transparent outline-none w-[130px] text-[var(--text)] uppercase"
                        />
                        <PenIcon color="var(--primary)" />
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 h-fit text-white font-medium px-8 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Deletar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col gap-1">
                  <label className="text-[var(--primary)] font-orbitron uppercase font-semibold text-xs tracking-wide mb-1">
                    Sexo
                  </label>
                  <div className="flex gap-4">
                    <RadioGroup
                      label="M"
                      name="sexo"
                      value="M"
                      checked={form.sexo === "M"}
                      onChange={onChangeField("sexo")}
                    />
                    <RadioGroup
                      label="F"
                      name="sexo"
                      value="F"
                      checked={form.sexo === "F"}
                      onChange={onChangeField("sexo")}
                    />
                  </div>
                </div>

                <FormInput
                  label="Escolaridade"
                  type="text"
                  placeholder=""
                  name="escolaridade"
                  value={form.escolaridade}
                  onChange={onChangeField("escolaridade")}
                />

                <FormInput
                  label="Data de Nascimento"
                  type="text"
                  placeholder=""
                  name="dataNascimento"
                  value={form.dataNascimento}
                  onChange={onChangeField("dataNascimento")}
                />
              </div>

              <div className="w-full">
                <FormInput
                  label="Motivo da Avaliação"
                  type="text"
                  placeholder=""
                  name="motivoAvaliacao"
                  value={form.motivoAvaliacao}
                  onChange={onChangeField("motivoAvaliacao")}
                />
              </div>

              <div className="flex flex-col items-center justify-center gap-2 mt-4 p-6 border-[1.5px] border-[var(--primary)] rounded-3xl">
                <p className="text-xl font-orbitron text-[var(--primary)] font-semibold uppercase tracking-wider">
                  Métricas
                </p>
                <p className="text-sm font-medium text-red-600 text-center">
                  Finalize o atendimento para que as métricas sejam preenchidas
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex gap-4 justify-end pt-8 w-full">
                <button
                  type="button"
                  onClick={onCancel}
                  className="text-gray-600 font-medium px-6 py-2.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="paciente-form"
                  disabled={loading}
                  className="bg-[var(--primary)] text-white font-medium px-8 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
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
