"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { PhaseOneTarget } from "@/constants/fase1Targets";
import styles from "./phaseOne.module.css";

type Encounter = {
  id: number;
  kind: "ship" | "meteor" | "visitor";
  duration: number;
  lane: number;
  side: "left" | "right";
  entry: string;
  approach: string;
  departure: string;
  exit: string;
  direction: 1 | -1;
  scale: number;
};

const ASSETS = {
  ship: "/img/distracoes/ovni.png",
  meteor: "/img/distracoes/meteoro.png",
  visitor: "/img/distracoes/et.png",
};
const KINDS: Encounter["kind"][] = ["ship", "meteor", "visitor"];

const getOppositePath = (target: PhaseOneTarget | null): Pick<Encounter, "side" | "lane" | "entry" | "approach" | "departure" | "exit" | "direction"> => {
  const centerX = target ? (target.x_min + target.x_max) / 2 : 0.5;
  const centerY = target ? (target.y_min + target.y_max) / 2 : 0.5;
  const side = centerX < 0.5 ? "right" : centerX > 0.5 ? "left" : Math.random() > 0.5 ? "right" : "left";
  const lane = centerY < 0.5
    ? 80 + Math.random() * 5
    : centerY > 0.5
      ? 10 + Math.random() * 5
      : Math.random() > 0.5 ? 80 + Math.random() * 5 : 10 + Math.random() * 5;

  // Keep the entire route beyond the target's nearest horizontal edge. This
  // leaves the distraction visible while preserving a clear opposite side.
  if (side === "right") {
    const targetEdge = target ? target.x_max * 100 : 50;
    const approach = Math.min(78, Math.max(58, targetEdge + 8));
    return {
      side,
      lane,
      entry: "110vw",
      approach: `${approach}vw`,
      departure: `${Math.min(92, approach + 12)}vw`,
      exit: "110vw",
      direction: -1 as const,
    };
  }

  const targetEdge = target ? target.x_min * 100 : 50;
  const approach = Math.max(4, Math.min(34, targetEdge - 30));
  return {
    side,
    lane,
    entry: "-360px",
    approach: `${approach}vw`,
    departure: `${Math.max(4, approach - 12)}vw`,
    exit: "-360px",
    direction: 1 as const,
  };
};

export function SpaceEncounters({ paused, target }: {
  readonly paused: boolean;
  readonly target: PhaseOneTarget | null;
}) {
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const currentTarget = useRef(target);
  const clock = useRef(0);
  const nextEncounterAt = useRef(3500);
  const endsAt = useRef(0);
  const previousKind = useRef<Encounter["kind"] | null>(null);

  useEffect(() => { currentTarget.current = target; }, [target]);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      clock.current += 250;
      if (endsAt.current && clock.current >= endsAt.current) {
        setEncounter(null);
        endsAt.current = 0;
      }
      if (clock.current < nextEncounterAt.current) return;

      const choices = KINDS.filter((kind) => kind !== previousKind.current);
      const kind = choices[Math.floor(Math.random() * choices.length)];
      const duration = kind === "meteor" ? 3800 + Math.random() * 1200 : 6000 + Math.random() * 1800;
      const active = currentTarget.current;
      const path = getOppositePath(active);
      setEncounter({ id: clock.current, kind, duration, ...path, scale: 1 + Math.random() * 0.35 });
      previousKind.current = kind;
      endsAt.current = clock.current + duration;
      nextEncounterAt.current = endsAt.current + 2300 + Math.random() * 2500;
    }, 250);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <div className={styles.encounters} aria-hidden="true" data-paused={paused}>
      {encounter && (
        <div key={encounter.id} className={`${styles.actor} ${styles[encounter.kind]}`}
          style={{
            "--lane": `${encounter.lane}%`, "--duration": `${encounter.duration}ms`,
            "--depth": encounter.scale,
            "--entry": encounter.entry,
            "--approach": encounter.approach,
            "--departure": encounter.departure,
            "--exit": encounter.exit,
            "--direction": encounter.direction,
          } as CSSProperties}>
          <span className={styles.trail} />
          <div className={styles.sprite}>
            <Image src={ASSETS[encounter.kind]} width={112} height={112} alt="" />
          </div>
        </div>
      )}
    </div>
  );
}
