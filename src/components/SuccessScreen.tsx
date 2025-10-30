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
  planetas_vistos?: { id: number }[];
  planetas_ignorados?: { id: number }[];
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

  const resultsFase2 = [{ id: 1, name: "🎯 Planetas vistos", score: `${data?.acertos ?? 0} de 6 planetas`}];
  

  const handleFaseResults = () => {
    if (fase === 2) {
      return results;
    } else if (fase === 3) {
      return resultsFase2;
    } else if (fase === 4) {
      return results;
    }
    return results;
  };

  const handleOnClick = () => {
    if (fase === 4) {
      globalThis.location.href = "/menu";
    } else {
      globalThis.location.href = `/fase/${fase}`;
    }
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
                text={fase === 4 ? "Continuar" : "Próximo Nível"}
                onClick={handleOnClick}
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
            <ResultsTable results={handleFaseResults()} data={data}/>
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
