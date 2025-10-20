"use client";
import NavbarCalibration from "@/components/Calibration/NavbarCalibration";
import OverlayInstruction from "@/components/Calibration/OverlayInstruction";
import { useCallback, useEffect, useState } from "react";
import { stars } from "@/constants/calibrationStar";
import StarCalibration from "@/components/Calibration/StarCalibration";
import SettingsModal from "@/components/SettingsModal";
import SuccessScreen from "@/components/Calibration/SuccessScreen";
import { steps } from "@/constants/steps";
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
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [hits, setHits] = useState(0);
  const [clickLog, setClickLog] = useState<ClickData[]>([]);
  const {
    isWebGazerLoaded,
    startTracking,
    stopTracking,
    lastGazeData,
  } = useEyeTracking();

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
      if (distance === undefined) {
        console.log("WebGazer não forneceu dados de gaze");
      } else {
        console.log("Distância:", distance.toFixed(2), "pixels");
        let precision = "Baixa";
        if (distance < 50) {
          precision = "Boa";
        } else if (distance < 100) {
          precision = "Média";
        }
        console.log("Precisão:", precision);
      }
      console.log("=================");

      // Também loga para facilitar a análise
      console.table([clickData]);
    },
    [lastGazeData]
  );

  // Handler modificado para as estrelas
  const handleStarClick = (event: React.MouseEvent, starId: string) => {
    logClick(event, `star-${starId}`);

    setHits((prev) => {
      const newHits = prev + 1;
      return newHits;
    });

    const starIndex = stars.findIndex((star) => star.id === starId);
    if (starIndex !== -1) {
      stars[starIndex].totalHits += 1;
    }
  };

  const handleStartCalibration = async () => {
    setShowInstructions(false);
    
    // Pequeno delay para garantir que o estado foi atualizado
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (isWebGazerLoaded) {
      console.log("Iniciando rastreamento ocular...");
      await startTracking();
    } else {
      console.warn("WebGazer não está carregado ainda");
    }
  };

  const handleRestart = () => {
    setSuccessModalVisible(false);
    setShowInstructions(true);
    setHits(0);
    setClickLog([]);
  };

  // Verifica quando o usuário completa a calibração
  useEffect(() => {
    if (hits >= 40 && !successModalVisible) {
      console.log("Calibração concluída com", hits, "hits");
      stopTracking();
      setSuccessModalVisible(true);

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
        let precision = "Precisa melhorar";
        if (avgDistance < 50) {
          precision = "Excelente";
        } else if (avgDistance < 100) {
          precision = "Boa";
        }
        console.log("Precisão geral:", precision);
      }
      console.log("========================================");
    }
  }, [hits, successModalVisible, clickLog]);      

  return (
    <>
      {isModalVisible ? (
        <div className="flex items-center justify-center min-h-screen">
            <SettingsModal
            isStoppedGame={true}
            onClick={() => {
                setIsModalVisible(false);
            }}
            />
        </div>
      ): (
        <div className="min-h-screen flex flex-col text-white">
          <div className="min-h-screen flex flex-col text-white">
            {/* Tela de instruções antes da calibração */}
            {showInstructions && <OverlayInstruction onComplete={handleStartCalibration} steps={steps}/>}

            {/* Navbar de controle */}
            <NavbarCalibration setIsModalOpen={() => setIsModalVisible(true)} />

            {/* Área principal da calibração */}
            <div className="flex-1 relative overflow-hidden">
              {stars.map(
                (star) =>
                  star.totalHits < 5 && (
                    <StarCalibration
                      key={star.id}
                      top={star.top}
                      left={star.left}
                      onHit={() => {}}
                      onError={() => console.error("Erro com estrela", star.id)}
                      onClick={(e: React.MouseEvent) => handleStarClick(e, star.id)}
                    />
                  )
              )}
            </div>

            {/* Modal de sucesso */}
            {successModalVisible && <SuccessScreen onRestart={handleRestart} />}
          </div>
        </div>
        )
    }
    </>
  );
}
