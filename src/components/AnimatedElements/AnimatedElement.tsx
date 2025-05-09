import "../AnimatedElements/AnimatedElements.css";

interface AnimatedElementProps {
  src: string;
  duration: number;
  id: string;
  isPaused: boolean;
}

const animationMap: Record<string, string> = {
  nave: "nave-animation",
  meteoro: "meteoro-animation",
  meteoroet: "meteoroet-animation",
  ovni: "ovni-animation",
  et: "et-animation",
};

export const AnimatedElement = ({
  src,
  duration,
  id,
  isPaused,
}: AnimatedElementProps) => {
  return (
    <img
      src={src}
      alt="elemento animado"
      className={`animated-element ${animationMap[id]} ${isPaused ? "paused" : ""}`}
      style={{
        animation: `${animationMap[id]} ${duration}s linear infinite ${
          id === "et" || id === "ovni" ? "alternate" : "normal"
        }`,
      }}
    />
  );
};
