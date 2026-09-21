"use client";

import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { CalibrationCoach, CalibrationCoachState } from "@/components/Calibration/CalibrationCoach";
import { CalibrationTarget } from "@/components/Calibration/CalibrationTarget";
import { NavbarCalibration } from "@/components/Calibration/NavbarCalibration";
import { SuccessScreen } from "@/components/Calibration/SuccessScreen";
import { SettingsModal } from "@/components/SettingsModal";
import {
  calibrationTargets,
  CLICKS_PER_CALIBRATION_TARGET,
} from "@/constants/calibrationStar";
import { useEyeTracking } from "@/context/EyeTrackingContext";

type ClickData = {
  clickX: number;
  clickY: number;
  gazeX: number | null;
  gazeY: number | null;
  timestamp: number;
  element: string;
  distance?: number;
};

type CalibrationStage = "intro" | "preparing" | "active" | "error" | "transition";

const TARGET_TRANSITION_MS = 1800;

const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

const getClickPrecisionLabel = (distance: number) => {
  if (distance < 50) return "Boa";
  if (distance < 100) return "Média";
  return "Baixa";
};

const getOverallPrecisionLabel = (avgDistance: number) => {
  if (avgDistance < 50) return "Excelente";
  if (avgDistance < 100) return "Boa";
  return "Precisa melhorar";
};

const computeDistance = (
  clickX: number,
  clickY: number,
  gazeX: number | null,
  gazeY: number | null
) => {
  if (gazeX === null || gazeY === null) return undefined;
  return calculateDistance(clickX, clickY, gazeX, gazeY);
};

const logClickDetails = (clickData: ClickData) => {
  const { clickX, clickY, gazeX, gazeY, element, distance } = clickData;
  console.log("=== CLICK LOG ===");
  console.log("Elemento:", element);
  console.log("Coordenadas do clique:", { x: clickX, y: clickY });
  console.log("Coordenadas do WebGazer:", { x: gazeX, y: gazeY });

  if (distance === undefined) {
    console.log("WebGazer não forneceu dados de gaze");
  } else {
    console.log("Distância:", distance.toFixed(2), "pixels");
    console.log("Precisão:", getClickPrecisionLabel(distance));
  }
  console.log("=================");
};

const logCalibrationStats = (clickLog: ClickData[]) => {
  console.log("=== ESTATÍSTICAS FINAIS DA CALIBRAÇÃO ===");
  const validLogs = clickLog.filter((log) => log.distance !== undefined);

  if (validLogs.length === 0) {
    console.log("Nenhum clique teve dados de gaze disponíveis.");
    console.log("========================================");
    return;
  }

  const distances = validLogs.map((log) => log.distance as number);
  const avgDistance = distances.reduce((sum, value) => sum + value, 0) / distances.length;
  const minDistance = Math.min(...distances);
  const maxDistance = Math.max(...distances);

  console.log("Total de cliques registrados:", clickLog.length);
  console.log("Cliques com dados de gaze:", validLogs.length);
  console.log("Distância média:", avgDistance.toFixed(2), "pixels");
  console.log("Menor distância:", minDistance.toFixed(2), "pixels");
  console.log("Maior distância:", maxDistance.toFixed(2), "pixels");
  console.log("Precisão geral:", getOverallPrecisionLabel(avgDistance));
  console.log("========================================");
};

const getCoachState = (stage: CalibrationStage): CalibrationCoachState | null => {
  if (stage === "active") return null;
  return stage;
};

export default function CalibrationPage() {
  const [stage, setStage] = useState<CalibrationStage>("intro");
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const [clicksOnTarget, setClicksOnTarget] = useState(0);
  const [completedTargets, setCompletedTargets] = useState(0);
  const [shouldResumeAfterSettings, setShouldResumeAfterSettings] = useState(false);

  const targetClicksRef = useRef(0);
  const clickLogRef = useRef<ClickData[]>([]);
  const transitionTimeoutRef = useRef<number | null>(null);
  const isStartingTrackingRef = useRef(false);

  const {
    isWebGazerLoaded,
    isTracking,
    error,
    startTracking,
    stopTracking,
    lastGazeData,
  } = useEyeTracking();

  const currentTarget = calibrationTargets[currentTargetIndex];
  const coachState = getCoachState(stage);

  const clearTransitionTimeout = useCallback(() => {
    if (transitionTimeoutRef.current === null) return;
    window.clearTimeout(transitionTimeoutRef.current);
    transitionTimeoutRef.current = null;
  }, []);

  useEffect(() => {
    return clearTransitionTimeout;
  }, [clearTransitionTimeout]);

  const handleStartCalibration = async () => {
    if (isStartingTrackingRef.current) return;

    isStartingTrackingRef.current = true;
    setStage("preparing");
    try {
      const didStartTracking = await startTracking(true, true);
      setStage(didStartTracking ? "active" : "error");
    } finally {
      isStartingTrackingRef.current = false;
    }
  };

  const advanceTarget = useCallback(() => {
    const nextCompletedTargets = currentTargetIndex + 1;
    setCompletedTargets(nextCompletedTargets);

    if (nextCompletedTargets === calibrationTargets.length) {
      stopTracking();
      logCalibrationStats(clickLogRef.current);
      setSuccessModalVisible(true);
      transitionTimeoutRef.current = null;
      return;
    }

    targetClicksRef.current = 0;
    setClicksOnTarget(0);
    setCurrentTargetIndex((currentIndex) => currentIndex + 1);
    setStage("active");
    transitionTimeoutRef.current = null;
  }, [currentTargetIndex, stopTracking]);

  const handleTargetClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (stage !== "active" || currentTarget === undefined) return;

    const clickX = event.clientX;
    const clickY = event.clientY;
    const gazeX = lastGazeData?.x ?? null;
    const gazeY = lastGazeData?.y ?? null;
    const clickData: ClickData = {
      clickX,
      clickY,
      gazeX,
      gazeY,
      timestamp: Date.now(),
      element: `star-${currentTarget.id}`,
      distance: computeDistance(clickX, clickY, gazeX, gazeY),
    };

    clickLogRef.current = [...clickLogRef.current, clickData];
    logClickDetails(clickData);

    const nextClicksOnTarget = targetClicksRef.current + 1;
    targetClicksRef.current = nextClicksOnTarget;
    setClicksOnTarget(nextClicksOnTarget);

    if (nextClicksOnTarget !== CLICKS_PER_CALIBRATION_TARGET) return;

    setStage("transition");
    clearTransitionTimeout();
    transitionTimeoutRef.current = window.setTimeout(advanceTarget, TARGET_TRANSITION_MS);
  };

  const resetCalibrationProgress = () => {
    clearTransitionTimeout();
    targetClicksRef.current = 0;
    clickLogRef.current = [];
    setCurrentTargetIndex(0);
    setClicksOnTarget(0);
    setCompletedTargets(0);
    setSuccessModalVisible(false);
    setShouldResumeAfterSettings(false);
    setStage("intro");
  };

  const onOpenSettings = async () => {
    if (stage === "active" && isTracking) {
      await stopTracking();
      setShouldResumeAfterSettings(true);
    }
    setIsModalVisible(true);
  };

  const onCloseSettings = async () => {
    setIsModalVisible(false);

    if (shouldResumeAfterSettings === false) return;

    if (isStartingTrackingRef.current) return;

    isStartingTrackingRef.current = true;
    setStage("preparing");
    try {
      const didResumeTracking = await startTracking(true, false);
      setShouldResumeAfterSettings(false);
      setStage(didResumeTracking ? "active" : "error");
    } finally {
      isStartingTrackingRef.current = false;
    }
  };

  if (isModalVisible === true) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <SettingsModal isStoppedGame={true} onClick={onCloseSettings} />
      </div>
    );
  }

  return (
    <div className="calibration-space min-h-screen overflow-hidden text-white">
      <NavbarCalibration
        setIsModalOpen={onOpenSettings}
        currentTarget={currentTargetIndex}
        totalTargets={calibrationTargets.length}
        clicksOnTarget={clicksOnTarget}
        clicksRequired={CLICKS_PER_CALIBRATION_TARGET}
      />

      <main className="relative h-[calc(100vh-94px)] min-h-[520px] overflow-hidden">
        {currentTarget === undefined || stage === "intro" || stage === "preparing" || stage === "error" ? null : (
          <CalibrationTarget
            target={currentTarget}
            clicks={clicksOnTarget}
            clicksRequired={CLICKS_PER_CALIBRATION_TARGET}
            isTransitioning={stage === "transition"}
            onClick={handleTargetClick}
          />
        )}

        {coachState === null ? null : (
          <CalibrationCoach
            state={coachState}
            isWebGazerLoaded={isWebGazerLoaded}
            error={error}
            completedTargets={completedTargets}
            onStart={handleStartCalibration}
          />
        )}

        {successModalVisible === true ? <SuccessScreen onRestart={resetCalibrationProgress} /> : null}
      </main>
    </div>
  );
}
