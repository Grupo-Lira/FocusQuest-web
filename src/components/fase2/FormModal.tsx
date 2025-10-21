import Image from "next/image";
import { Button } from "../Button";
import { Card } from "../Card";

interface FormModalProps {
  readonly onClose: () => void;
}

const planetas = [
  { id: 1, image: "/img/focos-fase-2/blue-green.png", name: "Cyanthia" },
  { id: 2, image: "/img/focos-fase-2/blue.png", name: "Azurion" },
  { id: 3, image: "/img/focos-fase-2/green.png", name: "Verdara" },
  { id: 4, image: "/img/focos-fase-2/gray.png", name: "Gravus" },
  { id: 5, image: "/img/focos-fase-2/orange.png", name: "Embera" },
  { id: 6, image: "/img/focos-fase-2/purple.png", name: "Violetor" },
  { id: 7, image: "/img/focos-fase-2/pink.png", name: "Rosalia" },
];

export default function FormModal({ onClose }: FormModalProps) {
  return (
    <Card
      title={"Quais planetas apareceram durante o jogo?"}
      buttons={<Button text="Continuar" onClick={onClose} />}
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-center">
          <p className="text-xl text-[#4a4a4a] font-orbitron text-center">
            Vote utilizando o painel com os botões dos planetas que você viu aparecer
            durante o jogo.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 justify-items-center px-24">
          {planetas.map((planeta, index) => (
            <div
              key={planeta.id}
              className={`flex flex-col items-center gap-2 border rounded-3xl w-fit px-10 py-3 border-gray-300 shadow ${
                index === planetas.length - 1 ? "col-span-3" : ""
              }`}
            >
              <Image src={planeta.image} alt={planeta.name} width={80} height={80} />
              <p className="text-md text-[#4a4a4a] font-orbitron">{planeta.name}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
