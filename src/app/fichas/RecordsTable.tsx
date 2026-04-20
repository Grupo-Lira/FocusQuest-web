type Record = {
  id: number;
  rank: string;
  name: string;
  forecast: string;
  time: string;
};

type Props = {
  readonly records: ReadonlyArray<Record>;
};

const HEADERS = [
  { label: "ID", widthClass: "w-44" },
  { label: "Nome", widthClass: "w-[250px]" },
  { label: "RG", widthClass: "w-44" },
  { label: "Métrica final", widthClass: "w-44" },
  { label: "Ações", widthClass: "w-44" },
] as const;

const TableHeader = () => {
  const cells = HEADERS.map((header) => (
    <th
      key={header.label}
      className={`font-orbitron font-semibold text-xl text-[var(--primary)] ${header.widthClass} text-left pl-3 py-2.5`}
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

const RecordRow = ({ record }: { record: Record }) => {
  return (
    <tr className="border-b border-[#FFD3C7] hover:bg-[#f3f2f2]">
      <td className="text-[var(--text)] w-44 text-left pl-3 py-2.5">{record.id}</td>
      <td className="text-[var(--text)] w-[250px] text-left pl-3 py-2.5">
        {record.name}
      </td>
      <td className="text-[var(--text)] w-44 text-left pl-3 py-2.5">{record.forecast}</td>
      <td className="text-[var(--text)] w-44 text-left pl-3 py-2.5">{record.time}</td>
    </tr>
  );
};

export function RecordsTable({ records }: Props) {
  return (
    <div className="flex flex-col items-center gap-8 pb-4">
      <table className="results-table">
        <TableHeader />
        <tbody>
          {records.map((record) => (
            <RecordRow key={record.id} record={record} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
