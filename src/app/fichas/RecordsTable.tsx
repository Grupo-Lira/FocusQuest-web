interface Record {
  id: number;
  rank: string;
  name: string;
  forecast: string;
  time: string;
}

interface Props {
  readonly records: ReadonlyArray<Record>;
}

export function RecordsTable({ records }: Props) {
  return (
    <div className="flex flex-col items-center gap-8 pb-4">
      <table className="results-table">
        <thead className="hover:bg-[#fff3e8]">
          <tr>
            <th className="font-orbitron font-semibold text-xl text-[var(--primary)] w-44 text-left pl-3 py-2.5">
              ID
            </th>
            <th className="font-orbitron font-semibold text-xl text-[var(--primary)] w-[250px] text-left pl-3 py-2.5">
              Nome
            </th>
            <th className="font-orbitron font-semibold text-xl text-[var(--primary)] w-44 text-left pl-3 py-2.5">
              RG
            </th>
            <th className="font-orbitron font-semibold text-xl text-[var(--primary)] w-44 text-left pl-3 py-2.5">
              Métrica final
            </th>
            <th className="font-orbitron font-semibold text-xl text-[var(--primary)] w-44 text-left pl-3 py-2.5">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="border-b border-[#FFD3C7] hover:bg-[#f3f2f2]">
              <td className="text-[var(--text)] w-44 text-left pl-3 py-2.5">
                {record.id}
              </td>
              <td className="text-[var(--text)] w-[250px] text-left pl-3 py-2.5">
                {record.name}
              </td>
              <td className="text-[var(--text)] w-44 text-left pl-3 py-2.5">
                {record.forecast}
              </td>
              <td className="text-[var(--text)] w-44 text-left pl-3 py-2.5">
                {record.time}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
