import Image from "next/image";
import { Button } from "./Button";
import { Card } from "./Card";
import { useEffect, useState } from "react";
import ResultsTable from "./ResultsTable";

export interface Metricas {
  tempo_reacao_medio_ms: number;
  total_acertos: number;
  acertos: number;
  total_comissao: number;
  total_omissao: number;
}



interface SuccessScreenProps {
  readonly fase: number;
  readonly data?: Metricas;
}

export default function SuccessScreen({ fase, data }: SuccessScreenProps) {
  const [resultsOpen, setResultsOpen] = useState(false);

  const results = [
    {
      id: 3,
      name: "🎯 Acertos",
      score: `${data?.total_acertos ?? 0} de 5 alvos`,
    },
    {
      id: 4,
      name: "❌ Demorou para focar",
      score: `${data?.total_comissao ?? 0} vezes`,
    },
    {
      id: 5,
      name: "❌ Distrações",
      score: `${data?.total_omissao ?? 0} distrações`,
    },
  ];

  const resultsFase2 = [{ id: 1, name: "🎯 Planetas vistos", score: `${data?.acertos} de 6 planetas`}];
  
  const resultsFase3 = [
    { id: 6, name: "💡 Precisão", score: "66%" },
    {
      id: 4,
      name: "❌ Demorou para focar",
      score: `${data?.total_comissao ?? 0} vezes`,
    },
    {
      id: 5,
      name: "❌ Distrações",
      score: `${data?.total_omissao ?? 0} distrações`,
    },
  ];

  const handleFaseResults = () => {
    if (fase === 2) {
      return results;
    } else if (fase === 3) {
      return resultsFase2;
    } else if (fase === 4) {
      return resultsFase3;
    }
    return results;
  };
  
  useEffect(() => {
    console.debug("Métricas recebidas no SuccessScreen:", data);
  }, [data]);

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
