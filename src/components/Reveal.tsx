import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { fadeBlurUp, fadeFromLeft, fadeFromRight, fadeIllustrate } from "../lib/reveal-animations";

const variantByKind = {
  left: fadeFromLeft,
  right: fadeFromRight,
  blurUp: fadeBlurUp,
  illustrate: fadeIllustrate,
} as const;

export type RevealKind = keyof typeof variantByKind;

type When = "inView" | "mount";

type Props = {
  children: ReactNode;
  /** Preset: horizontal fade + blur, centered blur-up, or hero illustration. */
  kind?: RevealKind;
  /** When `when` is `mount`, `viewport` is ignored. */
  when?: When;
  delay?: number;
  className?: string;
  viewportMargin?: string;
  /** How much of the element must be visible before triggering (in-view only). */
  amount?: number | "some" | "all";
};

const easeOut = [0.25, 1, 0.5, 1] as const;

export function Reveal({
  children,
  kind = "left",
  when = "inView",
  delay = 0,
  className,
  viewportMargin = "-56px 0px -32px 0px",
  amount = 0.22,
}: Props) {
  const reduceMotion = useReducedMotion();
  const variants: Variants = variantByKind[kind];

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const transition = {
    duration: 0.72,
    ease: easeOut,
    delay,
  };

  if (when === "mount") {
    return (
      <motion.div
        className={className}
        variants={variants}
        initial="initial"
        animate="animate"
        transition={transition}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: viewportMargin, amount }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
