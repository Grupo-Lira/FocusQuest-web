import Image from "next/image";
import { Button } from "./Button";
import { Card } from "./Card";
import { useState } from "react";
import ResultsTable from "./ResultsTable";
import { Metricas } from "./SuccessScreen";

export default function TimeOut({data}: {data: Metricas | null}) {
  const [resultsOpen, setResultsOpen] = useState(false);

  const results = [
    { id: 1, name: "⏱️ Tempo total", score: data?.tempo_reacao_medio_ms || "0" + " ms" },
    { id: 1, name: "⏱️ Tempo total", score: data?.tempo_reacao_medio_ms || "0" + " ms" },
    { id: 2, name: "🎯 Acertos", score: data?.total_acertos || 0 + " de 5 alvos" },
    { id: 3, name: "❌ Erros", score: data?.total_omissao || 0 + " distrações do tipo omissão" },
    { id: 3, name: "❌ Erros", score: data?.total_comissao || 0 + " distrações do tipo comissão" },
    { id: 4, name: "💡 Precisão", score: "66%" },
  ];

  return (
    <Card
      title={resultsOpen ? "Resultados" : "O Tempo Acabou!"}
      buttons={
        <>
          {resultsOpen ? (
            <div className="flex gap-4">
              <Button
                text="Próximo Nível"
                onClick={() => (globalThis.location.href = "/fase/2")}
              />
              <Button
                text="Menu Ínicial"
                onClick={() => (globalThis.location.href = "/menu")}
              />
            </div>
          ) : (
            <Button text="Ver Resultados" onClick={() => setResultsOpen(true)} />
          )}
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center">
          {resultsOpen ? (
            <ResultsTable results={results} />
          ) : (
            <Image
              src="/img/sad.png"
              height={296}
              width={200}
              alt="Personagem de tempo esgotado"
            />
          )}
        </div>
      </div>
    </Card>
  );
}
