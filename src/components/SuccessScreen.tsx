import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "./Button";
import { Card } from "./Card";
import { ResultsTable } from "./ResultsTable";

export type Metricas = {
  tempo_reacao_medio_ms: number;
  total_acertos: number;
  acertos: number;
  total_comissao: number;
  total_omissao: number;
  planetas_vistos?: { id: number }[];
  planetas_ignorados?: { id: number }[];
};

type Props = {
  readonly fase: number;
  readonly data?: Metricas;
};

const FINAL_PHASE = 4;

const buildFase1Results = (data: Metricas | undefined) => {
  const totalAcertos = data?.total_acertos ?? 0;
  const totalComissao = data?.total_comissao ?? 0;
  const totalOmissao = data?.total_omissao ?? 0;
  return [
    { id: 3, name: "🎯 Acertos", score: `${totalAcertos} de 5 alvos` },
    { id: 4, name: "❌ Demorou para focar", score: `${totalComissao} vezes` },
    { id: 5, name: "❌ Distrações", score: `${totalOmissao} distrações` },
  ];
};

const buildFase2Results = (data: Metricas | undefined) => {
  const acertos = data?.acertos ?? 0;
  return [{ id: 1, name: "🎯 Planetas vistos", score: `${acertos} de 6 planetas` }];
};

const getResultsForPhase = (fase: number, data: Metricas | undefined) => {
  if (fase === 3) return buildFase2Results(data);
  return buildFase1Results(data);
};

const getNextHref = (fase: number) => {
  if (fase === FINAL_PHASE) return "/menu";
  return `/fase/${fase}`;
};

const getNextButtonLabel = (fase: number) => {
  if (fase === FINAL_PHASE) return "Continuar";
  return "Próximo Nível";
};

const getCardTitle = (resultsOpen: boolean) => {
  if (resultsOpen === true) return "Resultados";
  return "Missão Cumprida!";
};

const redirectToMenu = () => {
  globalThis.location.href = "/menu";
};

export function SuccessScreen({ fase, data }: Props) {
  const [resultsOpen, setResultsOpen] = useState(false);

  useEffect(() => {
    console.debug("Métricas recebidas no SuccessScreen:", data);
  }, [data]);

  const onNextPhase = () => {
    globalThis.location.href = getNextHref(fase);
  };

  const onOpenResults = () => setResultsOpen(true);

  const title = getCardTitle(resultsOpen);
  const results = getResultsForPhase(fase, data);

  const buttons =
    resultsOpen === true ? (
      <div className="flex gap-4">
        <Button text={getNextButtonLabel(fase)} onClick={onNextPhase} />
        <Button text="Menu Ínicial" onClick={redirectToMenu} />
      </div>
    ) : (
      <Button text="Ver Resultados" onClick={onOpenResults} />
    );

  return (
    <Card title={title} buttons={buttons}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center">
          {resultsOpen === true ? (
            <ResultsTable results={results} data={data} fase={fase} />
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
