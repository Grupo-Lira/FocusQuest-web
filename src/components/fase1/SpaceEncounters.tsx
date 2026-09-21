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
  reverse: boolean;
  scale: number;
};

const ASSETS = {
  ship: "/img/distracoes/ovni.png",
  meteor: "/img/distracoes/meteoro.png",
  visitor: "/img/distracoes/et.png",
};
const KINDS: Encounter["kind"][] = ["ship", "meteor", "visitor"];

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
      // Prefer the opposite edge, with the target always painted above the encounter.
      const lane = active && (active.y_min + active.y_max) / 2 > 0.55
        ? 20 + Math.random() * 8 : 80 + Math.random() * 7;
      setEncounter({ id: clock.current, kind, duration, lane,
        reverse: Math.random() > 0.5, scale: 0.75 + Math.random() * 0.4 });
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
            "--entry": encounter.reverse ? "110vw" : "-160px",
            "--approach": encounter.reverse ? "68vw" : "20vw",
            "--departure": encounter.reverse ? "25vw" : "68vw",
            "--exit": encounter.reverse ? "-160px" : "110vw",
            "--direction": encounter.reverse ? -1 : 1,
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
