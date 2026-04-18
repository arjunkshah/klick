import { motion, useReducedMotion } from "framer-motion";
import type { ElementType, ReactNode } from "react";
import { blurPopUp } from "../lib/reveal-animations";

type HeadingTag = "h1" | "h2" | "h3";

type Props = {
  text: string;
  className?: string;
  as?: HeadingTag;
  children?: ReactNode;
};

/**
 * Optional hero-only headline: short stagger, minimal blur. Prefer `as="h1"` on the main hero;
 * use plain headings elsewhere to avoid motion overload.
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
              viewport={{ once: true, margin: "-32px 0px", amount: 0.15 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.04 * idx }}
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
