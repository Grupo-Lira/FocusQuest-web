"use client";
import { motion } from "framer-motion";

export const AnimatedElement = ({ src, initial, animate }: { src: string, initial: { x: string, y: string }, animate: { x: string, y: string } }) => {

    return (
        <motion.img
            src={src}
            alt="Elemento"
            initial={initial}
            animate={animate}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
    );
};


