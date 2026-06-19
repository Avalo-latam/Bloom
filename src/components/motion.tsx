"use client";

import { motion, type HTMLMotionProps } from "motion/react";

/** Fade + slide-up on first scroll into view. */
export function Reveal({
  delay = 0,
  y = 18,
  className,
  children,
  ...rest
}: {
  delay?: number;
  y?: number;
} & HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Subtle lift + shadow on hover; pairs with rounded cards. */
export function HoverLift({
  className,
  children,
  ...rest
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
