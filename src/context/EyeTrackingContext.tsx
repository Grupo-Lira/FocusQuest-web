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

interface EyeTrackingContextType {
  isWebGazerLoaded: boolean;
  isTracking: boolean;
  isPaused: boolean;
  error: string | null;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  fullStopTracking: () => void;
  lastGazeData: GazeData | null;
}

interface EyeTrackingProviderProps {
  readonly children: React.ReactNode;
}

type dataType = { x: number | null; y: number | null };

const EyeTrackingContext = createContext<EyeTrackingContextType>(
  {} as EyeTrackingContextType
);

export function EyeTrackingProvider({ children }: EyeTrackingProviderProps) {
  const [isWebGazerLoaded, setIsWebGazerLoaded] = useState<boolean>(false);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGazeData, setLastGazeData] = useState<GazeData | null>(null);

  const updateGazeData = useCallback((data: dataType) => {
    if (data && data.x !== null && data.y !== null) {
      setLastGazeData({
        x: data.x,
        y: data.y,
        timestamp: Date.now(),
      });
    }
  }, []);

  useEffect(() => {
    if (globalThis.webgazer) {
      setIsWebGazerLoaded(true);
    }
  }, []);

  const startTracking = useCallback(async () => {
    if (!isWebGazerLoaded) {
      setError("WebGazer not loaded yet.");
      return;
    }

    if (!hasPermission) {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setHasPermission(true);
      } catch (e) {
        setHasPermission(false);
        setError("Permissão de câmera negada.");
        console.error(e);
        return;
      }
    }

    if (isPaused) {
      globalThis.webgazer.resume();
      setIsPaused(false);
    } else {
      globalThis.webgazer
        .setRegression("ridge")
        .setTracker("TFFacemesh")
        .saveDataAcrossSessions(true) //Em prod podemos deixar true para salvar a calibração no navegador para próximos usos
        .showVideo(false) // Ocultar vídeo
        .showFaceOverlay(false) // Ocultar overlay da face
        .showFaceFeedbackBox(false) // Ocultar caixa de feedback
        .applyKalmanFilter(true)
        .setGazeListener((data: any) => {
          updateGazeData(data);
        });

      await globalThis.webgazer.begin();
    }

    setIsTracking(true);
  }, [isWebGazerLoaded, isPaused, hasPermission, updateGazeData]);

  const stopTracking = useCallback(async () => {
    if (isTracking) {
      console.log("Parando o rastreamento ocular...");
      await globalThis.webgazer.pause();
      globalThis.webgazer.clearGazeListener();

      setIsTracking(false);
      setIsPaused(true);
      setLastGazeData(null);
    }
  }, [isTracking]);

  const fullStopTracking = useCallback(() => {
    if (globalThis.webgazer) {
      globalThis.webgazer.end();
      setIsTracking(false);
      setIsPaused(false);
      setLastGazeData(null);
    }
  }, []);

  const value: EyeTrackingContextType = {
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
