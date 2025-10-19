import { Button } from "../Button";
import { Card } from "../Card";

interface FormModalProps {
  readonly onClose: () => void;
}

export default function FormModal({onClose}: FormModalProps) {
  return (
    <Card
      title={"Quais planetas apareceram durante o jogo?"}
      buttons={<Button text="Continuar" onClick={onClose} />}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center">
          <p className="text-xl text-[var(--primary)] font-orbitron w-[60%] text-center">
            Vote utilizando o painel com os botões dos planetas que você viu aparecer
            durante o jogo.
          </p>
        </div>
      </div>
    </Card>
  );
}
