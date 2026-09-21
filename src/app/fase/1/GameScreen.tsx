"use client";

import { Bolt } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { OverlayInstruction } from "@/components/Calibration/OverlayInstruction";
import { PatientSelectModal } from "@/components/PatientSelectModal";
import { SettingsModal } from "@/components/SettingsModal";
import { NavbarGame } from "@/components/NavbarGame";
import { Metricas, SuccessScreen } from "@/components/SuccessScreen";
import { TimeOut } from "@/components/TimeOut";
import { FocusSector } from "@/components/fase1/FocusSector";
import { SpaceEncounters } from "@/components/fase1/SpaceEncounters";
import styles from "@/components/fase1/phaseOne.module.css";
import { buildPhaseOneTargets, type PhaseOneTarget } from "@/constants/fase1Targets";
import { fase1Steps } from "@/constants/steps";
import { useAudio } from "@/context/AudioContext";
import { useEyeTracking } from "@/context/EyeTrackingContext";
import { useGameContext } from "@/context/GameContext";
import { usePatient } from "@/context/PatientContext";
import { usePhaseOneGaze } from "@/hooks/usePhaseOneGaze";
import { useSocketIO } from "@/hooks/useWebSocket";

type Stage = "intro" | "starting" | "running" | "finished" | "interrupted";
type TargetEvent = { fase?: number; alvo: PhaseOneTarget | number; motivo_termino?: string };
type FinishEvent = { fase?: number; metricas?: Metricas; motivo?: string };
const NAVBAR_LABEL = "ENCONTRE E FIXE OS OLHOS NOS 5 ALVOS DURANTE 5 SEGUNDOS" as const;

const getTargetWithBackendHitbox = (
  receivedTarget: TargetEvent["alvo"],
  localTarget: PhaseOneTarget,
): PhaseOneTarget | null => {
  if (!receivedTarget || typeof receivedTarget !== "object") return null;

  const coordinates = {
    x_min: Number(receivedTarget.x_min),
    x_max: Number(receivedTarget.x_max),
    y_min: Number(receivedTarget.y_min),
    y_max: Number(receivedTarget.y_max),
  };
  if (!Object.values(coordinates).every(Number.isFinite)) return null;
  if (coordinates.x_min < 0 || coordinates.x_max > 1 ||
      coordinates.y_min < 0 || coordinates.y_max > 1 ||
      coordinates.x_min >= coordinates.x_max || coordinates.y_min >= coordinates.y_max) {
    return null;
  }
  return { ...localTarget, ...coordinates };
};

export function GameScreen() {
  const playFieldRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);
  const stageRef = useRef<Stage>("intro");
  const targetsRef = useRef<PhaseOneTarget[]>([]);
  const completedRef = useRef<number[]>([]);
  const timedOutRef = useRef(false);
  const startingRef = useRef(false);
  const [stage, setStage] = useState<Stage>("intro");
  const [target, setTarget] = useState<PhaseOneTarget | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isPatientSelectOpen, setIsPatientSelectOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [result, setResult] = useState<Metricas | undefined>();
  const {
    isPaused, setIsPaused, setIsGameActive, setAudioGameStarted,
    timeLeft, setTimeLeft, setPhase, setHits, setErrors,
  } = useGameContext();
  const { stopTracking, isWebGazerLoaded, startTracking, lastGazeData, isTracking } = useEyeTracking();
  const { startAudio, pauseAudio } = useAudio();
  const { socket, isConnected } = useSocketIO();
  const { selectedPacienteId, setSelectedPacienteId } = usePatient();
  // Tracking callbacks change with provider state; cleanup uses the latest one.
  const trackingRef = useRef({ stopTracking, pauseAudio });
  useEffect(() => { trackingRef.current = { stopTracking, pauseAudio }; }, [stopTracking, pauseAudio]);

  const feedback = usePhaseOneGaze({
    socket, target, gaze: lastGazeData,
    enabled: stage === "running" && !isPaused && isTracking && isConnected,
  });

  useEffect(() => {
    mountedRef.current = true;
    setPhase(1);
    setTimeLeft(60);
    setHits(0);
    setErrors(0);
    setIsGameActive(false);
    setAudioGameStarted(false);
    setIsPaused(false);
    return () => {
      mountedRef.current = false;
      setIsGameActive(false);
      setAudioGameStarted(false);
      trackingRef.current.stopTracking();
      trackingRef.current.pauseAudio();
    };
  }, [setPhase, setTimeLeft, setHits, setErrors, setIsGameActive, setAudioGameStarted, setIsPaused]);

  useEffect(() => {
    if (!socket) return;
    const activateTarget = (data: TargetEvent) => {
      if (data.fase !== undefined && data.fase !== 1) return;
      if (stageRef.current !== "starting" && stageRef.current !== "running") return;
      const id = typeof data.alvo === "number" ? data.alvo : data.alvo?.id;
      const next = targetsRef.current.find((item) => item.id === Number(id));
      if (!next || completedRef.current.includes(next.id)) return;
      // The backend returns the expanded hitbox. The visual outline must use
      // exactly that rectangle; never fall back to a different local geometry.
      const synchronizedTarget = getTargetWithBackendHitbox(data.alvo, next);
      if (!synchronizedTarget) {
        setError("A missão recebeu uma área de foco inválida. Reinicie para tentar novamente.");
        return;
      }
      setTarget(synchronizedTarget);
      if (stageRef.current === "starting") {
        stageRef.current = "running";
        setStage("running");
        setIsGameActive(true);
        setAudioGameStarted(true);
        startAudio();
      }
    };
    const completeTarget = (data: TargetEvent) => {
      if (data.fase !== undefined && data.fase !== 1) return;
      if (stageRef.current !== "running" || data.motivo_termino !== "FOCOU") return;
      const id = Number(typeof data.alvo === "number" ? data.alvo : data.alvo?.id);
      if (!targetsRef.current.some((item) => item.id === id) || completedRef.current.includes(id)) return;
      completedRef.current = [...completedRef.current, id];
      setHits(completedRef.current.length);
      setTarget((current) => current?.id === id ? null : current);
      setNotice("Estrela conquistada! " + completedRef.current.length + " de 5");
    };
    const finish = (data: FinishEvent) => {
      if (data.fase !== undefined && data.fase !== 1) return;
      if (stageRef.current !== "running" && stageRef.current !== "finished") return;
      if (data.motivo === "TEMPO_FASE_EXCEDIDO" || data.motivo === "TEMPO") timedOutRef.current = true;
      stageRef.current = "finished";
      setStage("finished");
      setResult(data.metricas);
      setTarget(null);
      setSettingsOpen(false);
      setIsGameActive(false);
      setIsPaused(true);
      trackingRef.current.stopTracking();
      trackingRef.current.pauseAudio();
    };
    const disconnect = () => {
      if (stageRef.current !== "running" && stageRef.current !== "starting") return;
      stageRef.current = "interrupted";
      setStage("interrupted");
      setSettingsOpen(false);
      setError("A conexão com a missão foi perdida. Reinicie para começar uma nova tentativa.");
      setIsGameActive(false);
      setIsPaused(true);
      trackingRef.current.stopTracking();
      trackingRef.current.pauseAudio();
    };
    socket.on("fase1_iniciada", activateTarget);
    socket.on("brilhar_estrela", activateTarget);
    socket.on("alvo_fase1_concluido", completeTarget);
    socket.on("fase_concluida", finish);
    socket.on("disconnect", disconnect);
    return () => {
      socket.off("fase1_iniciada", activateTarget);
      socket.off("brilhar_estrela", activateTarget);
      socket.off("alvo_fase1_concluido", completeTarget);
      socket.off("fase_concluida", finish);
      socket.off("disconnect", disconnect);
    };
  }, [socket, setAudioGameStarted, setHits, setIsGameActive, setIsPaused, startAudio]);

  useEffect(() => {
    if (stage !== "starting") return;
    const timer = window.setTimeout(() => {
      if (stageRef.current !== "starting") return;
      stageRef.current = "interrupted";
      setStage("interrupted");
      setError("Não recebemos a confirmação de início. Reinicie para tentar novamente.");
      trackingRef.current.stopTracking();
      socket?.disconnect();
    }, 15000);
    return () => window.clearTimeout(timer);
  }, [stage, socket]);

  useEffect(() => {
    if (timeLeft !== 0 || stageRef.current !== "running" || timedOutRef.current) return;
    timedOutRef.current = true;
    stageRef.current = "finished";
    setStage("finished");
    setTarget(null);
    setSettingsOpen(false);
    setIsGameActive(false);
    setIsPaused(true);
    trackingRef.current.stopTracking();
    trackingRef.current.pauseAudio();
    socket?.emit("fase_1_tempo_excedido");
  }, [timeLeft, socket, setIsGameActive, setIsPaused]);

  useEffect(() => {
    if (!notice || isPaused) return;
    const timer = window.setTimeout(() => setNotice(""), 1800);
    return () => window.clearTimeout(timer);
  }, [notice, isPaused]);

  useEffect(() => {
    const pauseWhenHidden = () => {
      if (!document.hidden || stageRef.current !== "running") return;
      setIsPaused(true);
      trackingRef.current.stopTracking();
      trackingRef.current.pauseAudio();
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, [setIsPaused]);

  const start = async () => {
    if (startingRef.current || stageRef.current !== "intro") return;
    if (!selectedPacienteId) {
      setError("Selecione um paciente para iniciar a missão.");
      return;
    }
    if (!socket?.connected) {
      setError("Aguarde a conexão com a missão.");
      return;
    }
    if (!isWebGazerLoaded) {
      setError("Aguarde o visor ocular carregar.");
      return;
    }
    if (!playFieldRef.current) return;
    startingRef.current = true;
    setError("");
    stageRef.current = "starting";
    setStage("starting");
    try {
      const ready = isTracking || await startTracking(false, false);
      if (!mountedRef.current || stageRef.current !== "starting") {
        // A delayed camera response must not keep capture running after exit.
        if (ready) await globalThis.webgazer?.pause();
        trackingRef.current.stopTracking();
        return;
      }
      if (!ready || !socket.connected || !playFieldRef.current) {
        stageRef.current = "intro";
        setStage("intro");
        setError(!ready ? "Não conseguimos ligar o visor. Verifique a permissão da câmera e tente novamente."
          : "Aguarde a conexão para começar.");
        trackingRef.current.stopTracking();
        return;
      }
      const rect = playFieldRef.current.getBoundingClientRect();
      targetsRef.current = buildPhaseOneTargets(rect, window.innerWidth, window.innerHeight);
      setTimeLeft(60);
      setIsPaused(false);
      socket.emit("iniciar_fase1", { fase1: targetsRef.current, usuarioId: selectedPacienteId });
    } finally {
      startingRef.current = false;
    }
  };

  const pause = () => {
    if (stageRef.current !== "running") return;
    setIsPaused(true);
    stopTracking();
    pauseAudio();
  };
  const resume = async () => {
    if (resuming || stageRef.current !== "running" || !socket?.connected) return;
    setResuming(true);
    setError("");
    try {
      const ready = await startTracking(false, false);
      if (!mountedRef.current || stageRef.current !== "running") {
        if (ready) await globalThis.webgazer?.pause();
        trackingRef.current.stopTracking();
        return;
      }
      if (!ready) {
        setError("Verifique a câmera para continuar a missão.");
        setIsPaused(true);
        return;
      }
      setIsPaused(false);
      startAudio();
    } finally {
      if (mountedRef.current) setResuming(false);
    }
  };

  const handleNavbarPauseToggle = (nextPaused: boolean) => {
    if (nextPaused) {
      pause();
      return;
    }
    void resume();
  };

  const handleOpenSettings = () => {
    pause();
    setSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setSettingsOpen(false);
    void resume();
  };

  return (
    <div className={styles.screen}>
      <div className="flex justify-center mt-6 z-20">
        <NavbarGame label={NAVBAR_LABEL} onPauseToggle={handleNavbarPauseToggle} />
      </div>

      <button
        type="button"
        aria-label="Open settings"
        className="bg-[var(--primary)] z-20 w-11 h-11 rounded-full absolute flex items-center justify-center button-glow transition-all duration-300 top-9 right-9"
        onClick={handleOpenSettings}
      >
        <Bolt color="white" />
      </button>

      <div ref={playFieldRef} className={styles.playField} aria-hidden="true" />
      {stage === "running" && <SpaceEncounters paused={isPaused} target={target} />}
      {target && stage === "running" && <FocusSector key={target.id} target={target} {...feedback} />}
      {notice && stage === "running" && <div role="status" className={styles.notice}>{notice}</div>}

      <PatientSelectModal isOpen={isPatientSelectOpen}
        onSelect={(id) => { setSelectedPacienteId(id); setIsPatientSelectOpen(false); }}
        onCancel={() => { window.location.href = "/menu"; }} />

      {!isPatientSelectOpen && (stage === "intro" || stage === "starting") && (
        <>
          <OverlayInstruction onComplete={start} steps={fase1Steps} />
          {(error || !isConnected || !isWebGazerLoaded) && (
            <div className={styles.guideStatus} role={error ? "alert" : "status"}>
              {error || (!isConnected ? "Conectando à missão…" : "Aguardando o visor…")}
            </div>
          )}
        </>
      )}

      {stage === "running" && isPaused && !settingsOpen && (
        <div className={styles.overlay}><div className={styles.intro}>
          <h2>Missão pausada</h2><p>Quando estiver pronto, volte a olhar para a estrela.</p>
          {error && <p role="alert" className={styles.error}>{error}</p>}
          <button type="button" className={styles.primaryButton} onClick={resume} disabled={resuming}>{resuming ? "Ligando o visor…" : "Continuar missão"}</button>
          <Link href="/menu" className={styles.secondaryButton}>Voltar ao menu</Link>
        </div></div>
      )}
      {settingsOpen && <div className={styles.overlay}><SettingsModal isStoppedGame onClick={handleCloseSettings} /></div>}
      {stage === "interrupted" && <div className={styles.overlay}><div className={styles.intro}>
        <h2>Vamos reconectar a missão</h2><p role="alert">{error}</p>
        <button type="button" className={styles.primaryButton} onClick={() => window.location.reload()}>Reiniciar missão</button>
        <Link href="/menu" className={styles.secondaryButton}>Voltar ao menu</Link>
      </div></div>}
      {stage === "finished" && <div className={styles.overlay}>
        {timedOutRef.current ? <TimeOut data={result} /> : <SuccessScreen fase={2} data={result} />}
      </div>}
    </div>
  );
}
