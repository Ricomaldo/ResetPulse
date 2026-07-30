/**
 * @fileoverview Scale mode helper functions
 * @description Utilities for calculating optimal scale modes and conversions
 * @created 2026-01-15
 *
 * Scale modes available: 5, 15, 30, 45, 60 minutes
 * (Simplified from original 8 modes: removed 1, 10, 25 for better UX)
 */

/**
 * Calculate optimal scale mode for a given duration
 * Returns the smallest scale that can accommodate the duration
 *
 * @param {number} durationMinutes - Duration in minutes
 * @returns {number} - Optimal scale in minutes (5, 15, 30, 45, 60)
 *
 * @example
 * getOptimalScale(3)  // => 5
 * getOptimalScale(12) // => 15
 * getOptimalScale(25) // => 30
 * getOptimalScale(42) // => 45
 * getOptimalScale(58) // => 60
 */
export const getOptimalScale = (durationMinutes) => {
  if (durationMinutes <= 5) return 5;
  if (durationMinutes <= 15) return 15;
  if (durationMinutes <= 30) return 30;
  if (durationMinutes <= 45) return 45;
  if (durationMinutes <= 60) return 60;
  return 120; // porte-2 : échelle 2h (révision Eric du « 60 max » 3b-4)
};

/**
 * Convert scale number to scaleMode string format
 *
 * @param {number} scale - Scale in minutes
 * @returns {string} - ScaleMode format ('5min', '15min', etc.)
 *
 * @example
 * scaleToMode(30) // => '30min'
 */
export const scaleToMode = (scale) => `${scale}min`;

/**
 * Convert scaleMode string to number
 *
 * @param {string} scaleMode - ScaleMode format ('25min')
 * @returns {number} - Scale in minutes
 *
 * @example
 * modeToScale('30min') // => 30
 * modeToScale(null)    // => 60 (default)
 */
export const modeToScale = (scaleMode) => {
  return parseInt(scaleMode?.replace('min', '') || '60', 10);
};

/**
 * Check if a given scaleMode is one of the supported 5 scales
 *
 * @param {string} scaleMode - ScaleMode to check ('25min')
 * @returns {boolean} - True if scale is supported
 *
 * @example
 * isSupportedScale('30min') // => true
 * isSupportedScale('25min') // => false
 */
export const isSupportedScale = (scaleMode) => {
  const supportedScales = ['5min', '15min', '30min', '45min', '60min', '120min'];
  return supportedScales.includes(scaleMode);
};

/**
 * Derive the scale mode directly from a duration in SECONDS — fonction pure,
 * source de vérité unique pour TimerConfigContext (hotfix-porte-1 B2).
 * Le scaleMode n'est plus jamais persisté/choisi manuellement : il se
 * déduit toujours de `currentDuration`, la plus petite échelle (parmi les 5
 * de DIAL_MODES) dont maxMinutes ≥ durée. Purge le défaut déprécié '25min'
 * (repli silencieux vers 30min, arc plein pour tout rituel > 30min) — toute
 * durée, quel que soit un éventuel scaleMode persisté d'un état existant,
 * retombe sur une échelle valide sans crash (migration douce).
 *
 * @param {number} durationSeconds - currentDuration en secondes
 * @returns {string} - scaleMode ('5min' | '15min' | '30min' | '45min' | '60min')
 *
 * @example
 * deriveScaleMode(1200) // 20min -> '30min'
 * deriveScaleMode(3000) // 50min (Deep Work) -> '60min'
 */
export const deriveScaleMode = (durationSeconds) => {
  const durationMinutes = (durationSeconds || 0) / 60;
  return scaleToMode(getOptimalScale(durationMinutes));
};

// ============================================================
// Drag-échelle « Relâcher » (porte-3 V3, verdict Eric inversé en main)
// Le plancher d'échelle monte par escalade au relâcher-au-max, ne descend
// JAMAIS par le drag — reset uniquement au changement de contexte (TimeTimer).
// ============================================================

/** Les 6 échelles actives, en minutes, ordonnées (miroir de DIAL_MODES). */
export const SCALE_STEPS = [5, 15, 30, 45, 60, 120];

/**
 * Échelle au cran SUPÉRIEUR d'une échelle donnée.
 * @param {number} scaleMinutes - Échelle courante en minutes (5|15|30|45|60)
 * @returns {number|null} - Échelle suivante, ou null si déjà au max (60) ou inconnue
 */
export const getNextScaleUp = (scaleMinutes) => {
  const idx = SCALE_STEPS.indexOf(scaleMinutes);
  if (idx === -1 || idx === SCALE_STEPS.length - 1) {return null;}
  return SCALE_STEPS[idx + 1];
};

/**
 * Mécanique « Relâcher » : faut-il escalader au relâcher ?
 * Vrai si la durée relâchée (snappée) est AU max de l'échelle du geste et
 * qu'il existe un cran au-dessus. (Restauré de la branche proto-drag-echelle,
 * commit 8c5fc14 — porte-3 V3.)
 * @param {number} durationSeconds - Durée relâchée, en secondes (post-snap)
 * @param {number} scaleMinutes - Échelle du geste, en minutes
 * @returns {boolean}
 */
export const shouldEscalateOnRelease = (durationSeconds, scaleMinutes) =>
  durationSeconds >= scaleMinutes * 60 && getNextScaleUp(scaleMinutes) !== null;
