import { MoreVertical } from "lucide-react";
import { useState } from "react";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { Pagination } from "@/components/Pagination";
import { deletePaciente } from "@/services/paciente.service";
import { Paciente } from "@/types/paciente.types";

type Props = {
  readonly records: ReadonlyArray<Paciente.Record>;
  readonly onRefresh: () => void;
  readonly total: number;
  readonly currentPage: number;
  readonly onPageChange: (page: number) => void;
  readonly loading?: boolean;
};

const HEADERS = [
  { label: "ID" },
  { label: "Nome" },
  { label: "Data de nascimento" },
  { label: "Escolaridade" },
  { label: "Métrica final" },
  { label: "Ações" },
] as const;

const TableHeader = () => {
  const cells = HEADERS.map((header) => (
    <th
      key={header.label}
      className="font-orbitron font-semibold text-lg text-[var(--primary)] text-left pl-3 py-2 whitespace-nowrap"
    >
      {header.label}
    </th>
  ));

  return (
    <thead className="hover:bg-[#fff3e8]">
      <tr>{cells}</tr>
    </thead>
  );
};

const ActionsDropdown = ({
  recordId,
  onRefresh,
}: {
  recordId: Paciente.Record["id"];
  onRefresh: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePaciente(recordId);
      setIsDeleteModalOpen(false);
      setIsOpen(false);
      onRefresh();
    } catch (err) {
      console.error("Error deleting patient:", err);
      alert("Erro ao deletar paciente");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <MoreVertical width={20} />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[150px]">
          <button
            type="button"
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
            onClick={() => {
              setIsOpen(false);
              window.location.href = `/fichas/editar/${recordId}`;
            }}
          >
            Editar
          </button>
          <button
            type="button"
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
            onClick={() => {
              setIsDeleteModalOpen(true);
              setIsOpen(false);
            }}
          >
            Deletar
          </button>
          <button
            type="button"
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
            onClick={() => setIsOpen(false)}
          >
            Baixar em PDF
          </button>
        </div>
      )}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        patientName={recordId}
        isLoading={isDeleting}
      />
    </div>
  );
};

const RecordRow = ({
  record,
  onRefresh,
}: {
  record: Paciente.Record;
  onRefresh: () => void;
}) => {
  return (
    <tr className="border-b border-[#FFD3C7] hover:bg-[#f3f2f2]">
      <td className="text-[var(--text)] w-[100px] text-left pl-3">
        <button
          type="button"
          onClick={() => (window.location.href = `/fichas/editar/${record.id}`)}
          className="text-[var(--primary)] hover:underline cursor-pointer font-medium w-[70px] truncate"
        >
          {record.id}
        </button>
      </td>
      <td className="text-[var(--text)] w-[300px] text-left pl-3">{record.nome}</td>
      <td className="text-[var(--text)] w-[200px] text-left pl-3">
        {record.dataNascimento}
      </td>
      <td className="text-[var(--text)] w-[200px] text-left pl-3">
        {record.escolaridade || "-"}
      </td>
      <td className="text-[var(--text)] w-[150px] text-left pl-3">
        {record.metrica_final || "-"}
      </td>
      <td className="w-20 text-left pl-3">
        <ActionsDropdown recordId={record.id} onRefresh={onRefresh} />
      </td>
    </tr>
  );
};

export function RecordsTable({
  records,
  onRefresh,
  total,
  currentPage,
  onPageChange,
  loading,
}: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-[var(--text)]">Carregando...</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className="text-[var(--text)]">Nenhum registro encontrado</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <table className="w-full">
        <TableHeader />
        <tbody>
          {records.map((record) => (
            <RecordRow key={record.id} record={record} onRefresh={onRefresh} />
          ))}
        </tbody>
      </table>
      <Pagination total={total} currentPage={currentPage} onPageChange={onPageChange} />
    </div>
  );
}
