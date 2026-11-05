import { motion } from "framer-motion";
import Image from "next/image";
import { useT } from "@/i18n/client";

type PlanetInstance = {
  src: string;
  start: { left: string; top: string };
  end: { left: string; top: string };
  duration: number;
};

type Props = {
  activePlanet: PlanetInstance | null;
};

const TRANSITION = { duration: 2, ease: "easeInOut" } as const;
const EXIT_VARIANT = { opacity: 0, transition: { duration: 0.3 } } as const;

export function PlanetsAnimation({ activePlanet }: Props) {
  const t = useT();
  if (activePlanet === null) return null;

  const transition = { duration: activePlanet.duration, ease: "easeInOut" } as const;

  return (
    <motion.div
      key={activePlanet.src}
      initial={activePlanet.start}
      animate={activePlanet.end}
      exit={EXIT_VARIANT}
      transition={transition}
      className="absolute"
    >
      <Image src={activePlanet.src} alt={t("Planeta")} width={120} height={120} />
    </motion.div>
  );
}
