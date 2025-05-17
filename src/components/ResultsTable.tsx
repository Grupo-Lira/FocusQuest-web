import { feedbackMessages } from "@/constants/feedbackMessages";
import { useGameContext } from "@/context/GameContext";

export default function ResultsTable() {
  const { hits, timeLeft, errors } = useGameContext();

  const accuracy = ((hits / (hits + errors)) * 100).toFixed(2);
  const time = 60 - timeLeft;
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;

  const getFeedbackMessage = (ac: number) => {
    return (
      feedbackMessages.find((msg) => ac >= msg.min && ac <= msg.max) ??
      feedbackMessages[2] 
    );
  };

  const feedback = getFeedbackMessage(Number(accuracy));

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
          <tr className="border-b border-[#FFD3C7] hover:bg-[#f3f2f2]">
            <td className="text-[var(--text)] w-[250px] text-left pl-3 py-2.5">
              ⏱️ Tempo total
            </td>
            <td className="text-[var(--text)] w-[250px] text-left pl-3 py-2.5">
              {formattedTime}
            </td>
          </tr>
          <tr className="border-b border-[#FFD3C7] hover:bg-[#f3f2f2]">
            <td className="text-[var(--text)] w-[250px] text-left pl-3 py-2.5">
              🎯 Acertos
            </td>
            <td className="text-[var(--text)] w-[250px] text-left pl-3 py-2.5">
              {hits} de 15 alvos
            </td>
          </tr>
          <tr className="border-b border-[#FFD3C7] hover:bg-[#f3f2f2]">
            <td className="text-[var(--text)] w-[250px] text-left pl-3 py-2.5">
              ❌ Erros
            </td>
            <td className="text-[var(--text)] w-[250px] text-left pl-3 py-2.5">
              {errors} distrações
            </td>
          </tr>
          <tr className="border-b border-[#FFD3C7] hover:bg-[#f3f2f2]">
            <td className="text-[var(--text)] w-[250px] text-left pl-3 py-2.5">
              💡 Precisão
            </td>
            <td className="text-[var(--text)] w-[250px] text-left pl-3 py-2.5">
              {isNaN(Number(accuracy)) ? "0" : accuracy}%
            </td>
          </tr>
        </tbody>
      </table>
      <div className="max-w-[25.5rem]">
        <p className="text-xl text-[var(--primary)] text-center font-semibold">
          {feedback.title}
        </p>
        <p className="text-[var(--text)] text-center">{feedback.description}</p>
      </div>
    </div>
  );
}
