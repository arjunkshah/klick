import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const variants: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

type Props = { children: ReactNode };

export function PageTransition({ children }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="w-full"
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        duration: reduceMotion ? 0 : 0.32,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
