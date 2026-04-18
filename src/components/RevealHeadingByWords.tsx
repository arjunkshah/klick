import { motion, useReducedMotion } from "framer-motion";
import type { ElementType, ReactNode } from "react";
import { blurPopUp } from "../lib/reveal-animations";

type HeadingTag = "h1" | "h2" | "h3";

type Props = {
  /** Plain string; split on whitespace for per-word motion (like reference `BlurPopUpByWord`). */
  text: string;
  className?: string;
  as?: HeadingTag;
  /** Extra nodes after the animated words (e.g. screen-reader-only). */
  children?: ReactNode;
};

/**
 * Hero-style headline: each word blurs up with stagger (`blurPopUp` + `whileInView`),
 * per https://github.com/anoopraju31/linear-landing-page (BlurPopUpByWord).
 */
export function RevealHeadingByWords({ text, className = "", as: Tag = "h2", children }: Props) {
  const reduceMotion = useReducedMotion();
  const words = text.split(/\s+/).filter(Boolean);
  const Comp = Tag as ElementType;

  if (reduceMotion) {
    return (
      <Comp className={className}>
        {text}
        {children}
      </Comp>
    );
  }

  return (
    <Comp className={className}>
      <span className="block text-balance">
        <span className="inline-block align-top text-balance">
          {words.map((word, idx) => (
            <motion.span
              key={`${idx}-${word}`}
              style={{ wordBreak: "normal" }}
              className="inline-block"
              variants={blurPopUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-48px 0px -24px 0px", amount: 0.2 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 * idx }}
            >
              {word}
              {idx < words.length - 1 ? "\u00A0" : ""}
            </motion.span>
          ))}
        </span>
      </span>
      {children}
    </Comp>
  );
}
