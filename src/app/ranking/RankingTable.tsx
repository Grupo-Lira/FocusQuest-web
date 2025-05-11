interface Result {
  id: number;
  rank: string;
  name: string;
  forecast: string;
  time: string;
}

interface ResultsTableProps {
  results: Result[];
}

export default function RankingTable({ results }: ResultsTableProps) {
  return (
    <div className="flex flex-col items-center gap-8 pb-4">
      <table className="results-table">
        <thead className="hover:bg-[#fff3e8]">
          <tr>
            <th className="font-orbitron font-semibold text-xl text-[var(--primary)] w-44 text-left pl-3 py-2.5">
              Rank
            </th>
            <th className="font-orbitron font-semibold text-xl text-[var(--primary)] w-[250px] text-left pl-3 py-2.5">
              Jogador
            </th>
            <th className="font-orbitron font-semibold text-xl text-[var(--primary)] w-44 text-left pl-3 py-2.5">
              Precisão
            </th>
            <th className="font-orbitron font-semibold text-xl text-[var(--primary)] w-44 text-left pl-3 py-2.5">
              Tempo
            </th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.id} className="border-b border-[#FFD3C7] hover:bg-[#f3f2f2]">
              <td className="text-[var(--text)] w-44 text-left pl-3 py-2.5">
                {result.rank}
              </td>
              <td className="text-[var(--text)] w-[250px] text-left pl-3 py-2.5">
                {result.name}
              </td>
              <td className="text-[var(--text)] w-44 text-left pl-3 py-2.5">
                {result.forecast}
              </td>
              <td className="text-[var(--text)] w-44 text-left pl-3 py-2.5">
                {result.time}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
