interface Result {
  id: number;
  name: string;
  score: string;
}

interface ResultsTableProps {
  results: Result[];
}

export default function ResultsTable({ results }: ResultsTableProps) {
  return (
    <div className="flex flex-col items-center gap-8 pb-4">
      <table className="results-table">
        <thead className="hover:bg-[#fff3e8]">
          <tr>
            <th className="font-orbitron font-semibold text-xl text-[var(--primary)] w-[250px] text-left pl-3 py-2.5">
              Métrica
            </th>
            <th className="font-orbitron font-semibold text-xl text-[var(--primary)] w-[250px] text-left pl-3 py-2.5">
              Valor
            </th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.id} className="border-b border-[#FFD3C7] hover:bg-[#f3f2f2]">
              <td className="text-[var(--text)] w-[250px] text-left pl-3 py-2.5">
                {result.name}
              </td>
              <td className="text-[var(--text)] w-[250px] text-left pl-3 py-2.5">
                {result.score}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="max-w-[25.5rem]">
        <p className="text-xl text-[var(--primary)] text-center font-semibold">
          🙂 Boa! Mas há espaço para melhorias.
        </p>
        <p className="text-[var(--text)] text-center">
          Continue praticando para atingir a precisão de um verdadeiro explorador
          espacial!
        </p>
      </div>
    </div>
  );
}
