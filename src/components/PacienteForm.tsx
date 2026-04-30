import { FormInput } from "@/components/FormInput";
import { RadioGroup } from "@/components/RadioGroup";
import { PenIcon, PlusIcon } from "lucide-react";

export type FormState = {
  nome: string;
  rg: string;
  dataAvaliacao: string;
  sexo: "M" | "F" | "";
  escolaridade: string;
  dataNascimento: string;
  motivoAvaliacao: string;
};

export const INITIAL_FORM_STATE: FormState = {
  nome: "",
  rg: "",
  dataAvaliacao: "",
  sexo: "",
  escolaridade: "",
  dataNascimento: "",
  motivoAvaliacao: "",
};

type Props = {
  form: FormState;
  setForm: (form: FormState | ((prev: FormState) => FormState)) => void;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
  loading: boolean;
  error: string | null;
  formId: string;
  submitButtonText: string;
  showDeleteButton?: boolean;
  onDelete?: () => void;
  isDeleting?: boolean;
};

export function PacienteForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  loading,
  error,
  formId,
  submitButtonText,
  showDeleteButton = false,
  onDelete,
  isDeleting = false,
}: Props) {
  const applyDateMask = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  };

  const applyRgMask = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    if (numbers.length <= 8)
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}-${numbers.slice(8, 9)}`;
  };

  const onChangeField = (field: keyof FormState) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      if (field === "dataAvaliacao" || field === "dataNascimento") {
        setForm((prev) => ({ ...prev, [field]: applyDateMask(value) }));
      } else if (field === "rg") {
        setForm((prev) => ({ ...prev, [field]: applyRgMask(value) }));
      } else {
        setForm((prev) => ({ ...prev, [field]: value }));
      }
    };
  };

  return (
    <form id={formId} onSubmit={onSubmit} className="flex flex-col gap-8 w-full">
      <div
        className={`flex ${showDeleteButton ? "justify-between" : "items-start"} gap-6`}
      >
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
        {showDeleteButton && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 h-fit text-white font-medium px-8 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Deletar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FormInput
          label="RG"
          type="text"
          placeholder=""
          name="rg"
          value={form.rg}
          onChange={onChangeField("rg")}
        />

        <div className="flex flex-col gap-1">
          <span className="text-[var(--primary)] font-orbitron uppercase font-semibold text-xs tracking-wide mb-1">
            Sexo
          </span>
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
          label="Data de Nascimento"
          type="text"
          placeholder=""
          name="dataNascimento"
          value={form.dataNascimento}
          onChange={onChangeField("dataNascimento")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
        <FormInput
          label="Escolaridade"
          type="text"
          placeholder=""
          name="escolaridade"
          value={form.escolaridade}
          onChange={onChangeField("escolaridade")}
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
    </form>
  );
}
