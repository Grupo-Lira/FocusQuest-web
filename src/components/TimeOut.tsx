import Image from "next/image";
import { useState } from "react";
import { Button } from "./Button";
import { Card } from "./Card";
import { ResultsTable } from "./ResultsTable";
import { Metricas } from "./SuccessScreen";

type Props = {
  readonly data?: Metricas;
};

const buildResults = (data: Metricas | undefined) => {
  const totalAcertos = data?.total_acertos ?? 0;
  const totalComissao = data?.total_comissao ?? 0;
  const totalOmissao = data?.total_omissao ?? 0;
  return [
    { id: 3, name: "🎯 Acertos", score: `${totalAcertos} de 5 alvos` },
    { id: 4, name: "❌ Demorou para focar", score: `${totalComissao} vezes` },
    { id: 5, name: "❌ Distrações", score: `${totalOmissao} distrações` },
  ];
};

const getTitle = (resultsOpen: boolean) => {
  if (resultsOpen === true) return "Resultados";
  return "O Tempo Acabou!";
};

const redirectToNextPhase = () => {
  globalThis.location.href = "/fase/2";
};

const redirectToMenu = () => {
  globalThis.location.href = "/menu";
};

export function TimeOut({ data }: Props) {
  const [resultsOpen, setResultsOpen] = useState(false);

  const onOpenResults = () => setResultsOpen(true);
  const results = buildResults(data);
  const title = getTitle(resultsOpen);

  const buttons =
    resultsOpen === true ? (
      <div className="flex gap-4">
        <Button text="Próximo Nível" onClick={redirectToNextPhase} />
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
            <ResultsTable results={results} data={data} fase={1} />
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
