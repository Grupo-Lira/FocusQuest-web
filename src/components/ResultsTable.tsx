import Image from "next/image";
import { Metricas } from "./SuccessScreen";

interface Result {
  id: number;
  name: string;
  score: string;
}

interface ResultsTableProps {
  results: Result[];
  data: Metricas | undefined;
}

const planetas = [
  { id: 1, image: "/img/focos-fase-2/gray.png", name: "Gravus" },
  { id: 2, image: "/img/focos-fase-2/blue-green.png", name: "Cyanthia" },
  { id: 3, image: "/img/focos-fase-2/blue.png", name: "Azurion" },
  { id: 4, image: "/img/focos-fase-2/orange.png", name: "Embera" },
  { id: 5, image: "/img/focos-fase-2/pink.png", name: "Rosalia" },
  { id: 6, image: "/img/focos-fase-2/green.png", name: "Verdara" },
  { id: 7, image: "/img/focos-fase-2/purple.png", name: "Violetor" },
];

export function ResultsTable({ results, data }: Readonly<ResultsTableProps>) {
  const grupos = [
    { label: "Vistos", key: "planetas_vistos" as const },
    { label: "Ignorados", key: "planetas_ignorados" as const },
  ];

  return (
    <div className="flex flex-col items-center gap-8 pb-4">
      <table className="results-table w-full">
        <thead className="hover:bg-[#fff3e8]">
          <tr>
            <th className="font-orbitron font-semibold text-xl text-[var(--primary)] w-[250px] text-left pl-3 py-2.5">
              Métrica
            </th>
            <th className="font-orbitron font-semibold text-xl text-[var(--primary)] w-[250px] text-left pl-3 py-2.5">
              Valor
            </th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.id} className="border-b border-[#FFD3C7] hover:bg-[#f3f2f2]">
              <td className="text-[var(--text)] w-[250px] text-left pl-3 py-2.5">
                {result.name}
              </td>
              <td className="text-[var(--text)] w-[250px] text-left pl-3 py-2.5">
                {result.score}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data && (
        <div className="flex gap-10 flex-col">
          {grupos.map(({ label, key }) => {
            const lista = data?.[key] ?? [];

            return (
              <div key={key} className="flex flex-col gap-3">
                <p className="font-orbitron font-semibold text-xl text-[var(--primary)] w-[250px] text-left pl-3 py-2.5">
                  {label}
                </p>

                <div className="flex flex-wrap gap-3">
                  {lista.map(({ id }) => {
                    const planeta = planetas.find((p) => p.id === id);
                    if (!planeta) return null;

                    return (
                      <div
                        key={id}
                        className="flex flex-col items-center gap-2.5 border border-[#EAEAEA] rounded-3xl w-fit py-2.5 px-8 shadow"
                      >
                        <Image
                          src={planeta.image}
                          alt={planeta.name}
                          width={68}
                          height={67}
                        />
                        <p className="text-md text-[#4a4a4a] font-orbitron">
                          {planeta.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
