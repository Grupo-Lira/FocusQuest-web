import { Card } from "@/components/Card";
import RankingTable from "./RankingTable";
import { Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
import { useGameContext } from "@/context/GameContext";

export default function RankingScreen() {
  const { ranking, setRanking,setLoading } = useGameContext();
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  
  const fetchRanking = async () => {
    setLoading(true);
    setIsRefreshing(true);
    try{
      const response = await axios.get("http://localhost:4000/");
      console.log(response.data.rankings);
      setRanking(response.data.rankings);
      setLastUpdated(new Date());
    }catch (error) {
      console.error("Erro ao buscar ranking:", error);
    } finally{
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRanking();
  }, []);

  useEffect(() => {
    if (!lastUpdated) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <Card title={"Ranking Global"}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center">
          <p className="text-xl font-medium">Veja quem está dominando a galáxia!</p>
        </div>

        <div className="flex items-center pl-4 h-12 rounded-full font-semibold bg-[var(--white)] text-[var(--text)] inner-shadow w-[50%] justify-between">
          <input type="text" placeholder="Pesquisar por jogador" />
          <button
            className="button-3d bg-[var(--primary)] flex p-3 rounded-full cursor-pointer transition-transform duration-300 hover:scale-105 "
            onClick={() => {}}
          >
            <Search color="white" strokeWidth={3} />
          </button>
        </div>
        <RankingTable results={ranking} />
        <div className="flex items-center gap-2">
          <Image
            src="/img/icon/reload.svg"
            alt="Refresh"
            width={20}
            height={20}
            className={`cursor-pointer transition-transform ${
              isRefreshing ? "animate-spin" : "hover:rotate-45"
            }`}
            onClick={fetchRanking}
          />
          <p className="text-sm text-[var(--text)]">
            Atualizado há:{" "}
            <span className="text-[var(--primary)] font-semibold">{elapsed}s</span>
          </p>
        </div>
      </div>
    </Card>
  );
}
