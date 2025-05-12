import Image from "next/image";
import { Button } from "./Button";
import { Card } from "./Card";
import { useState } from "react";
import ResultsTable from "./ResultsTable";

export default function TimeOut() {
  const [resultsOpen, setResultsOpen] = useState(false);

  const results = [
    { id: 1, name: "⏱️ Tempo total", score: "00:32" },
    { id: 2, name: "🎯 Acertos", score: "4 de 5 alvos" },
    { id: 3, name: "❌ Erros", score: "2 distrações" },
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
