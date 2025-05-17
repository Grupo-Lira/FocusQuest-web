import Image from "next/image";
import { Button } from "./Button";
import { Card } from "./Card";
import { useState } from "react";
import ResultsTable from "./ResultsTable";

export default function SuccessScreen() {
  const [resultsOpen, setResultsOpen] = useState(false);

  return (
    <Card
      title={resultsOpen ? "Resultados" : "Missão Cumprida!"}
      buttons={
        <>
          {resultsOpen ? (
            <div className="flex gap-4">
              <Button
                text="Próximo Nível"
                onClick={() => (window.location.href = "/fase/2")}
              />
              <Button
                text="Menu Ínicial"
                onClick={() => (window.location.href = "/menu")}
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
            <ResultsTable />
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
