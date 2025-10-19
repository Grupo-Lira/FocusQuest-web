import { motion } from "framer-motion";
import Image from "next/image";

interface PlanetInstance {
  src: string;
  start: { left: string | number; bottom: number | string };
  end: { left: string | number; bottom: number | string };
  side: "left" | "right";
}

interface PlanetsAnimationProps {
  readonly activePlanet: PlanetInstance | null;
}

export default function PlanetsAnimation({ activePlanet }: PlanetsAnimationProps) {
  if (!activePlanet) return null;

  return (
    <motion.div
      key={activePlanet.src}
      initial={activePlanet.start}
      animate={activePlanet.end}
      exit={{ opacity: 0 }}
      transition={{ duration: 2, ease: "easeInOut" }}
      className="absolute"
    >
      <Image src={activePlanet.src} alt="Planeta" width={120} height={120} />
    </motion.div>
  );
}
