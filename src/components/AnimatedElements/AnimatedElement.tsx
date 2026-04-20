/* eslint-disable @next/next/no-img-element */
import "../AnimatedElements/AnimatedElements.css";

type Props = {
  src: string;
  duration: number;
  id: string;
  isPaused: boolean;
};

const ANIMATION_MAP: Record<string, string> = {
  nave: "nave-animation",
  meteoro: "meteoro-animation",
  meteoroet: "meteoroet-animation",
  ovni: "ovni-animation",
  et: "et-animation",
};

const ALTERNATING_IDS = ["et", "ovni"] as const;

const getAnimationDirection = (id: string) => {
  if (ALTERNATING_IDS.includes(id as (typeof ALTERNATING_IDS)[number]))
    return "alternate";
  return "normal";
};

const getPausedClass = (isPaused: boolean) => {
  if (isPaused === true) return "paused";
  return "";
};

export const AnimatedElement = ({ src, duration, id, isPaused }: Props) => {
  const animationName = ANIMATION_MAP[id];
  const direction = getAnimationDirection(id);
  const pausedClass = getPausedClass(isPaused);
  const className = `animated-element ${animationName} ${pausedClass}`;
  const style = {
    animation: `${animationName} ${duration}s linear infinite ${direction}`,
  };

  return <img src={src} alt="elemento animado" className={className} style={style} />;
};
