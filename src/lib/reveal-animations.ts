import type { Variants } from "framer-motion";

/** Word / block blur rise — matches anoopraju31/linear-landing-page `blurPopUp`. */
export const blurPopUp: Variants = {
  initial: {
    opacity: 0,
    filter: "blur(10px)",
    y: "20%",
  },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
  },
};

/** Horizontal slide + blur (linear-landing–style, tuned subtler). */
export const fadeFromLeft: Variants = {
  initial: {
    opacity: 0,
    x: -36,
    filter: "blur(10px)",
  },
  animate: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
  },
};

export const fadeFromRight: Variants = {
  initial: {
    opacity: 0,
    x: 36,
    filter: "blur(10px)",
  },
  animate: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
  },
};

/** Blur-up without horizontal bias — good for centered nav / headlines. */
export const fadeBlurUp: Variants = {
  initial: {
    opacity: 0,
    filter: "blur(10px)",
    y: "18%",
  },
  animate: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
  },
};

/** Hero / large media: slight 3D-ish drift like reference `illustrate`. */
export const fadeIllustrate: Variants = {
  initial: {
    opacity: 0,
    x: 44,
    y: -20,
    filter: "blur(8px)",
  },
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    filter: "blur(0px)",
  },
};
