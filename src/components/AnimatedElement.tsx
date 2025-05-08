"use client";
import { useEffect, useRef } from "react";
import {createAnimatable} from "animejs";

interface AnimatedElementProps {
  src: string;
  initial: { x: string; y: string };
  animate: { x: string; y: string };
  duration: number;
  direction?: "normal" | "reverse" | "alternate";
}

export const AnimatedElement = ({
  src,
  initial,
  animate,
  duration,
  direction = "normal", // padrão: só vai
}: AnimatedElementProps) => {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current) {
      anime({
        targets: imgRef.current,
        translateX: [initial.x, animate.x],
        translateY: [initial.y, animate.y],
        duration: duration * 1000, // em milissegundos
        easing: "linear",
        loop: true,
        direction: direction,
      });
    }
  }, [initial, animate, duration, direction]);

  return <img ref={imgRef} src={src} alt="Elemento" style={{ position: "absolute" }} />;
};
