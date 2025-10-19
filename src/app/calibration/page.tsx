"use client";
import NavbarCalibration from "@/components/Calibration/NavbarCalibration";
import OverlayInstruction from "@/components/Calibration/OverlayInstruction";
import { useEffect, useState } from "react";
import { stars } from "@/constants/calibrationStar";
import StarCalibration from "@/components/Calibration/StarCalibration";
import SettingsModal from "@/components/SettingsModal";
import SuccessScreen from "@/components/Calibration/SuccessScreen";
import { steps } from "@/constants/steps";

export default function CalibrationPage() {
  const [showInstructions, setShowInstructions] = useState(true);
  const [successModalVisible, setSuccessModalVisible] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [hits, setHits] = useState(0);

  // Inicia o processo de calibração
  const handleStartCalibration = () => {
    setShowInstructions(false);
  };

  // Verifica quando o usuário completa a calibração
  useEffect(() => {
    if (hits === 5) {
      setSuccessModalVisible(true);
    }
  }, [hits]);

  // Reinicia calibração quando fechar o modal de sucesso
  const handleRestart = () => {
    setHits(0);
    setSuccessModalVisible(false);
    setShowInstructions(true);
  };

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
            {/* Tela de instruções antes da calibração */}
            {showInstructions && <OverlayInstruction onComplete={handleStartCalibration} steps={steps}/>}

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
                />
            ))}
            </div>

            {/* Modal de sucesso */}
            {successModalVisible && (
                <SuccessScreen onRestart={handleRestart} />
            )}
        </div>
        )
    }
    </>
  );
}
