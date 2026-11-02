// Sistema de movimiento compartido (inspirado en Fluid Functionalism):
// resortes en lugar de duraciones fijas, con tres presets.
export const spring = {
  fast: { type: 'spring', stiffness: 520, damping: 38, mass: 0.6 },
  moderate: { type: 'spring', stiffness: 340, damping: 32, mass: 0.8 },
  slow: { type: 'spring', stiffness: 200, damping: 28, mass: 1 },
} as const
