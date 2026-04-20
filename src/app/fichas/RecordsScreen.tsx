import { Search } from "lucide-react";
import Image from "next/image";
import { Card } from "@/components/Card";
import { RecordsTable } from "./RecordsTable";

const RANKING_RECORDS = [
  { id: 1, rank: "🥇 1º", name: "AstroLiderX", forecast: "99%", time: "00:10" },
  { id: 2, rank: "🥈 2º", name: "CometHunter", forecast: "97%", time: "00:15" },
  {
    id: 3,
    rank: "🥉 3º",
    name: "Patrulheiro Espacial",
    forecast: "95%",
    time: "00:17",
  },
  { id: 4, rank: "🏆 4º", name: "LunaNova", forecast: "92%", time: "00:25" },
  { id: 5, rank: "🏆 5º", name: "AmandaCode", forecast: "90%", time: "00:28" },
  { id: 6, rank: "🏆 6º", name: "HeyAstro", forecast: "89%", time: "00:34" },
] as const;

const noop = () => {};

const SearchBar = () => {
  return (
    <div className="flex items-center pl-4 h-12 rounded-full font-semibold bg-[var(--white)] text-[var(--text)] inner-shadow w-[50%] justify-between">
      <input type="text" placeholder="Pesquisar por jogador" />
      <button
        type="button"
        className="button-3d bg-[var(--primary)] flex p-2 px-3 rounded-full cursor-pointer transition-transform duration-300 hover:scale-105 "
        onClick={noop}
      >
        <Search color="white" strokeWidth={3} width={20} />
      </button>
    </div>
  );
};

const LastUpdated = () => {
  return (
    <div className="flex items-center gap-2">
      <Image src="/img/icon/reload.svg" alt="Refresh" width={20} height={20} />
      <p className="text-sm text-[var(--text)]">
        Atualizado há: <span className="text-[var(--primary)] font-semibold">10s</span>
      </p>
    </div>
  );
};

export function RecordsScreen() {
  return (
    <Card title="Ranking Global">
      <div className="flex flex-col gap-4 max-h-[400px]">
        <SearchBar />
        <RecordsTable records={RANKING_RECORDS} />
        <LastUpdated />
      </div>
    </Card>
  );
}
