"use client";
import NavbarCalibration from "@/components/Calibration/NavbarCalibration";
import OverlayInstruction from "@/components/Calibration/OverlayInstruction";
import { useCallback, useEffect, useState } from "react";
import { stars } from "@/constants/calibrationStar";
import StarCalibration from "@/components/Calibration/StarCalibration";
import SettingsModal from "@/components/SettingsModal";
import SuccessScreen from "@/components/Calibration/SuccessScreen";
import { useEyeTracking } from "@/context/EyeTrackingContext";

interface ClickData {
  clickX: number;
  clickY: number;
  gazeX: number | null;
  gazeY: number | null;
  timestamp: number;
  element: string;
  distance?: number; // Distância entre clique e gaze em pixels
}

export default function CalibrationPage() {
  const [showInstructions, setShowInstructions] = useState(true);
  const [successModalVisible, setSuccessModalVisible] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [hits, setHits] = useState(0);
  const [clickLog, setClickLog] = useState<ClickData[]>([]);
  const {
    isWebGazerLoaded,
    isTracking,
    startTracking,
    stopTracking,
    fullStopTracking,
    error,
    lastGazeData,
  } = useEyeTracking();

  // Inicia o processo de calibração
  const handleStartCalibration = () => {
    setShowInstructions(false);
  };

  // Função para calcular distância entre dois pontos
  const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  // Função para registrar cliques
  const logClick = useCallback(
    (event: React.MouseEvent, element: string) => {
      const clickX = event.clientX;
      const clickY = event.clientY;

      const gazeX = lastGazeData?.x || null;
      const gazeY = lastGazeData?.y || null;

      let distance = undefined;
      if (gazeX !== null && gazeY !== null) {
        distance = calculateDistance(clickX, clickY, gazeX, gazeY);
      }

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
      // Log detalhado no console
      console.log("=== CLICK LOG ===");
      console.log("Elemento:", element);
      console.log("Coordenadas do clique:", { x: clickX, y: clickY });
      console.log("Coordenadas do WebGazer:", { x: gazeX, y: gazeY });
      if (distance !== undefined) {
        console.log("Distância:", distance.toFixed(2), "pixels");
        console.log(
          "Precisão:",
          distance < 50 ? "Boa" : distance < 100 ? "Média" : "Baixa"
        );
      } else {
        console.log("WebGazer não forneceu dados de gaze");
      }
      console.log("=================");

      // Também loga para facilitar a análise
      console.table([clickData]);
    },
    [lastGazeData]
  );

  // Handler para cliques na área principal (fora das estrelas)
  const handleAreaClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Só registra se não estiver clicando em uma estrela ou outros elementos interativos
    if ((event.target as HTMLElement).className === "flex-1 relative overflow-hidden") {
      logClick(event, "background");
    }
  };

  // Handler modificado para as estrelas
  const handleStarClick = (event: React.MouseEvent, starId: number) => {
    logClick(event, `star-${starId}`);
  };

  // Verifica quando o usuário completa a calibração
  useEffect(() => {
    if (hits === 5) {
      setSuccessModalVisible(true);
      // Log final com estatísticas
      console.log("=== ESTATÍSTICAS FINAIS DA CALIBRAÇÃO ===");
      const validLogs = clickLog.filter((log) => log.distance !== undefined);
      if (validLogs.length > 0) {
        const avgDistance =
          validLogs.reduce((sum, log) => sum + (log.distance || 0), 0) / validLogs.length;
        const minDistance = Math.min(...validLogs.map((log) => log.distance || Infinity));
        const maxDistance = Math.max(...validLogs.map((log) => log.distance || 0));

        console.log("Total de cliques registrados:", clickLog.length);
        console.log("Cliques com dados de gaze:", validLogs.length);
        console.log("Distância média:", avgDistance.toFixed(2), "pixels");
        console.log("Menor distância:", minDistance.toFixed(2), "pixels");
        console.log("Maior distância:", maxDistance.toFixed(2), "pixels");
        console.log(
          "Precisão geral:",
          avgDistance < 50 ? "Excelente" : avgDistance < 100 ? "Boa" : "Precisa melhorar"
        );
      }
      console.log("========================================");
    }
  }, [hits, clickLog, lastGazeData]);

  useEffect(() => {
    if (isWebGazerLoaded && !isTracking && !isModalVisible && !showInstructions) {
      startTracking();
    }
  }, [isWebGazerLoaded, isTracking, isModalVisible, showInstructions, startTracking]);

  // Reinicia calibração quando fechar o modal de sucesso
  const handleRestart = () => {
    setHits(0);
    setClickLog([]);
    setSuccessModalVisible(false);
    setShowInstructions(true);
  };

  return (
    <>
      {!isModalVisible ? (
        <div
          className="min-h-screen flex flex-col text-white"
          onClick={handleAreaClick} // Captura cliques na área principal
        >
          <div className="min-h-screen flex flex-col text-white">
            {/* Tela de instruções antes da calibração */}
            {showInstructions && (
              <OverlayInstruction onComplete={handleStartCalibration} />
            )}

            {/* Navbar de controle */}
            <NavbarCalibration setIsModalOpen={() => setIsModalVisible(true)} />

            {/* Área principal da calibração */}
            <div className="flex-1 relative overflow-hidden">
              {stars.map((star) => (
                <StarCalibration
                  key={star.id}
                  top={star.top}
                  left={star.left}
                  onHit={() => setHits((prev) => prev + 1)}
                  onError={() => console.error("Erro com estrela", star.id)}
                  onClick={(e: React.MouseEvent) => handleStarClick(e, star.id)}
                />
              ))}
              <p
                style={{
                  position: "absolute",
                  top: "50px",
                  left: "200px",
                  color: "white",
                  zIndex: 1000,
                }}
              >
                {lastGazeData
                  ? `X: ${lastGazeData.x.toFixed(2)}, Y: ${lastGazeData.y.toFixed(2)}`
                  : "Aguardando dados..."}
              </p>
            </div>

            {/* Modal de sucesso */}
            {successModalVisible && <SuccessScreen onRestart={handleRestart} />}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <SettingsModal
            isStoppedGame={true}
            onClick={() => {
              setIsModalVisible(false);
            }}
          />
        </div>
      )}
    </>
  );
}
