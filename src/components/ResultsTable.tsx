import Image from "next/image";
import { Metricas } from "./SuccessScreen";

type Result = {
  id: number;
  name: string;
  score: string;
};

type Planet = {
  id: number;
  image: string;
  name: string;
};

type PlanetGroupKey = "planetas_vistos" | "planetas_ignorados";

type Props = {
  results: Result[];
  data: Metricas | undefined;
  fase: number;
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

const GROUPS: ReadonlyArray<{ label: string; key: PlanetGroupKey }> = [
  { label: "Vistos", key: "planetas_vistos" },
  { label: "Ignorados", key: "planetas_ignorados" },
];

const TH_CLASS =
  "font-orbitron font-semibold text-xl text-[var(--primary)] w-[250px] text-left pl-3 py-2.5" as const;
const TD_CLASS = "text-[var(--text)] w-[250px] text-left pl-3 py-2.5" as const;

const findPlanet = (id: number) => {
  const planet = PLANETS.find((item) => item.id === id);
  return planet;
};

const PlanetCard = ({ planet }: { planet: Planet }) => {
  return (
    <div className="flex flex-col items-center gap-2.5 border border-[#EAEAEA] rounded-3xl w-fit py-2.5 px-8 shadow">
      <Image src={planet.image} alt={planet.name} width={68} height={67} />
      <p className="text-md text-[#4a4a4a] font-orbitron">{planet.name}</p>
    </div>
  );
};

const PlanetGroup = ({
  label,
  planetIds,
}: {
  label: string;
  planetIds: ReadonlyArray<{ id: number }>;
}) => {
  return (
    <div className="flex flex-col gap-3">
      <p className={TH_CLASS}>{label}</p>
      <div className="flex flex-wrap gap-3">
        {planetIds.map(({ id }) => {
          const planet = findPlanet(id);
          if (planet === undefined) return null;
          return <PlanetCard key={id} planet={planet} />;
        })}
      </div>
    </div>
  );
};

const ResultRow = ({ result }: { result: Result }) => {
  return (
    <tr className="border-b border-[#FFD3C7] hover:bg-[#f3f2f2]">
      <td className={TD_CLASS}>{result.name}</td>
      <td className={TD_CLASS}>{result.score}</td>
    </tr>
  );
};

export function ResultsTable({ results, data, fase }: Readonly<Props>) {
  return (
    <div className="flex flex-col items-center gap-8 pb-4">
      <table className="results-table w-full">
        <thead className="hover:bg-[#fff3e8]">
          <tr>
            <th className={TH_CLASS}>Métrica</th>
            <th className={TH_CLASS}>Valor</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <ResultRow key={result.id} result={result} />
          ))}
        </tbody>
      </table>
      {data === undefined || fase !== 3 ? null : (
        <div className="flex gap-10 flex-col">
          {GROUPS.map(({ label, key }) => (
            <PlanetGroup key={key} label={label} planetIds={data[key] ?? []} />
          ))}
        </div>
      )}
    </div>
  );
}
