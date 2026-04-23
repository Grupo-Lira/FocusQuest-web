import { Search, Plus } from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { RecordsTable } from "./RecordsTable";
import { listPacientes } from "@/services/paciente.service";
import { useEffect, useState } from "react";

type Record = {
  id: number;
  nome: string;
  dataNascimento: string;
  escolaridade: string;
  metricaFinal: string;
};

const noop = () => {};

export function RecordsScreen() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPacientes = async () => {
    try {
      const response = await listPacientes();
      const mappedRecords: Record[] = response.data.map((paciente, index) => ({
        id: index + 1,
        nome: paciente.nome,
        dataNascimento: paciente.dataNascimento || "-",
        escolaridade: paciente.escolaridade || "-",
        metricaFinal: "-",
      }));
      setRecords(mappedRecords);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar pacientes");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  if (error) {
    return (
      <Card title="Fichas">
        <div className="flex items-center justify-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Fichas">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4 justify-between">
          <SearchBar />
          <Button
            text="Criar nova ficha"
            onClick={() => (window.location.href = "/fichas/criar")}
            className="px-6 py-2.5"
          />
        </div>
        <RecordsTable
          records={records}
          onRefresh={fetchPacientes}
          total={records.length}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          loading={loading}
        />
      </div>
    </Card>
  );
}

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
