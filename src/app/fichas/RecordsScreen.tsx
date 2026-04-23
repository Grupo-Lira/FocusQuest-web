import { Search, Plus } from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { RecordsTable } from "./RecordsTable";

const PATIENT_RECORDS = [
  { id: 1, nome: "João Silva", rg: "123456789", metricaFinal: "85%" },
  { id: 2, nome: "Maria Santos", rg: "987654321", metricaFinal: "92%" },
  { id: 3, nome: "Pedro Oliveira", rg: "456789123", metricaFinal: "78%" },
  { id: 4, nome: "Ana Costa", rg: "321654987", metricaFinal: "88%" },
  { id: 5, nome: "Carlos Lima", rg: "789123456", metricaFinal: "91%" },
] as const;

const noop = () => {};

const SearchBar = () => {
  return (
    <div className="flex items-center pl-4 h-10 rounded-full font-semibold bg-[var(--white)] text-[var(--text)] inner-shadow w-[400px]">
      <input
        type="text"
        placeholder="Pesquisar por jogador"
        className="flex-grow bg-transparent outline-none text-sm"
      />
      <button
        type="button"
        className="button-3d bg-[var(--primary)] flex p-1.5 px-3 rounded-full cursor-pointer transition-transform duration-300 hover:scale-105 mr-1"
        onClick={noop}
      >
        <Search color="white" strokeWidth={3} width={18} />
      </button>
    </div>
  );
};

export function RecordsScreen() {
  return (
    <Card title="Fichas">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4 justify-between">
          <SearchBar />
          <Button text="Criar nova ficha" onClick={noop} className="px-6 py-2.5" />
        </div>
        <RecordsTable records={PATIENT_RECORDS} />
      </div>
    </Card>
  );
}
