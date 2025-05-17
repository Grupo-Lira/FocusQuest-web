const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface IrisPosition {
  x: number;
  y: number;
  timestamp?: string;
}

/**
 * Monitora o rastreamento ocular em tempo real
 * @param callback Função chamada quando novos dados são recebidos
 * @param interval Intervalo de polling em ms (padrão: 1s)
 * @returns Função para parar o monitoramento
 */
export function startEyeTracking(
  callback: (position: IrisPosition | null) => void,
  interval: number = 1000
): () => void {
  let isActive = true;

  const fetchData = async () => {
    if (!isActive) return;

    try {
      const res = await fetch(`${API_URL}/eyetracking`, {
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Erro HTTP: ${res.status}`);
      }

      const data = await res.json();
      callback(data.iris_position || null);
    } catch (error) {
      console.error("Erro na requisição:", error);
      callback(null);
    }
  };

  const timerId = setInterval(fetchData, interval);

  // Retorna uma função de cleanup
  return () => {
    isActive = false;
    clearInterval(timerId);
  };
}
