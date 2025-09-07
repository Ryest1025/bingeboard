// Shared framer-motion variants for search UI components
// Keeping durations very short to maintain snappy feel
// Internal constants (not exported) to avoid counting as unused exports while still reusable inside this module
const containerMotion = {
  initial: { opacity: 0, y: -6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: 'easeOut' } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.12, ease: 'easeIn' } },
};

const itemMotion = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 4 },
  transition: { duration: 0.18, ease: 'easeOut' },
};

const listStagger = {
  animate: { transition: { staggerChildren: 0.035, delayChildren: 0.04 } },
};

// Utility to optionally suppress motion for reduced-motion users
export function maybeDisableMotion(prefersReducedMotion: boolean) {
  if (prefersReducedMotion) {
    return { containerMotion: {}, itemMotion: {}, listStagger: {} } as const;
  }
  return { containerMotion, itemMotion, listStagger } as const;
}
