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
  return 60;
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
  const supportedScales = ['5min', '15min', '30min', '45min', '60min'];
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
// PROTO drag-échelle (branche proto-drag-echelle)
// Helpers purs pour l'escalade d'échelle par drag : le drag sature
// aujourd'hui au max de l'échelle dérivée (deriveScaleMode) — ces fonctions
// portent la logique « scaleFloor » (plancher d'échelle) partagée par les
// deux mécaniques testées (Relâche / Maintien). Si une mécanique est retenue,
// consolider ; sinon, supprimer ce bloc avec la branche.
// ============================================================

/** Les 5 échelles actives, en minutes, ordonnées (miroir de DIAL_MODES). */
export const SCALE_STEPS = [5, 15, 30, 45, 60];

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
 * Échelle au cran INFÉRIEUR d'une échelle donnée.
 * @param {number} scaleMinutes - Échelle courante en minutes
 * @returns {number|null} - Échelle précédente, ou null si déjà au min (5) ou inconnue
 */
export const getPreviousScaleDown = (scaleMinutes) => {
  const idx = SCALE_STEPS.indexOf(scaleMinutes);
  if (idx <= 0) {return null;}
  return SCALE_STEPS[idx - 1];
};

/**
 * Mécanique A (« Relâche et ça respire ») : faut-il escalader au relâcher ?
 * Vrai si la durée relâchée (snappée) est AU max de l'échelle du geste et
 * qu'il existe un cran au-dessus.
 * @param {number} durationSeconds - Durée relâchée, en secondes (post-snap)
 * @param {number} scaleMinutes - Échelle du geste, en minutes
 * @returns {boolean}
 */
export const shouldEscalateOnRelease = (durationSeconds, scaleMinutes) =>
  durationSeconds >= scaleMinutes * 60 && getNextScaleUp(scaleMinutes) !== null;

/**
 * Résout le scaleFloor après un changement de durée (relâcher, ou durée posée
 * par le contexte — ex. Rituel). Règle de reset choisie (mandat) : le plancher
 * se réinitialise quand la durée descend SOUS le max de l'échelle précédente
 * — hystérésis : relâcher pile à 30 sur un plancher 45 GARDE le plancher
 * (30 n'est pas < 30), il faut descendre à 29 pour redescendre l'échelle.
 * @param {number|null} floorMinutes - Plancher courant en minutes (ou null)
 * @param {number} durationSeconds - Durée courante en secondes
 * @returns {number|null} - Plancher conservé, ou null (reset)
 */
export const resolveScaleFloor = (floorMinutes, durationSeconds) => {
  if (!floorMinutes) {return null;}
  const prev = getPreviousScaleDown(floorMinutes);
  if (prev === null) {return null;} // plancher à la plus petite échelle : sans objet
  const durationMinutes = (durationSeconds || 0) / 60;
  return durationMinutes < prev ? null : floorMinutes;
};
