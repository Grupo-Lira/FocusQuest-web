const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const DEFAULT_POLL_INTERVAL_MS = 1000;

export type IrisPosition = {
  x: number;
  y: number;
  timestamp?: string;
};

type EyeTrackingResponse = {
  iris_position?: IrisPosition | null;
};

const fetchIrisPosition = async (): Promise<IrisPosition | null> => {
  const response = await fetch(`${API_URL}/eyetracking`, {
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.ok === false) {
    console.error("Erro na requisição: HTTP", response.status);
    return null;
  }

  const data = (await response.json()) as EyeTrackingResponse;
  if (data.iris_position === null || data.iris_position === undefined) return null;
  return data.iris_position;
};

/**
 * Monitors eye tracking in real time.
 * @param callback Called whenever new data is received.
 * @param interval Polling interval in ms (default: 1s).
 * @returns A function to stop the monitoring.
 */
export function startEyeTracking(
  callback: (position: IrisPosition | null) => void,
  interval: number = DEFAULT_POLL_INTERVAL_MS
): () => void {
  const state = { isActive: true };

  const fetchData = async () => {
    if (state.isActive === false) return;
    const position = await fetchIrisPosition();
    callback(position);
  };

  const timerId = setInterval(fetchData, interval);

  return () => {
    state.isActive = false;
    clearInterval(timerId);
  };
}
