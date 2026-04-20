import Image from "next/image";
import { PlanetaResposta } from "@/app/fase/2/GameScreen";
import { Button } from "../Button";
import { Card } from "../Card";

type Planet = {
  id: number;
  image: string;
  name: string;
};

type Props = {
  readonly onClose: () => void;
  readonly planetasSelecionados: PlanetaResposta[];
};

const PLANETS: ReadonlyArray<Planet> = [
  { id: 1, image: "/img/focos-fase-2/gray.png", name: "Gravus" },
  { id: 2, image: "/img/focos-fase-2/blue-green.png", name: "Cyanthia" },
  { id: 3, image: "/img/focos-fase-2/blue.png", name: "Azurion" },
  { id: 4, image: "/img/focos-fase-2/orange.png", name: "Embera" },
  { id: 5, image: "/img/focos-fase-2/pink.png", name: "Rosalia" },
  { id: 6, image: "/img/focos-fase-2/green.png", name: "Verdara" },
  { id: 7, image: "/img/focos-fase-2/purple.png", name: "Violetor" },
] as const;

const MIN_ANSWERS_REQUIRED = 3;

const getBorderColorClass = (selection: PlanetaResposta | undefined) => {
  if (selection === undefined) return "border-gray-300";
  if (selection.correto === true) return "border-green-500 border-3";
  return "border-red-500 border-3";
};

const getSpanClass = (index: number) => {
  if (index === PLANETS.length - 1) return "col-span-3";
  return "";
};

const PlanetCard = ({
  planet,
  selection,
  index,
}: {
  planet: Planet;
  selection: PlanetaResposta | undefined;
  index: number;
}) => {
  const borderColorClass = getBorderColorClass(selection);
  const spanClass = getSpanClass(index);
  const cardClass = `flex flex-col items-center gap-2 border rounded-3xl w-fit px-10 py-3 ${borderColorClass} shadow ${spanClass}`;

  return (
    <div className={cardClass}>
      <Image src={planet.image} alt={planet.name} width={80} height={80} />
      <p className="text-md text-[#4a4a4a] font-orbitron">{planet.name}</p>
    </div>
  );
};

export function FormModal({ onClose, planetasSelecionados }: Props) {
  const isDisabled = planetasSelecionados.length < MIN_ANSWERS_REQUIRED;
  const buttons = <Button text="Continuar" onClick={onClose} disabled={isDisabled} />;

  return (
    <Card title="Quais planetas apareceram durante o jogo?" buttons={buttons}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-center">
          <p className="text-xl text-[#4a4a4a] font-orbitron text-center">
            Vote utilizando o painel com os botões dos planetas que você viu aparecer
            durante o jogo.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 justify-items-center px-24">
          {PLANETS.map((planet, index) => {
            const selection = planetasSelecionados?.find(
              (answer) => answer.planeta === planet.id
            );
            return (
              <PlanetCard
                key={planet.id}
                planet={planet}
                selection={selection}
                index={index}
              />
            );
          })}
        </div>
      </div>
    </Card>
  );
}
