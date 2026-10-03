"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

type GazePrediction = { x: number | null; y: number | null } | null;

type WebGazerApi = {
  resume: () => Promise<void> | void;
  removeMouseEventListeners: () => Promise<void> | void;
  clearData: () => Promise<void> | void;
  setRegression: (regression: string) => WebGazerApi;
  setTracker: (tracker: string) => WebGazerApi;
  saveDataAcrossSessions: (enabled: boolean) => WebGazerApi;
  showVideo: (visible: boolean) => WebGazerApi;
  showFaceOverlay: (visible: boolean) => WebGazerApi;
  showFaceFeedbackBox: (visible: boolean) => WebGazerApi;
  applyKalmanFilter: (enabled: boolean) => WebGazerApi;
  setGazeListener: (listener: (data: GazePrediction) => void) => WebGazerApi;
  showPredictionPoints: (visible: boolean) => Promise<void> | void;
  begin: () => Promise<void> | void;
  pause: () => Promise<void> | void;
  end: () => Promise<void> | void;
};

declare global {
  // Global properties require var in TypeScript ambient declarations.
  // eslint-disable-next-line no-var
  var webgazer: WebGazerApi | undefined;
}

export interface GazeData {
  x: number;
  y: number;
  timestamp: number;
}

interface EyeTrackingContextType {
  isWebGazerLoaded: boolean;
  isTracking: boolean;
  isPaused: boolean;
  error: string | null;
  startTracking: (trackWithMouse: boolean, isTutorial: boolean) => Promise<boolean>;
  stopTracking: () => void;
  fullStopTracking: () => void;
  lastGazeData: GazeData | null;
}

interface EyeTrackingProviderProps {
  readonly children: React.ReactNode;
}

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

  const updateGazeData = useCallback((data: GazePrediction) => {
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

  const startTracking = useCallback(
    async (trackWithMouse: boolean, isTutorial: boolean) => {
      console.log(`isPaused: ${isPaused}`);
      console.log(`isWebGazerLoaded: ${isWebGazerLoaded}`);
      setError(null);

      const webgazer = globalThis.webgazer;
      if (!isWebGazerLoaded || !webgazer) {
        setError("WebGazer not loaded yet.");
        return false;
      }

      if (!hasPermission) {
        try {
          await navigator.mediaDevices.getUserMedia({ video: true });
          setHasPermission(true);
        } catch (e) {
          setHasPermission(false);
          setError("Permissão de câmera negada.");
          console.error(e);
          return false;
        }
      }

      try {
        if (isPaused) {
          await webgazer.resume();
          if (!trackWithMouse) {
            await webgazer.removeMouseEventListeners();
          }
          if (isTutorial) await webgazer.clearData();
          setIsPaused(false);
        } else {
          console.log("Caiu no if do beggin");
          if (isTutorial) {
            await webgazer.clearData();
          }

          await webgazer
            .setRegression("weightedRidge")
            .setTracker("TFFacemesh")
            .saveDataAcrossSessions(true) //Em prod podemos deixar true para salvar a calibração no navegador para próximos usos
            .showVideo(false) // Ocultar vídeo
            .showFaceOverlay(false) // Ocultar overlay da face
            .showFaceFeedbackBox(false) // Ocultar caixa de feedback
            .applyKalmanFilter(true)
            .setGazeListener((data) => {
              updateGazeData(data);
            });

          await webgazer.showPredictionPoints(true);
          await webgazer.begin();

          if (!trackWithMouse) {
            await webgazer.removeMouseEventListeners();
          }
        }

        setIsTracking(true);
        return true;
      } catch (e) {
        setError("Não foi possível iniciar o rastreamento ocular.");
        console.error(e);
        return false;
      }
    },
    [isWebGazerLoaded, isPaused, hasPermission, updateGazeData]
  );

  const stopTracking = useCallback(async () => {
    if (isTracking && globalThis.webgazer) {
      console.log("Parando o rastreamento ocular...");
      await globalThis.webgazer.pause();

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
