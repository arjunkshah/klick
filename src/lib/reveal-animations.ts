import type { Variants } from "framer-motion";

/** Subtle per-word headline motion (lighter than reference — short blur + small rise). */
export const blurPopUp: Variants = {
  initial: {
    opacity: 0,
    filter: "blur(6px)",
    y: "10%",
  },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
  },
};
