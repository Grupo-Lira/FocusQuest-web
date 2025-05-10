import Image from "next/image";
import { Button } from "./Button";
import { Card } from "./Card";
import { useState } from "react";

export default function TimeOut() {
    const [ resultsOpen, setResultsOpen ] = useState(false);

  return (
    <Card
      title="O Tempo Acabou!"
      buttons={
        <>
            <Button text="Ver Resultados" onClick={() => setResultsOpen(true)} />
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center">
          <Image 
            src="/img/sad.png"
            height={296}
            width={200}
            alt="Personagem de tempo esgotado"
          />
        </div>
      </div>
    </Card>
  );
}
