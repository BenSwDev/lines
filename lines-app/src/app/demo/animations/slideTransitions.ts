import { Variants } from "framer-motion";

/**
 * Animation variants for slide transitions
 * Provides smooth, LAYA-style entrance and exit animations
 */

export const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.95
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.95
  })
};

export const fadeVariants: Variants = {
  enter: {
    opacity: 0,
    y: 20
  },
  center: {
    opacity: 1,
    y: 0
  },
  exit: {
    opacity: 0,
    y: -20
  }
};

export const scaleVariants: Variants = {
  enter: {
    opacity: 0,
    scale: 0.8
  },
  center: {
    opacity: 1,
    scale: 1
  },
  exit: {
    opacity: 0,
    scale: 0.8
  }
};

export const slideTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 0.8
};

export const fadeTransition = {
  duration: 0.4,
  ease: [0.4, 0, 0.2, 1]
};

export const staggerContainer: Variants = {
  enter: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

export const staggerItem: Variants = {
  enter: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  center: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95
  }
};

export const emojiVariants: Variants = {
  enter: {
    scale: 0,
    rotate: -180
  },
  center: {
    scale: 1,
    rotate: 0
  },
  exit: {
    scale: 0,
    rotate: 180
  }
};

export const emojiTransition = {
  type: "spring" as const,
  stiffness: 200,
  damping: 15
};

export const progressBarVariants: Variants = {
  initial: {
    width: 0
  },
  animate: {
    width: "100%"
  }
};

export const questionCardVariants: Variants = {
  enter: {
    opacity: 0,
    y: 30,
    scale: 0.9
  },
  center: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  exit: {
    opacity: 0,
    y: -30,
    scale: 0.9
  }
};

export const questionCardTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 25
};
