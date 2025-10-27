import Image from "next/image";
import { Button } from "./Button";
import { Card } from "./Card";
import { useState } from "react";
import ResultsTable from "./ResultsTable";

export interface Metricas {
  alvo_indice: number;
  motivo_servidor: string;
  resultado: string;
  concluiu_duracao_minima: boolean;
  tempo_reacao_ms: number;
  foco_maximo_ms: number;
  desvio_maximo_ms: number;
  tempo_total_focado_ms: number;
  duracao_total_alvo_ms: number;
}

interface SuccessScreenProps {
  readonly fase: number;
  readonly data: Metricas | null; // Adicione data como prop opcional
}

export default function SuccessScreen({ fase, data }: SuccessScreenProps) {
  const [resultsOpen, setResultsOpen] = useState(false);

  const results = [
    { id: 1, name: "⏱️ Tempo total", score: data?.tempo_total_focado_ms + " ms" },
    { id: 2, name: "🎯 Acertos", score: "4 de 5 alvos" },
    { id: 3, name: "❌ Erros", score: "2 distrações" },
    { id: 4, name: "💡 Precisão", score: "66%" },
  ];

  const resultsFase2 = [{ id: 1, name: "🎯 Planetas vistos", score: "7 de 9" }];

  const handleFaseResults = () => {
    if (fase === 2) {
      return results;
    } else if (fase === 3) {
      return resultsFase2;
    }
    return results;
  };

  return (
    <Card
      title={resultsOpen ? "Resultados" : "Missão Cumprida!"}
      buttons={
        <>
          {resultsOpen ? (
            <div className="flex gap-4">
              <Button
                text="Próximo Nível"
                onClick={() => (globalThis.location.href = `/fase/${fase}`)}
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
            <ResultsTable results={handleFaseResults()} />
          ) : (
            <Image
              src="/img/viva.png"
              height={400}
              width={275}
              alt="Personagem de missao cumprida"
            />
          )}
        </div>
      </div>
    </Card>
  );
}
