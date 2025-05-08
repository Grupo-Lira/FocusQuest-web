"use client";
import { motion } from "framer-motion";

interface AnimatedElementProps {
    src: string;
    initial: { x: string; y: string };
    animate: { x: string; y: string };
    duration: number;
    repeatType?: "loop" | "reverse" | "mirror";
}

export const AnimatedElement = ({ src, initial, animate, duration, repeatType }: AnimatedElementProps) => {

    return (
        <motion.img
            src={src}
            alt="Elemento"
            initial={initial}
            animate={animate}
            transition={{ duration: duration, repeat: Infinity, ease: "linear", repeatType: repeatType, }}
        />
    );
};


