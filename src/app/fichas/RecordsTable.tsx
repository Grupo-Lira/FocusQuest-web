import { MoreVertical } from "lucide-react";
import { useState } from "react";

type Record = {
  id: number;
  nome: string;
  rg: string;
  metricaFinal: string;
};

type Props = {
  readonly records: ReadonlyArray<Record>;
};

const HEADERS = [
  { label: "ID" },
  { label: "Nome" },
  { label: "RG" },
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

const ActionsDropdown = ({ recordId }: { recordId: number }) => {
  const [isOpen, setIsOpen] = useState(false);

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
            onClick={() => setIsOpen(false)}
          >
            Editar
          </button>
          <button
            type="button"
            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
            onClick={() => setIsOpen(false)}
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
    </div>
  );
};

const RecordRow = ({ record }: { record: Record }) => {
  return (
    <tr className="border-b border-[#FFD3C7] hover:bg-[#f3f2f2]">
      <td className="text-[var(--text)] w-[100px] text-left pl-3">{record.id}</td>
      <td className="text-[var(--text)] w-[300px] text-left pl-3">{record.nome}</td>
      <td className="text-[var(--text)] w-[300px] text-left pl-3">{record.rg}</td>
      <td className="text-[var(--text)] w-[300px] text-left pl-3">
        {record.metricaFinal}
      </td>
      <td className="w-20 text-left pl-3">
        <ActionsDropdown recordId={record.id} />
      </td>
    </tr>
  );
};

const Pagination = () => {
  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-[var(--text)]">35 registros encontrados</p>
      <div className="flex gap-2">
        <button
          type="button"
          className="px-3 py-1 rounded-full bg-[var(--primary)] text-white font-semibold"
        >
          1
        </button>
        <button
          type="button"
          className="px-3 py-1 rounded-full bg-[var(--white)] text-[var(--primary)] font-semibold hover:bg-gray-100"
        >
          2
        </button>
        <button
          type="button"
          className="px-3 py-1 rounded-full bg-[var(--white)] text-[var(--primary)] font-semibold hover:bg-gray-100"
        >
          3
        </button>
        <button
          type="button"
          className="px-3 py-1 rounded-full bg-[var(--white)] text-[var(--primary)] font-semibold hover:bg-gray-100"
        >
          4
        </button>
      </div>
    </div>
  );
};

export function RecordsTable({ records }: Props) {
  return (
    <div className="flex flex-col">
      <table className="w-full">
        <TableHeader />
        <tbody>
          {records.map((record) => (
            <RecordRow key={record.id} record={record} />
          ))}
        </tbody>
      </table>
      <Pagination />
    </div>
  );
}
