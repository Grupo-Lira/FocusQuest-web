"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

declare global {
  interface Window {
    webgazer: any;
  }
}

interface GazeData {
  x: number;
  y: number;
  timestamp: number;
}

const EyeTrackingContext = createContext({});

export function EyeTrackingProvider({ children }: { children: React.ReactNode }) {
  const [isWebGazerLoaded, setIsWebGazerLoaded] = useState<boolean>(false);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGazeData, setLastGazeData] = useState<GazeData | null>(null);

  const updateGazeData = useCallback((data: any) => {
    if (data && data.x !== null && data.y !== null) {
      setLastGazeData({
        x: data.x,
        y: data.y,
        timestamp: Date.now(),
      });
    }
  }, []);

  useEffect(() => {
    if (window.webgazer) {
      setIsWebGazerLoaded(true);
      window.webgazer.params.showVideoPreview = false;
      window.webgazer.params.showPredictionPoints = true;
    }
  }, []);

  const startTracking = async () => {
    if (!isWebGazerLoaded) {
      setError("WebGazer not loaded yet.");
      return;
    } else {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(() => setHasPermission(true))
        .catch(() => {
          setHasPermission(false);
          setError("Permissão negada.");
        });
    }

    try {
      if (isPaused) {
        window.webgazer.resume();
        setIsPaused(false);
      } else {
        await window.webgazer
          .setRegression("ridge")
          .setTracker("TFFacemesh")
          .saveDataAcrossSessions(false) //Em prod podemos deixar true para salvar a calibração no navegador para próximos usos
          .setGazeListener((data: any, elapsedTime: number) => {
            updateGazeData(data); // Atualiza as coordenadas do gaze
            if (data) {
              console.log(`X: ${data.x}, Y: ${data.y}`);
            }
          })
          .begin();

        window.webgazer
          .showVideo(true)
          .showPredictionPoints(true)
          .showFaceFeedbackBox(true)
          .applyKalmanFilter(true);
      }

      setIsTracking(true);
    } catch (err: unknown) {
      console.error("Erro ao iniciar/retomar rastreamento:", err);
      setError((err as Error).message);
    }
  };

  const stopTracking = () => {
    if (window.webgazer && isTracking) {
      window.webgazer.pause();
      setIsTracking(false);
      setIsPaused(true);
    }
  };

  const fullStopTracking = () => {
    if (window.webgazer) {
      window.webgazer.end();
      setIsTracking(false);
      setIsPaused(false);
    }
  };

  const value = {
    isWebGazerLoaded,
    isTracking,
    isPaused,
    error,
    startTracking,
    stopTracking,
    fullStopTracking,
    lastGazeData,
  };

  return (
    <EyeTrackingContext.Provider value={value}>{children}</EyeTrackingContext.Provider>
  );
}

export const useEyeTracking = () => {
  const context = useContext(EyeTrackingContext);
  return context;
};
