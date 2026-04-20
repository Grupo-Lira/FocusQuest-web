import { motion } from "framer-motion";
import Image from "next/image";

type PlanetInstance = {
  src: string;
  start: { left: string | number; bottom: number | string };
  end: { left: string | number; bottom: number | string };
  side: "left" | "right";
};

type Props = {
  readonly activePlanet: PlanetInstance | null;
};

const TRANSITION = { duration: 2, ease: "easeInOut" } as const;
const EXIT_VARIANT = { opacity: 0 } as const;

export function PlanetsAnimation({ activePlanet }: Props) {
  if (activePlanet === null) return null;

  return (
    <motion.div
      key={activePlanet.src}
      initial={activePlanet.start}
      animate={activePlanet.end}
      exit={EXIT_VARIANT}
      transition={TRANSITION}
      className="absolute"
    >
      <Image src={activePlanet.src} alt="Planeta" width={120} height={120} />
    </motion.div>
  );
}
