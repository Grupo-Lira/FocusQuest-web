"use client";

import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import type { GazeData } from "@/context/EyeTrackingContext";
import {
  PHASE_ONE_GAZE_INTERVAL_MS,
  PHASE_ONE_SAMPLE_MAX_AGE_MS,
  type PhaseOneTarget,
} from "@/constants/fase1Targets";

type Props = {
  socket: Socket | null;
  target: PhaseOneTarget | null;
  gaze: GazeData | null;
  enabled: boolean;
};

type BackendFocusStatus = {
  status: "FOCANDO" | "DESFOCADO" | "CONCLUIDO";
  timestamp: number;
};

const EMPTY_FEEDBACK = {
  isInside: false,
  hasSignal: false,
};

export function usePhaseOneGaze({ socket, target, gaze, enabled }: Props) {
  const latestGaze = useRef(gaze);
  const backendStatusRef = useRef<BackendFocusStatus | null>(null);
  const [feedback, setFeedback] = useState(EMPTY_FEEDBACK);

  useEffect(() => { latestGaze.current = gaze; }, [gaze]);

  useEffect(() => {
    backendStatusRef.current = null;
    if (!enabled || !socket || !target) return;

    const handleFocusStatus = (data: {
      fase?: number;
      alvo?: number;
      status?: BackendFocusStatus["status"];
      timestamp?: number;
      tempo_foco_ms?: number;
    }) => {
      if (data.fase !== undefined && data.fase !== 1) return;
      if (Number(data.alvo) !== target.id || !data.status) return;

      const timestamp = Number(data.timestamp) || Date.now();
      if (backendStatusRef.current && timestamp < backendStatusRef.current.timestamp) return;

      backendStatusRef.current = {
        status: data.status,
        timestamp,
      };
      setFeedback({
        hasSignal: true,
        // O brilho só é ativado após a classificação do servidor, não pela
        // estimativa local das coordenadas do WebGazer.
        isInside: data.status === "FOCANDO",
      });
    };

    socket.on("fase1_foco_status", handleFocusStatus);
    return () => {
      socket.off("fase1_foco_status", handleFocusStatus);
    };
  }, [enabled, socket, target]);

  useEffect(() => {
    setFeedback(EMPTY_FEEDBACK);
    if (!enabled || !socket || !target) return;

    const activatedAt = Date.now();
    let lastSentTimestamp = 0;
    const readSample = () => {
      const sample = latestGaze.current;
      if (!sample || sample.timestamp < activatedAt ||
          Date.now() - sample.timestamp > PHASE_ONE_SAMPLE_MAX_AGE_MS ||
          !Number.isFinite(sample.x) || !Number.isFinite(sample.y)) return null;

      // Same normalization is used for feedback and the backend payload.
      const x = Math.max(0, Math.min(1, sample.x / window.innerWidth));
      const y = Math.max(0, Math.min(1, sample.y / window.innerHeight));
      return { sample, x, y };
    };

    const emitTimer = window.setInterval(() => {
      const current = readSample();
      if (!current || !socket.connected || current.sample.timestamp === lastSentTimestamp) return;

      socket.emit("gaze_data_fase1", {
        x: current.x,
        y: current.y,
        rawX: current.sample.x,
        rawY: current.sample.y,
        timestamp: current.sample.timestamp,
      });
      lastSentTimestamp = current.sample.timestamp;
    }, PHASE_ONE_GAZE_INTERVAL_MS);

    return () => {
      window.clearInterval(emitTimer);
    };
  }, [enabled, socket, target]);

  return feedback;
}
