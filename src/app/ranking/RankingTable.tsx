import { useGameContext } from "@/context/GameContext";

interface Result {
  _id: string;
  name: string;
  accuracy: number;
  time: number;
}

interface ResultsTableProps {
  results: Result[];
}

export default function RankingTable({ results }: ResultsTableProps) {
  const { loading } = useGameContext();

  function formatSecondsToTime(seconds: number): string {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  }
  
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
          { loading ? (
            <tr>
              <td colSpan={4} className="text-center py-4">
                <p className="text-lg font-semibold">Carregando...</p>
              </td>
            </tr>
          ) : (
            results.map((result, index) => (
              <tr key={result._id} className="border-b border-[#FFD3C7] hover:bg-[#f3f2f2]">
                <td className="text-[var(--text)] w-44 text-left pl-3 py-2.5">
                  {index === 0
                    ? "🥇 1°"
                    : index === 1
                    ? "🥈 2°"
                    : index === 2
                    ? "🥉 3°"
                    : `🏆 ${index + 1}`}
                </td>
                <td className="text-[var(--text)] w-[250px] text-left pl-3 py-2.5">
                  {result.name}
                </td>
                <td className="text-[var(--text)] w-44 text-left pl-3 py-2.5">
                  {result.accuracy}%
                </td>
                <td className="text-[var(--text)] w-44 text-left pl-3 py-2.5">
                  {formatSecondsToTime(result.time)}
                </td>
              </tr>
            ))
          )} 
        </tbody>
      </table>
    </div>
  );
}
