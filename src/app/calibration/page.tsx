"use client";

import { useCallback, useEffect, useState } from "react";
import { NavbarCalibration } from "@/components/Calibration/NavbarCalibration";
import { OverlayInstruction } from "@/components/Calibration/OverlayInstruction";
import { StarCalibration } from "@/components/Calibration/StarCalibration";
import { SuccessScreen } from "@/components/Calibration/SuccessScreen";
import { SettingsModal } from "@/components/SettingsModal";
import { stars } from "@/constants/calibrationStar";
import { steps } from "@/constants/steps";
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

const MAX_HITS_PER_STAR = 5;
const MAX_TOTAL_HITS = stars.length * MAX_HITS_PER_STAR;
const START_DELAY_MS = 100;

const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  return distance;
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
    const precision = getClickPrecisionLabel(distance);
    console.log("Distância:", distance.toFixed(2), "pixels");
    console.log("Precisão:", precision);
  }
  console.log("=================");
  console.table([clickData]);
};

const logCalibrationStats = (clickLog: ClickData[]) => {
  console.log("=== ESTATÍSTICAS FINAIS DA CALIBRAÇÃO ===");
  const validLogs = clickLog.filter((log) => log.distance !== undefined);

  if (validLogs.length === 0) {
    console.log("========================================");
    return;
  }

  const distances = validLogs.map((log) => log.distance as number);
  const avgDistance = distances.reduce((sum, value) => sum + value, 0) / distances.length;
  const minDistance = Math.min(...distances);
  const maxDistance = Math.max(...distances);
  const precision = getOverallPrecisionLabel(avgDistance);

  console.log("Total de cliques registrados:", clickLog.length);
  console.log("Cliques com dados de gaze:", validLogs.length);
  console.log("Distância média:", avgDistance.toFixed(2), "pixels");
  console.log("Menor distância:", minDistance.toFixed(2), "pixels");
  console.log("Maior distância:", maxDistance.toFixed(2), "pixels");
  console.log("Precisão geral:", precision);
  console.log("========================================");
};

const incrementStarHit = (starId: string) => {
  const starIndex = stars.findIndex((star) => star.id === starId);
  if (starIndex === -1) return;
  stars[starIndex].totalHits += 1;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function CalibrationPage() {
  const [showInstructions, setShowInstructions] = useState(true);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [hits, setHits] = useState(0);
  const [clickLog, setClickLog] = useState<ClickData[]>([]);
  const { isWebGazerLoaded, startTracking, stopTracking, lastGazeData } =
    useEyeTracking();

  const logClick = useCallback(
    (event: React.MouseEvent, element: string) => {
      const clickX = event.clientX;
      const clickY = event.clientY;
      const gazeX = lastGazeData === null ? null : lastGazeData.x;
      const gazeY = lastGazeData === null ? null : lastGazeData.y;
      const distance = computeDistance(clickX, clickY, gazeX, gazeY);

      const clickData: ClickData = {
        clickX,
        clickY,
        gazeX,
        gazeY,
        timestamp: Date.now(),
        element,
        distance,
      };

      setClickLog((prev) => [...prev, clickData]);
      logClickDetails(clickData);
    },
    [lastGazeData]
  );

  const handleStarClick = (event: React.MouseEvent, starId: string) => {
    logClick(event, `star-${starId}`);
    setHits((prev) => prev + 1);
    incrementStarHit(starId);
  };

  const handleStartCalibration = async () => {
    setShowInstructions(false);
    await wait(START_DELAY_MS);

    if (isWebGazerLoaded === false) {
      console.warn("WebGazer não está carregado ainda");
      return;
    }

    console.log("Iniciando rastreamento ocular...");
    await startTracking(true, true);
  };

  const handleRestart = () => {
    setSuccessModalVisible(false);
    setShowInstructions(true);
    setHits(0);
    setClickLog([]);
  };

  const onCloseSettings = () => setIsModalVisible(false);
  const onOpenSettings = () => setIsModalVisible(true);

  useEffect(() => {
    if (hits < MAX_TOTAL_HITS) return;
    if (successModalVisible === true) return;

    console.log("Calibração concluída com", hits, "hits");
    stopTracking();
    setSuccessModalVisible(true);
    logCalibrationStats(clickLog);
  }, [hits, successModalVisible, clickLog, stopTracking]);

  const activeStars = stars.filter((star) => star.totalHits < MAX_HITS_PER_STAR);

  if (isModalVisible === true) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <SettingsModal isStoppedGame={true} onClick={onCloseSettings} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-white">
      <div className="min-h-screen flex flex-col text-white">
        {showInstructions === true ? (
          <OverlayInstruction onComplete={handleStartCalibration} steps={steps} />
        ) : null}

        <NavbarCalibration setIsModalOpen={onOpenSettings} />

        <div className="flex-1 relative overflow-hidden">
          {activeStars.map((star) => (
            <StarCalibration
              key={star.id}
              top={star.top}
              left={star.left}
              onHit={() => {}}
              onError={() => console.error("Erro com estrela", star.id)}
              onClick={(event: React.MouseEvent) => handleStarClick(event, star.id)}
            />
          ))}
        </div>

        {successModalVisible === true ? (
          <SuccessScreen onRestart={handleRestart} />
        ) : null}
      </div>
    </div>
  );
}
