import Image from "next/image";
import { Button } from "../Button";
import { Card } from "../Card";

type SuccessScreenProps = {
  onRestart: () => void;
};

export default function SuccessScreen({ onRestart }: Readonly<SuccessScreenProps>) {
  return (
    <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center">
        <Card
        title={"Missão Cumprida!"}
        buttons={
            <div className="flex gap-4">
            <Button text="Reiniciar" onClick={onRestart} />
            <Button text="Finalizar" onClick={() => (globalThis.location.href = "/menu")} />
            </div>
        }
        >
        <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center">
            <Image
                src="/img/successCalibration.svg"
                height={400}
                width={275}
                alt="Personagem de missao cumprida"
            />
            </div>
        </div>
        </Card>
    </div>
  );
}
